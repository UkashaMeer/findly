import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Loader2, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// Type definitions
interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
}

interface LocationPickerProps {
  onLocationSelect?: (location: Location) => void;
  defaultLocation?: Location;
}

interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    state?: string;
    postcode?: string;
    suburb?: string;
    road?: string;
    house_number?: string;
  };
}

interface NominatimReverseResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    state?: string;
    postcode?: string;
    suburb?: string;
    road?: string;
    house_number?: string;
  };
}

// Extend Window interface for maplibregl
declare global {
  interface Window {
    maplibregl: any;
  }
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  defaultLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(defaultLocation || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<NominatimSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Dynamically load MapLibre CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
    document.head.appendChild(link);

    // Load MapLibre GL JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
    script.async = true;
    
    script.onload = () => {
      if (!window.maplibregl || !mapContainer.current) return;
      
      try {
        const map = new window.maplibregl.Map({
          container: mapContainer.current,
          style: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
          center: defaultLocation 
            ? [defaultLocation.lng, defaultLocation.lat] 
            : [67.0011, 24.8607], // Karachi coordinates
          zoom: defaultLocation ? 15 : 12
        });

        mapInstance.current = map;

        map.on('load', () => {
          setMapLoaded(true);
          
          // Add navigation controls
          map.addControl(new window.maplibregl.NavigationControl(), 'top-right');
          
          // Add click event to set location
          map.on('click', (e: any) => {
            const { lng, lat } = e.lngLat;
            setLocationOnMap(lat, lng);
            reverseGeocode(lat, lng);
          });

          // Set default location marker if provided
          if (defaultLocation) {
            setLocationOnMap(defaultLocation.lat, defaultLocation.lng);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Set location on map with marker
  const setLocationOnMap = (lat: number, lng: number): void => {
    if (!mapInstance.current || !window.maplibregl) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Create new marker
    const marker = new window.maplibregl.Marker({
      color: '#3b82f6',
      draggable: true
    })
      .setLngLat([lng, lat])
      .addTo(mapInstance.current);

    markerRef.current = marker;

    // Update location when marker is dragged
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      reverseGeocode(lngLat.lat, lngLat.lng);
    });

    // Center map on marker
    mapInstance.current.flyTo({
      center: [lng, lat],
      zoom: 15,
      essential: true
    });
  };

  // Reverse geocoding to get address
  const reverseGeocode = async (lat: number, lng: number): Promise<void> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data: NominatimReverseResult = await response.json();
      
      const location: Location = {
        lat,
        lng,
        address: data.display_name || 'Unknown location',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        country: data.address?.country || ''
      };
      
      setSelectedLocation(location);
      if (onLocationSelect) {
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Get current location
  const getCurrentLocation = (): void => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setLocationOnMap(latitude, longitude);
        reverseGeocode(latitude, longitude);
        setIsLoadingLocation(false);
      },
      (error: GeolocationPositionError) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  // Search for locations
  const searchLocation = async (): Promise<void> => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );
      const data: NominatimSearchResult[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const selectSearchResult = (result: NominatimSearchResult): void => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setLocationOnMap(lat, lng);
    
    const location: Location = {
      lat,
      lng,
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village || '',
      country: result.address?.country || ''
    };
    
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Clear search
  const clearSearch = (): void => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchLocation();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
          <Button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            variant="default"
            size="default"
            type="button"
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Current
              </>
            )}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.place_id}-${index}`}
                    onClick={() => selectSearchResult(result)}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                    type="button"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {result.display_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-64 rounded-md border bg-muted/50 overflow-hidden"
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Selected Location</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedLocation.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      {!selectedLocation && (
        <div className="text-xs text-muted-foreground text-center">
          Click on the map, search for a location, or use your current location
        </div>
      )}
    </div>
  );
};

export default LocationPicker;