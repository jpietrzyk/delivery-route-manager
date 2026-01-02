import type { MapProvider } from "@/types/map-provider";
import { LeafletMapProvider } from "@/providers/LeafletMapProvider";

export type MapProviderType = "leaflet" | "google" | "here" | "mapy";

/**
 * Factory for creating map provider instances
 * Supports multiple map providers with consistent interface
 */
export function createMapProvider(
  providerType: MapProviderType,
  mapInstance: unknown
): MapProvider {
  switch (providerType) {
    case "leaflet":
      return new LeafletMapProvider(mapInstance);

    // Future providers:
    // case "google":
    //   const { GoogleMapProvider } = await import("@/providers/GoogleMapProvider");
    //   return new GoogleMapProvider(mapInstance);

    // case "here":
    //   const { HereMapProvider } = await import("@/providers/HereMapProvider");
    //   return new HereMapProvider(mapInstance);

    // case "mapy":
    //   const { MapyCzProvider } = await import("@/providers/MapyCzProvider");
    //   return new MapyCzProvider(mapInstance);

    default:
      throw new Error(`Unknown map provider: ${providerType}`);
  }
}

/**
 * Legacy async version for compatibility
 * @deprecated Use createMapProvider instead
 */
export async function getMapProvider(provider: MapProviderType = "leaflet", mapInstance?: unknown): Promise<MapProvider> {
  if (!mapInstance) {
    throw new Error("Map instance is required");
  }
  return createMapProvider(provider, mapInstance);
}
