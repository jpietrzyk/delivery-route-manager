import React, { useEffect, useRef } from "react";
import L from "leaflet";

interface MapyMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
}

interface MapyPolyline {
  id: string;
  positions: Array<{ lat: number; lng: number }>;
  color?: string;
  weight?: number;
  opacity?: number;
}

interface MapyTiledMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  mapset?: "basic" | "outdoor" | "winter" | "aerial" | "names-overlay";
  apiKey: string;
  markers?: MapyMarker[];
  polylines?: MapyPolyline[];
  className?: string;
}

export const MapyTiledMap: React.FC<MapyTiledMapProps> = ({
  center,
  zoom = 13,
  mapset = "basic",
  apiKey,
  markers = [],
  polylines = [],
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    // Initialize map
    const map = L.map(containerRef.current).setView(
      [center.lat, center.lng],
      zoom
    );

    // Add Mapy.cz tile layer
    const tileUrl = `https://api.mapy.com/v1/maptiles/${mapset}/256/{z}/{x}/{y}?apikey=${apiKey}`;
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

    // Create marker layer group
    const markerLayer = L.layerGroup().addTo(map);
    markerLayerRef.current = markerLayer;

    // Create polyline layer group
    const polylineLayer = L.layerGroup().addTo(map);
    polylineLayerRef.current = polylineLayer;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      polylineLayerRef.current = null;
    };
  }, [apiKey, center.lat, center.lng, zoom, mapset]);

  // Update markers
  useEffect(() => {
    if (!markerLayerRef.current) return;

    // Clear existing markers
    markerLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng]).addTo(
        markerLayerRef.current!
      );

      if (marker.title) {
        leafletMarker.bindPopup(marker.title);
      }
    });
  }, [markers]);

  // Update polylines
  useEffect(() => {
    if (!polylineLayerRef.current) return;

    console.log("Updating polylines, count:", polylines.length);

    // Clear existing polylines
    polylineLayerRef.current.clearLayers();

    // Add new polylines
    polylines.forEach((polyline) => {
      console.log(
        "Adding polyline:",
        polyline.id,
        "with",
        polyline.positions.length,
        "positions"
      );
      console.log("First 3 positions:", polyline.positions.slice(0, 3));

      const positions = polyline.positions.map(
        (pos) => [pos.lat, pos.lng] as [number, number]
      );

      console.log(
        "Converted to Leaflet format (first 3):",
        positions.slice(0, 3)
      );

      const leafletPolyline = L.polyline(positions, {
        color: polyline.color || "#3388ff",
        weight: polyline.weight || 3,
        opacity: polyline.opacity || 0.8,
      }).addTo(polylineLayerRef.current!);

      console.log("Polyline added to map:", leafletPolyline);
    });
  }, [polylines]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
