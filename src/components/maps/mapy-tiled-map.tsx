import React, { useEffect, useRef } from "react";
import L from "leaflet";

interface MapyTiledMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  mapset?: "basic" | "outdoor" | "winter" | "aerial" | "names-overlay";
  apiKey: string;
  className?: string;
}

export const MapyTiledMap: React.FC<MapyTiledMapProps> = ({
  center,
  zoom = 13,
  mapset = "basic",
  apiKey,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

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

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [apiKey, center.lat, center.lng, zoom, mapset]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
