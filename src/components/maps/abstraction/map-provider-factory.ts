import type { MapProvider } from "@/types/map-provider";

// This factory will later support multiple providers (Leaflet, Google, HERE, etc.)
export async function getMapProvider(provider: "leaflet" = "leaflet"): Promise<MapProvider> {
  switch (provider) {
    case "leaflet": {
      // Lazy import to avoid loading all providers at once
      const { LeafletMapProvider } = await import("@/components/maps/leaflet/leaflet-map-provider");
      return LeafletMapProvider;
    }
    default:
      throw new Error(`Unknown map provider: ${provider}`);
  }
}
