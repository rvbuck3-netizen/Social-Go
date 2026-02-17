
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@shared/routes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin, User, Heart, MessageCircle as MessageIcon, Send } from "lucide-react";

export default function Feed() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: [api.posts.list.path],
  });

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
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20" data-testid="feed-container">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <h1 className="text-base font-semibold" data-testid="text-feed-title">Feed</h1>
      </div>

      <div className="divide-y">
        {posts?.map((post) => (
          <div key={post.id} className="px-4 py-3" data-testid={`post-item-${post.id}`}>
            <div className="flex gap-3">
              <button onClick={() => setLocation(`/user/${post.authorName}`)} className="shrink-0" data-testid={`button-avatar-${post.id}`}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setLocation(`/user/${post.authorName}`)} className="font-semibold text-sm text-left" data-testid={`text-author-${post.id}`}>{post.authorName}</button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Nearby
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-1 leading-relaxed" data-testid={`text-content-${post.id}`}>{post.content}</p>
                <div className="flex items-center gap-5 mt-2 -ml-1">
                  <button className="flex items-center gap-1 text-muted-foreground transition-colors" data-testid={`button-like-${post.id}`}>
                    <Heart className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground transition-colors" data-testid={`button-comment-${post.id}`}>
                    <MessageIcon className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground transition-colors" data-testid={`button-share-${post.id}`}>
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No posts nearby yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
