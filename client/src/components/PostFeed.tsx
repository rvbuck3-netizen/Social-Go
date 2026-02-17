import { Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MapPin, User, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface PostFeedProps {
  posts: Post[];
  userLocation: { latitude: number; longitude: number } | null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function PostFeed({ posts, userLocation }: PostFeedProps) {
  // Sort posts by distance if user location is available
  const sortedPosts = [...posts].sort((a, b) => {
    if (!userLocation) return 0;
    
    const distA = calculateDistance(
      userLocation.latitude, userLocation.longitude,
      a.latitude, a.longitude
    );
    const distB = calculateDistance(
      userLocation.latitude, userLocation.longitude,
      b.latitude, b.longitude
    );
    
    return distA - distB;
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="secondary" 
          className="rounded-full h-12 px-6 shadow-lg border border-border/50 bg-background/80 backdrop-blur-md hover:bg-background transition-all"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Nearby Posts ({posts.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 overflow-hidden border-r-0">
        <SheetHeader className="p-6 pb-2 border-b bg-muted/20">
          <SheetTitle className="flex items-center gap-2 font-display text-2xl">
            <span className="text-primary">Social</span>Go Feed
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            What people are saying around you
          </p>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] px-4 py-4">
          <div className="space-y-4 pb-12">
            {sortedPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No posts nearby yet.</p>
                <p className="text-sm mt-1">Be the first to drop a message!</p>
              </div>
            ) : (
              sortedPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-card rounded-xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                        {post.authorName.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm leading-none">{post.authorName}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
                          </span>
                          {userLocation && (
                            <span className="flex items-center gap-1 text-primary/80 font-medium">
                              <MapPin className="h-3 w-3" />
                              {calculateDistance(
                                userLocation.latitude, userLocation.longitude,
                                post.latitude, post.longitude
                              ).toFixed(1)}km away
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-foreground/90 text-sm leading-relaxed pl-10 border-l-2 border-primary/10 ml-4">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
