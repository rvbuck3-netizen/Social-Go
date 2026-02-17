import { useState, useEffect } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coords: Location | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    coords: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        coords: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      });
      return;
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        error: null,
        loading: false,
      });
    };

    const error = () => {
      setLocation({
        coords: null,
        error: "Unable to retrieve your location",
        loading: false,
      });
    };

    // Initial fetch
    navigator.geolocation.getCurrentPosition(success, error);
    
    // Watch for updates
    const watchId = navigator.geolocation.watchPosition(success, error);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}
