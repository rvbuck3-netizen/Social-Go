
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import SocialMap from "@/pages/SocialMap";
import Feed from "@/pages/Feed";
import Profile from "@/pages/Profile";
import Shop from "@/pages/Shop";
import UserProfile from "@/pages/UserProfile";
import AppSettings from "@/pages/AppSettings";
import AgeVerification from "@/components/AgeVerification";
import Onboarding from "@/components/Onboarding";
import { MessageCircle, Map as MapIcon, User, ShoppingBag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

function BottomNav() {
  const [location] = useLocation();
  const navItems = [
    { href: "/", icon: MapIcon, label: "Explore" },
    { href: "/feed", icon: MessageCircle, label: "Feed" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/40 flex items-center justify-around z-[2000] pb-safe" role="navigation" aria-label="Main navigation" data-testid="nav-bottom">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 px-4 cursor-pointer transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.2 : 1.5}
              />
              <span className={cn("text-[10px]", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function AuthenticatedApp() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <main className="flex-1 overflow-hidden relative">
        <Switch>
          <Route path="/" component={SocialMap} />
          <Route path="/feed" component={Feed} />
          <Route path="/user/:username" component={UserProfile} />
          <Route path="/shop" component={Shop} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={AppSettings} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function AgeGatedApp() {
  const { data: profile, isLoading: profileLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profile && !profile.ageVerified) {
    return <AgeVerification />;
  }

  if (profile && !profile.onboardingCompleted) {
    return <Onboarding />;
  }

  return <AuthenticatedApp />;
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return <AgeGatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
