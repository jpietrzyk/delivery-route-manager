/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { loadHere } from "@/lib/here-loader";
import type { Order } from "@/types/order";

interface HereMapRendererProps {
  orders: Order[];
}

export const HereMapRenderer: React.FC<HereMapRendererProps> = ({ orders }) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
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

    // Add markers for orders
    const H = (window as any).H;
    if (!H) return;

    const group = new H.map.Group();
    orders.forEach((order) => {
      const marker = new H.map.Marker({ lat: order.location.lat, lng: order.location.lng });
      (marker as any).data = { id: order.id };
      group.addObject(marker);
      markersRef.current.push(marker);
    });

    map.addObject(group);

    // Fit bounds if we have orders
    if (orders.length > 0) {
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
      lineString.pushLatLngAlt(orders[0].location.lat, orders[0].location.lng, 0);
      lineString.pushLatLngAlt(orders[1].location.lat, orders[1].location.lng, 0);
      const polyline = new H.map.Polyline(lineString, { style: { lineWidth: 4, strokeColor: "#2563eb" } });
      polylineRef.current = polyline;
      map.addObject(polyline);
    }
  }, [orders]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default HereMapRenderer;
