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

// Create a divIcon with a numeric badge for waypoint sequence
const createNumberedIcon = (iconUrl: string, badgeNumber?: number) => {
  const badge =
    badgeNumber !== undefined
      ? `<span style="position:absolute;top:2px;left:50%;transform:translateX(-50%);background:#111827;color:white;border-radius:9999px;padding:0 6px;font-size:12px;font-weight:700;line-height:18px;box-shadow:0 1px 2px rgba(0,0,0,0.25);">${badgeNumber}</span>`
      : "";

  return L.divIcon({
    html:
      `<div style="position:relative;display:inline-block;width:25px;height:41px;">` +
      `<img src="${iconUrl}" alt="marker" style="width:25px;height:41px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));" />` +
      badge +
      "</div>",
    className: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Get icon based on marker data
const getIconForMarker = (marker: MapMarkerData) => {
  const isDelivery = marker.type === "delivery";

  // Disabled markers always use gray icon
  if (marker.isDisabled) {
    const grayIconUrl = poolIcon.options.iconUrl as string;
    if (isDelivery && marker.waypointIndex !== undefined) {
      return createNumberedIcon(grayIconUrl, marker.waypointIndex);
    }
    return L.icon({
      iconUrl: grayIconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    });
  }

  // Determine base icon URL with priority: highlight > current/previous > type
  let iconUrl = defaultIcon.options.iconUrl as string;
  // Priority: highlight > current/previous > type
  if (marker.isHighlighted) {
    iconUrl = highlightIcon.options.iconUrl as string;
  } else if (marker.isCurrentOrder) {
    iconUrl = currentOrderIcon.options.iconUrl as string;
  } else if (marker.isPreviousOrder) {
    iconUrl = previousOrderIcon.options.iconUrl as string;
  } else {
    switch (marker.type) {
      case "pool":
        iconUrl = poolIcon.options.iconUrl as string;
        break;
      case "pool-high-value":
        iconUrl = poolHighValueIcon.options.iconUrl as string;
        break;
      case "delivery":
      default:
        iconUrl = defaultIcon.options.iconUrl as string;
        break;
    }
  }

  // Attach waypoint index badge only for delivery markers with a known sequence
  if (isDelivery && marker.waypointIndex !== undefined) {
    return createNumberedIcon(iconUrl, marker.waypointIndex);
  }

  return L.icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
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

      {/* Render markers */}
      {markersWithIndex.map((marker) => {
        const icon = getIconForMarker(marker);

        return (
          <Marker
            key={marker.id}
            position={[marker.location.lat, marker.location.lng]}
            // @ts-expect-error: icon is supported by react-leaflet Marker
            icon={icon}
            opacity={marker.isDisabled ? 0.4 : 1.0}
            eventHandlers={
              marker.isDisabled
                ? undefined
                : {
                    mouseover: () => onMarkerHover?.(marker.id, true),
                    mouseout: () => onMarkerHover?.(marker.id, false),
                  }
            }
          >
            {marker.popupContent && !marker.isDisabled && (
              <Popup>{marker.popupContent}</Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMapRenderer;
