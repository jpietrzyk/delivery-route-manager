import React from "react";
import type { Order } from "@/types/order";

// Haversine formula for straight-line distance in km
function getDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

function getDriveMinutes(distanceKm: number) {
  const avgTruckSpeedKmh = 60;
  return Math.round((distanceKm / avgTruckSpeedKmh) * 60);
}
function getHandlingMinutes(complexity: number) {
  return (complexity ?? 1) * 20;
}
function formatTimeHM(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface DeliveryRouteManagerProps {
  orders: Order[];
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (id: string | null) => void;
}

export const DeliveryRouteManager: React.FC<DeliveryRouteManagerProps> = ({
  orders,
  highlightedOrderId,
  setHighlightedOrderId,
}) => {
  let currentTime = new Date();
  currentTime.setHours(8, 0, 0, 0); // Start at 8:00 AM
  const result: React.ReactElement[] = [];
  for (let idx = 0; idx < orders.length; idx++) {
    const order = orders[idx];
    // Drive time from previous order (skip for first)
    let driveMinutes = 0;
    if (idx > 0) {
      driveMinutes = getDriveMinutes(
        getDistanceKm(orders[idx - 1].location, order.location)
      );
      currentTime = new Date(currentTime.getTime() + driveMinutes * 60000);
    }
    const arrivalTime = new Date(currentTime);
    // Handling time
    const handlingMinutes = getHandlingMinutes(order.product?.complexity ?? 1);
    const departureTime = new Date(
      currentTime.getTime() + handlingMinutes * 60000
    );
    result.push(
      <li
        key={String(order.id)}
        className={`rounded border p-2 bg-accent/40 ${
          highlightedOrderId === String(order.id) ? "ring-2 ring-blue-400" : ""
        }`}
        onMouseEnter={() => setHighlightedOrderId?.(String(order.id))}
        onMouseLeave={() => setHighlightedOrderId?.(null)}
      >
        <div className="font-medium text-sm text-foreground">
          {order.product?.name}
        </div>
        <div className="text-xs text-muted-foreground">{order.customer}</div>
        <div className="text-xs text-muted-foreground/80">
          Status: {order.status}
        </div>
        <div className="text-xs text-muted-foreground/80 mt-1">
          Przyjazd: {formatTimeHM(arrivalTime)} | Wyjazd:{" "}
          {formatTimeHM(departureTime)}
        </div>
      </li>
    );
    // Prepare for next order
    currentTime = departureTime;
    if (idx < orders.length - 1) {
      // Show drive + handling time to next order
      const nextDriveMinutes = getDriveMinutes(
        getDistanceKm(order.location, orders[idx + 1].location)
      );
      const nextHandlingMinutes = getHandlingMinutes(
        orders[idx + 1].product?.complexity ?? 1
      );
      result.push(
        <li
          key={`time-${order.id}-${orders[idx + 1].id}`}
          className="flex items-center justify-center text-xs text-muted-foreground/80"
        >
          ↳ czas przejazdu: {nextDriveMinutes}min, obsługa:{" "}
          {nextHandlingMinutes}min
        </li>
      );
    }
  }
  return (
    <ul className="space-y-2">
      {orders.length === 0 ? (
        <li className="text-xs text-muted-foreground">Brak zamówień</li>
      ) : (
        result
      )}
    </ul>
  );
};
