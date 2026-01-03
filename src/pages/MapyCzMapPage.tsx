import React, { useEffect, useState } from "react";
import { MapyTiledMap } from "@/components/maps/mapy-tiled-map";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
}

export default function MapyCzMapPage() {
  const mapyApiKey = import.meta.env.VITE_MAPY_CZ_API_KEY as string | undefined;
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await OrdersApi.getOrders();
        const orderMarkers: MapMarker[] = orders
          .filter(
            (order: Order) =>
              order.location && order.location.lat && order.location.lng
          )
          .map((order: Order) => ({
            id: order.id,
            lat: order.location.lat,
            lng: order.location.lng,
            title: `${order.id} - ${order.customer || "Unknown Customer"} (${
              order.product?.name || "No product"
            })`,
          }));
        setMarkers(orderMarkers);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="p-4 border-b border-border bg-background">
        <h1 className="text-xl font-semibold">Mapy.cz Map Tiles</h1>
        <p className="text-sm text-muted-foreground">
          Interactive map using official Mapy.cz REST tile API with Leaflet.
          Displaying {markers.length} orders.
        </p>
      </header>
      <div className="flex-1 min-h-0">
        {mapyApiKey ? (
          !loading ? (
            <MapyTiledMap
              center={{ lat: 47.4979, lng: 19.0402 }}
              zoom={6}
              mapset="basic"
              apiKey={mapyApiKey}
              markers={markers}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          )
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
