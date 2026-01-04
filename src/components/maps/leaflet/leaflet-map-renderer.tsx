/**
 * LeafletMapRenderer - Simplified Leaflet rendering using minimal map data
 * This component only handles rendering, no business logic
 */
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import React from "react";
import type {
  MapMarkerData,
  MapRouteSegmentData,
  MapBounds,
} from "../abstraction/map-data";

interface LeafletMapRendererProps {
  markers: MapMarkerData[];
  routes: MapRouteSegmentData[];
  bounds: MapBounds;
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
  onRouteSegmentHover?: (segmentId: string, isHovering: boolean) => void;
}

// Marker icons (matching LeafletMapProvider)
const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const poolIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const poolHighValueIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const highlightIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const currentOrderIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const previousOrderIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Get icon based on marker data
const getIconForMarker = (marker: MapMarkerData) => {
  // Priority: highlight > current/previous > type
  if (marker.isHighlighted) return highlightIcon;
  if (marker.isCurrentOrder) return currentOrderIcon;
  if (marker.isPreviousOrder) return previousOrderIcon;

  switch (marker.type) {
    case "pool":
      return poolIcon;
    case "pool-high-value":
      return poolHighValueIcon;
    case "delivery":
    default:
      return defaultIcon;
  }
};

// Map fitter component - handles bounds fitting
function MapFitter({ bounds }: { bounds: MapBounds }) {
  const map = useMap();

  React.useEffect(() => {
    if (bounds.points.length === 0) return;

    const deliveryPoints = bounds.points; // Simplified - could filter by type

    if (deliveryPoints.length === 1) {
      map.setView([deliveryPoints[0].lat, deliveryPoints[0].lng], 13);
    } else if (deliveryPoints.length > 1) {
      const leafletBounds = L.latLngBounds(
        deliveryPoints.map((p) => [p.lat, p.lng])
      );
      map.fitBounds(leafletBounds, { padding: [40, 40] });
    }
  }, [bounds, map]);

  return null;
}

const LeafletMapRenderer: React.FC<LeafletMapRendererProps> = ({
  markers,
  routes,
  bounds,
  onMarkerHover,
  onRouteSegmentHover,
}) => {
  return (
    <MapContainer style={{ width: "100%", height: "100%" }}>
      <MapFitter bounds={bounds} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Render route segments */}
      {routes.map((route) => {
        // Use polyline positions if available, otherwise straight line
        const positions = route.positions
          ? route.positions.map((pos) => [pos.lat, pos.lng] as [number, number])
          : [
              [route.from.lat, route.from.lng] as [number, number],
              [route.to.lat, route.to.lng] as [number, number],
            ];

        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: route.isHighlighted
                ? route.highlightColor || "#10b981"
                : "#2563eb",
              weight: route.isHighlighted ? 6 : 4,
              opacity: route.isHighlighted ? 1.0 : 0.8,
            }}
            eventHandlers={{
              mouseover: () => {
                onRouteSegmentHover?.(route.id, true);
              },
              mouseout: () => {
                onRouteSegmentHover?.(route.id, false);
              },
            }}
          />
        );
      })}

      {/* Render markers */}
      {markers.map((marker) => {
        const icon = getIconForMarker(marker);

        return (
          <Marker
            key={marker.id}
            position={[marker.location.lat, marker.location.lng]}
            // @ts-expect-error: icon is supported by react-leaflet Marker
            icon={icon}
            eventHandlers={{
              mouseover: () => onMarkerHover?.(marker.id, true),
              mouseout: () => onMarkerHover?.(marker.id, false),
            }}
          >
            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMapRenderer;
