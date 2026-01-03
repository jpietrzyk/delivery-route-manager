import React, { useEffect, useState } from "react";
import { MapyTiledMap } from "@/components/maps/mapy-tiled-map";
import { OrdersApi } from "@/services/ordersApi";
import { DeliveryRoutesApi } from "@/services/deliveryRoutesApi";
import { MapyRoutingApi } from "@/services/mapyRoutingApi";
import type { Order } from "@/types/order";
import type { DeliveryRoute } from "@/types/delivery-route";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
}

interface MapPolyline {
  id: string;
  positions: Array<{ lat: number; lng: number }>;
  color?: string;
  weight?: number;
  opacity?: number;
}

export default function MapyCzMapPage() {
  const mapyApiKey = import.meta.env.VITE_MAPY_CZ_API_KEY as string | undefined;
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [polylines, setPolylines] = useState<MapPolyline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        const [orders, deliveryRoutes] = await Promise.all([
          OrdersApi.getOrders(),
          DeliveryRoutesApi.getDeliveries(),
        ]);

        console.log("Orders fetched:", orders.length);
        console.log("Delivery routes fetched:", deliveryRoutes.length);

        // Get order IDs from first delivery route
        const firstRouteOrderIds = new Set(
          deliveryRoutes.length > 0 && deliveryRoutes[0].orders
            ? deliveryRoutes[0].orders.map((wp) => wp.orderId)
            : []
        );
        console.log("First route order IDs:", Array.from(firstRouteOrderIds));

        // Create order markers - only for orders in the first delivery route
        const orderMarkers: MapMarker[] = orders
          .filter(
            (order: Order) =>
              order.location &&
              order.location.lat &&
              order.location.lng &&
              firstRouteOrderIds.has(order.id)
          )
          .map((order: Order) => ({
            id: order.id,
            lat: order.location.lat,
            lng: order.location.lng,
            title: `${order.id} - ${order.customer || "Unknown Customer"} (${
              order.product?.name || "No product"
            })`,
          }));
        console.log("Order markers created:", orderMarkers.length);
        setMarkers(orderMarkers);

        // Create polyline between first two waypoints of first delivery route using real routing
        if (deliveryRoutes.length > 0 && mapyApiKey) {
          const firstRoute = deliveryRoutes[0];
          console.log(
            "First route:",
            firstRoute.id,
            "waypoints:",
            firstRoute.orders?.length
          );

          if (firstRoute.orders && firstRoute.orders.length >= 2) {
            const waypoint1OrderId = firstRoute.orders[0].orderId;
            const waypoint2OrderId = firstRoute.orders[1].orderId;

            console.log(
              "Looking for orders:",
              waypoint1OrderId,
              waypoint2OrderId
            );

            const order1 = orders.find((o) => o.id === waypoint1OrderId);
            const order2 = orders.find((o) => o.id === waypoint2OrderId);

            console.log("Found order1:", order1?.id, order1?.location);
            console.log("Found order2:", order2?.id, order2?.location);

            if (
              order1?.location &&
              order2?.location &&
              order1.location.lat &&
              order1.location.lng &&
              order2.location.lat &&
              order2.location.lng
            ) {
              try {
                console.log("Calculating route...");
                const routingResponse = await MapyRoutingApi.calculateRoute(
                  {
                    start: [order1.location.lng, order1.location.lat], // [lng, lat]
                    end: [order2.location.lng, order2.location.lat], // [lng, lat]
                    routeType: "car_fast",
                    format: "geojson",
                  },
                  mapyApiKey
                );

                console.log("Route calculated:", {
                  length: routingResponse.length,
                  duration: routingResponse.duration,
                  coordinates:
                    routingResponse.geometry.geometry.coordinates.length,
                });
                console.log("Full routing response:", routingResponse);
                console.log(
                  "Geometry coordinates sample (first 5):",
                  routingResponse.geometry.geometry.coordinates.slice(0, 5)
                );

                // Convert GeoJSON coordinates to polyline positions
                const positions = MapyRoutingApi.convertGeoJSONToPositions(
                  routingResponse.geometry.geometry.coordinates
                );

                console.log(
                  "Converted positions sample (first 5):",
                  positions.slice(0, 5)
                );

                const routePolyline: MapPolyline = {
                  id: `${firstRoute.id}-segment-0-1`,
                  positions,
                  color: "#ff6b6b",
                  weight: 4,
                  opacity: 0.8,
                };
                console.log(
                  "Polyline created with",
                  positions.length,
                  "points:",
                  routePolyline
                );
                setPolylines([routePolyline]);
              } catch (error) {
                console.error("Failed to calculate route:", error);
                // Fallback to straight line
                const routePolyline: MapPolyline = {
                  id: `${firstRoute.id}-segment-0-1`,
                  positions: [
                    { lat: order1.location.lat, lng: order1.location.lng },
                    { lat: order2.location.lat, lng: order2.location.lng },
                  ],
                  color: "#ff6b6b",
                  weight: 4,
                  opacity: 0.8,
                };
                console.log("Polyline created (fallback straight line)");
                setPolylines([routePolyline]);
              }
            } else {
              console.log("Missing location data for one or both orders");
            }
          } else {
            console.log("Not enough waypoints in first route");
          }
        } else {
          console.log("No delivery routes found or API key missing");
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
              polylines={polylines}
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
