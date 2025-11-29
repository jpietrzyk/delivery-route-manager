// src/components/HereMap.tsx
import { useEffect, useRef } from "react";
import { useHereMap } from "@/hooks/useHereMap"; // Obtain the context

const HereMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { styleRef, setIsReady } = useHereMap(); // Get the context setters

  useEffect(() => {
    // Check if H (HERE Maps) is available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === "undefined" || !(window as any).H) {
      console.error("HERE Maps SDK not loaded");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const H = (window as any).H;
    const platform = new H.service.Platform({
      apikey: import.meta.env.VITE_HERE_MAPS_API_KEY,
    });

    const engineType = H.Map.EngineType.HARP;
    const defaultLayers = platform.createDefaultLayers({ engineType });

    if (!mapRef.current) {
      console.error("Map container not available");
      return;
    }

    const map = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: { lat: 52.52, lng: 13.405 },
      zoom: 10,
      engineType,
      pixelRatio: window.devicePixelRatio || 1,
    });

    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    const baseLayer = map.getBaseLayer();
    const style = baseLayer?.getProvider()?.getStyle();

    // Enable other components to use the style once it is ready
    if (style) {
      styleRef.current = style;
      setIsReady(true);
    }

    const handleResize = () => map.getViewPort().resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.dispose();
    };
  }, [styleRef, setIsReady]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};

export default HereMap;
