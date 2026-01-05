/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from "react";
import type { MapProvider } from "@/types/map-provider";
import { LeafletMapProvider } from "@/providers/LeafletMapProvider";

interface MapProviderContextValue {
  provider: MapProvider | null;
  providerType: "leaflet" | "google" | "here" | "mapy";
}

const MapProviderContext = createContext<MapProviderContextValue>({
  provider: null,
  providerType: "leaflet",
});

export const useMapProvider = () => {
  const context = useContext(MapProviderContext);
  if (!context.provider) {
    throw new Error("useMapProvider must be used within MapProviderProvider");
  }
  return context;
};

interface MapProviderProviderProps {
  children: React.ReactNode;
  map?: unknown; // Leaflet map instance
  providerType?: "leaflet" | "google" | "here" | "mapy";
}

export const MapProviderProvider: React.FC<MapProviderProviderProps> = ({
  children,
  map,
  providerType = "leaflet",
}) => {
  const provider = useMemo(() => {
    if (!map) return null;

    switch (providerType) {
      case "leaflet":
        return new LeafletMapProvider(map);
      // Future providers:
      // case 'google':
      //   return new GoogleMapProvider(map);
      // case 'here':
      //   return new HereMapProvider(map);
      // case 'mapy':
      //   return new MapyCzProvider(map);
      default:
        return new LeafletMapProvider(map);
    }
  }, [map, providerType]);

  const value = useMemo(
    () => ({ provider, providerType }),
    [provider, providerType]
  );

  return (
    <MapProviderContext.Provider value={value}>
      {children}
    </MapProviderContext.Provider>
  );
};
