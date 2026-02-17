
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@shared/routes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin, User, Heart, MessageCircle as MessageIcon, Send, Bookmark, MoreHorizontal, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const locationVibes = [
  "Nearby", "In the area", "Around the corner", "Close by", "In the neighborhood"
];

function getVibe(id: number) {
  return locationVibes[id % locationVibes.length];
}

export default function Feed() {
  const [, setLocation] = useLocation();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: [api.posts.list.path],
  });

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleSave = (postId: number) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="border-b px-4 py-3">
          <h1 className="text-base font-semibold" data-testid="text-feed-title">Feed</h1>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-4 pt-1">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="feed-container">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold" data-testid="text-feed-title">Nearby</h1>
        </div>
        <Badge variant="secondary" className="text-[10px] gap-1" data-testid="badge-post-count">
          {posts?.length || 0} updates
        </Badge>
      </div>

      <div className="divide-y">
        {posts?.map((post, index) => {
          const isLiked = likedPosts.has(post.id);
          const isSaved = savedPosts.has(post.id);
          return (
            <div key={post.id} className="px-4 py-4" data-testid={`post-item-${post.id}`}>
              <div className="flex gap-3">
                <button onClick={() => setLocation(`/user/${post.authorName}`)} className="shrink-0" data-testid={`button-avatar-${post.id}`}>
                  <Avatar className="h-10 w-10 ring-1 ring-border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <button
                        onClick={() => setLocation(`/user/${post.authorName}`)}
                        className="font-semibold text-sm text-left truncate"
                        data-testid={`text-author-${post.id}`}
                      >
                        {post.authorName}
                      </button>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <button className="text-muted-foreground shrink-0 p-1" data-testid={`button-more-${post.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                    {post.latitude != null && post.longitude != null ? (
                      <>
                        <MapPin className="h-3 w-3 text-primary/70" />
                        <span className="text-[11px] text-primary/70 font-medium">{getVibe(post.id)}</span>
                      </>
                    ) : (
                      <>
                        <Compass className="h-3 w-3 text-muted-foreground/70" />
                        <span className="text-[11px] text-muted-foreground/70 font-medium">Shared an update</span>
                      </>
                    )}
                  </div>

                  <p className="text-[15px] leading-relaxed" data-testid={`text-content-${post.id}`}>{post.content}</p>

                  <div className="flex items-center justify-between mt-3 -ml-1.5">
                    <div className="flex items-center gap-4">
                      <button
                        className="flex items-center gap-1.5 p-1.5 transition-colors"
                        onClick={() => toggleLike(post.id)}
                        data-testid={`button-like-${post.id}`}
                      >
                        <Heart
                          className={cn(
                            "h-[18px] w-[18px] transition-all",
                            isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"
                          )}
                          strokeWidth={isLiked ? 0 : 1.5}
                        />
                        {isLiked && <span className="text-xs text-red-500 font-medium">1</span>}
                      </button>
                      <button className="flex items-center gap-1.5 p-1.5 text-muted-foreground transition-colors" data-testid={`button-comment-${post.id}`}>
                        <MessageIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                      </button>
                      <button className="flex items-center gap-1.5 p-1.5 text-muted-foreground transition-colors" data-testid={`button-share-${post.id}`}>
                        <Send className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <button
                      className="p-1.5 transition-colors"
                      onClick={() => toggleSave(post.id)}
                      data-testid={`button-save-${post.id}`}
                    >
                      <Bookmark
                        className={cn(
                          "h-[18px] w-[18px] transition-all",
                          isSaved ? "fill-foreground text-foreground" : "text-muted-foreground"
                        )}
                        strokeWidth={isSaved ? 0 : 1.5}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {posts?.length === 0 && (
        <div className="text-center py-20 px-6">
          <Compass className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium">Nothing nearby yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share what's happening around you</p>
        </div>
      )}
    </div>
  );
}
