import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import React from "react";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import type { Order } from "@/types/order";
import { OrdersApi } from "@/services/ordersApi";

interface LeafletMapProps {
  orders?: Order[];
}

function MapFitter({ orders }: { orders: Order[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (orders.length === 0) return;

    // Filter to get only delivery orders for primary focus
    const deliveryOrders = orders.filter((order) => order.deliveryId);

    if (deliveryOrders.length === 1) {
      map.setView(deliveryOrders[0].location, 13);
    } else if (deliveryOrders.length > 1) {
      // Focus on delivery orders, but include pool orders in bounds for context
      const allOrders = orders.filter(
        (order) => order.deliveryId || (deliveryOrders.length === 0 && order) // Include pool orders if no delivery orders
      );
      const bounds = L.latLngBounds(
        allOrders.map((o) => [o.location.lat, o.location.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      // If no delivery orders, show all orders (pool orders)
      const bounds = L.latLngBounds(
        orders.map((o) => [o.location.lat, o.location.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [orders, map]);
  return null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ orders = [] }) => {
  const center =
    orders.length > 0 ? orders[0].location : { lat: 51.505, lng: -0.09 };
  const { highlightedOrderId } = useMarkerHighlight();

  // Preload icons
  const defaultIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );
  // Pool/unassigned marker icons
  const poolIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );
  const poolHighPriceIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );
  const highlightIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );

  // Use fixed threshold for orange marker
  const ORANGE_THRESHOLD = 13000;

  // Draw straight lines between consecutive DELIVERY order markers only
  const polylinePositions: [number, number][][] = [];
  const deliveryOrders = orders.filter((order) => order.deliveryId);
  if (deliveryOrders.length >= 2) {
    for (let i = 0; i < deliveryOrders.length - 1; i++) {
      polylinePositions.push([
        [deliveryOrders[i].location.lat, deliveryOrders[i].location.lng],
        [
          deliveryOrders[i + 1].location.lat,
          deliveryOrders[i + 1].location.lng,
        ],
      ]);
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      engineType="DEFAULT"
      pixelRatio={window.devicePixelRatio || 1}
    >
      <MapFitter orders={orders} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {polylinePositions.length > 0 &&
        polylinePositions.map((positions, index) => (
          <Polyline
            key={index}
            positions={positions}
            pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.8 }}
          />
        ))}
      {orders.map((order) => {
        const isPool = !order.deliveryId;
        let icon = defaultIcon;
        if (isPool) {
          if ((order.totalAmount ?? 0) > ORANGE_THRESHOLD) {
            icon = poolHighPriceIcon;
          } else {
            icon = poolIcon;
          }
        }
        if (highlightedOrderId === order.id) {
          icon = highlightIcon;
        }
        return (
          <Marker
            key={order.id}
            position={order.location}
            // @ts-expect-error: icon is supported by react-leaflet Marker but not in type definitions
            icon={icon as L.Icon}
          >
            <Popup>
              {order.product?.name}
              <br />
              {order.customer}
              <br />({order.location.lat}, {order.location.lng})
              {isPool && (
                <div style={{ color: "#888", marginBottom: "8px" }}>
                  No delivery assigned
                </div>
              )}
              {isPool && order.totalAmount !== undefined && (
                <div
                  style={{
                    color:
                      (order.totalAmount ?? 0) > ORANGE_THRESHOLD
                        ? "#f59e42"
                        : "#888",
                    marginBottom: "8px",
                  }}
                >
                  {`Order price: €${order.totalAmount.toLocaleString()} (threshold: €${ORANGE_THRESHOLD.toLocaleString()})`}
                </div>
              )}
              {isPool && (
                <button
                  onClick={async () => {
                    try {
                      await OrdersApi.updateOrder(order.id, {
                        deliveryId: "DEL-001",
                      });
                      // Refresh the page to update the UI
                      window.location.reload();
                    } catch (error) {
                      console.error("Failed to add order to delivery:", error);
                      alert("Failed to add order to delivery");
                    }
                  }}
                  style={{
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    marginTop: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ➕ Add to Delivery
                </button>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
