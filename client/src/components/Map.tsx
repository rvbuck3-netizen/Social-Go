import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { Post } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, User } from "lucide-react";

// Fix for default Leaflet marker icons not loading in webpack/vite environments
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Icons
const createPostIcon = () => {
  return L.divIcon({
    className: 'custom-post-marker',
    html: `<div class="w-8 h-8 rounded-full bg-accent border-2 border-white shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker-pulse',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface MapProps {
  userLocation: { latitude: number; longitude: number } | null;
  posts: Post[];
}

function MapUpdater({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export function Map({ userLocation, posts }: MapProps) {
  const center = userLocation 
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : { lat: 40.7128, lng: -74.0060 }; // Default to NYC if no location

  return (
    <div className="w-full h-full z-0 relative">
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserIcon()}
            >
              <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                <div className="text-center font-medium p-1">You are here</div>
              </Popup>
            </Marker>
            <MapUpdater center={{ lat: userLocation.latitude, lng: userLocation.longitude }} />
          </>
        )}

        {/* Post Markers */}
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.latitude, post.longitude]}
            icon={createPostIcon()}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-bold text-sm text-primary">{post.authorName}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                  {post.content}
                </p>
                <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                  {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
