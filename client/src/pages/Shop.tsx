
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Flame, Crown, Star, Coins, Check, Sparkles, Eye, MessageCircle, Filter, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingPeriod = "weekly" | "monthly" | "6month";

const subscriptionPlans = [
  {
    id: "go-plus",
    name: "Go+",
    tagline: "See more, connect more",
    icon: Star,
    color: "text-yellow-500",
    prices: {
      weekly: { amount: "$6.99", perMonth: "$27.96/mo" },
      monthly: { amount: "$19.99", perMonth: "$19.99/mo" },
      "6month": { amount: "$59.99", perMonth: "$10.00/mo", save: "Save 50%" },
    },
    features: [
      { icon: Heart, text: "Unlimited likes" },
      { icon: Eye, text: "See who viewed your profile" },
      { icon: Zap, text: "1 free Boost per month" },
      { icon: Filter, text: "Advanced filters" },
    ],
  },
  {
    id: "go-premium",
    name: "Go Premium",
    tagline: "Get noticed first",
    icon: Crown,
    color: "text-purple-500",
    popular: true,
    prices: {
      weekly: { amount: "$12.99", perMonth: "$51.96/mo" },
      monthly: { amount: "$34.99", perMonth: "$34.99/mo" },
      "6month": { amount: "$119.99", perMonth: "$20.00/mo", save: "Save 43%" },
    },
    features: [
      { icon: Heart, text: "Everything in Go+" },
      { icon: Sparkles, text: "Priority profile — seen first" },
      { icon: MessageCircle, text: "Message before matching" },
      { icon: Eye, text: "See who likes you" },
      { icon: Zap, text: "3 free Boosts per month" },
      { icon: Star, text: "5 Super Likes per week" },
    ],
  },
];

const boostProducts = [
  {
    id: "boost-1",
    name: "1 Boost",
    description: "30 min of extra visibility",
    price: "$4.99",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    id: "boost-5",
    name: "5 Boosts",
    description: "Best for a big night out",
    price: "$14.99",
    priceEach: "$3.00 each",
    icon: Flame,
    color: "text-orange-500",
    popular: true,
  },
  {
    id: "boost-10",
    name: "10 Boosts",
    description: "For the whole week",
    price: "$24.99",
    priceEach: "$2.50 each",
    icon: Crown,
    color: "text-purple-500",
  },
];

const superLikePacks = [
  { id: "rose-1", amount: 1, price: "$3.99" },
  { id: "rose-3", amount: 3, price: "$9.99", priceEach: "$3.33 each" },
  { id: "rose-5", amount: 5, price: "$14.99", priceEach: "$3.00 each", popular: true },
  { id: "rose-15", amount: 15, price: "$34.99", priceEach: "$2.33 each" },
];

export default function Shop() {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

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

  const handlePurchase = (itemName: string) => {
    toast({
      title: "Coming Soon",
      description: `${itemName} will be available once payments are connected.`,
    });
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const billingLabels: Record<BillingPeriod, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    "6month": "6 Months",
  };

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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subscriptions</p>
          <p className="text-xs text-muted-foreground mb-3">Unlock premium features to meet more people faster.</p>

          <div className="flex items-center gap-1 p-0.5 bg-muted rounded-md mb-4 w-fit">
            {(Object.keys(billingLabels) as BillingPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  billingPeriod === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
                data-testid={`button-billing-${period}`}
              >
                {billingLabels[period]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {subscriptionPlans.map((plan) => {
              const pricing = plan.prices[billingPeriod];
              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative p-4",
                    plan.popular && "border-primary"
                  )}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2.5 left-4 text-[10px]" data-testid={`badge-popular-${plan.id}`}>
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <plan.icon className={cn("h-5 w-5", plan.color)} />
                      <div>
                        <p className="text-sm font-bold" data-testid={`text-plan-name-${plan.id}`}>{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" data-testid={`text-plan-price-${plan.id}`}>{pricing.amount}</p>
                      <p className="text-[10px] text-muted-foreground">{pricing.perMonth}</p>
                      {pricing.save && (
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-400" data-testid={`text-plan-save-${plan.id}`}>{pricing.save}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs text-muted-foreground">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(plan.name)}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    Get {plan.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Boosts</p>
          <p className="text-xs text-muted-foreground mb-3">Stand out on the map. Boosted profiles appear larger and highlighted so nearby people notice you first.</p>
          <div className="space-y-1">
            {boostProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3 py-3">
                <product.icon className={cn("h-5 w-5 shrink-0", product.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" data-testid={`text-boost-name-${product.id}`}>{product.name}</span>
                    {product.popular && (
                      <Badge variant="secondary" className="text-[10px]">Best value</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => boostMutation.mutate(product.id)}
                    disabled={boostMutation.isPending}
                    data-testid={`button-buy-boost-${product.id}`}
                  >
                    {product.price}
                  </Button>
                  {product.priceEach && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{product.priceEach}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Super Likes</p>
          <p className="text-xs text-muted-foreground mb-3">Send a Super Like to let someone know you're interested. They'll see yours before anyone else's.</p>
          <div className="space-y-1">
            {superLikePacks.map((pack) => (
              <div key={pack.id} className="flex items-center gap-3 py-3">
                <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" data-testid={`text-superlike-${pack.id}`}>
                      {pack.amount} Super {pack.amount === 1 ? "Like" : "Likes"}
                    </span>
                    {pack.popular && (
                      <Badge variant="secondary" className="text-[10px]">Best value</Badge>
                    )}
                  </div>
                  {pack.priceEach && (
                    <p className="text-xs text-muted-foreground">{pack.priceEach}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePurchase(`${pack.amount} Super Likes`)}
                  data-testid={`button-buy-superlike-${pack.id}`}
                >
                  {pack.price}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 pb-4">
          <p className="text-[10px] text-muted-foreground text-center">
            Subscriptions auto-renew until cancelled. Cancel anytime in your account settings. All purchases are non-refundable.
          </p>
        </div>
      </div>
    </div>
  );
}
