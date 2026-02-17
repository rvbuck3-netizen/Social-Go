
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Instagram, Twitter, Globe, ArrowLeft, Zap, Shield } from "lucide-react";
import { SiTiktok, SiSnapchat, SiLinkedin, SiFacebook } from "react-icons/si";

export default function UserProfile() {
  const [, params] = useRoute("/user/:username");
  const [, setLocation] = useLocation();
  const username = params?.username;

  const { data: user, isLoading, error } = useQuery<any>({
    queryKey: ['/api/users', username],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) throw new Error("User not found");
      return res.json();
    },
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto pb-20">
        <div className="sticky top-0 z-10 glass border-b border-border/40 px-5 py-3.5 flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/feed")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="px-5 pt-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 flex items-center justify-around">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 glass border-b border-border/40 px-5 py-3.5 flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/feed")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-base font-semibold font-display">Profile</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  const hasSocials = user.instagram || user.twitter || user.tiktok || user.snapchat || user.linkedin || user.facebook || user.website;

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="user-profile-container">
      <div className="sticky top-0 z-10 glass border-b border-border/40 px-5 py-3.5 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => setLocation("/feed")} data-testid="button-back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-base font-semibold font-display">{user.username}</span>
        {user.isBoosted && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Zap className="h-3 w-3" /> Boosted
          </Badge>
        )}
      </div>

      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20" data-testid="img-user-avatar">
            <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
            <AvatarFallback className="bg-muted"><User className="h-10 w-10 text-muted-foreground" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center justify-around text-center">
            <div>
              <p className="font-bold text-lg font-display" data-testid="text-user-posts">0</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg font-display" data-testid="text-user-connections">0</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold" data-testid="text-user-name">{user.username}</p>
          {user.bio && <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed" data-testid="text-user-bio">{user.bio}</p>}
          {user.isGoMode && (
            <Badge variant="secondary" className="mt-2 text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-3 w-3" /> Go Mode Active
            </Badge>
          )}
        </div>

        {hasSocials && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {user.instagram && (
              <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-instagram">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {user.twitter && (
              <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-twitter">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {user.tiktok && (
              <a href={`https://tiktok.com/@${user.tiktok}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-tiktok">
                <SiTiktok className="h-4 w-4" />
              </a>
            )}
            {user.snapchat && (
              <a href={`https://snapchat.com/add/${user.snapchat}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-snapchat">
                <SiSnapchat className="h-4 w-4" />
              </a>
            )}
            {user.linkedin && (
              <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-linkedin">
                <SiLinkedin className="h-4 w-4" />
              </a>
            )}
            {user.facebook && (
              <a href={`https://facebook.com/${user.facebook}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-facebook">
                <SiFacebook className="h-4 w-4" />
              </a>
            )}
            {user.website && (
              <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-user-website">
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1 gap-1.5" data-testid="button-connect">
            <User className="h-4 w-4" />
            Connect
          </Button>
          <Button size="icon" variant="outline" data-testid="button-report-user">
            <Shield className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
