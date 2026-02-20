
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap, Flame, Crown, Star, Coins, Check, Sparkles, Eye, MessageCircle, Filter, Heart, ChevronDown, Shield, TrendingUp, Users, Clock, Loader2, ExternalLink, MapPin, Building2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const fallbackSubscriptions: StripeProduct[] = [
  {
    id: "fallback-go-plus",
    name: "Go+",
    description: "See more, connect more",
    metadata: { type: "subscription", tier: "go-plus" },
    prices: [
      { id: "fallback-plus-monthly", unitAmount: 999, currency: "usd", recurring: { interval: "month", interval_count: 1 }, metadata: { period: "monthly" } },
      { id: "fallback-plus-6month", unitAmount: 4999, currency: "usd", recurring: { interval: "month", interval_count: 6 }, metadata: { period: "6month" } },
    ],
  },
  {
    id: "fallback-go-premium",
    name: "Go Premium",
    description: "The ultimate Social Go experience",
    metadata: { type: "subscription", tier: "go-premium" },
    prices: [
      { id: "fallback-premium-monthly", unitAmount: 1999, currency: "usd", recurring: { interval: "month", interval_count: 1 }, metadata: { period: "monthly" } },
      { id: "fallback-premium-6month", unitAmount: 9999, currency: "usd", recurring: { interval: "month", interval_count: 6 }, metadata: { period: "6month" } },
    ],
  },
];

const fallbackBoosts: StripeProduct[] = [
  { id: "fallback-boost-1", name: "1 Boost", description: null, metadata: { type: "boost", quantity: "1" }, prices: [{ id: "fb-b1", unitAmount: 299, currency: "usd", recurring: null, metadata: {} }] },
  { id: "fallback-boost-5", name: "5 Boosts", description: null, metadata: { type: "boost", quantity: "5", popular: "true" }, prices: [{ id: "fb-b5", unitAmount: 1199, currency: "usd", recurring: null, metadata: {} }] },
  { id: "fallback-boost-10", name: "10 Boosts", description: null, metadata: { type: "boost", quantity: "10" }, prices: [{ id: "fb-b10", unitAmount: 1999, currency: "usd", recurring: null, metadata: {} }] },
];

const fallbackTokens: StripeProduct[] = [
  { id: "fallback-tokens-50", name: "50 Tokens", description: null, metadata: { type: "tokens", quantity: "50" }, prices: [{ id: "fb-t50", unitAmount: 499, currency: "usd", recurring: null, metadata: {} }] },
  { id: "fallback-tokens-200", name: "200 Tokens", description: null, metadata: { type: "tokens", quantity: "200", bonus: "20" }, prices: [{ id: "fb-t200", unitAmount: 1499, currency: "usd", recurring: null, metadata: {} }] },
  { id: "fallback-tokens-500", name: "500 Tokens", description: null, metadata: { type: "tokens", quantity: "500", bonus: "75", popular: "true" }, prices: [{ id: "fb-t500", unitAmount: 2999, currency: "usd", recurring: null, metadata: {} }] },
];

type BillingPeriod = "weekly" | "monthly" | "6month";

interface StripePrice {
  id: string;
  unitAmount: number;
  currency: string;
  recurring: any;
  metadata: Record<string, string>;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  prices: StripePrice[];
}

const planFeatures: Record<string, Array<{ icon: any; text: string }>> = {
  "go-plus": [
    { icon: Heart, text: "Unlimited interactions" },
    { icon: Eye, text: "See who viewed your profile" },
    { icon: Zap, text: "1 free Boost per month" },
    { icon: Filter, text: "Advanced filters" },
  ],
  "go-premium": [
    { icon: Heart, text: "Everything in Go+" },
    { icon: Sparkles, text: "Priority profile \u2014 seen first" },
    { icon: MessageCircle, text: "Message anyone nearby" },
    { icon: Eye, text: "See who's interested in you" },
    { icon: Zap, text: "3 free Boosts per month" },
    { icon: Star, text: "5 Shoutouts per week" },
  ],
};

const planMeta: Record<string, { icon: any; iconColor: string; badgeBg: string; tagline: string; popular?: boolean }> = {
  "go-plus": { icon: Star, iconColor: "text-amber-500", badgeBg: "bg-amber-500/8", tagline: "See more, connect more" },
  "go-premium": { icon: Crown, iconColor: "text-violet-500", badgeBg: "bg-violet-500/8", tagline: "The ultimate Social Go experience", popular: true },
};

const boostMeta: Record<string, { icon: any; color: string; bg: string; subtitle: string; popular?: boolean }> = {
  "1": { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/8", subtitle: "30 min of visibility" },
  "5": { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/8", subtitle: "Best for a night out", popular: true },
  "10": { icon: Crown, color: "text-violet-500", bg: "bg-violet-500/8", subtitle: "Stay visible all week" },
};

function formatPrice(amount: number) {
  return `$${(amount / 100).toFixed(2)}`;
}

function getPricePerMonth(price: StripePrice): string {
  if (!price.recurring) return "";
  const amount = price.unitAmount;
  const interval = price.recurring.interval;
  const count = price.recurring.interval_count || 1;

  if (interval === "week") return `$${((amount / 100) * 4.33).toFixed(2)}/mo`;
  if (interval === "month" && count === 1) return `$${(amount / 100).toFixed(2)}/mo`;
  if (interval === "month" && count === 6) return `$${((amount / 100) / 6).toFixed(2)}/mo`;
  return "";
}

function getSavePercent(prices: StripePrice[], currentPrice: StripePrice): string | null {
  if (!currentPrice.recurring) return null;
  const monthlyPrice = prices.find(p => p.metadata?.period === "monthly");
  if (!monthlyPrice || monthlyPrice.id === currentPrice.id) return null;
  const monthlyPerMonth = monthlyPrice.unitAmount;
  const interval = currentPrice.recurring.interval;
  const count = currentPrice.recurring.interval_count || 1;
  let currentPerMonth: number;
  if (interval === "week") currentPerMonth = currentPrice.unitAmount * 4.33;
  else if (interval === "month") currentPerMonth = currentPrice.unitAmount / count;
  else return null;
  const savings = Math.round((1 - currentPerMonth / monthlyPerMonth) * 100);
  return savings > 0 ? `Save ${savings}%` : null;
}

function getPeriodLabel(price: StripePrice): string {
  if (!price.recurring) return "";
  const interval = price.recurring.interval;
  const count = price.recurring.interval_count || 1;
  if (interval === "week") return "week";
  if (interval === "month" && count === 1) return "month";
  if (interval === "month" && count === 6) return "6 months";
  return interval;
}

export default function Shop() {
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("6month");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({ title: "Purchase successful!", description: "Thank you for your purchase." });
      window.history.replaceState({}, '', '/shop');
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
    } else if (params.get('cancelled') === 'true') {
      toast({ title: "Purchase cancelled", description: "No charges were made." });
      window.history.replaceState({}, '', '/shop');
    }
  }, []);

  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: StripeProduct[] }>({
    queryKey: ['/api/stripe/products'],
  });

  const { data: subscriptionData } = useQuery<{ subscription: any }>({
    queryKey: ['/api/stripe/subscription'],
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, mode }: { priceId: string; mode: string }) => {
      const res = await apiRequest('POST', '/api/stripe/checkout', { priceId, mode });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Checkout failed", description: "Please try again later." });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/stripe/portal', {});
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Could not open billing portal." });
    },
  });

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const products = productsData?.products || [];
  const stripeAvailable = products.length > 0;
  const subscriptionProducts = stripeAvailable ? products.filter(p => p.metadata?.type === "subscription") : fallbackSubscriptions;
  const boostProducts = stripeAvailable ? products.filter(p => p.metadata?.type === "boost") : fallbackBoosts;
  const shoutoutProducts = products.filter(p => p.metadata?.type === "shoutout");
  const tokenProducts = stripeAvailable ? products.filter(p => p.metadata?.type === "tokens") : fallbackTokens;
  const currentSubscription = subscriptionData?.subscription;

  const periodToMetadata: Record<BillingPeriod, string> = {
    weekly: "weekly",
    monthly: "monthly",
    "6month": "6month",
  };

  const billingLabels: Record<BillingPeriod, string> = {
    weekly: "Weekly",
    monthly: "Monthly",
    "6month": "6 Months",
  };

  const handleCheckout = (priceId: string, isSubscription: boolean) => {
    if (priceId.startsWith("fallback-") || priceId.startsWith("fb-")) {
      toast({ title: "Coming soon", description: "Payments are being set up. Check back shortly!" });
      return;
    }
    checkoutMutation.mutate({ priceId, mode: isSubscription ? "subscription" : "payment" });
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

      {currentSubscription && (
        <div className="mx-5 mb-4">
          <Card className="p-3 flex items-center gap-3 bg-violet-500/5 border-violet-500/15">
            <div className="h-9 w-9 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
              <Crown className="h-4 w-4 text-violet-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400" data-testid="text-subscription-active">
                {currentSubscription.tier === 'go-premium' ? 'Go Premium' : 'Go+'} Active
              </p>
              <p className="text-xs text-muted-foreground">
                Renews {currentSubscription.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd * 1000).toLocaleDateString() : 'soon'}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => portalMutation.mutate()}
              disabled={portalMutation.isPending}
              data-testid="button-manage-subscription"
            >
              {portalMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ExternalLink className="h-3 w-3 mr-1" />Manage</>}
            </Button>
          </Card>
        </div>
      )}

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
        {productsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {boostProducts.sort((a, b) => parseInt(a.metadata?.quantity || "0") - parseInt(b.metadata?.quantity || "0")).map((product) => {
              const qty = product.metadata?.quantity || "1";
              const meta = boostMeta[qty] || boostMeta["1"];
              const price = product.prices[0];
              const priceEach = parseInt(qty) > 1 && price ? `$${(price.unitAmount / 100 / parseInt(qty)).toFixed(2)} each` : undefined;

              return (
                <Card
                  key={product.id}
                  className="relative flex flex-col items-center text-center p-4"
                  data-testid={`card-boost-${qty}`}
                >
                  {meta.popular && (
                    <Badge className="absolute -top-2 text-[9px]">Popular</Badge>
                  )}
                  <div className={cn("h-10 w-10 rounded-md flex items-center justify-center mb-2.5", meta.bg)}>
                    <meta.icon className={cn("h-5 w-5", meta.color)} />
                  </div>
                  <span className="text-xs font-bold" data-testid={`text-boost-name-${qty}`}>{product.name}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{meta.subtitle}</span>
                  <span className="text-sm font-bold mt-2">{price ? formatPrice(price.unitAmount) : "..."}</span>
                  {priceEach && (
                    <span className="text-[10px] text-muted-foreground">{priceEach}</span>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-3 font-semibold"
                    onClick={() => price && handleCheckout(price.id, false)}
                    disabled={checkoutMutation.isPending || !price}
                    data-testid={`button-buy-boost-${qty}`}
                  >
                    {checkoutMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
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

        {productsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptionProducts.sort((a, b) => {
              const order = ["go-plus", "go-premium"];
              return order.indexOf(a.metadata?.tier || "") - order.indexOf(b.metadata?.tier || "");
            }).map((plan) => {
              const tier = plan.metadata?.tier || "";
              const meta = planMeta[tier];
              const features = planFeatures[tier] || [];
              const targetPeriod = periodToMetadata[billingPeriod];
              const selectedPrice = plan.prices.find(p => p.metadata?.period === targetPeriod);
              const save = selectedPrice ? getSavePercent(plan.prices, selectedPrice) : null;
              const isCurrentPlan = currentSubscription?.tier === tier;

              if (!meta) return null;

              return (
                <Card
                  key={plan.id}
                  className={cn("relative overflow-hidden", meta.popular && "ring-1 ring-primary/30")}
                  data-testid={`card-plan-${tier}`}
                >
                  <div className="p-5">
                    {meta.popular && (
                      <Badge className="absolute top-3 right-3 text-[10px] gap-1" data-testid={`badge-popular-${tier}`}>
                        <Sparkles className="h-3 w-3" />
                        Most Popular
                      </Badge>
                    )}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={cn("h-10 w-10 rounded-md flex items-center justify-center", meta.badgeBg)}>
                        <meta.icon className={cn("h-5 w-5", meta.iconColor)} />
                      </div>
                      <div>
                        <p className="font-bold font-display" data-testid={`text-plan-name-${tier}`}>{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{meta.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-4">
                      <span className="text-3xl font-extrabold font-display" data-testid={`text-plan-price-${tier}`}>
                        {selectedPrice ? formatPrice(selectedPrice.unitAmount) : "..."}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {selectedPrice ? getPeriodLabel(selectedPrice) : billingPeriod}
                      </span>
                      {save && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-emerald-500/8 text-emerald-600 dark:text-emerald-400" data-testid={`text-plan-save-${tier}`}>
                          {save}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2.5 mb-5">
                      {features.map((feature, i) => (
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
                      variant={meta.popular ? "default" : "outline"}
                      onClick={() => selectedPrice && handleCheckout(selectedPrice.id, true)}
                      disabled={checkoutMutation.isPending || !selectedPrice || isCurrentPlan}
                      data-testid={`button-subscribe-${tier}`}
                    >
                      {isCurrentPlan ? "Current Plan" : checkoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Get ${plan.name}`}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
            {productsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              shoutoutProducts.sort((a, b) => parseInt(a.metadata?.quantity || "0") - parseInt(b.metadata?.quantity || "0")).map((pack) => {
                const qty = parseInt(pack.metadata?.quantity || "1");
                const price = pack.prices[0];
                const priceEach = qty > 1 && price ? `$${(price.unitAmount / 100 / qty).toFixed(2)} each` : undefined;
                const popular = pack.metadata?.popular === "true";

                return (
                  <Card key={pack.id} className="flex items-center gap-3 p-3">
                    <div className="h-9 w-9 rounded-md bg-orange-500/8 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" data-testid={`text-shoutout-${qty}`}>
                          {qty} {qty === 1 ? "Shoutout" : "Shoutouts"}
                        </span>
                        {popular && (
                          <Badge variant="secondary" className="text-[9px]">Best value</Badge>
                        )}
                      </div>
                      {priceEach && (
                        <p className="text-[11px] text-muted-foreground">{priceEach}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-semibold"
                      onClick={() => price && handleCheckout(price.id, false)}
                      disabled={checkoutMutation.isPending || !price}
                      data-testid={`button-buy-shoutout-${qty}`}
                    >
                      {price ? formatPrice(price.unitAmount) : "..."}
                    </Button>
                  </Card>
                );
              })
            )}
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
            {productsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              tokenProducts.sort((a, b) => parseInt(a.metadata?.quantity || "0") - parseInt(b.metadata?.quantity || "0")).map((pack) => {
                const qty = parseInt(pack.metadata?.quantity || "50");
                const price = pack.prices[0];
                const priceEach = price ? `$${(price.unitAmount / 100 / qty).toFixed(3)} each` : undefined;
                const bonus = pack.metadata?.bonus ? `+${pack.metadata.bonus} free` : undefined;
                const popular = pack.metadata?.popular === "true";

                return (
                  <Card key={pack.id} className="flex items-center gap-3 p-3">
                    <div className="h-9 w-9 rounded-md bg-amber-500/8 flex items-center justify-center shrink-0">
                      <Coins className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" data-testid={`text-token-amount-${qty}`}>{qty} tokens</span>
                        {popular && (
                          <Badge variant="secondary" className="text-[9px]">Best value</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {priceEach && (
                          <span className="text-[11px] text-muted-foreground">{priceEach}</span>
                        )}
                        {bonus && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{bonus}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-semibold"
                      onClick={() => price && handleCheckout(price.id, false)}
                      disabled={checkoutMutation.isPending || !price}
                      data-testid={`button-buy-token-${qty}`}
                    >
                      {price ? formatPrice(price.unitAmount) : "..."}
                    </Button>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => toggleSection("promote")}
          className="w-full flex items-center gap-3 text-left py-1 mb-1"
          data-testid="button-toggle-promote-business"
        >
          <div className="h-9 w-9 rounded-md bg-emerald-500/8 flex items-center justify-center shrink-0">
            <Building2 className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold font-display">Promote Your Business</p>
            <p className="text-xs text-muted-foreground">Place your brand on the Social Go map</p>
          </div>
          <div className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-muted transition-transform",
            openSection === "promote" && "rotate-180"
          )}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
        {openSection === "promote" && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Get a branded pin on the map visible to all nearby users. Great for events, restaurants, shops, and local services.</p>
            {[
              { days: 7, price: "$9.99", label: "1 Week", subtitle: "Perfect for events", id: "promo-7" },
              { days: 30, price: "$29.99", label: "1 Month", subtitle: "Best for local businesses", popular: true, id: "promo-30" },
              { days: 90, price: "$69.99", label: "3 Months", subtitle: "Maximum exposure", id: "promo-90" },
            ].map((pkg) => (
              <Card key={pkg.id} className="flex items-center gap-3 p-3">
                <div className="h-9 w-9 rounded-md bg-emerald-500/8 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" data-testid={`text-promo-label-${pkg.days}`}>{pkg.label}</span>
                    {pkg.popular && (
                      <Badge variant="secondary" className="text-[9px]">Most popular</Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{pkg.subtitle}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="font-semibold"
                  onClick={() => {
                    toast({ title: "Coming soon", description: "Business promotions launching soon! Stay tuned." });
                  }}
                  data-testid={`button-buy-promo-${pkg.days}`}
                >
                  {pkg.price}
                </Button>
              </Card>
            ))}
            <div className="flex items-start gap-2 pt-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">Your branded pin shows your business name, category, and a link to your website on the map for all nearby users.</p>
            </div>
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

      {user?.stripeCustomerId && (
        <div className="px-5 pb-3">
          <Button
            variant="outline"
            className="w-full font-semibold"
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            data-testid="button-manage-billing"
          >
            {portalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
            Manage Billing
          </Button>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground text-center px-5 pb-6 pt-2">
        Subscriptions auto-renew until cancelled. Cancel anytime in settings. All purchases are non-refundable.
      </p>
    </div>
  );
}
