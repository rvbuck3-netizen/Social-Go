
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Users, Zap, Compass, ArrowRight, Globe, Star, MessageCircle, Eye, Sparkles, Lock, Clock } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    location: "Los Angeles, CA",
    text: "I moved to a new city and Social Go helped me find people to hang out with on my first weekend. The Go Mode feature is genius.",
    rating: 5,
  },
  {
    name: "James K.",
    location: "Austin, TX",
    text: "Love how my location stays fuzzy so I feel safe. Met some amazing people at a coffee shop through this app.",
    rating: 5,
  },
  {
    name: "Priya R.",
    location: "New York, NY",
    text: "Finally a social app that doesn't feel creepy. The auto-expiring location and blocking features make me feel in control.",
    rating: 5,
  },
];

const features = [
  {
    icon: MapPin,
    title: "Go Mode",
    description: "Tap to broadcast your general location and let nearby people know you're open to connecting. Auto-expires after 2 hours for your safety.",
    color: "text-primary",
    bg: "bg-primary/8",
  },
  {
    icon: MessageCircle,
    title: "Geo-Tagged Posts",
    description: "Drop messages pinned to real-world locations. Share recommendations, ask for tips, or just say hello to your neighborhood.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/8",
  },
  {
    icon: Eye,
    title: "Local & Global Discovery",
    description: "See who's nearby on a live satellite map. Explore your neighborhood or discover people and posts from cities around the world.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/8",
  },
  {
    icon: Sparkles,
    title: "Visibility Boosts",
    description: "Stand out from the crowd with profile boosts and shoutouts. Get noticed by more people when it matters most.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/8",
  },
];

const safetyFeatures = [
  {
    icon: Lock,
    title: "Fuzzy Location",
    description: "Your exact location is never shared. We add a ~300m offset so people see your general area, not your doorstep.",
  },
  {
    icon: Clock,
    title: "Auto-Expiring",
    description: "Go Mode automatically turns off after 2 hours. You're always in control of when you're visible.",
  },
  {
    icon: Shield,
    title: "Block & Report",
    description: "One-tap blocking and reporting. We take safety seriously so you can focus on making genuine connections.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Compass className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight font-display">Social Go</span>
          </div>
          <a href="/api/login" data-testid="button-login-header">
            <Button size="sm" variant="outline">Sign In</Button>
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <section className="w-full px-5 pt-20 pb-16 text-center">
          <div className="max-w-xl mx-auto">
            <Badge className="mb-6 no-default-hover-elevate no-default-active-elevate">
              <Shield className="h-3 w-3 mr-1.5" />
              Safety-first social discovery
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5 font-display" data-testid="text-hero-title">
              Meet people nearby,<br />without the pressure
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md mx-auto">
              Connect confidently with people around you. Activate Go Mode to broadcast your availability, drop geo-tagged posts, and discover who's nearby — all with your privacy protected.
            </p>
            <div className="flex flex-col items-center gap-3">
              <a href="/api/login" data-testid="button-login-hero" className="w-full max-w-xs">
                <Button size="lg" className="w-full text-[15px] gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">No credit card required. Sign in with Google, GitHub, or email.</p>
            </div>
          </div>
        </section>

        <section className="w-full px-5 pb-16" data-testid="section-features">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Features</p>
              <h2 className="text-2xl font-bold font-display">Everything you need to connect</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature) => (
                <Card key={feature.title} className="p-5">
                  <div className={`h-9 w-9 rounded-md ${feature.bg} flex items-center justify-center mb-3`}>
                    <feature.icon className={`h-4 w-4 ${feature.color}`} />
                  </div>
                  <p className="text-sm font-semibold mb-1.5">{feature.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-5 pb-16" data-testid="section-safety">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Safety Matters</p>
              <h2 className="text-2xl font-bold font-display">Built with privacy at the core</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {safetyFeatures.map((feature) => (
                <Card key={feature.title} className="p-5 text-center">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center mb-3 mx-auto">
                    <feature.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold mb-1.5">{feature.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-5 pb-16" data-testid="section-testimonials">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What People Say</p>
              <h2 className="text-2xl font-bold font-display">Loved by real users</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="p-5">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed mb-4 text-muted-foreground">"{t.text}"</p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.location}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-5 pb-16" data-testid="section-how-it-works">
          <div className="max-w-xl mx-auto">
            <Card className="p-6 sm:p-8 text-center bg-muted/40">
              <Globe className="h-6 w-6 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold font-display mb-2">How It Works</h2>
              <div className="space-y-4 mt-6 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-semibold">Sign up in seconds</p>
                    <p className="text-xs text-muted-foreground">Use Google, GitHub, Apple, or email. No lengthy forms.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-semibold">Activate Go Mode</p>
                    <p className="text-xs text-muted-foreground">One tap to broadcast that you're open to meeting people nearby.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-sm font-semibold">Explore & connect</p>
                    <p className="text-xs text-muted-foreground">See nearby people on the map, read local posts, and start conversations.</p>
                  </div>
                </div>
              </div>
              <a href="/api/login" className="inline-block mt-8" data-testid="button-login-cta">
                <Button size="lg" className="gap-2">
                  Start Exploring
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30" data-testid="footer">
        <div className="max-w-3xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                  <Compass className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold font-display">Social Go</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">Location-based social discovery. Meet people nearby with privacy and confidence.</p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <a href="mailto:support@socialgoapp.com" className="hover-elevate rounded-md px-1 -mx-1" data-testid="link-contact">support@socialgoapp.com</a>
              <div className="flex items-center gap-3 flex-wrap">
                <a href="/privacy" className="hover-elevate rounded-md px-1 -mx-1" data-testid="link-privacy">Privacy Policy</a>
                <a href="/terms" className="hover-elevate rounded-md px-1 -mx-1" data-testid="link-terms">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-6 pt-4 text-center">
            <p className="text-[11px] text-muted-foreground">{new Date().getFullYear()} Social Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
