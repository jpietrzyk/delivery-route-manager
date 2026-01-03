import React, { useEffect, useRef, useState } from "react";
import { loadMapy } from "@/lib/mapy-loader";

interface MapyMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
}

interface MapyMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapyMarker[];
  className?: string;
  apiKey?: string;
}

export const MapyMap: React.FC<MapyMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  className,
  apiKey,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const [isReady, setReady] = useState(false);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    loadMapy(apiKey)
      .then(() => {
        if (!isMounted || !containerRef.current) return;

        const centerCoords = SMap.Coords.fromWGS84(center.lng, center.lat);
        const map = new SMap(containerRef.current, centerCoords, zoom);
        map.addDefaultLayer(SMap.DEF_BASE).enable();
        map.addDefaultControls();

        const markerLayer = new SMap.Layer.Marker();
        map.addLayer(markerLayer);
        markerLayer.enable();

        mapRef.current = map;
        markerLayerRef.current = markerLayer;
        setReady(true);
      })
      .catch((err) => {
        console.error("Failed to load Mapy.cz", err);
      });

    return () => {
      isMounted = false;
      if (markerLayerRef.current) {
        markerLayerRef.current.removeAll();
      }
      if (mapRef.current) {
        // SMap does not expose a destroy, but clearing refs helps GC
        mapRef.current = null;
      }
    };
  }, [apiKey, center.lat, center.lng, zoom]);

  // Update center/zoom when props change
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const coords = SMap.Coords.fromWGS84(center.lng, center.lat);
    mapRef.current.setCenterZoom(coords, zoom, true);
  }, [center.lat, center.lng, zoom, isReady]);

  // Update markers when data changes
  useEffect(() => {
    if (!isReady || !markerLayerRef.current) return;
    const layer = markerLayerRef.current;
    layer.removeAll();

    markers.forEach((marker) => {
      const coords = SMap.Coords.fromWGS84(marker.lng, marker.lat);
      const smapMarker = new SMap.Marker(coords, marker.id);
      if (marker.title) {
        smapMarker.decorate(SMap.Marker.Feature.Tooltip, marker.title);
      }
      layer.addMarker(smapMarker);
    });
  }, [markers, isReady]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
