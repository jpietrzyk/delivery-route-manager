/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { loadHere } from "@/lib/here-loader";
import type { Order } from "@/types/order";

interface HereMapRendererProps {
  orders: Order[];
  unassignedOrders?: Order[];
  highlightedOrderId?: string | null;
  onMarkerHover?: (orderId: string, isHovering: boolean) => void;
}

export const HereMapRenderer: React.FC<HereMapRendererProps> = ({
  orders,
  unassignedOrders = [],
  highlightedOrderId,
  onMarkerHover,
}) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const markerIndexRef = React.useRef<
    Map<string, { marker: any; type: "delivery" | "unassigned" }>
  >(new Map());
  const defaultIconRef = React.useRef<any | null>(null);
  const unassignedIconRef = React.useRef<any | null>(null);
  const highlightIconRef = React.useRef<any | null>(null);
  const polylineRef = React.useRef<any | null>(null);

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

      // Prepare simple SVG-based icons
      const defaultSvg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="26" height="40" viewBox="0 0 26 40" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M13 40c0 0 13-18.207 13-26C26 6.268 20.18 0 13 0 5.82 0 0 6.268 0 14c0 7.793 13 26 13 26z" fill="#3b82f6"/>
            <circle cx="13" cy="14" r="6" fill="#ffffff"/>
          </g>
        </svg>`;
      const unassignedSvg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="26" height="40" viewBox="0 0 26 40" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M13 40c0 0 13-18.207 13-26C26 6.268 20.18 0 13 0 5.82 0 0 6.268 0 14c0 7.793 13 26 13 26z" fill="#6b7280"/>
            <circle cx="13" cy="14" r="6" fill="#ffffff"/>
          </g>
        </svg>`;
      const highlightSvg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="30" height="46" viewBox="0 0 30 46" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M15 46c0 0 15-20.958 15-29C30 7.82 23.284 0 15 0 6.716 0 0 7.82 0 17c0 8.042 15 29 15 29z" fill="#ef4444"/>
            <circle cx="15" cy="17" r="7" fill="#ffffff"/>
          </g>
        </svg>`;
      defaultIconRef.current = new H.map.Icon(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultSvg)}`,
      );
      unassignedIconRef.current = new H.map.Icon(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(unassignedSvg)}`,
      );
      highlightIconRef.current = new H.map.Icon(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(highlightSvg)}`,
      );

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

  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    for (const m of markersRef.current) {
      map.removeObject(m);
    }
    markersRef.current = [];
    markerIndexRef.current.clear();

    // Add markers for orders
    const H = (window as any).H;
    if (!H) return;

    const group = new H.map.Group();
    const addOrderMarker = (order: Order, type: "delivery" | "unassigned") => {
      const isHighlighted =
        highlightedOrderId && order.id === highlightedOrderId;
      const baseIcon =
        type === "unassigned"
          ? unassignedIconRef.current
          : defaultIconRef.current;
      const iconToUse = isHighlighted ? highlightIconRef.current : baseIcon;
      const marker = new H.map.Marker(
        { lat: order.location.lat, lng: order.location.lng },
        iconToUse ? { icon: iconToUse } : undefined,
      );
      (marker as any).data = { id: order.id };
      if (onMarkerHover) {
        marker.addEventListener("pointerenter", () =>
          onMarkerHover(order.id, true),
        );
        marker.addEventListener("pointerleave", () =>
          onMarkerHover(order.id, false),
        );
      }
      group.addObject(marker);
      markersRef.current.push(marker);
      markerIndexRef.current.set(order.id, { marker, type });
    };

    orders.forEach((o) => addOrderMarker(o, "delivery"));
    unassignedOrders.forEach((o) => addOrderMarker(o, "unassigned"));

    map.addObject(group);

    // Fit bounds if we have orders
    if (orders.length > 0 || unassignedOrders.length > 0) {
      const rect = group.getBoundingBox();
      if (rect) {
        map.getViewModel().setLookAtData({ bounds: rect }, true);
      }
    }

    // Draw a simple polyline between first two orders if present (minimal route validation)
    if (polylineRef.current) {
      map.removeObject(polylineRef.current);
      polylineRef.current = null;
    }
    if (orders.length >= 2) {
      const lineString = new H.geo.LineString();
      lineString.pushLatLngAlt(
        orders[0].location.lat,
        orders[0].location.lng,
        0,
      );
      lineString.pushLatLngAlt(
        orders[1].location.lat,
        orders[1].location.lng,
        0,
      );
      const polyline = new H.map.Polyline(lineString, {
        style: { lineWidth: 4, strokeColor: "#2563eb" },
      });
      polylineRef.current = polyline;
      map.addObject(polyline);
    }
  }, [orders, unassignedOrders, highlightedOrderId, onMarkerHover]);

  // Update icons on highlight change
  React.useEffect(() => {
    const H = (window as any).H;
    const map = mapInstanceRef.current;
    if (!H || !map) return;

    markerIndexRef.current.forEach(({ marker, type }, orderId) => {
      const isHighlighted =
        highlightedOrderId && orderId === highlightedOrderId;
      const baseIcon =
        type === "unassigned"
          ? unassignedIconRef.current
          : defaultIconRef.current;
      const icon = isHighlighted ? highlightIconRef.current : baseIcon;
      if (icon) {
        marker.setIcon(icon);
      }
    });
  }, [highlightedOrderId]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default HereMapRenderer;
