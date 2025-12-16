import React from "react";
import type { Order } from "@/types/order";

interface OrderRouteItemProps {
  order: Order;
  arrivalTime: Date;
  departureTime: Date;
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (id: string | null) => void;
}

export const OrderRouteItem: React.FC<OrderRouteItemProps> = ({
  order,
  arrivalTime,
  departureTime,
  highlightedOrderId,
  setHighlightedOrderId,
}) => {
  // Format time as HH:MM
  const formatTimeHM = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
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
};
