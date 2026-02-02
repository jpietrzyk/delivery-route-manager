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

      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      void behavior;
      const ui = H.ui.UI.createDefault(map, defaultLayers);
      void ui;

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
    const ICONS = {
      waypoint: "/markers/marker-waypoint.svg",
      default: "/markers/marker-default.svg",
      hover: "/markers/marker-hover.svg",
      unassigned: "/markers/unassigned-marker.svg",
    };

    if (marker.customIconUrl) {
      return marker.customIconUrl;
    }

    let iconUrl = ICONS.default;

    if (marker.isHighlighted) {
      iconUrl = ICONS.hover;
    }

    if (marker.type === "delivery" && marker.waypointIndex !== undefined) {
      iconUrl = marker.isHighlighted ? ICONS.hover : ICONS.waypoint;
    }

    if (marker.type !== "delivery") {
      iconUrl = marker.isHighlighted ? ICONS.hover : ICONS.unassigned;
    }

    return iconUrl;
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

  // Update markers and routes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous groups if present
    if (markersGroupRef.current) {
      map.removeObject(markersGroupRef.current);
      markersGroupRef.current = null;
    }

    if (routesGroupRef.current) {
      map.removeObject(routesGroupRef.current);
      routesGroupRef.current = null;
    }

    const H = (window as any).H;
    if (!H) return;

    const markersGroup = new H.map.Group();
    const routesGroup = new H.map.Group();

    // Add markers
    markers.forEach((marker) => {
      const iconUrl = getHereIconUrl(marker);
      const iconOptions = getHereIconOptions(marker);
      const icon = iconUrl
        ? new H.map.Icon(iconUrl, {
            size: iconOptions.size,
            anchor: iconOptions.anchor,
          })
        : undefined;
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
    });

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

    map.addObject(markersGroup);
    map.addObject(routesGroup);
    markersGroupRef.current = markersGroup;
    routesGroupRef.current = routesGroup;

    // Fit bounds only when the set of points changes
    if (bounds.points.length > 0) {
      const key = bounds.points
        .map((p) => `${p.lat.toFixed(6)}:${p.lng.toFixed(6)}`)
        .join("|");
      if (lastBoundsKeyRef.current !== key) {
        lastBoundsKeyRef.current = key;
        const points = bounds.points;
        if (points.length === 1) {
          map.setCenter({ lat: points[0].lat, lng: points[0].lng });
          map.setZoom(13);
        } else {
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
      }
    }
  }, [
    markers,
    routes,
    bounds,
    onMarkerHover,
    onRouteSegmentHover,
    getHereIconUrl,
    getHereIconOptions,
  ]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default HereMapRenderer;
