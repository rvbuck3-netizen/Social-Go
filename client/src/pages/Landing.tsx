
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Shield, Users, Zap, Compass } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Social Go</span>
          </div>
          <a href="/api/login" data-testid="button-login-header">
            <Button size="sm">Sign In</Button>
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4">
        <div className="max-w-lg w-full pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-6">
            <Shield className="h-3 w-3" />
            Safety is our #1 priority
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight mb-3" data-testid="text-hero-title">
            Meet people nearby —<br />without the pressure.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Social Go empowers you to connect confidently with people around you and across the world. Activate Go Mode, share live updates, and instantly discover who's nearby and ready to engage. Build meaningful connections in real time — whether you're stepping out of your comfort zone or expanding your global network.
          </p>
          <a href="/api/login" data-testid="button-login-hero">
            <Button size="lg" className="w-full max-w-xs text-base">
              Get Started
            </Button>
          </a>
          <p className="text-[11px] text-muted-foreground mt-3">Free to join. No credit card required.</p>
        </div>

        <div className="max-w-lg w-full space-y-3 pb-16">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <MapPin className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold mb-0.5">Go Mode</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Broadcast your location to nearby people. Auto-expires for safety.</p>
            </Card>
            <Card className="p-4">
              <Shield className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold mb-0.5">Privacy First</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Your exact location is always hidden. Block and report anyone.</p>
            </Card>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold mb-0.5">Social Feed</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Drop geo-tagged posts and see what's happening around you.</p>
            </Card>
            <Card className="p-4">
              <Zap className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-semibold mb-0.5">Get Noticed</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Boost your profile and stand out on the map with visibility upgrades.</p>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-4 text-center">
        <p className="text-[11px] text-muted-foreground">Social Go {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
