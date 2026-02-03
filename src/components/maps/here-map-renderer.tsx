/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { createPortal } from "react-dom";
import { loadHere } from "@/lib/here-loader";
import type {
  MapMarkerData,
  MapRouteSegmentData,
  MapBounds,
} from "@/components/maps/abstraction/map-data";
import type { Order } from "@/types/order";
import { OrderPopupContent } from "@/components/maps/abstraction/order-popup-content";

interface HereMapRendererProps {
  markers: MapMarkerData[];
  routes: MapRouteSegmentData[];
  bounds: MapBounds;
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
  onRouteSegmentHover?: (segmentId: string, isHovering: boolean) => void;
  onMarkerClick?: (markerId: string) => void;
}

const HereMapRenderer: React.FC<HereMapRendererProps> = ({
  markers,
  routes,
  bounds,
  onMarkerHover,
  onRouteSegmentHover,
  onMarkerClick,
}) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersGroupRef = React.useRef<any | null>(null);
  const routesGroupRef = React.useRef<any | null>(null);
  const markerMapRef = React.useRef<Map<string, any>>(new Map());
  const markerIconDataRef = React.useRef<
    Map<string, { base: any; hover: any }>
  >(new Map());
  const routePolylineMapRef = React.useRef<Map<string, any>>(new Map());
  const iconCacheRef = React.useRef<Map<string, any>>(new Map());
  const userInteractedRef = React.useRef<boolean>(false);
  const initialBoundsFitRef = React.useRef<boolean>(false);
  const popupContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string | null>(
    null,
  );
  const [popupPosition, setPopupPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  // Track local hover state for instant visual feedback (no React re-render needed)
  const localHoveredMarkerRef = React.useRef<string | null>(null);
  const localHoveredRouteRef = React.useRef<string | null>(null);

  // Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupContainerRef.current &&
        !popupContainerRef.current.contains(event.target as Node)
      ) {
        setSelectedMarkerId(null);
      }
    };

    if (selectedMarkerId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [selectedMarkerId]);

  // Instant hover handlers - update visuals immediately, then notify context
  const handleMarkerHoverImmediate = React.useCallback(
    (markerId: string, isHovering: boolean) => {
      const hereMarker = markerMapRef.current.get(markerId);
      const iconData = markerIconDataRef.current.get(markerId);

      if (hereMarker && iconData) {
        // Instant visual feedback - swap icon immediately
        hereMarker.setIcon(isHovering ? iconData.hover : iconData.base);

        // Update local state
        localHoveredMarkerRef.current = isHovering ? markerId : null;
      }

      // Notify context for sidebar updates (debounced to avoid excessive re-renders)
      onMarkerHover?.(markerId, isHovering);
    },
    [onMarkerHover],
  );

  const handleRouteHoverImmediate = React.useCallback(
    (segmentId: string, isHovering: boolean) => {
      const polyline = routePolylineMapRef.current.get(segmentId);

      if (polyline) {
        // Instant visual feedback - update style immediately
        polyline.setStyle({
          lineWidth: isHovering ? 6 : 4,
          strokeColor: isHovering ? "#10b981" : "#2563eb",
          opacity: isHovering ? 1.0 : 0.8,
        });

        // Update local state
        localHoveredRouteRef.current = isHovering ? segmentId : null;
      }

      // Notify context for sidebar updates
      onRouteSegmentHover?.(segmentId, isHovering);
    },
    [onRouteSegmentHover],
  );

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

      // Optimize canvas for frequent readback operations
      // This fixes the "willReadFrequently" console warning
      try {
        const canvas = mapRef.current?.querySelector("canvas");
        if (canvas) {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            console.log("✅ Canvas optimized with willReadFrequently");
          }
        }
      } catch (error) {
        console.warn("Could not optimize canvas:", error);
      }

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
      (map as any).addEventListener("dragstart", markUserInteraction);
      (map as any).addEventListener("wheel", markUserInteraction);
      (map as any).addEventListener("dbltap", markUserInteraction);

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

  const getHereIconUrl = React.useCallback(
    (marker: MapMarkerData, isHover: boolean = false) => {
      const baseUrl = window.location.origin;

      // If hover state, always use hover icon
      if (isHover) {
        return `${baseUrl}/markers/marker-hover.svg`;
      }

      const iconPath = marker.iconPath || "/markers/marker-default.svg";

      if (marker.customIconUrl) {
        return marker.customIconUrl.startsWith("http")
          ? marker.customIconUrl
          : `${baseUrl}${marker.customIconUrl}`;
      }

      return `${baseUrl}${iconPath}`;
    },
    [],
  );

  const getHereIconOptions = React.useCallback((marker: MapMarkerData) => {
    const isUnassigned = marker.type !== "delivery";
    if (isUnassigned) {
      // Unassigned markers: maintain 0.67:1 aspect ratio (226.14 x 335 in SVG)
      return {
        size: { w: 22, h: 32 },
        anchor: { x: 11, y: 32 },
      };
    }
    // Waypoint/delivery markers: maintain 0.67:1 aspect ratio (237.47 x 337.5 in SVG)
    return {
      size: { w: 27, h: 40 },
      anchor: { x: 13, y: 40 },
    };
  }, []);

  const createHereIcon = React.useCallback(
    (iconUrl: string, options: any) => {
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
    },
    [bounds.points],
  );

  const handleMarkerClickCallback = React.useCallback(
    (markerId: string) => {
      console.log("🎯 Marker clicked:", markerId);
      setSelectedMarkerId(markerId);
      onMarkerClick?.(markerId);
    },
    [onMarkerClick],
  );

  // Fallback: handle marker clicks at the map level
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    const H = (window as any).H;
    if (!map || !H) return;

    const handleMapTap = (evt: any) => {
      const target = evt?.target;
      if (target && target instanceof H.map.Marker) {
        const data = target.getData?.();
        if (data?.id) {
          handleMarkerClickCallback(data.id);
        }
      }
    };

    map.addEventListener("tap", handleMapTap);
    return () => {
      map.removeEventListener("tap", handleMapTap);
    };
  }, [handleMarkerClickCallback]);

  // Create markers only when positions/count change (not on highlight)
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const H = (window as any).H;
    if (!H) return;

    // Check if we need to recreate markers
    const existingMarkerIds = new Set(markerMapRef.current.keys());
    const newMarkerIds = new Set(markers.map((m) => m.id));
    const needsRecreate =
      existingMarkerIds.size !== newMarkerIds.size ||
      ![...existingMarkerIds].every((id) => newMarkerIds.has(id));

    if (needsRecreate) {
      // Reuse existing markers group when possible to avoid remove errors
      let markersGroup = markersGroupRef.current;
      if (markersGroup) {
        try {
          markersGroup.removeAll();
        } catch (error) {
          console.warn("Could not clear markers group:", error);
        }
      } else {
        markersGroup = new H.map.Group();
        markersGroupRef.current = markersGroup;
        map.addObject(markersGroup);
      }
      markerMapRef.current.clear();

      const handleGroupMarkerClick = (evt: any) => {
        console.log("Group marker click detected, event:", evt);
        const target = evt?.target;
        const data = target?.getData?.();
        console.log("Extracted data from marker:", data);
        if (data?.id) {
          console.log("Calling handleMarkerClickCallback with ID:", data.id);
          handleMarkerClickCallback(data.id);
        }
      };

      markersGroup.addEventListener("tap", handleGroupMarkerClick);
      markersGroup.addEventListener("pointerup", handleGroupMarkerClick);
      markersGroup.addEventListener("click", handleGroupMarkerClick);

      // Create new markers
      markers.forEach((marker) => {
        // Pre-create both base and hover icons for instant swapping
        const baseIconUrl = getHereIconUrl(marker, false);
        const hoverIconUrl = getHereIconUrl(marker, true);
        const iconOptions = getHereIconOptions(marker);
        const baseIcon = createHereIcon(baseIconUrl, iconOptions);
        const hoverIcon = createHereIcon(hoverIconUrl, iconOptions);

        // Store both icons for instant swapping
        if (baseIcon && hoverIcon) {
          markerIconDataRef.current.set(marker.id, {
            base: baseIcon,
            hover: hoverIcon,
          });
        }

        const hereMarker = new H.map.Marker(
          { lat: marker.location.lat, lng: marker.location.lng },
          baseIcon ? { icon: baseIcon } : undefined,
        );
        hereMarker.setData({ id: marker.id, markerData: marker });

        // Add cursor pointer for better UX
        const markerElement = hereMarker.getRootElement?.();
        if (markerElement) {
          markerElement.style.cursor = "pointer";
        }

        // Use immediate hover handlers for instant visual feedback
        hereMarker.addEventListener("pointerenter", () =>
          handleMarkerHoverImmediate(marker.id, true),
        );
        hereMarker.addEventListener("pointerleave", () =>
          handleMarkerHoverImmediate(marker.id, false),
        );

        const handleMarkerClick = () => handleMarkerClickCallback(marker.id);
        hereMarker.addEventListener("tap", handleMarkerClick);
        hereMarker.addEventListener("pointerdown", handleMarkerClick);
        hereMarker.addEventListener("pointerup", handleMarkerClick);
        hereMarker.addEventListener("click", handleMarkerClick);

        markersGroup.addObject(hereMarker);
        markerMapRef.current.set(marker.id, hereMarker);
      });
    }
  }, [
    markers,
    handleMarkerHoverImmediate,
    handleMarkerClickCallback,
    getHereIconUrl,
    getHereIconOptions,
    createHereIcon,
  ]);

  // Sync highlight state from context (for sidebar-initiated highlights)
  React.useEffect(() => {
    markers.forEach((marker) => {
      const hereMarker = markerMapRef.current.get(marker.id);
      const iconData = markerIconDataRef.current.get(marker.id);

      if (hereMarker && iconData && marker.isHighlighted) {
        // If highlighted from context (sidebar), update icon
        if (localHoveredMarkerRef.current !== marker.id) {
          hereMarker.setIcon(iconData.hover);
        }
      } else if (hereMarker && iconData && !marker.isHighlighted) {
        // If not highlighted, reset to base icon (unless locally hovered)
        if (localHoveredMarkerRef.current !== marker.id) {
          hereMarker.setIcon(iconData.base);
        }
      }
    });
  }, [markers]);

  // Create routes only when route structure changes (not on highlight)
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const H = (window as any).H;
    if (!H) return;

    // Check if we need to recreate routes
    const existingRouteIds = new Set(routePolylineMapRef.current.keys());
    const newRouteIds = new Set(routes.map((r) => r.id));

    // Check if route IDs changed
    const routeIdsChanged =
      existingRouteIds.size !== newRouteIds.size ||
      ![...existingRouteIds].every((id) => newRouteIds.has(id));

    // Also check if any route positions have changed (e.g., HERE API routes loaded)
    let routePositionsChanged = false;
    if (!routeIdsChanged) {
      // Only check positions if IDs are the same
      for (const route of routes) {
        const existingPolyline = routePolylineMapRef.current.get(route.id);
        if (existingPolyline) {
          const existingPositions = existingPolyline
            .getGeometry()
            .getLatLngAltArray();
          const newPositions = route.positions || [
            { lat: route.from.lat, lng: route.from.lng },
            { lat: route.to.lat, lng: route.to.lng },
          ];

          // Compare position count as a quick check
          if (existingPositions.length / 3 !== newPositions.length) {
            routePositionsChanged = true;
            break;
          }
        }
      }
    }

    const needsRecreate = routeIdsChanged || routePositionsChanged;

    if (!needsRecreate) {
      // Routes structure unchanged, skip recreation
      return;
    }

    // Reuse existing routes group when possible to avoid remove errors
    let routesGroup = routesGroupRef.current;
    if (routesGroup) {
      try {
        routesGroup.removeAll();
      } catch (error) {
        console.warn("Could not clear routes group:", error);
      }
    } else {
      routesGroup = new H.map.Group();
      routesGroupRef.current = routesGroup;
      map.addObject(routesGroup);
    }
    routePolylineMapRef.current.clear();

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
          lineWidth: 4,
          strokeColor: "#2563eb",
          opacity: 0.8,
        },
      });

      // Use immediate hover handlers for instant visual feedback
      polyline.addEventListener("pointerenter", () =>
        handleRouteHoverImmediate(route.id, true),
      );
      polyline.addEventListener("pointerleave", () =>
        handleRouteHoverImmediate(route.id, false),
      );

      routesGroup.addObject(polyline);
      routePolylineMapRef.current.set(route.id, polyline);

      // Add route information labels if distance/duration available
      if (route.distance !== undefined || route.duration !== undefined) {
        const midPoint = positions[Math.floor(positions.length / 2)];

        // Format distance in km
        const distanceKm = route.distance
          ? (route.distance / 1000).toFixed(1)
          : null;

        // Format duration as hours/minutes
        let durationStr = "";
        if (route.duration) {
          const hours = Math.floor(route.duration / 3600);
          const minutes = Math.floor((route.duration % 3600) / 60);
          if (hours > 0) {
            durationStr = `${hours}h ${minutes}m`;
          } else {
            durationStr = `${minutes}m`;
          }
        }

        // Create label text
        const labelText = [distanceKm && `${distanceKm}km`, durationStr]
          .filter(Boolean)
          .join(" • ");

        if (labelText) {
          // Create a simple SVG icon for the label
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="30">
            <rect x="2" y="2" width="116" height="26" fill="white" stroke="#999" stroke-width="1" rx="3"/>
            <text x="60" y="19" text-anchor="middle" font-size="12" font-family="Arial" fill="#333">${labelText}</text>
          </svg>`;
          const iconUrl = "data:image/svg+xml," + encodeURIComponent(svg);
          const labelIcon = new H.map.Icon(iconUrl, { width: 120, height: 30 });
          const label = new H.map.Marker(
            { lat: midPoint.lat, lng: midPoint.lng },
            { icon: labelIcon },
          );
          routesGroup.addObject(label);
        }
      }
    });
  }, [routes, handleRouteHoverImmediate]);

  // Sync route highlight state from context (for sidebar-initiated highlights)
  React.useEffect(() => {
    routes.forEach((route) => {
      const polyline = routePolylineMapRef.current.get(route.id);
      if (polyline) {
        // Update only if not locally hovered (local hover takes precedence)
        if (localHoveredRouteRef.current !== route.id) {
          polyline.setStyle({
            lineWidth: route.isHighlighted ? 6 : 4,
            strokeColor: route.isHighlighted
              ? route.highlightColor || "#10b981"
              : "#2563eb",
            opacity: route.isHighlighted ? 1.0 : 0.8,
          });
        }
      }
    });
  }, [routes]);

  // Handle bounds fitting in a separate effect
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || bounds.points.length === 0) return;

    // Only fit bounds on initial load, never auto-fit afterwards
    // This prevents the jumping zoom issue
    if (initialBoundsFitRef.current) return;

    const points = bounds.points;
    console.log("Fitting initial bounds with", points.length, "points");

    const H = (window as any).H;
    if (!H) return;

    try {
      if (points.length === 1) {
        map.setCenter({ lat: points[0].lat, lng: points[0].lng });
        map.setZoom(13);
      } else {
        // Calculate min/max coordinates to create proper bounding box
        let minLat = points[0].lat;
        let maxLat = points[0].lat;
        let minLng = points[0].lng;
        let maxLng = points[0].lng;

        for (const point of points) {
          minLat = Math.min(minLat, point.lat);
          maxLat = Math.max(maxLat, point.lat);
          minLng = Math.min(minLng, point.lng);
          maxLng = Math.max(maxLng, point.lng);
        }

        // Create rect with proper bounds (north, west, south, east)
        const boundingBox = new H.geo.Rect(maxLat, minLng, minLat, maxLng);
        map.getViewModel().setLookAtData({ bounds: boundingBox }, true);
      }
      initialBoundsFitRef.current = true;
      console.log("Initial bounds fitted");
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [bounds.points]);

  // Get the selected marker's popup content
  const selectedMarker = selectedMarkerId
    ? markers.find((m) => m.id === selectedMarkerId)
    : null;

  React.useEffect(() => {
    console.log("selectedMarkerId changed:", selectedMarkerId);
    console.log("selectedMarker:", selectedMarker);
    if (selectedMarker?.popupData) {
      console.log("selectedMarker.popupData:", selectedMarker.popupData);
    }
    console.log(
      "should show popup:",
      selectedMarker && selectedMarker.popupData,
    );
  }, [selectedMarkerId, selectedMarker]);

  const updatePopupPosition = React.useCallback(() => {
    const map = mapInstanceRef.current;
    const mapElement = mapRef.current;
    if (!map || !mapElement || !selectedMarker) {
      setPopupPosition(null);
      return;
    }

    try {
      const screenPoint = map.geoToScreen({
        lat: selectedMarker.location.lat,
        lng: selectedMarker.location.lng,
      });
      const rect = mapElement.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + screenPoint.x,
        y: rect.top + screenPoint.y,
      });
    } catch (error) {
      console.error("Failed to compute popup position:", error);
      setPopupPosition(null);
    }
  }, [selectedMarker]);

  React.useEffect(() => {
    updatePopupPosition();

    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapViewChange = () => updatePopupPosition();
    map.addEventListener("mapviewchange", handleMapViewChange);
    window.addEventListener("resize", handleMapViewChange);

    return () => {
      map.removeEventListener("mapviewchange", handleMapViewChange);
      window.removeEventListener("resize", handleMapViewChange);
    };
  }, [selectedMarkerId, updatePopupPosition]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", position: "relative" }}
      />
      {selectedMarker?.popupData &&
        createPortal(
          <>
            {popupPosition && (
              <div
                ref={popupContainerRef}
                style={{
                  position: "fixed",
                  left: `${popupPosition.x}px`,
                  top: `${popupPosition.y}px`,
                  transform: "translate(-50%, calc(-100% - 12px))",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  zIndex: 10000,
                  maxWidth: "400px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                <button
                  onClick={() => setSelectedMarkerId(null)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  ✕
                </button>
                <div style={{ padding: "20px", paddingTop: "30px" }}>
                  <OrderPopupContent
                    order={selectedMarker.popupData.order as unknown as Order}
                    isUnassigned={selectedMarker.popupData.isUnassigned}
                    toggleText={selectedMarker.popupData.toggleText}
                    onToggle={selectedMarker.popupData.onToggle}
                  />
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </div>
  );
};

export default HereMapRenderer;
