import React, { memo } from "react";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeliveryOrderItemProps {
  order: Order;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onRemove?: (orderId: string) => void;
  arrivalTime?: Date;
  departureTime?: Date;
}

export const DeliveryOrderItem = memo<DeliveryOrderItemProps>(
  function DeliveryOrderItem({
    order,
    isHighlighted = false,
    onMouseEnter,
    onMouseLeave,
    onRemove,
    arrivalTime,
    departureTime,
  }) {
    // Format time as HH:MM
    const formatTimeHM = (date: Date) => {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering mouse leave/enter on parent
      onRemove?.(order.id);
    };

    return (
      <li
        className={`rounded border p-2 bg-accent/40 ${
          isHighlighted ? "ring-2 ring-blue-400" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-medium text-sm text-foreground">
              {order.product?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {order.customer}
            </div>
            <div className="text-xs text-muted-foreground/80">
              Status: {order.status}
            </div>
            <div className="text-xs text-muted-foreground/80 mt-1">
              {arrivalTime && departureTime ? (
                <>
                  Przyjazd: {formatTimeHM(arrivalTime)} | Wyjazd:{" "}
                  {formatTimeHM(departureTime)}
                </>
              ) : (
                <>
                  Location: ({order.location.lat.toFixed(4)},{" "}
                  {order.location.lng.toFixed(4)})
                </>
              )}
            </div>
          </div>
          {onRemove && (
            <Button
              variant="destructive"
              size="icon-sm"
              onClick={handleRemove}
              className="shrink-0 mt-0.5"
              aria-label={`Remove order ${order.id}`}
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </li>
    );
  }
);
