import { useState } from "react";
import { useLocation } from "@/hooks/use-location";
import { usePosts } from "@/hooks/use-posts";
import { Map } from "@/components/Map";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { PostFeed } from "@/components/PostFeed";
import { Button } from "@/components/ui/button";
import { Plus, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { coords, error: locationError, loading: locationLoading } = useLocation();
  const { data: posts = [], isLoading: postsLoading, error: postsError } = usePosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateClick = () => {
    if (!coords) {
      toast({
        title: "Location needed",
        description: "We need your location to drop a message.",
        variant: "destructive",
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleRecenter = () => {
    // Force reload/recenter logic would go here, 
    // for now simply notifies user if we don't have location
    if (!coords) {
      toast({
        title: "Waiting for location...",
        description: "Please allow location access to see your position.",
      });
    }
  };

  if (locationLoading || postsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-24 w-24">
             <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
             <div className="absolute inset-4 rounded-full border-t-4 border-accent animate-spin animation-delay-150"></div>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground animate-pulse">Social Go</h2>
          <p className="text-muted-foreground">Locating you...</p>
        </div>
      </div>
    );
  }

  if (locationError || postsError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">
            {locationError || "Failed to load posts. Please try again later."}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-background">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <Map userLocation={coords} posts={posts} />
      </div>

      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex justify-between items-start">
          <div className="pointer-events-auto bg-background/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-border/50">
            <h1 className="font-display font-bold text-xl tracking-tight">
              <span className="text-primary">Social</span>Go
            </h1>
          </div>
          
          <div className="pointer-events-auto">
            <PostFeed posts={posts} userLocation={coords} />
          </div>
        </div>
      </div>

      {/* Bottom Floating Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex justify-between items-end">
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 rounded-full shadow-lg border border-border pointer-events-auto bg-background/90 backdrop-blur"
            onClick={handleRecenter}
          >
            <LocateFixed className="h-5 w-5" />
          </Button>

          <Button
            size="lg"
            className="h-16 w-16 rounded-full shadow-xl shadow-primary/25 bg-gradient-to-tr from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-4 border-background pointer-events-auto transition-transform hover:scale-105 active:scale-95"
            onClick={handleCreateClick}
          >
            <Plus className="h-8 w-8 text-white" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      {coords && (
        <CreatePostDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          latitude={coords.latitude}
          longitude={coords.longitude}
        />
      )}
    </div>
  );
}
