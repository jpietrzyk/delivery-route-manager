import React from "react";
import type { Order } from "@/types/order";
import { DeliveryOrderItem } from "./delivery-order-item";

interface DeliveryOrderListProps {
  orders: Order[];
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (id: string | null) => void;
  onRemoveOrder?: (orderId: string) => void;
  title?: string;
}

export const DeliveryOrderList: React.FC<DeliveryOrderListProps> = ({
  orders,
  highlightedOrderId,
  setHighlightedOrderId,
  onRemoveOrder,
  title = "Zamówienia",
}) => {
  return (
    <div className="px-4 py-2">
      <div className="font-semibold text-sm mb-2 text-foreground/70">
        {title}
      </div>
      {orders.length === 0 ? (
        <div className="text-xs text-muted-foreground">Brak zamówień</div>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <DeliveryOrderItem
              key={order.id}
              order={order}
              isHighlighted={highlightedOrderId === order.id}
              onMouseEnter={() => setHighlightedOrderId?.(order.id)}
              onMouseLeave={() => setHighlightedOrderId?.(null)}
              onRemove={onRemoveOrder}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
