/**
 * MapRenderer - Provider-agnostic map rendering component
 * Uses MapProvider abstraction instead of direct map library usage
 */
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { MapMarkerData, MapRouteSegmentData, MapBounds } from "./map-data";

interface MapRendererProps {
  markers: MapMarkerData[];
  routes: MapRouteSegmentData[];
  bounds?: MapBounds;
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
  onRouteSegmentHover?: (segmentId: string, isHovering: boolean) => void;
}

/**
 * Hook component to initialize map provider and sync data
 * NOTE: This is a placeholder for future full provider integration
 */
function MapProviderSync({ markers, routes, bounds }: MapRendererProps) {
  // TODO: Implement provider synchronization
  // This will connect to MapProvider when we fully migrate away from react-leaflet
  React.useEffect(() => {
    console.log("MapProviderSync: data updated", {
      markersCount: markers.length,
      routesCount: routes.length,
      boundsCount: bounds?.points.length || 0,
    });
  }, [markers.length, routes.length, bounds?.points.length]);

  return null;
}

/**
 * MapRenderer component
 * This component will eventually replace the direct Leaflet implementation
 */
const MapRenderer: React.FC<MapRendererProps> = (props) => {
  // For now, keep the MapContainer as the base
  // We'll gradually move rendering logic to the provider
  return (
    <MapContainer style={{ width: "100%", height: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapProviderSync {...props} />
    </MapContainer>
  );
};

export default MapRenderer;
