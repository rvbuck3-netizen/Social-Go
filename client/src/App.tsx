
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SocialMap from "@/pages/SocialMap";
import Feed from "@/pages/Feed";
import Profile from "@/pages/Profile";
import Shop from "@/pages/Shop";
import { MessageCircle, Map as MapIcon, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: MapIcon, label: "Explore" },
    { href: "/feed", icon: MessageCircle, label: "Feed" },
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 flex items-center justify-around z-[2000] pb-safe" data-testid="nav-bottom">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-4 cursor-pointer transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon
                className={cn("h-6 w-6", isActive && "fill-current")}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Router() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <main className="flex-1 overflow-hidden relative">
        <Switch>
          <Route path="/" component={SocialMap} />
          <Route path="/feed" component={Feed} />
          <Route path="/shop" component={Shop} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
