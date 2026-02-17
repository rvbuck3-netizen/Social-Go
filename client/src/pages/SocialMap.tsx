
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Plus, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function SocialMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: posts } = useQuery<any[]>({
    queryKey: [api.posts.list.path],
  });

  const { data: nearbyUsers } = useQuery<any[]>({
    queryKey: [api.users.nearby.path],
    refetchInterval: 5000,
  });

  const { data: user } = useQuery<any>({
    queryKey: [api.users.me.path],
  });

  const postMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.posts.create.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          latitude: userLocation![0],
          longitude: userLocation![1],
          authorName: user?.username || "Alice",
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      setIsPostDialogOpen(false);
      form.reset();
      toast({ title: "Posted successfully!" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (coords: { latitude: number, longitude: number }) => {
      const res = await fetch(api.users.updateStatus.path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords),
      });
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertPostSchema.pick({ content: true })),
    defaultValues: { content: "" },
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        statusMutation.mutate({ latitude: coords[0], longitude: coords[1] });
      },
      (err) => {
        console.error(err);
        const fallback: [number, number] = [37.7749, -122.4194];
        setUserLocation(fallback);
        statusMutation.mutate({ latitude: fallback[0], longitude: fallback[1] });
      }
    );

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        statusMutation.mutate({ 
          latitude: pos.coords.latitude, 
          longitude: pos.coords.longitude 
        });
      });
    }, 30000); // Update location every 30s

    return () => clearInterval(interval);
  }, []);

  if (!userLocation) return <div className="h-full flex items-center justify-center bg-background">Locating...</div>;

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapRecenter coords={userLocation} />
        
        {/* Your Location */}
        <Marker 
          position={userLocation}
          icon={new L.Icon({
            iconUrl: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
            iconSize: [40, 40],
            className: "rounded-full border-4 border-primary bg-white shadow-lg animate-pulse"
          })}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* Posts */}
        {posts?.map((post) => (
          <Marker key={post.id} position={[post.latitude, post.longitude]}>
            <Popup>
              <div className="p-1 min-w-[120px]">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} />
                  </Avatar>
                  <p className="font-bold text-xs">{post.authorName}</p>
                </div>
                <p className="text-sm">{post.content}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby Users */}
        {nearbyUsers?.filter(u => u.id !== user?.id).map((u) => (
          <Marker 
            key={u.id} 
            position={[u.latitude, u.longitude]}
            icon={new L.Icon({
              iconUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
              iconSize: [32, 32],
              className: "rounded-full border-2 border-primary bg-white shadow-sm"
            })}
          >
            <Popup>{u.username} is nearby</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full shadow-lg h-10 w-10 bg-background/80 backdrop-blur-sm"
          onClick={() => {
             navigator.geolocation.getCurrentPosition((pos) => {
               setUserLocation([pos.coords.latitude, pos.coords.longitude]);
             });
          }}
        >
          <Navigation className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-lg flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", user?.isGoMode ? "bg-green-500 animate-pulse" : "bg-muted")} />
          <span className="text-xs font-bold uppercase tracking-wider">Social Go</span>
        </div>
      </div>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-[1000] active-elevate-2 hover:scale-105 transition-transform"
            size="icon"
          >
            <Plus className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share a location update</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => postMutation.mutate(data))} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="What's happening here?" 
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11" disabled={postMutation.isPending}>
                Post Update
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
