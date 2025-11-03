'use client';

import { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

interface GoogleLocationMapProps {
  location: string;
  onLocationSelect: (location: string, coordinates: { lat: number; lng: number }) => void;
  initialCoordinates?: { lat: number; lng: number };
  hideLocationDisplay?: boolean; // Option to hide the overlay completely
}

function MapContent({
  location,
  onLocationSelect,
  initialCoordinates,
  hideLocationDisplay,
}: GoogleLocationMapProps) {
  const map = useMap();
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(
    initialCoordinates || { lat: 3.139, lng: 101.6869 }
  );

  // Update map center and marker when initialCoordinates change
  useEffect(() => {
    if (initialCoordinates && map) {
      setMarkerPosition(initialCoordinates);
      map.panTo(initialCoordinates);
      map.setZoom(13);
    }
  }, [initialCoordinates, map]);

  return (
    <AdvancedMarker position={markerPosition}>
      <Pin
        background="var(--color-secondary-500)"
        borderColor="var(--color-secondary-600)"
        glyphColor="var(--color-accent-700)"
      />
    </AdvancedMarker>
  );
}

export default function GoogleLocationMap({
  location,
  onLocationSelect,
  initialCoordinates = { lat: 3.139, lng: 101.6869 },
  hideLocationDisplay = false,
}: GoogleLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const handleMapClick = useCallback(
    async (event: { detail: { latLng?: { lat: number; lng: number } } }) => {
      const lat = event.detail.latLng?.lat;
      const lng = event.detail.latLng?.lng;

      if (!lat || !lng) return;

      const coordinates = { lat, lng };

      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });

        if (response.results && response.results[0]) {
          const locationName = response.results[0].formatted_address;
          onLocationSelect(locationName, coordinates);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    },
    [onLocationSelect]
  );

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center">
        <p className="text-sm text-red-600">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-[var(--color-primary-200)]">
        <Map
          defaultCenter={initialCoordinates}
          defaultZoom={10}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={handleMapClick}
          mapId="location-picker-map"
        >
          <MapContent
            location={location}
            onLocationSelect={onLocationSelect}
            initialCoordinates={initialCoordinates}
            hideLocationDisplay={hideLocationDisplay}
          />
        </Map>
      </div>
    </APIProvider>
  );
}
