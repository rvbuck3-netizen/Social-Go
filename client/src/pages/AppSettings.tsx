
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, ShieldCheck, Clock, Ban, LogOut, Bell, Eye, Moon, Info,
  MapPin, UserX, AlertTriangle, Lock, Fingerprint, MessageSquareWarning,
  HeartHandshake, Phone, Mail, ChevronRight, Globe, Trash2, FileText, HelpCircle
} from "lucide-react";

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

  const handleComingSoon = (feature: string) => {
    toast({ title: "Coming Soon", description: `${feature} will be available in a future update.` });
  };

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

      <div className="px-4 py-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Safety & Visibility</p>
        </div>
        <p className="text-xs text-muted-foreground">Your safety is our top priority. These controls determine who can see you and how your location is shared.</p>

        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="space-y-0.5">
            <Label className="text-sm font-semibold" data-testid="label-go-mode">Go Mode</Label>
            <p className="text-xs text-muted-foreground">
              Broadcast your approximate location to nearby people. Always fuzzed for your protection.
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

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-show-distance">Show distance</Label>
            <p className="text-xs text-muted-foreground">Let others see how far away you are</p>
          </div>
          <Switch defaultChecked data-testid="switch-show-distance" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-hide-online">Hide online status</Label>
            <p className="text-xs text-muted-foreground">Others won't see when you're active</p>
          </div>
          <Switch data-testid="switch-hide-online" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-incognito">Incognito browsing</Label>
            <p className="text-xs text-muted-foreground">View profiles without them knowing</p>
          </div>
          <Switch data-testid="switch-incognito" />
        </div>
      </div>

      <div className="px-4 py-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-500 shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy Controls</p>
        </div>
        <p className="text-xs text-muted-foreground">Control exactly what information you share and who can contact you.</p>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-exact-location">Exact location sharing</Label>
            <p className="text-xs text-muted-foreground">Always off. Your location is fuzzed by ~300m</p>
          </div>
          <Switch checked={false} disabled data-testid="switch-exact-location" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-show-socials">Show social links</Label>
            <p className="text-xs text-muted-foreground">Display your Instagram, Twitter, etc. on your profile</p>
          </div>
          <Switch defaultChecked data-testid="switch-show-socials" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-show-bio">Show bio on map</Label>
            <p className="text-xs text-muted-foreground">Display your bio when people tap your marker</p>
          </div>
          <Switch defaultChecked data-testid="switch-show-bio" />
        </div>
      </div>

      <div className="px-4 py-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <UserX className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocking & Reporting</p>
        </div>
        <p className="text-xs text-muted-foreground">Manage people you've blocked and review your reports. Blocked users cannot see you or interact with you in any way.</p>

        <button
          className="flex items-center justify-between gap-2 w-full py-2"
          onClick={() => handleComingSoon("Blocked users list")}
          data-testid="button-blocked-list"
        >
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Blocked users</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2"
          onClick={() => handleComingSoon("Report history")}
          data-testid="button-report-history"
        >
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Report history</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 py-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-notif-nearby">Nearby activity</Label>
            <p className="text-xs text-muted-foreground">When new people appear near you</p>
          </div>
          <Switch defaultChecked data-testid="switch-notif-nearby" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-notif-interactions">Interactions & Shoutouts</Label>
            <p className="text-xs text-muted-foreground">When someone interacts with your profile or sends a Shoutout</p>
          </div>
          <Switch defaultChecked data-testid="switch-notif-likes" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-notif-messages">Messages</Label>
            <p className="text-xs text-muted-foreground">When you receive a new message</p>
          </div>
          <Switch defaultChecked data-testid="switch-notif-messages" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-notif-promo">Promotions & tips</Label>
            <p className="text-xs text-muted-foreground">Special offers and app tips</p>
          </div>
          <Switch data-testid="switch-notif-promo" />
        </div>
      </div>

      <div className="px-4 py-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label className="text-sm" data-testid="label-dark-mode">Dark mode</Label>
            <p className="text-xs text-muted-foreground">Use dark theme throughout the app</p>
          </div>
          <Switch data-testid="switch-dark-mode" />
        </div>
      </div>

      <div className="px-4 py-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How We Protect You</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Location fuzzing</p>
              <p className="text-xs text-muted-foreground">Your exact location is never shared. We add a random ~300 meter offset so nobody can pinpoint where you are.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Auto-expiring Go Mode</p>
              <p className="text-xs text-muted-foreground">Go Mode automatically turns off after 2 hours. You'll never accidentally leave your location broadcasting overnight.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Ban className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Instant blocking</p>
              <p className="text-xs text-muted-foreground">Block anyone directly from the map. Blocked users are immediately removed and can never see your profile or location again.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Report & review</p>
              <p className="text-xs text-muted-foreground">Every report is reviewed by our safety team. We take harassment, stalking, and inappropriate behavior very seriously.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Fingerprint className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Data encryption</p>
              <p className="text-xs text-muted-foreground">All personal data is encrypted in transit and at rest. Your information is never sold to third parties.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HeartHandshake className="h-4 w-4 text-pink-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium">Community guidelines</p>
              <p className="text-xs text-muted-foreground">Everyone on Social Go agrees to treat others with respect. Violations result in immediate suspension.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support & Legal</p>
        </div>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Help Center")}
          data-testid="button-help-center"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Help Center</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Safety tips")}
          data-testid="button-safety-tips"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Safety tips</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Contact support")}
          data-testid="button-contact-support"
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Contact support</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Emergency resources")}
          data-testid="button-emergency"
        >
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-red-500" />
            <span className="text-sm">Emergency resources</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Privacy policy")}
          data-testid="button-privacy-policy"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Privacy policy</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Terms of service")}
          data-testid="button-terms"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Terms of service</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 py-4 border-b space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
        </div>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5"
          onClick={() => handleComingSoon("Manage subscription")}
          data-testid="button-manage-subscription"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Manage subscription</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          className="flex items-center justify-between gap-2 w-full py-2.5 text-destructive"
          onClick={() => handleComingSoon("Delete account")}
          data-testid="button-delete-account"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Delete account</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-4 pb-2">
        <a href="/api/logout">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" data-testid="button-sign-out">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </a>
      </div>

      <div className="px-4 pb-6 pt-2">
        <p className="text-[10px] text-muted-foreground text-center">Social Go v1.0</p>
        <p className="text-[10px] text-muted-foreground text-center">Built to help people connect safely</p>
      </div>
    </div>
  );
}
