
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Flame, Crown, Star, Clock, Coins } from "lucide-react";

const boostProducts = [
  {
    id: "boost-1hr",
    name: "Quick Boost",
    description: "1 hour",
    price: "$0.99",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    id: "boost-6hr",
    name: "Super Boost",
    description: "6 hours",
    price: "$2.99",
    icon: Flame,
    color: "text-orange-500",
    popular: true,
  },
  {
    id: "boost-24hr",
    name: "Ultra Boost",
    description: "24 hours",
    price: "$4.99",
    icon: Crown,
    color: "text-purple-500",
  },
];

const coinPacks = [
  { id: "coins-50", amount: 50, price: "$0.99" },
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

      <div className="px-4 pt-4 space-y-6">
        {user?.isBoosted && user?.boostExpiresAt && (
          <div className="flex items-center gap-3 py-2">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium" data-testid="text-boost-active">Boost active</p>
              <p className="text-xs text-muted-foreground">
                Expires {new Date(user.boostExpiresAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Boosts</p>
          <div className="space-y-1">
            {boostProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 py-3">
                <product.icon className={`h-5 w-5 ${product.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" data-testid={`text-product-name-${product.id}`}>{product.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{product.description}</span>
                </div>
                {product.popular && (
                  <Badge variant="secondary" className="text-[10px] shrink-0" data-testid={`badge-popular-${product.id}`}>Popular</Badge>
                )}
                <Button
                  size="sm"
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

        <div className="border-t pt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Coins</p>
          <div className="space-y-1">
            {coinPacks.map((pack) => (
              <div
                key={pack.id}
                className="flex items-center gap-3 py-3 cursor-pointer"
                onClick={() => handleCoinPurchase(`${pack.amount} Coins`)}
              >
                <Coins className="h-5 w-5 text-yellow-500 shrink-0" />
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium" data-testid={`text-coin-amount-${pack.id}`}>{pack.amount} coins</span>
                  {pack.bonus && (
                    <span className="text-xs text-green-600 dark:text-green-400" data-testid={`badge-bonus-${pack.id}`}>{pack.bonus}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid={`button-buy-${pack.id}`}
                >
                  {pack.price}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-2 pb-4">
          All purchases are non-refundable.
        </p>
      </div>
    </div>
  );
}
