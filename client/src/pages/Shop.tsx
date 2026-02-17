
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Flame, Crown, Star, Sparkles, Clock } from "lucide-react";

const boostProducts = [
  {
    id: "boost-1hr",
    name: "Quick Boost",
    description: "Stand out on the map for 1 hour",
    price: "$0.99",
    duration: "1 hour",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    popular: false,
  },
  {
    id: "boost-6hr",
    name: "Super Boost",
    description: "Be the first people see for 6 hours",
    price: "$2.99",
    duration: "6 hours",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    popular: true,
  },
  {
    id: "boost-24hr",
    name: "Ultra Boost",
    description: "Maximum visibility for a full day",
    price: "$4.99",
    duration: "24 hours",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    popular: false,
  },
];

const coinPacks = [
  { id: "coins-50", amount: 50, price: "$0.99", bonus: "" },
  { id: "coins-150", amount: 150, price: "$2.99", bonus: "+25 bonus" },
  { id: "coins-500", amount: 500, price: "$7.99", bonus: "+100 bonus" },
  { id: "coins-1200", amount: 1200, price: "$14.99", bonus: "+300 bonus" },
];

export default function Shop() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const boostMutation = useMutation({
    mutationFn: async (boostType: string) => {
      const res = await fetch(api.shop.purchaseBoost.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boostType }),
      });
      if (!res.ok) throw new Error("Purchase failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({
        title: "Boost Activated!",
        description: `You're now boosted until ${new Date(data.boostExpiresAt).toLocaleTimeString()}`,
      });
    },
    onError: () => {
      toast({ title: "Purchase failed", description: "Please try again later." });
    },
  });

  const handleCoinPurchase = (packName: string) => {
    toast({
      title: "Coming Soon",
      description: `${packName} will be available once payments are connected.`,
    });
  };

  if (isLoading) return <div className="p-10 text-center">Loading shop...</div>;

  return (
    <div className="p-4 pb-20 space-y-6 h-full overflow-y-auto">
      <div className="text-center py-4 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Get Noticed</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Boost your visibility and connect with more people nearby
        </p>
      </div>

      {user?.isBoosted && user?.boostExpiresAt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" data-testid="text-boost-active">Boost Active</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires {new Date(user.boostExpiresAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Boost Your Profile</h2>
        {boostProducts.map((product) => (
          <Card key={product.id} className={`relative ${product.borderColor}`}>
            {product.popular && (
              <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground" data-testid={`badge-popular-${product.id}`}>
                <Star className="h-3 w-3 mr-1" /> Most Popular
              </Badge>
            )}
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${product.bgColor} flex items-center justify-center shrink-0`}>
                  <product.icon className={`h-6 w-6 ${product.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                    <Badge variant="secondary" className="text-[10px]">{product.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
                </div>
                <Button
                  onClick={() => boostMutation.mutate(product.id)}
                  className="shrink-0"
                  disabled={boostMutation.isPending}
                  data-testid={`button-buy-${product.id}`}
                >
                  {product.price}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Coin Packs</h2>
        <p className="text-xs text-muted-foreground px-1">Use coins to boost posts and unlock features</p>
        <div className="grid grid-cols-2 gap-3">
          {coinPacks.map((pack) => (
            <Card key={pack.id} className="hover-elevate cursor-pointer" onClick={() => handleCoinPurchase(`${pack.amount} Coins`)}>
              <CardContent className="pt-4 pb-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-xl font-bold" data-testid={`text-coin-amount-${pack.id}`}>{pack.amount}</span>
                </div>
                {pack.bonus && (
                  <Badge variant="secondary" className="text-[10px]" data-testid={`badge-bonus-${pack.id}`}>{pack.bonus}</Badge>
                )}
                <Button className="w-full" data-testid={`button-buy-${pack.id}`}>
                  {pack.price}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] text-muted-foreground">
          All purchases are non-refundable. Boosts increase your visibility on the map.
        </p>
      </div>
    </div>
  );
}
