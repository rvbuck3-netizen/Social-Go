
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Navigation, Instagram, Twitter, Globe, EyeOff, ShieldAlert, Ban, Flag, Locate } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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

function ZoomLabelScaler() {
  const map = useMap();
  useEffect(() => {
    const updateLabels = () => {
      const zoom = map.getZoom();
      const labelsEl = map.getContainer().querySelector('.labels-layer') as HTMLElement | null;
      if (!labelsEl) return;
      if (zoom <= 10) {
        labelsEl.style.filter = 'brightness(4) contrast(6) saturate(0)';
        labelsEl.style.opacity = '0.8';
      } else if (zoom <= 12) {
        labelsEl.style.filter = 'brightness(3.5) contrast(5) saturate(0)';
        labelsEl.style.opacity = '0.85';
      } else if (zoom <= 14) {
        labelsEl.style.filter = 'brightness(3) contrast(4) saturate(0)';
        labelsEl.style.opacity = '0.9';
      } else if (zoom <= 16) {
        labelsEl.style.filter = 'brightness(2.5) contrast(3.5) saturate(0)';
        labelsEl.style.opacity = '0.95';
      } else {
        labelsEl.style.filter = 'brightness(2) contrast(3) saturate(0)';
        labelsEl.style.opacity = '1';
      }
    };
    map.on('zoomend', updateLabels);
    updateLabels();
    return () => { map.off('zoomend', updateLabels); };
  }, [map]);
  return null;
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-16 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm h-11 w-11"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        data-testid="button-zoom-in"
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm h-11 w-11"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        data-testid="button-zoom-out"
      >
        <Minus className="h-5 w-5" />
      </Button>
    </div>
  );
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

  const blockMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      const res = await fetch(api.users.block.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedUserId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.nearby.path] });
      toast({ title: "User blocked", description: "They won't appear on your map anymore." });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ reportedUserId, reason }: { reportedUserId: string, reason: string }) => {
      const res = await fetch(api.users.report.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedUserId, reason }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Report submitted", description: "We'll review this shortly. Thank you for keeping Social Go safe." });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertPostSchema.pick({ content: true, hideExactLocation: true })),
    defaultValues: { content: "", hideExactLocation: false },
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
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!userLocation) return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Finding your location...</span>
      </div>
    </div>
  );

  return (
    <div className="relative h-full w-full" data-testid="map-container">
      <MapContainer 
        center={userLocation} 
        zoom={16} 
        className="h-full w-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer 
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          className="labels-layer"
          subdomains="abcd"
        />
        <ZoomLabelScaler />
        <MapRecenter coords={userLocation} />
        <ZoomControls />
        
        <Marker 
          position={userLocation}
          icon={new L.DivIcon({
            html: `<div class="user-marker-you">
                     <img src="${user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'}" />
                   </div>`,
            className: "",
            iconSize: [44, 44],
            iconAnchor: [22, 22]
          })}
        >
          <Popup className="modern-popup">
            <div className="p-2 text-sm font-medium">You are here</div>
          </Popup>
        </Marker>

        {posts?.map((post) => (
          <Marker 
            key={post.id} 
            position={[post.latitude, post.longitude]}
            icon={new L.DivIcon({
              html: `<div class="post-marker">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}" />
                     </div>`,
              className: "",
              iconSize: [34, 34],
              iconAnchor: [17, 17]
            })}
          >
            <Popup className="modern-popup">
              <div className="p-3 min-w-[160px] max-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} />
                  </Avatar>
                  <span className="font-semibold text-xs">{post.authorName}</span>
                </div>
                <p className="text-sm leading-snug">{post.content}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {nearbyUsers?.filter(u => u.userId !== user?.userId).map((u) => (
          <Marker 
            key={u.id} 
            position={[u.latitude, u.longitude]}
            icon={new L.DivIcon({
              html: `<div class="nearby-user-marker ${u.isBoosted ? 'boosted' : ''}">
                       <img src="${u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}" />
                     </div>`,
              className: "",
              iconSize: [36, 36],
              iconAnchor: [18, 18]
            })}
          >
            <Popup className="modern-popup">
              <div className="p-3 min-w-[180px]">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} />
                    <AvatarFallback>{u.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{u.username}</p>
                    <p className="text-xs text-muted-foreground">Nearby</p>
                  </div>
                </div>
                
                {(u.instagram || u.twitter || u.website) && (
                  <div className="flex items-center gap-1 pt-2 border-t border-border">
                    {u.instagram && (
                      <Button size="icon" variant="ghost" asChild>
                        <a href={`https://instagram.com/${u.instagram}`} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4 text-pink-500" />
                        </a>
                      </Button>
                    )}
                    {u.twitter && (
                      <Button size="icon" variant="ghost" asChild>
                        <a href={`https://twitter.com/${u.twitter}`} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 text-sky-500" />
                        </a>
                      </Button>
                    )}
                    {u.website && (
                      <Button size="icon" variant="ghost" asChild>
                        <a href={u.website.startsWith('http') ? u.website : `https://${u.website}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 pt-2 border-t border-border">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => blockMutation.mutate(u.userId)}
                    disabled={blockMutation.isPending}
                    data-testid={`button-block-${u.userId}`}
                  >
                    <Ban className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => reportMutation.mutate({ reportedUserId: u.userId, reason: "stalking" })}
                    disabled={reportMutation.isPending}
                    data-testid={`button-report-${u.userId}`}
                  >
                    <Flag className="h-4 w-4 text-destructive" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground ml-auto">Block / Report</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000]">
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full shadow-lg bg-background/90 backdrop-blur-sm h-11 w-11"
          onClick={() => {
             navigator.geolocation.getCurrentPosition((pos) => {
               setUserLocation([pos.coords.latitude, pos.coords.longitude]);
             });
          }}
          aria-label="Recenter on your location"
          data-testid="button-recenter"
        >
          <Locate className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", user?.isGoMode ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40")} />
          <span className="text-xs font-bold uppercase tracking-widest">Social Go</span>
        </div>
      </div>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="absolute bottom-20 right-4 h-14 w-14 rounded-full shadow-2xl z-[1000]"
            size="icon"
            aria-label="Create a new post"
            data-testid="button-create-post"
          >
            <Plus className="h-7 w-7" />
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
                        data-testid="input-post-content"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hideExactLocation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-2 rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        Blur Location
                      </FormLabel>
                      <FormDescription>
                        Hide your exact address
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-blur-location"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={postMutation.isPending} data-testid="button-submit-post">
                Post Update
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
