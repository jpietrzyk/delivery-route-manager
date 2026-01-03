import React from "react";
import { MapyMap } from "@/components/maps/mapy-map";

const sampleMarkers = [
  { id: "warehouse", lat: 50.0874654, lng: 14.4212535, title: "Warehouse" },
  { id: "customer-1", lat: 50.0755381, lng: 14.4378005, title: "Customer 1" },
];

export default function MapyCzMapPage() {
  const mapyApiKey = import.meta.env.VITE_MAPY_CZ_API_KEY as string | undefined;

  const staticUrl = React.useMemo(() => {
    const url = new URL("https://api.mapy.com/v1/static/map");
    url.searchParams.set("apikey", mapyApiKey ?? "");
    // Bounding box for Hungary (lon/lat pairs, west/south to east/north)
    url.searchParams.append("lon", "16.1");
    url.searchParams.append("lat", "45.7");
    url.searchParams.append("lon", "22.9");
    url.searchParams.append("lat", "48.6");
    url.searchParams.set("width", "900");
    url.searchParams.set("height", "500");
    url.searchParams.set("mapset", "basic");
    url.searchParams.set("format", "png");
    // Optional marker for Budapest
    url.searchParams.append(
      "markers",
      "color:red;size:normal;label:BP;19.0402,47.4979"
    );
    return url.toString();
  }, [mapyApiKey]);

  return (
    <div className="w-full h-screen flex flex-col space-y-6">
      <header className="p-4 border-b border-border bg-background">
        <h1 className="text-xl font-semibold">Mapy.cz Preview</h1>
        <p className="text-sm text-muted-foreground">
          Experimental map page using the official Mapy.cz JS API. Leaflet
          remains the default map elsewhere.
        </p>
      </header>

      <section className="px-4">
        <h2 className="text-lg font-semibold mb-2">Static map (Hungary)</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Rendered via REST static map API. Uses bounding box and a Budapest
          marker.
        </p>
        <div className="w-full max-w-5xl border rounded-md overflow-hidden bg-card">
          <img
            src={staticUrl}
            alt="Static map of Hungary"
            className="w-full h-auto block"
          />
        </div>
      </section>

      <div className="flex-1 min-h-0">
        <MapyMap
          center={{ lat: 50.0874654, lng: 14.4212535 }}
          zoom={13}
          markers={sampleMarkers}
          className="w-full h-full"
          apiKey={mapyApiKey}
        />
      </div>
    </div>
  );
}
