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

import { getMarkerStyle } from "../abstraction/marker-style";
import { createNumberedIcon } from "../abstraction/marker-style";

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
        deliveryPoints.map((p) => [p.lat, p.lng]),
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
  // Ensure every delivery marker has a 1-based waypoint index (fallback if missing)
  const markersWithIndex = React.useMemo(() => {
    let seq = 0;
    return markers.map((marker) => {
      if (marker.type === "delivery") {
        const idx = marker.waypointIndex ?? ++seq;
        // Keep seq in sync even when waypointIndex is provided
        if (marker.waypointIndex === undefined) {
          seq = idx;
        }
        return { ...marker, waypointIndex: idx };
      }
      return marker;
    });
  }, [markers]);

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

      {/* Render unassigned markers - first markers, then delivery markers so delivery markers appear on top */}
      {/* Render unassigned markers (all, with opacity based on filter match) */}
      {markersWithIndex
        .filter((marker) => marker.type !== "delivery")
        .map((marker) => {
          let icon, opacity;
          if (marker.customIconUrl) {
            const baseIcon = L.icon({
              iconUrl: marker.customIconUrl,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              shadowSize: [41, 41],
            });
            icon = baseIcon;
            opacity = marker.matchesFilters === false ? 0.4 : 1.0;
          } else {
            ({ icon, opacity } = getMarkerStyle(marker));
          }
          return (
            <Marker
              key={marker.id}
              position={[marker.location.lat, marker.location.lng]}
              // @ts-expect-error: icon is supported by react-leaflet Marker
              icon={icon}
              opacity={opacity}
              eventHandlers={{
                mouseover: () => onMarkerHover?.(marker.id, true),
                mouseout: () => onMarkerHover?.(marker.id, false),
              }}
            >
              {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
            </Marker>
          );
        })}
      {/* Render delivery markers on top (always fully opaque) */}
      {markersWithIndex
        .filter((marker) => marker.type === "delivery")
        .map((marker) => {
          let icon, opacity;
          if (marker.customIconUrl) {
            const baseIcon = L.icon({
              iconUrl: marker.customIconUrl,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
              shadowSize: [41, 41],
            });
            icon =
              marker.waypointIndex !== undefined
                ? createNumberedIcon(marker.customIconUrl, marker.waypointIndex)
                : baseIcon;
            opacity = marker.matchesFilters === false ? 0.4 : 1.0;
          } else {
            ({ icon, opacity } = getMarkerStyle(marker));
          }
          return (
            <Marker
              key={marker.id}
              position={[marker.location.lat, marker.location.lng]}
              // @ts-expect-error: icon is supported by react-leaflet Marker
              icon={icon}
              opacity={opacity}
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
