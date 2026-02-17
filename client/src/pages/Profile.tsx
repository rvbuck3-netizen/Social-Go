
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Shield, ShieldCheck, Instagram, Twitter, Globe, Settings, Clock, Ban, ChevronDown, ChevronUp } from "lucide-react";
import { SiTiktok, SiSnapchat, SiLinkedin } from "react-icons/si";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

export default function Profile() {
  const { toast } = useToast();
  const [showMoreSocials, setShowMoreSocials] = useState(false);

  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const form = useForm({
    defaultValues: {
      bio: user?.bio || "",
      instagram: user?.instagram || "",
      twitter: user?.twitter || "",
      tiktok: user?.tiktok || "",
      snapchat: user?.snapchat || "",
      linkedin: user?.linkedin || "",
      website: user?.website || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        bio: user.bio || "",
        instagram: user.instagram || "",
        twitter: user.twitter || "",
        tiktok: user.tiktok || "",
        snapchat: user.snapchat || "",
        linkedin: user.linkedin || "",
        website: user.website || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.users.updateStatus.path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({ title: "Profile updated" });
    },
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

  const hasSocials = user?.instagram || user?.twitter || user?.tiktok || user?.snapchat || user?.linkedin || user?.website;

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="profile-container">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between gap-2">
        <h1 className="text-base font-semibold">{user?.username}</h1>
        <Button size="icon" variant="ghost" data-testid="button-settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border border-border" data-testid="img-avatar">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center justify-around text-center">
            <div>
              <p className="font-bold text-lg" data-testid="text-post-count">0</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg" data-testid="text-nearby-count">0</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div>
              <p className="font-bold text-lg" data-testid="text-coins">{user?.coins || 0}</p>
              <p className="text-xs text-muted-foreground">Coins</p>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm font-semibold" data-testid="text-username">{user?.username}</p>
          {user?.bio && <p className="text-sm text-muted-foreground mt-0.5" data-testid="text-bio">{user?.bio}</p>}
        </div>

        {hasSocials && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {user?.instagram && (
              <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" data-testid="link-instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {user?.twitter && (
              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {user?.tiktok && (
              <a href={`https://tiktok.com/@${user.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" data-testid="link-tiktok">
                <SiTiktok className="h-4 w-4" />
              </a>
            )}
            {user?.snapchat && (
              <a href={`https://snapchat.com/add/${user.snapchat}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" data-testid="link-snapchat">
                <SiSnapchat className="h-4 w-4" />
              </a>
            )}
            {user?.linkedin && (
              <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" data-testid="link-linkedin">
                <SiLinkedin className="h-4 w-4" />
              </a>
            )}
            {user?.website && (
              <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground" data-testid="link-website">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-y space-y-3">
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
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Safety</p>
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

      <div className="px-4 pt-4 pb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Edit Profile</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-3">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" className="resize-none text-sm" {...field} data-testid="input-bio" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Socials</p>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="username" className="text-sm" {...field} data-testid="input-instagram" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="username" className="text-sm" {...field} data-testid="input-twitter" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground py-1"
                  onClick={() => setShowMoreSocials(!showMoreSocials)}
                  data-testid="button-toggle-more-socials"
                >
                  {showMoreSocials ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showMoreSocials ? "Show less" : "More socials"}
                </button>

                {showMoreSocials && (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-xs">
                            <SiTiktok className="h-3.5 w-3.5" /> TikTok
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="username" className="text-sm" {...field} data-testid="input-tiktok" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="snapchat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-xs">
                            <SiSnapchat className="h-3.5 w-3.5 text-yellow-400" /> Snapchat
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="username" className="text-sm" {...field} data-testid="input-snapchat" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-xs">
                            <SiLinkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="username or profile slug" className="text-sm" {...field} data-testid="input-linkedin" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5 text-xs">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." className="text-sm" {...field} data-testid="input-website" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
              Save Profile
            </Button>
          </form>
        </Form>
      </div>

      <div className="px-4 pb-6">
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" data-testid="button-sign-out">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
