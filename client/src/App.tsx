
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@shared/routes";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import SocialMap from "@/pages/SocialMap";
import Feed from "@/pages/Feed";
import Profile from "@/pages/Profile";
import Shop from "@/pages/Shop";
import UserProfile from "@/pages/UserProfile";
import AppSettings from "@/pages/AppSettings";
import { MessageCircle, Map as MapIcon, User, ShoppingBag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function BottomNav() {
  const [location] = useLocation();
  const { data: profile } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const isGoMode = profile?.isGoMode === true;

  const navItems = [
    { href: "/", icon: MapIcon, label: "Explore" },
    { href: "/feed", icon: MessageCircle, label: "Feed" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 flex items-center justify-around z-[2000] pb-safe" role="navigation" aria-label="Main navigation" data-testid="nav-bottom">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-4 cursor-pointer transition-colors relative",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <span className="relative">
                <item.icon
                  className={cn("h-6 w-6", isActive && "fill-current")}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {item.label === "Explore" && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                      isGoMode ? "bg-green-500" : "bg-red-500"
                    )}
                    data-testid="indicator-go-status"
                  />
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
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

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="h-6 w-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
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
