
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User, Instagram, Twitter, Globe, ChevronDown,
  Palette, Sparkles, Camera, Circle, Heart, Music, Coffee, Gamepad2, BookOpen, Dumbbell, Plane, Star,
  Zap, Flame, Trophy, Share2, Copy, Check
} from "lucide-react";
import { SiTiktok, SiSnapchat, SiLinkedin, SiFacebook } from "react-icons/si";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const themeColors = [
  { id: "purple", label: "Purple", color: "bg-purple-500", ring: "ring-purple-500" },
  { id: "blue", label: "Blue", color: "bg-blue-500", ring: "ring-blue-500" },
  { id: "pink", label: "Pink", color: "bg-pink-500", ring: "ring-pink-500" },
  { id: "green", label: "Green", color: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "orange", label: "Orange", color: "bg-orange-500", ring: "ring-orange-500" },
  { id: "red", label: "Red", color: "bg-red-500", ring: "ring-red-500" },
  { id: "cyan", label: "Cyan", color: "bg-cyan-500", ring: "ring-cyan-500" },
  { id: "yellow", label: "Yellow", color: "bg-yellow-400", ring: "ring-yellow-400" },
];

const markerStyles = [
  { id: "default", label: "Classic" },
  { id: "glow", label: "Glow" },
  { id: "pulse", label: "Pulse" },
  { id: "ring", label: "Ring" },
];

const avatarStyles = [
  { id: "avataaars", label: "Avatars" },
  { id: "bottts", label: "Bots" },
  { id: "pixel-art", label: "Pixel" },
  { id: "lorelei", label: "Lorelei" },
  { id: "fun-emoji", label: "Fun" },
];

const interestIcons = [
  { id: "music", icon: Music, label: "Music" },
  { id: "coffee", icon: Coffee, label: "Coffee" },
  { id: "gaming", icon: Gamepad2, label: "Gaming" },
  { id: "reading", icon: BookOpen, label: "Reading" },
  { id: "fitness", icon: Dumbbell, label: "Fitness" },
  { id: "travel", icon: Plane, label: "Travel" },
  { id: "sparkles", icon: Sparkles, label: "Vibes" },
  { id: "heart", icon: Heart, label: "Social" },
];

const moodOptions = [
  { id: "chatty", label: "Down to chat" },
  { id: "exploring", label: "Exploring" },
  { id: "chilling", label: "Just chilling" },
  { id: "meeting", label: "Open to meet" },
  { id: "working", label: "Working nearby" },
  { id: "hanging", label: "Hanging out" },
  { id: "networking", label: "Networking" },
  { id: "newhere", label: "New in town" },
];

export default function Profile() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showMoreSocials, setShowMoreSocials] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("purple");
  const [selectedMarker, setSelectedMarker] = useState("default");
  const [selectedAvatar, setSelectedAvatar] = useState("avataaars");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const [copiedReferral, setCopiedReferral] = useState(false);

  const { data: user, isLoading } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const { data: gamification } = useQuery<any>({
    queryKey: ['/api/gamification/me'],
  });

  const { data: referralData } = useQuery<any>({
    queryKey: ['/api/referral/code'],
  });

  const form = useForm({
    defaultValues: {
      bio: user?.bio || "",
      instagram: user?.instagram || "",
      twitter: user?.twitter || "",
      tiktok: user?.tiktok || "",
      snapchat: user?.snapchat || "",
      linkedin: user?.linkedin || "",
      facebook: user?.facebook || "",
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
        facebook: user.facebook || "",
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

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const currentTheme = themeColors.find(t => t.id === selectedTheme);
  const hasSocials = user?.instagram || user?.twitter || user?.tiktok || user?.snapchat || user?.linkedin || user?.facebook || user?.website;

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="profile-container">
      <div className="sticky top-0 z-10 glass border-b border-border/40 px-5 py-3.5">
        <h1 className="text-base font-semibold font-display">{user?.username}</h1>
      </div>

      <div className="px-5 pt-6 pb-5">
        <div className="flex items-start gap-5">
          <div className="relative">
            <Avatar
              className={cn("h-20 w-20 ring-[3px] ring-offset-[3px] ring-offset-background", currentTheme?.ring)}
              data-testid="img-avatar"
            >
              <AvatarImage src={`https://api.dicebear.com/7.x/${selectedAvatar}/svg?seed=${user?.username || 'You'}`} />
              <AvatarFallback className="bg-muted"><User className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center shadow-sm"
              onClick={() => {
                const idx = avatarStyles.findIndex(a => a.id === selectedAvatar);
                setSelectedAvatar(avatarStyles[(idx + 1) % avatarStyles.length].id);
              }}
              data-testid="button-change-avatar"
            >
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-lg font-bold font-display" data-testid="text-username">{user?.username}</p>
              {user?.isFoundingMember && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400" data-testid="badge-founding-member">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  Founder
                </Badge>
              )}
              {user?.isGoMode && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" data-testid="badge-go-mode">
                  <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
                  Go Mode
                </Badge>
              )}
            </div>
            {user?.bio ? (
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-bio">{user.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">Tap Edit Profile to add a bio</p>
            )}
            {selectedMood && (
              <Badge variant="secondary" className="mt-2 text-[10px]" data-testid="badge-mood">
                {moodOptions.find(m => m.id === selectedMood)?.label}
              </Badge>
            )}
          </div>
        </div>

        {selectedInterests.length > 0 && (
          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            {selectedInterests.map((id) => {
              const interest = interestIcons.find(i => i.id === id);
              if (!interest) return null;
              return (
                <Badge key={id} variant="outline" className="gap-1 text-[10px] py-0.5" data-testid={`badge-interest-${id}`}>
                  <interest.icon className="h-3 w-3" />
                  {interest.label}
                </Badge>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <Card className="py-3.5 text-center">
            <p className="font-bold text-xl font-display" data-testid="text-post-count">0</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Posts</p>
          </Card>
          <Card className="py-3.5 text-center">
            <p className="font-bold text-xl font-display" data-testid="text-nearby-count">0</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Connections</p>
          </Card>
          <Card className="py-3.5 text-center">
            <p className="font-bold text-xl font-display" data-testid="text-coins">{user?.coins || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Coins</p>
          </Card>
        </div>

        {!user?.isBoosted && !user?.subscriptionTier && (
          <Card className="mt-4 p-3.5 flex items-center gap-3 bg-amber-500/5 border-amber-500/15 hover-elevate cursor-pointer" onClick={() => navigate('/shop')} data-testid="card-boost-cta">
            <div className="h-9 w-9 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Boost Your Profile</p>
              <p className="text-[11px] text-muted-foreground">Get 3x more visibility for 30 minutes</p>
            </div>
            <Button size="sm" data-testid="button-boost-profile">
              Boost
            </Button>
          </Card>
        )}

        {gamification && (
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold" data-testid="text-level">Level {gamification.level}</p>
                  <p className="text-[11px] text-muted-foreground">{gamification.xp} XP</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className={cn("h-4 w-4", gamification.streakCount > 0 ? "text-orange-500" : "text-muted-foreground")} />
                <span className="text-sm font-semibold" data-testid="text-streak">{gamification.streakCount}</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${gamification.progressPercent}%` }}
                data-testid="xp-progress-bar"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {gamification.nextLevelXp === Infinity ? "Max level reached" : `${gamification.nextLevelXp - gamification.xp} XP to Level ${gamification.level + 1}`}
            </p>

            {gamification.badges && gamification.badges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs font-medium text-muted-foreground mb-2">Badges</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {gamification.badges.map((badge: any) => (
                    <Badge key={badge.id} variant="secondary" className="text-[10px] gap-1" data-testid={`badge-${badge.code}`}>
                      <Trophy className="h-2.5 w-2.5" />
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {referralData?.code && (() => {
          const referralLink = `${window.location.origin}?ref=${referralData.code}`;
          const shareText = `Join me on Social Go! Use my referral code ${referralData.code} to sign up and we both earn rewards.`;
          const canShare = typeof navigator.share === 'function';

          return (
            <Card className="mt-4 p-4 bg-primary/5 border-primary/15">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Invite Friends</p>
                  <p className="text-[11px] text-muted-foreground">You both earn 100 XP when they join</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border/60 mb-3">
                <p className="text-[11px] text-muted-foreground font-mono truncate flex-1" data-testid="text-referral-code">{referralData.code}</p>
                <Button
                  size="sm"
                  variant={copiedReferral ? "default" : "outline"}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(referralLink);
                      setCopiedReferral(true);
                      toast({ title: "Link copied!", description: "Share it with your friends." });
                      setTimeout(() => setCopiedReferral(false), 2000);
                    } catch {
                      toast({ title: "Copy failed", description: "Try selecting and copying the code manually." });
                    }
                  }}
                  data-testid="button-copy-referral"
                >
                  {copiedReferral ? <><Check className="h-3.5 w-3.5 mr-1" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" /> Copy Link</>}
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {canShare && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      navigator.share({ title: "Join Social Go", text: shareText, url: referralLink }).catch(() => {});
                    }}
                    data-testid="button-share-invite"
                  >
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share with Friends
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={canShare ? "" : "flex-1"}
                  onClick={() => {
                    const smsBody = encodeURIComponent(shareText + " " + referralLink);
                    window.open(`sms:?body=${smsBody}`, '_blank');
                  }}
                  data-testid="button-sms-invite"
                >
                  Text a Friend
                </Button>
              </div>
            </Card>
          );
        })()}

        {hasSocials && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {user?.instagram && (
              <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {user?.twitter && (
              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {user?.tiktok && (
              <a href={`https://tiktok.com/@${user.tiktok}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-tiktok">
                <SiTiktok className="h-4 w-4" />
              </a>
            )}
            {user?.snapchat && (
              <a href={`https://snapchat.com/add/${user.snapchat}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-snapchat">
                <SiSnapchat className="h-4 w-4" />
              </a>
            )}
            {user?.linkedin && (
              <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-linkedin">
                <SiLinkedin className="h-4 w-4" />
              </a>
            )}
            {user?.facebook && (
              <a href={`https://facebook.com/${user.facebook}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-facebook">
                <SiFacebook className="h-4 w-4" />
              </a>
            )}
            {user?.website && (
              <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-website">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="px-5 py-5 border-t border-border/60">
        <button
          type="button"
          className="flex items-center justify-between w-full py-1"
          onClick={() => setShowCustomize(!showCustomize)}
          data-testid="button-toggle-customize"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-primary/8 flex items-center justify-center">
              <Palette className="h-4 w-4 text-primary shrink-0" />
            </div>
            <p className="text-sm font-semibold">Customize Profile</p>
          </div>
          <div className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-muted transition-transform",
            showCustomize && "rotate-180"
          )}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>

        {showCustomize && <div className="space-y-5 mt-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">Profile color</p>
            <div className="flex items-center gap-2 flex-wrap">
              {themeColors.map((theme) => (
                <button
                  key={theme.id}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    theme.color,
                    selectedTheme === theme.id ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" : "opacity-60"
                  )}
                  onClick={() => setSelectedTheme(theme.id)}
                  data-testid={`button-theme-${theme.id}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">Avatar style</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {avatarStyles.map((style) => (
                <Button
                  key={style.id}
                  size="sm"
                  variant={selectedAvatar === style.id ? "default" : "outline"}
                  onClick={() => setSelectedAvatar(style.id)}
                  data-testid={`button-avatar-${style.id}`}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">Map marker style</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {markerStyles.map((style) => (
                <Button
                  key={style.id}
                  size="sm"
                  variant={selectedMarker === style.id ? "default" : "outline"}
                  onClick={() => setSelectedMarker(style.id)}
                  data-testid={`button-marker-${style.id}`}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">Current mood</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.id}
                  size="sm"
                  variant={selectedMood === mood.id ? "default" : "outline"}
                  onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                  data-testid={`button-mood-${mood.id}`}
                >
                  {mood.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">Interests</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {interestIcons.map((interest) => (
                <Button
                  key={interest.id}
                  size="sm"
                  variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
                  onClick={() => toggleInterest(interest.id)}
                  className="gap-1.5"
                  data-testid={`button-interest-${interest.id}`}
                >
                  <interest.icon className="h-3.5 w-3.5" />
                  {interest.label}
                </Button>
              ))}
            </div>
          </div>
        </div>}
      </div>

      <div className="px-5 pt-5 pb-5 border-t border-border/60">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">Edit Profile</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-3">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" className="resize-none text-sm" {...field} data-testid="input-bio" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <button
                type="button"
                className="flex items-center justify-between w-full py-1"
                onClick={() => setShowMoreSocials(!showMoreSocials)}
                data-testid="button-toggle-more-socials"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">Link Socials</p>
                </div>
                <div className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-muted transition-transform",
                  showMoreSocials && "rotate-180"
                )}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>

              {showMoreSocials && (
                <div className="space-y-3 mt-3">
                  <FormField control={form.control} name="instagram" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram</FormLabel>
                      <FormControl><Input placeholder="username" className="text-sm" {...field} data-testid="input-instagram" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="twitter" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><Twitter className="h-3.5 w-3.5 text-sky-500" /> X</FormLabel>
                      <FormControl><Input placeholder="username" className="text-sm" {...field} data-testid="input-twitter" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tiktok" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><SiTiktok className="h-3.5 w-3.5" /> TikTok</FormLabel>
                      <FormControl><Input placeholder="username" className="text-sm" {...field} data-testid="input-tiktok" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="snapchat" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><SiSnapchat className="h-3.5 w-3.5 text-yellow-400" /> Snapchat</FormLabel>
                      <FormControl><Input placeholder="username" className="text-sm" {...field} data-testid="input-snapchat" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="linkedin" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><SiLinkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn</FormLabel>
                      <FormControl><Input placeholder="username or profile slug" className="text-sm" {...field} data-testid="input-linkedin" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="facebook" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><SiFacebook className="h-3.5 w-3.5 text-blue-500" /> Facebook</FormLabel>
                      <FormControl><Input placeholder="username or profile ID" className="text-sm" {...field} data-testid="input-facebook" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs"><Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website</FormLabel>
                      <FormControl><Input placeholder="https://..." className="text-sm" {...field} data-testid="input-website" /></FormControl>
                    </FormItem>
                  )} />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
              Save Profile
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
