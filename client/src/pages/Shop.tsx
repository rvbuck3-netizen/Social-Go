
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Flame, Crown, Star, Clock } from "lucide-react";

const boostProducts = [
  {
    id: "boost-1hr",
    name: "Quick Boost",
    description: "Stand out for 1 hour",
    price: "$0.99",
    duration: "1 hr",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    popular: false,
  },
  {
    id: "boost-6hr",
    name: "Super Boost",
    description: "Top visibility for 6 hours",
    price: "$2.99",
    duration: "6 hrs",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    popular: true,
  },
  {
    id: "boost-24hr",
    name: "Ultra Boost",
    description: "Maximum visibility all day",
    price: "$4.99",
    duration: "24 hrs",
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    popular: false,
  },
];

const coinPacks = [
  { id: "coins-50", amount: 50, price: "$0.99", bonus: "" },
  { id: "coins-150", amount: 150, price: "$2.99", bonus: "+25" },
  { id: "coins-500", amount: 500, price: "$7.99", bonus: "+100" },
  { id: "coins-1200", amount: 1200, price: "$14.99", bonus: "+300" },
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
        description: `Boosted until ${new Date(data.boostExpiresAt).toLocaleTimeString()}`,
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

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="shop-container">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <h1 className="text-base font-semibold" data-testid="text-shop-title">Shop</h1>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {user?.isBoosted && user?.boostExpiresAt && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" data-testid="text-boost-active">Boost Active</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires {new Date(user.boostExpiresAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility Boosts</p>
          <div className="space-y-2">
            {boostProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border relative">
                {product.popular && (
                  <Badge className="absolute -top-2 right-3 text-[10px]" data-testid={`badge-popular-${product.id}`}>
                    <Star className="h-2.5 w-2.5 mr-0.5" /> Popular
                  </Badge>
                )}
                <div className={`h-10 w-10 rounded-full ${product.bgColor} flex items-center justify-center shrink-0`}>
                  <product.icon className={`h-5 w-5 ${product.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" data-testid={`text-product-name-${product.id}`}>{product.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{product.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{product.description}</p>
                </div>
                <Button
                  onClick={() => boostMutation.mutate(product.id)}
                  disabled={boostMutation.isPending}
                  data-testid={`button-buy-${product.id}`}
                >
                  {product.price}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coin Packs</p>
          <div className="grid grid-cols-2 gap-2">
            {coinPacks.map((pack) => (
              <Card key={pack.id} className="hover-elevate cursor-pointer" onClick={() => handleCoinPurchase(`${pack.amount} Coins`)}>
                <CardContent className="pt-3 pb-3 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-lg font-bold" data-testid={`text-coin-amount-${pack.id}`}>{pack.amount}</span>
                  </div>
                  {pack.bonus && (
                    <Badge variant="secondary" className="text-[10px]" data-testid={`badge-bonus-${pack.id}`}>{pack.bonus} bonus</Badge>
                  )}
                  <Button className="w-full" data-testid={`button-buy-${pack.id}`}>
                    {pack.price}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center py-3">
          All purchases are non-refundable. Boosts increase your map visibility.
        </p>
      </div>
    </div>
  );
}
