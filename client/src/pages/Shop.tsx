
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Flame, Crown, Star, Coins, Check, Sparkles, Eye, MessageCircle, Filter, Heart, ChevronDown, Shield, TrendingUp, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type BillingPeriod = "weekly" | "monthly" | "6month";

interface PlanPricing {
  amount: string;
  perMonth: string;
  save?: string;
}

const subscriptionPlans = [
  {
    id: "go-plus",
    name: "Go+",
    tagline: "See more, connect more",
    icon: Star,
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-500/8",
    prices: {
      weekly: { amount: "$2.99", perMonth: "$11.96/mo" } as PlanPricing,
      monthly: { amount: "$7.99", perMonth: "$7.99/mo" } as PlanPricing,
      "6month": { amount: "$19.99", perMonth: "$3.33/mo", save: "Save 58%" } as PlanPricing,
    },
    features: [
      { icon: Heart, text: "Unlimited interactions" },
      { icon: Eye, text: "See who viewed your profile" },
      { icon: Zap, text: "1 free Boost per month" },
      { icon: Filter, text: "Advanced filters" },
    ],
  },
  {
    id: "go-premium",
    name: "Go Premium",
    tagline: "The ultimate Social Go experience",
    icon: Crown,
    iconColor: "text-violet-500",
    badgeBg: "bg-violet-500/8",
    popular: true,
    prices: {
      weekly: { amount: "$4.99", perMonth: "$19.96/mo" } as PlanPricing,
      monthly: { amount: "$12.99", perMonth: "$12.99/mo" } as PlanPricing,
      "6month": { amount: "$39.99", perMonth: "$6.67/mo", save: "Save 49%" } as PlanPricing,
    },
    features: [
      { icon: Heart, text: "Everything in Go+" },
      { icon: Sparkles, text: "Priority profile — seen first" },
      { icon: MessageCircle, text: "Message anyone nearby" },
      { icon: Eye, text: "See who's interested in you" },
      { icon: Zap, text: "3 free Boosts per month" },
      { icon: Star, text: "5 Shoutouts per week" },
    ],
  },
];

const boostProducts = [
  {
    id: "boost-1",
    name: "1 Boost",
    subtitle: "30 min of visibility",
    price: "$2.49",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/8",
  },
  {
    id: "boost-5",
    name: "5 Boosts",
    subtitle: "Best for a night out",
    price: "$7.49",
    priceEach: "$1.50 each",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/8",
    popular: true,
  },
  {
    id: "boost-10",
    name: "10 Boosts",
    subtitle: "Stay visible all week",
    price: "$12.49",
    priceEach: "$1.25 each",
    icon: Crown,
    color: "text-violet-500",
    bg: "bg-violet-500/8",
  },
];

const shoutoutPacks = [
  { id: "shoutout-1", amount: 1, price: "$1.99" },
  { id: "shoutout-3", amount: 3, price: "$4.99", priceEach: "$1.66 each" },
  { id: "shoutout-5", amount: 5, price: "$7.49", priceEach: "$1.50 each", popular: true },
  { id: "shoutout-15", amount: 15, price: "$17.49", priceEach: "$1.17 each" },
];

const tokenPacks = [
  { id: "tokens-50", amount: 50, price: "$2.49" },
  { id: "tokens-150", amount: 150, price: "$5.99", priceEach: "$0.04 each", bonus: "+25 free" },
  { id: "tokens-500", amount: 500, price: "$14.99", priceEach: "$0.03 each", bonus: "+100 free", popular: true },
  { id: "tokens-1200", amount: 1200, price: "$29.99", priceEach: "$0.025 each", bonus: "+300 free" },
];

export default function Shop() {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("6month");
  const [openSection, setOpenSection] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const billingLabels: Record<BillingPeriod, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    "6month": "6 Months",
  };

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="shop-container">
      <div className="sticky top-0 z-10 glass border-b border-border/40 px-5 py-3.5 flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold font-display" data-testid="text-shop-title">Shop</h1>
        <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
          <Coins className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-sm font-semibold" data-testid="text-coin-balance">{user?.coins || 0}</span>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-300" />
              <span className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wider">Limited time</span>
            </div>
            <h2 className="text-primary-foreground text-xl font-bold font-display mb-1">Get noticed instantly</h2>
            <p className="text-primary-foreground/70 text-sm mb-4">Premium members get 3x more connections</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                className="bg-white text-primary border-white font-semibold"
                onClick={() => {
                  const el = document.getElementById('subscriptions-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-hero-cta"
              >
                View Plans
              </Button>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary-foreground/50" />
                <span className="text-primary-foreground/50 text-xs">2.4k+ subscribers</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {user?.isBoosted && user?.boostExpiresAt && (
        <div className="mx-5 mb-4">
          <Card className="p-3 flex items-center gap-3 bg-emerald-500/5 border-emerald-500/15">
            <div className="h-9 w-9 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-testid="text-boost-active">Boost active</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires {new Date(user.boostExpiresAt).toLocaleTimeString()}
              </p>
            </div>
          </Card>
        </div>
      )}

      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold font-display">Quick Boosts</h3>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {boostProducts.map((product) => (
            <Card
              key={product.id}
              className="relative flex flex-col items-center text-center p-4"
              data-testid={`card-boost-${product.id}`}
            >
              {product.popular && (
                <Badge className="absolute -top-2 text-[9px]">Popular</Badge>
              )}
              <div className={cn("h-10 w-10 rounded-md flex items-center justify-center mb-2.5", product.bg)}>
                <product.icon className={cn("h-5 w-5", product.color)} />
              </div>
              <span className="text-xs font-bold" data-testid={`text-boost-name-${product.id}`}>{product.name}</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">{product.subtitle}</span>
              <span className="text-sm font-bold mt-2">{product.price}</span>
              {product.priceEach && (
                <span className="text-[10px] text-muted-foreground">{product.priceEach}</span>
              )}
              <Button
                size="sm"
                className="w-full mt-3 font-semibold"
                onClick={() => boostMutation.mutate(product.id)}
                disabled={boostMutation.isPending}
                data-testid={`button-buy-boost-${product.id}`}
              >
                {boostMutation.isPending ? "..." : "Buy"}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 pb-3" id="subscriptions-section">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold font-display">Subscriptions</h3>
          </div>
          <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-md">
            {(Object.keys(billingLabels) as BillingPeriod[]).map((period) => (
              <Button
                key={period}
                size="sm"
                variant={billingPeriod === period ? "secondary" : "ghost"}
                onClick={() => setBillingPeriod(period)}
                className={cn(
                  "text-xs font-medium",
                  billingPeriod === period
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
                data-testid={`button-billing-${period}`}
              >
                {billingLabels[period]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {subscriptionPlans.map((plan) => {
            const pricing = plan.prices[billingPeriod];
            return (
              <Card
                key={plan.id}
                className={cn("relative overflow-hidden", plan.popular && "ring-1 ring-primary/30")}
                data-testid={`card-plan-${plan.id}`}
              >
                <div className="p-5">
                  {plan.popular && (
                    <Badge className="absolute top-3 right-3 text-[10px] gap-1" data-testid={`badge-popular-${plan.id}`}>
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={cn("h-10 w-10 rounded-md flex items-center justify-center", plan.badgeBg)}>
                      <plan.icon className={cn("h-5 w-5", plan.iconColor)} />
                    </div>
                    <div>
                      <p className="font-bold font-display" data-testid={`text-plan-name-${plan.id}`}>{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl font-extrabold font-display" data-testid={`text-plan-price-${plan.id}`}>{pricing.amount}</span>
                    <span className="text-sm text-muted-foreground">/ {billingPeriod === "weekly" ? "week" : billingPeriod === "monthly" ? "month" : "6 months"}</span>
                    {pricing.save && (
                      <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/8 text-emerald-600 dark:text-emerald-400" data-testid={`text-plan-save-${plan.id}`}>
                        {pricing.save}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full font-semibold"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(plan.name)}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    Get {plan.name}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-6 pb-2">
        <button
          onClick={() => toggleSection("shoutouts")}
          className="w-full flex items-center gap-3 text-left py-1 mb-1"
          data-testid="button-toggle-shoutouts"
        >
          <div className="h-9 w-9 rounded-md bg-orange-500/8 flex items-center justify-center shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold font-display">Shoutouts</p>
            <p className="text-xs text-muted-foreground">Stand out from the crowd</p>
          </div>
          <div className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-muted transition-transform",
            openSection === "shoutouts" && "rotate-180"
          )}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
        {openSection === "shoutouts" && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Send a Shoutout to get noticed. Your profile jumps to the top of their list.</p>
            {shoutoutPacks.map((pack) => (
              <Card key={pack.id} className="flex items-center gap-3 p-3">
                <div className="h-9 w-9 rounded-md bg-orange-500/8 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" data-testid={`text-shoutout-${pack.id}`}>
                      {pack.amount} {pack.amount === 1 ? "Shoutout" : "Shoutouts"}
                    </span>
                    {pack.popular && (
                      <Badge variant="secondary" className="text-[9px]">Best value</Badge>
                    )}
                  </div>
                  {pack.priceEach && (
                    <p className="text-[11px] text-muted-foreground">{pack.priceEach}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="font-semibold"
                  onClick={() => handlePurchase(`${pack.amount} Shoutouts`)}
                  data-testid={`button-buy-shoutout-${pack.id}`}
                >
                  {pack.price}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => toggleSection("tokens")}
          className="w-full flex items-center gap-3 text-left py-1 mb-1"
          data-testid="button-toggle-social-go-tokens"
        >
          <div className="h-9 w-9 rounded-md bg-amber-500/8 flex items-center justify-center shrink-0">
            <Coins className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold font-display">Social Go Tokens</p>
            <p className="text-xs text-muted-foreground">Premium currency that never expires</p>
          </div>
          <div className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-muted transition-transform",
            openSection === "tokens" && "rotate-180"
          )}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
        {openSection === "tokens" && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Use tokens to extend Go Mode, send gifts, and tip profiles. They never expire.</p>
            {tokenPacks.map((pack) => (
              <Card key={pack.id} className="flex items-center gap-3 p-3">
                <div className="h-9 w-9 rounded-md bg-amber-500/8 flex items-center justify-center shrink-0">
                  <Coins className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" data-testid={`text-token-amount-${pack.id}`}>{pack.amount} tokens</span>
                    {pack.popular && (
                      <Badge variant="secondary" className="text-[9px]">Best value</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pack.priceEach && (
                      <span className="text-[11px] text-muted-foreground">{pack.priceEach}</span>
                    )}
                    {pack.bonus && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{pack.bonus}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="font-semibold"
                  onClick={() => handlePurchase(`${pack.amount} Tokens`)}
                  data-testid={`button-buy-token-${pack.id}`}
                >
                  {pack.price}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-6 pb-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold font-display">Why upgrade?</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-md bg-violet-500/8 flex items-center justify-center shrink-0 mt-0.5">
                <Eye className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-xs font-semibold">3x views</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Boosted profiles get 3x more profile views</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-md bg-pink-500/8 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="text-xs font-semibold">5x connections</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Premium users connect 5x more often</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-md bg-blue-500/8 flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-semibold">Message first</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">Break the ice with anyone nearby</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-md bg-emerald-500/8 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold">Full control</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">See who views your profile and shows interest</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-5 pb-6 pt-2">
        Subscriptions auto-renew until cancelled. Cancel anytime in settings. All purchases are non-refundable.
      </p>
    </div>
  );
}
