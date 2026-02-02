/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { createPortal } from "react-dom";
import { loadHere } from "@/lib/here-loader";
import type {
  MapMarkerData,
  MapRouteSegmentData,
  MapBounds,
} from "@/components/maps/abstraction/map-data";
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
  const lastBoundsKeyRef = React.useRef<string | null>(null);
  const markerMapRef = React.useRef<Map<string, any>>(new Map());
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
        const iconUrl = getHereIconUrl(marker);
        const iconOptions = getHereIconOptions(marker);
        const icon = createHereIcon(iconUrl, iconOptions);

        const hereMarker = new H.map.Marker(
          { lat: marker.location.lat, lng: marker.location.lng },
          icon ? { icon } : undefined,
        );
        hereMarker.setData({ id: marker.id });

        if (onMarkerHover) {
          hereMarker.addEventListener("pointerenter", () =>
            onMarkerHover(marker.id, true),
          );
          hereMarker.addEventListener("pointerleave", () =>
            onMarkerHover(marker.id, false),
          );
        }

        const handleMarkerClick = () => handleMarkerClickCallback(marker.id);
        hereMarker.addEventListener("tap", handleMarkerClick);
        hereMarker.addEventListener("pointerdown", handleMarkerClick);
        hereMarker.addEventListener("pointerup", handleMarkerClick);
        hereMarker.addEventListener("click", handleMarkerClick);

        markersGroup.addObject(hereMarker);
        markerMapRef.current.set(marker.id, hereMarker);
      });

      map.addObject(markersGroup);
      markersGroupRef.current = markersGroup;
    }
  }, [
    markers,
    onMarkerHover,
    handleMarkerClickCallback,
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
      initialBoundsFitRef.current = true;
      console.log("Initial bounds fitted");
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, []);

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
                    order={selectedMarker.popupData.order}
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
