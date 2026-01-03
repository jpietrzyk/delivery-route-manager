import React from "react";
import { MapyTiledMap } from "@/components/maps/mapy-tiled-map";

const sampleMarkers = [
  { id: "warehouse", lat: 50.0874654, lng: 14.4212535, title: "Warehouse" },
  { id: "customer-1", lat: 50.0755381, lng: 14.4378005, title: "Customer 1" },
];

export default function MapyCzMapPage() {
  const mapyApiKey = import.meta.env.VITE_MAPY_CZ_API_KEY as string | undefined;

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="p-4 border-b border-border bg-background">
        <h1 className="text-xl font-semibold">Mapy.cz Map Tiles</h1>
        <p className="text-sm text-muted-foreground">
          Interactive map using official Mapy.cz REST tile API with Leaflet.
        </p>
      </header>
      <div className="flex-1 min-h-0">
        {mapyApiKey ? (
          <MapyTiledMap
            center={{ lat: 47.4979, lng: 19.0402 }}
            zoom={6}
            mapset="basic"
            apiKey={mapyApiKey}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-card">
            <p className="text-muted-foreground">
              API key not configured. Please set VITE_MAPY_CZ_API_KEY in .env
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
