
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Shield, Users, Zap, Compass, ArrowRight, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 glass">
        <div className="flex items-center justify-between px-5 py-3.5 max-w-lg mx-auto">
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

      <main className="flex-1 flex flex-col items-center px-5">
        <div className="max-w-lg w-full pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/8 text-primary text-xs font-medium px-3 py-1.5 rounded-md mb-6">
            <Shield className="h-3 w-3" />
            Safety-first social discovery
          </div>
          <h1 className="text-4xl font-bold tracking-tight leading-[1.15] mb-4 font-display" data-testid="text-hero-title">
            Meet people nearby,<br />without the pressure
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-10 max-w-sm mx-auto">
            Connect confidently with people around you. Activate Go Mode, share live updates, and discover who's nearby.
          </p>
          <div className="flex flex-col items-center gap-3">
            <a href="/api/login" data-testid="button-login-hero" className="w-full max-w-xs">
              <Button size="lg" className="w-full text-[15px] gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <p className="text-xs text-muted-foreground">Free to join. No credit card required.</p>
          </div>
        </div>

        <div className="max-w-lg w-full pb-20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">How it works</p>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-5">
              <div className="h-9 w-9 rounded-md bg-primary/8 flex items-center justify-center mb-3">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-semibold mb-1">Go Mode</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Broadcast your location to nearby people. Auto-expires for safety.</p>
            </Card>
            <Card className="p-5">
              <div className="h-9 w-9 rounded-md bg-emerald-500/8 flex items-center justify-center mb-3">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold mb-1">Privacy First</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Your exact location is always hidden. Block and report anyone.</p>
            </Card>
            <Card className="p-5">
              <div className="h-9 w-9 rounded-md bg-amber-500/8 flex items-center justify-center mb-3">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-semibold mb-1">Social Feed</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Drop geo-tagged posts and see what's happening around you.</p>
            </Card>
            <Card className="p-5">
              <div className="h-9 w-9 rounded-md bg-violet-500/8 flex items-center justify-center mb-3">
                <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-sm font-semibold mb-1">Get Noticed</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Boost your profile and stand out with visibility upgrades.</p>
            </Card>
          </div>

          <div className="mt-8 rounded-md bg-muted/60 p-5 flex items-start gap-3">
            <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-0.5">Expand your network globally</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Whether you're stepping out of your comfort zone or networking in a new city, Social Go helps you break the ice with confidence.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center">
        <p className="text-xs text-muted-foreground">Social Go {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
