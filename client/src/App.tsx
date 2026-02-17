
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SocialMap from "@/pages/SocialMap";
import Feed from "@/pages/Feed";
import Profile from "@/pages/Profile";
import { Rss, Map as MapIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/feed", icon: Rss, label: "Feed" },
    { href: "/", icon: MapIcon, label: "Social Go" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t flex items-center justify-around px-6 z-[2000] pb-safe">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <span className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors relative group cursor-pointer",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <item.icon className={cn(
                "h-6 w-6 transition-transform",
                isActive ? "scale-110" : "group-hover:scale-105"
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute -top-1 w-12 h-1 bg-primary rounded-full blur-[2px]" />
              )}
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
