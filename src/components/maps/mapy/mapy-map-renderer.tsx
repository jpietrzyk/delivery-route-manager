/**
 * MapyMapRenderer - Mapy.cz rendering using minimal map data
 * This component matches LeafletMapRenderer interface but uses Mapy.cz tiles
 */
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type {
  MapMarkerData,
  MapRouteSegmentData,
  MapBounds,
} from "../abstraction/map-data";

interface MapyMapRendererProps {
  markers: MapMarkerData[];
  routes: MapRouteSegmentData[];
  bounds: MapBounds;
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
  onRouteSegmentHover?: (segmentId: string, isHovering: boolean) => void;
}

// Marker icons (matching LeafletMapRenderer for consistency)
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

const MapyMapRenderer: React.FC<MapyMapRendererProps> = ({
  markers,
  routes,
  bounds,
  onMarkerHover,
  onRouteSegmentHover,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ReturnType<typeof L.map> | null>(null);
  const markerLayerRef = useRef<ReturnType<typeof L.layerGroup> | null>(null);
  const routeLayerRef = useRef<ReturnType<typeof L.layerGroup> | null>(null);
  const markerInstancesRef = useRef<Map<string, ReturnType<typeof L.marker>>>(
    new Map()
  );
  const routeInstancesRef = useRef<Map<string, ReturnType<typeof L.polyline>>>(
    new Map()
  );

  // Get Mapy.cz API key from environment
  const mapyApiKey = import.meta.env.VITE_MAPY_CZ_API_KEY as string | undefined;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !mapyApiKey) {
      console.warn("MapyMapRenderer: Container or API key not available");
      return;
    }

    // Initialize Leaflet map
    const map = L.map(containerRef.current).setView([50.0755, 14.4378], 7); // Default: Prague

    // Add Mapy.cz tile layer
    const mapset = "basic"; // Options: basic, outdoor, winter, aerial, names-overlay
    const tileUrl = `https://api.mapy.com/v1/maptiles/${mapset}/256/{z}/{x}/{y}?apikey=${mapyApiKey}`;

    L.tileLayer(tileUrl, {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }).addTo(map);

    // Add Mapy.cz logo control
    const LogoControl = L.Control.extend({
      options: { position: "bottomleft" as const },
      onAdd: function () {
        const container = L.DomUtil.create("div");
        const link = L.DomUtil.create("a", "", container);
        link.setAttribute("href", "http://mapy.com/");
        link.setAttribute("target", "_blank");
        link.innerHTML =
          '<img src="https://api.mapy.com/img/api/logo.svg" style="width: 50px; height: auto;" />';
        L.DomEvent.disableClickPropagation(link);
        return container;
      },
    });
    new (LogoControl as typeof L.Control)().addTo(map);

    // Create layer groups for markers and routes
    const markerLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markerLayerRef.current = markerLayer;
    routeLayerRef.current = routeLayer;

    // Store references for cleanup
    const markerInstances = markerInstancesRef.current;
    const routeInstances = routeInstancesRef.current;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      routeLayerRef.current = null;
      markerInstances.clear();
      routeInstances.clear();
    };
  }, [mapyApiKey]);

  // Fit map to bounds
  useEffect(() => {
    if (!mapRef.current || bounds.points.length === 0) return;

    const map = mapRef.current;
    const deliveryPoints = bounds.points;

    if (deliveryPoints.length === 1) {
      map.setView([deliveryPoints[0].lat, deliveryPoints[0].lng], 13);
    } else if (deliveryPoints.length > 1) {
      const leafletBounds = L.latLngBounds(
        deliveryPoints.map((p) => [p.lat, p.lng])
      );
      map.fitBounds(leafletBounds, { padding: [40, 40] });
    }
  }, [bounds]);

  // Render markers
  useEffect(() => {
    if (!markerLayerRef.current) return;

    const markerLayer = markerLayerRef.current;
    const markerInstances = markerInstancesRef.current;

    // Get current marker IDs
    const currentMarkerIds = new Set(markers.map((m) => m.id));

    // Remove markers that no longer exist
    markerInstances.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        markerLayer.removeLayer(marker);
        markerInstances.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      const existingMarker = markerInstances.get(markerData.id);
      const icon = getIconForMarker(markerData);
      const position: [number, number] = [
        markerData.location.lat,
        markerData.location.lng,
      ];

      if (existingMarker) {
        // Update existing marker
        existingMarker.setLatLng(position);
        existingMarker.setIcon(icon);

        // Update popup if needed
        if (markerData.popupContent) {
          const popupContainer = document.createElement("div");
          // Simple DOM rendering without React root for popups
          popupContainer.innerHTML = String(markerData.popupContent);
          existingMarker.bindPopup(popupContainer);
        }
      } else {
        // Create new marker
        const newMarker = L.marker(position, { icon });

        // Add popup if provided
        if (markerData.popupContent) {
          const popupContainer = document.createElement("div");
          // Simple DOM rendering without React root for popups
          popupContainer.innerHTML = String(markerData.popupContent);
          newMarker.bindPopup(popupContainer);
        }

        // Add hover events
        newMarker.on("mouseover", () => {
          onMarkerHover?.(markerData.id, true);
        });
        newMarker.on("mouseout", () => {
          onMarkerHover?.(markerData.id, false);
        });

        newMarker.addTo(markerLayer);
        markerInstances.set(markerData.id, newMarker);
      }
    });
  }, [markers, onMarkerHover]);

  // Render route segments
  useEffect(() => {
    if (!routeLayerRef.current) return;

    const routeLayer = routeLayerRef.current;
    const routeInstances = routeInstancesRef.current;

    // Get current route IDs
    const currentRouteIds = new Set(routes.map((r) => r.id));

    // Remove routes that no longer exist
    routeInstances.forEach((polyline, id) => {
      if (!currentRouteIds.has(id)) {
        routeLayer.removeLayer(polyline);
        routeInstances.delete(id);
      }
    });

    // Add or update routes
    routes.forEach((routeData) => {
      const existingRoute = routeInstances.get(routeData.id);

      // Use polyline positions if available, otherwise straight line
      const positions: [number, number][] = routeData.positions
        ? routeData.positions.map((pos) => [pos.lat, pos.lng])
        : [
            [routeData.from.lat, routeData.from.lng],
            [routeData.to.lat, routeData.to.lng],
          ];

      const color = routeData.isHighlighted
        ? routeData.highlightColor || "#10b981"
        : "#2563eb";
      const weight = routeData.isHighlighted ? 6 : 4;
      const opacity = routeData.isHighlighted ? 1.0 : 0.8;

      if (existingRoute) {
        // Update existing route
        existingRoute.setLatLngs(positions);
        existingRoute.setStyle({ color, weight, opacity });
      } else {
        // Create new route
        const newRoute = L.polyline(positions, {
          color,
          weight,
          opacity,
        });

        // Add hover events
        newRoute.on("mouseover", () => {
          onRouteSegmentHover?.(routeData.id, true);
        });
        newRoute.on("mouseout", () => {
          onRouteSegmentHover?.(routeData.id, false);
        });

        newRoute.addTo(routeLayer);
        routeInstances.set(routeData.id, newRoute);
      }
    });
  }, [routes, onRouteSegmentHover]);

  if (!mapyApiKey) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          color: "#6b7280",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ marginBottom: "8px", fontWeight: "600" }}>
            Mapy.cz API Key Required
          </p>
          <p style={{ fontSize: "14px" }}>
            Please set VITE_MAPY_CZ_API_KEY in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      data-testid="mapy-map-renderer"
    />
  );
};

export default MapyMapRenderer;
