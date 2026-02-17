
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, ShieldCheck, Clock, Ban, LogOut, Bell, Moon, Info,
  MapPin, UserX, AlertTriangle, Lock, Fingerprint, MessageSquareWarning,
  HeartHandshake, Phone, Mail, ChevronRight, Globe, Trash2, FileText, HelpCircle,
  Sun
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function useLocalSetting(key: string, defaultValue: boolean): [boolean, (val: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(`socialgo_${key}`);
    if (stored !== null) return stored === "true";
    return defaultValue;
  });

  const update = (val: boolean) => {
    setValue(val);
    localStorage.setItem(`socialgo_${key}`, String(val));
  };

  return [value, update];
}

function useDarkMode(): [boolean, (val: boolean) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("socialgo_dark_mode");
    if (stored !== null) return stored === "true";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("socialgo_dark_mode", String(isDark));
  }, [isDark]);

  return [isDark, setIsDark];
}

function SettingRow({ icon: Icon, iconColor, label, description, children, testId }: {
  icon: any;
  iconColor?: string;
  label: string;
  description: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'}`} />
        </div>
        <div className="space-y-0.5 min-w-0">
          <Label className="text-sm font-medium" data-testid={testId}>{label}</Label>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function NavRow({ icon: Icon, iconColor, label, onClick, testId }: {
  icon: any;
  iconColor?: string;
  label: string;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      className="flex items-center justify-between gap-2 w-full py-2"
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'}`} />
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function AppSettings() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [isDarkMode, setDarkMode] = useDarkMode();
  const [showDistance, setShowDistance] = useLocalSetting("show_distance", true);
  const [hideOnline, setHideOnline] = useLocalSetting("hide_online", false);
  const [incognito, setIncognito] = useLocalSetting("incognito", false);
  const [showSocials, setShowSocials] = useLocalSetting("show_socials", true);
  const [showBio, setShowBio] = useLocalSetting("show_bio", true);
  const [notifNearby, setNotifNearby] = useLocalSetting("notif_nearby", true);
  const [notifInteractions, setNotifInteractions] = useLocalSetting("notif_interactions", true);
  const [notifMessages, setNotifMessages] = useLocalSetting("notif_messages", true);
  const [notifPromo, setNotifPromo] = useLocalSetting("notif_promo", false);

  const goModeMutation = useMutation({
    mutationFn: async (isGoMode: boolean) => {
      const res = await fetch(api.users.updateStatus.path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGoMode }),
      });
      return res.json();
    },
    onSuccess: (_, isGoMode) => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({
        title: isGoMode ? "Go Mode Activated" : "Go Mode Deactivated",
        description: isGoMode ? "You're now visible to nearby people." : "Your location is now hidden.",
      });
    },
  });

  const handleComingSoon = (feature: string) => {
    toast({ title: "Coming Soon", description: `${feature} will be available in a future update.` });
  };

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="settings-container">
      <div className="sticky top-0 z-10 glass border-b border-border/40 px-5 py-3.5">
        <h1 className="text-base font-semibold font-display" data-testid="text-settings-title">Settings</h1>
      </div>

      <div className="px-5 py-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Safety & Visibility</p>
        </div>

        <SettingRow icon={MapPin} iconColor="text-emerald-500" label="Go Mode" description="Broadcast your approximate location to nearby people" testId="label-go-mode">
          <Switch
            checked={user?.isGoMode}
            onCheckedChange={(checked) => goModeMutation.mutate(checked)}
            disabled={goModeMutation.isPending}
            data-testid="switch-go-mode"
          />
        </SettingRow>
        {user?.isGoMode && user?.goModeExpiresAt && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 pl-11" data-testid="text-go-mode-expiry">
            <Clock className="h-3 w-3" />
            Auto-expires {new Date(user.goModeExpiresAt).toLocaleTimeString()}
          </p>
        )}

        <SettingRow icon={MapPin} label="Show distance" description="Let others see how far away you are" testId="label-show-distance">
          <Switch
            checked={showDistance}
            onCheckedChange={(checked) => {
              setShowDistance(checked);
              toast({ title: checked ? "Distance visible" : "Distance hidden", description: "Your preference has been saved." });
            }}
            data-testid="switch-show-distance"
          />
        </SettingRow>

        <SettingRow icon={UserX} label="Hide online status" description="Others won't see when you're active" testId="label-hide-online">
          <Switch
            checked={hideOnline}
            onCheckedChange={(checked) => {
              setHideOnline(checked);
              toast({ title: checked ? "Online status hidden" : "Online status visible", description: "Your preference has been saved." });
            }}
            data-testid="switch-hide-online"
          />
        </SettingRow>

        <SettingRow icon={Fingerprint} label="Incognito browsing" description="View profiles without them knowing" testId="label-incognito">
          <Switch
            checked={incognito}
            onCheckedChange={(checked) => {
              setIncognito(checked);
              toast({ title: checked ? "Incognito mode on" : "Incognito mode off", description: "Your preference has been saved." });
            }}
            data-testid="switch-incognito"
          />
        </SettingRow>
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy Controls</p>
        </div>

        <SettingRow icon={MapPin} label="Exact location sharing" description="Always off. Your location is fuzzed by ~300m" testId="label-exact-location">
          <Switch checked={false} disabled data-testid="switch-exact-location" />
        </SettingRow>

        <SettingRow icon={Globe} label="Show social links" description="Display your Instagram, Twitter, etc. on your profile" testId="label-show-socials">
          <Switch
            checked={showSocials}
            onCheckedChange={(checked) => {
              setShowSocials(checked);
              toast({ title: checked ? "Social links visible" : "Social links hidden", description: "Your preference has been saved." });
            }}
            data-testid="switch-show-socials"
          />
        </SettingRow>

        <SettingRow icon={FileText} label="Show bio on map" description="Display your bio when people tap your marker" testId="label-show-bio">
          <Switch
            checked={showBio}
            onCheckedChange={(checked) => {
              setShowBio(checked);
              toast({ title: checked ? "Bio visible on map" : "Bio hidden from map", description: "Your preference has been saved." });
            }}
            data-testid="switch-show-bio"
          />
        </SettingRow>
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <UserX className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocking & Reporting</p>
        </div>
        <NavRow icon={Ban} label="Blocked users" onClick={() => handleComingSoon("Blocked users list")} testId="button-blocked-list" />
        <NavRow icon={MessageSquareWarning} label="Report history" onClick={() => handleComingSoon("Report history")} testId="button-report-history" />
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</p>
        </div>

        <SettingRow icon={MapPin} label="Nearby activity" description="When new people appear near you" testId="label-notif-nearby">
          <Switch checked={notifNearby} onCheckedChange={setNotifNearby} data-testid="switch-notif-nearby" />
        </SettingRow>
        <SettingRow icon={Fingerprint} label="Interactions & Shoutouts" description="When someone interacts with your profile" testId="label-notif-interactions">
          <Switch checked={notifInteractions} onCheckedChange={setNotifInteractions} data-testid="switch-notif-interactions" />
        </SettingRow>
        <SettingRow icon={Mail} label="Messages" description="When you receive a new message" testId="label-notif-messages">
          <Switch checked={notifMessages} onCheckedChange={setNotifMessages} data-testid="switch-notif-messages" />
        </SettingRow>
        <SettingRow icon={Bell} label="Promotions & tips" description="Special offers and app tips" testId="label-notif-promo">
          <Switch checked={notifPromo} onCheckedChange={setNotifPromo} data-testid="switch-notif-promo" />
        </SettingRow>
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appearance</p>
        </div>

        <SettingRow
          icon={isDarkMode ? Moon : Sun}
          iconColor={isDarkMode ? "text-muted-foreground" : "text-amber-500"}
          label="Dark mode"
          description="Use dark theme throughout the app"
          testId="label-dark-mode"
        >
          <Switch
            checked={isDarkMode}
            onCheckedChange={(checked) => {
              setDarkMode(checked);
              toast({ title: checked ? "Dark mode enabled" : "Light mode enabled" });
            }}
            data-testid="switch-dark-mode"
          />
        </SettingRow>
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How We Protect You</p>
        </div>
        <div className="space-y-4">
          {[
            { icon: MapPin, color: "text-emerald-500", title: "Location fuzzing", desc: "Your exact location is never shared. We add a random ~300m offset." },
            { icon: Clock, color: "text-amber-500", title: "Auto-expiring Go Mode", desc: "Go Mode automatically turns off after 2 hours." },
            { icon: Ban, color: "text-red-500", title: "Instant blocking", desc: "Block anyone directly from the map. They can never see you again." },
            { icon: AlertTriangle, color: "text-orange-500", title: "Report & review", desc: "Every report is reviewed. We take harassment seriously." },
            { icon: Fingerprint, color: "text-violet-500", title: "Data encryption", desc: "All data encrypted in transit and at rest. Never sold to third parties." },
            { icon: HeartHandshake, color: "text-pink-500", title: "Community guidelines", desc: "Everyone agrees to treat others with respect." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support & Legal</p>
        </div>
        <NavRow icon={HelpCircle} label="Help Center" onClick={() => handleComingSoon("Help Center")} testId="button-help-center" />
        <NavRow icon={ShieldCheck} label="Safety tips" onClick={() => handleComingSoon("Safety tips")} testId="button-safety-tips" />
        <NavRow icon={Mail} label="Contact support" onClick={() => handleComingSoon("Contact support")} testId="button-contact-support" />
        <NavRow icon={Phone} iconColor="text-red-500" label="Emergency resources" onClick={() => handleComingSoon("Emergency resources")} testId="button-emergency" />
        <NavRow icon={FileText} label="Privacy policy" onClick={() => handleComingSoon("Privacy policy")} testId="button-privacy-policy" />
        <NavRow icon={FileText} label="Terms of service" onClick={() => handleComingSoon("Terms of service")} testId="button-terms" />
      </div>

      <div className="h-px bg-border/60 mx-5" />

      <div className="px-5 py-5 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
        </div>
        <NavRow icon={Globe} label="Manage subscription" onClick={() => handleComingSoon("Manage subscription")} testId="button-manage-subscription" />
        <button
          className="flex items-center justify-between gap-2 w-full py-2 text-destructive"
          onClick={() => setShowDeleteDialog(true)}
          data-testid="button-delete-account"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-destructive/8 flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4" />
            </div>
            <span className="text-sm">Delete account</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pt-2 pb-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive"
          onClick={() => setShowSignOutDialog(true)}
          data-testid="button-sign-out"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="px-5 pb-6 pt-2">
        <p className="text-[10px] text-muted-foreground text-center">Social Go v1.0</p>
        <p className="text-[10px] text-muted-foreground text-center">Built to help people connect safely</p>
      </div>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign back in to access your profile and see nearby people.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-signout">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} data-testid="button-confirm-signout">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your profile, all your posts, and remove you from the map. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                toast({ title: "Coming Soon", description: "Account deletion will be available in a future update." });
              }}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
