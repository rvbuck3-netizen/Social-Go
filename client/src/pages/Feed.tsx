
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin, User } from "lucide-react";

export default function Feed() {
  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: [api.posts.list.path],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-4 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold mb-6">Recent Activity</h1>
      {posts?.map((post) => (
        <Card key={post.id} className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">{post.authorName}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3" />
              <span>Nearby</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
          </CardContent>
        </Card>
      ))}
      {posts?.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>No posts nearby yet. Be the first to post!</p>
        </div>
      )}
    </div>
  );
}
