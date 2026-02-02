/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { loadHere } from "@/lib/here-loader";
import type {
  MapMarkerData,
  MapRouteSegmentData,
  MapBounds,
} from "@/components/maps/abstraction/map-data";

interface HereMapRendererProps {
  markers: MapMarkerData[];
  routes: MapRouteSegmentData[];
  bounds: MapBounds;
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
  onRouteSegmentHover?: (segmentId: string, isHovering: boolean) => void;
}

const HereMapRenderer: React.FC<HereMapRendererProps> = ({
  markers,
  routes,
  bounds,
  onMarkerHover,
  onRouteSegmentHover,
}) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersGroupRef = React.useRef<any | null>(null);
  const routesGroupRef = React.useRef<any | null>(null);
  const lastBoundsKeyRef = React.useRef<string | null>(null);
  const markerMapRef = React.useRef<Map<string, any>>(new Map());
  const iconCacheRef = React.useRef<Map<string, any>>(new Map());
  const userInteractedRef = React.useRef<boolean>(false);
  const initialBoundsFitRef = React.useRef<boolean>(false);

  // Initialize HERE Map
  React.useEffect(() => {
    let disposed = false;
    const init = async () => {
      const apiKey = import.meta.env.VITE_HERE_MAPS_API_KEY as string;
      if (!apiKey) {
        console.error("VITE_HERE_MAPS_API_KEY is missing");
        return;
      }

      const H = await loadHere(apiKey);
      if (!H || disposed) return;

      const platform = new H.service.Platform({ apikey: apiKey });
      const defaultLayers = platform.createDefaultLayers();
      const map = new H.Map(mapRef.current!, defaultLayers.vector.normal.map, {
        pixelRatio: window.devicePixelRatio || 1,
        center: { lat: 50.049683, lng: 19.944544 },
        zoom: 6,
      });

      mapInstanceRef.current = map;

      const mapEvents = new H.mapevents.MapEvents(map);
      const behavior = new H.mapevents.Behavior(mapEvents);
      void behavior;
      const ui = H.ui.UI.createDefault(map, defaultLayers);
      void ui;

      // Track user interactions to stop auto-fitting bounds
      const markUserInteraction = () => {
        userInteractedRef.current = true;
      };
      map.addEventListener("dragstart", markUserInteraction);
      map.addEventListener("wheel", markUserInteraction);
      map.addEventListener("dbltap", markUserInteraction);

      const handleResize = () => map.getViewPort().resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        map.dispose();
      };
    };

    const disposerPromise = init();

    return () => {
      disposed = true;
      void disposerPromise;
    };
  }, []);

  const getHereIconUrl = React.useCallback((marker: MapMarkerData) => {
    const baseUrl = window.location.origin;
    const iconPath = marker.iconPath || "/markers/marker-default.svg";

    if (marker.customIconUrl) {
      return marker.customIconUrl.startsWith("http")
        ? marker.customIconUrl
        : `${baseUrl}${marker.customIconUrl}`;
    }

    return `${baseUrl}${iconPath}`;
  }, []);

  const getHereIconOptions = React.useCallback((marker: MapMarkerData) => {
    const isUnassigned = marker.type !== "delivery";
    if (isUnassigned) {
      return {
        size: { w: 32, h: 32 },
        anchor: { x: 16, y: 16 },
      };
    }
    return {
      size: { w: 25, h: 41 },
      anchor: { x: 12, y: 41 },
    };
  }, []);

  const createHereIcon = React.useCallback((iconUrl: string, options: any) => {
    const H = (window as any).H;
    if (!H) return null;

    const cacheKey = `${iconUrl}-${options.size.w}-${options.size.h}`;
    if (iconCacheRef.current.has(cacheKey)) {
      return iconCacheRef.current.get(cacheKey);
    }

    try {
      const icon = new H.map.Icon(iconUrl, {
        size: options.size,
        anchor: options.anchor,
      });
      iconCacheRef.current.set(cacheKey, icon);
      return icon;
    } catch (error) {
      console.error(`Failed to create icon from URL: ${iconUrl}`, error);
      return null;
    }
  }, []);

  // Create markers only when positions/count change (not on highlight)
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const H = (window as any).H;
    if (!H) return;

    // Create a key based on marker positions and IDs only (exclude highlight state)
    const markerKey = markers
      .map((m) => `${m.id}:${m.location.lat}:${m.location.lng}:${m.type}`)
      .join("|");

    // Check if we need to recreate markers
    const existingMarkerIds = new Set(markerMapRef.current.keys());
    const newMarkerIds = new Set(markers.map((m) => m.id));
    const needsRecreate =
      existingMarkerIds.size !== newMarkerIds.size ||
      ![...existingMarkerIds].every((id) => newMarkerIds.has(id));

    if (needsRecreate) {
      // Remove old markers group
      if (markersGroupRef.current) {
        map.removeObject(markersGroupRef.current);
        markersGroupRef.current = null;
      }
      markerMapRef.current.clear();

      const markersGroup = new H.map.Group();

      // Create new markers
      markers.forEach((marker) => {
        const iconUrl = getHereIconUrl(marker);
        const iconOptions = getHereIconOptions(marker);
        const icon = createHereIcon(iconUrl, iconOptions);

        const hereMarker = new H.map.Marker(
          { lat: marker.location.lat, lng: marker.location.lng },
          icon ? { icon } : undefined,
        );

        if (onMarkerHover) {
          hereMarker.addEventListener("pointerenter", () =>
            onMarkerHover(marker.id, true),
          );
          hereMarker.addEventListener("pointerleave", () =>
            onMarkerHover(marker.id, false),
          );
        }

        markersGroup.addObject(hereMarker);
        markerMapRef.current.set(marker.id, hereMarker);
      });

      map.addObject(markersGroup);
      markersGroupRef.current = markersGroup;
    }
  }, [
    markers,
    onMarkerHover,
    getHereIconUrl,
    getHereIconOptions,
    createHereIcon,
  ]);

  // Update marker icons when highlight state changes (without recreating)
  React.useEffect(() => {
    const H = (window as any).H;
    if (!H) return;

    markers.forEach((marker) => {
      const hereMarker = markerMapRef.current.get(marker.id);
      if (hereMarker) {
        const iconUrl = getHereIconUrl(marker);
        const iconOptions = getHereIconOptions(marker);
        const icon = createHereIcon(iconUrl, iconOptions);
        if (icon) {
          hereMarker.setIcon(icon);
        }
      }
    });
  }, [markers, getHereIconUrl, getHereIconOptions, createHereIcon]);

  // Update routes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const H = (window as any).H;
    if (!H) return;

    // Remove previous routes group
    if (routesGroupRef.current) {
      map.removeObject(routesGroupRef.current);
      routesGroupRef.current = null;
    }

    const routesGroup = new H.map.Group();

    // Add polylines for routes
    routes.forEach((route) => {
      const positions = route.positions || [
        { lat: route.from.lat, lng: route.from.lng },
        { lat: route.to.lat, lng: route.to.lng },
      ];

      const lineString = new H.geo.LineString();
      positions.forEach((pos) => {
        lineString.pushLatLngAlt(pos.lat, pos.lng, 0);
      });

      const polyline = new H.map.Polyline(lineString, {
        style: {
          lineWidth: route.isHighlighted ? 6 : 4,
          strokeColor: route.isHighlighted
            ? route.highlightColor || "#10b981"
            : "#2563eb",
          opacity: route.isHighlighted ? 1.0 : 0.8,
        },
      });

      if (onRouteSegmentHover) {
        polyline.addEventListener("pointerenter", () =>
          onRouteSegmentHover(route.id, true),
        );
        polyline.addEventListener("pointerleave", () =>
          onRouteSegmentHover(route.id, false),
        );
      }

      routesGroup.addObject(polyline);
    });

    map.addObject(routesGroup);
    routesGroupRef.current = routesGroup;
  }, [routes, onRouteSegmentHover]);

  // Handle bounds fitting in a separate effect
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || bounds.points.length === 0) return;

    // Create a stable key based on sorted delivery order positions only
    const deliveryPoints = bounds.points.slice(
      0,
      markers.filter((m) => m.type === "delivery").length,
    );
    const key = deliveryPoints
      .map((p) => `${p.lat.toFixed(5)}:${p.lng.toFixed(5)}`)
      .join("|");

    // Only fit bounds if:
    // 1. This is the first time (initial load)
    // 2. The delivery points have actually changed
    // 3. User hasn't manually interacted with the map
    const boundsChanged = lastBoundsKeyRef.current !== key;
    const shouldFit =
      boundsChanged &&
      (!initialBoundsFitRef.current || !userInteractedRef.current);

    if (shouldFit) {
      lastBoundsKeyRef.current = key;
      initialBoundsFitRef.current = true;

      const points = bounds.points;
      if (points.length === 1) {
        map.setCenter({ lat: points[0].lat, lng: points[0].lng });
        map.setZoom(13);
      } else {
        const H = (window as any).H;
        if (!H) return;

        const boundingBox = new H.geo.Rect(
          points[0].lat,
          points[0].lng,
          points[0].lat,
          points[0].lng,
        );
        points.forEach((point) => {
          boundingBox.mergePoint({ lat: point.lat, lng: point.lng });
        });
        map.getViewModel().setLookAtData({ bounds: boundingBox }, true);
      }

      // Reset user interaction flag when bounds change significantly (e.g., order added/removed)
      // This allows auto-fit after meaningful changes
      if (boundsChanged) {
        userInteractedRef.current = false;
      }
    }
  }, [bounds, markers]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default HereMapRenderer;
