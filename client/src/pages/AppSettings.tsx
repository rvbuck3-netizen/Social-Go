
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, Clock, Ban, LogOut, Bell, Eye, Moon, Info } from "lucide-react";

export default function AppSettings() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const goModeMutation = useMutation({
    mutationFn: async (isGoMode: boolean) => {
      const res = await fetch(api.users.updateStatus.path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGoMode }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({
        title: "Go Mode Updated",
        description: "Your visibility has been changed.",
      });
    },
  });

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-6 w-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="settings-container">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <h1 className="text-base font-semibold" data-testid="text-settings-title">Settings</h1>
      </div>

      <div className="px-4 py-3 border-b space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility</p>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Go Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              Show your location to nearby people
            </p>
          </div>
          <Switch
            checked={user?.isGoMode}
            onCheckedChange={(checked) => goModeMutation.mutate(checked)}
            disabled={goModeMutation.isPending}
            data-testid="switch-go-mode"
          />
        </div>
        {user?.isGoMode && user?.goModeExpiresAt && (
          <p className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-go-mode-expiry">
            <Clock className="h-3 w-3" />
            Auto-expires {new Date(user.goModeExpiresAt).toLocaleTimeString()} for your safety
          </p>
        )}
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Safety & Privacy</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Your exact location is never shown. Nearby users see an approximate area only.</p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Go Mode automatically turns off after 2 hours to protect your privacy.</p>
          </div>
          <div className="flex items-start gap-2">
            <Ban className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">Block or report anyone directly from the map. Blocked users can't see you.</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Preferences</p>
        <div className="flex items-center justify-between gap-4 py-2">
          <Label className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notifications
          </Label>
          <Switch data-testid="switch-notifications" />
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <Label className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            Show distance
          </Label>
          <Switch defaultChecked data-testid="switch-show-distance" />
        </div>
        <div className="flex items-center justify-between gap-4 py-2">
          <Label className="text-sm flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            Dark mode
          </Label>
          <Switch data-testid="switch-dark-mode" />
        </div>
      </div>

      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</p>
        <div className="flex items-center gap-2 py-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Social Go v1.0 — Connect with people nearby</p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6">
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" data-testid="button-sign-out">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
