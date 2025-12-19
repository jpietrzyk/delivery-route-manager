import React, { memo } from "react";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Clock, Hammer } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface DeliveryOrderItemProps {
  order: Order;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onRemove?: (orderId: string) => void;
  arrivalTime?: Date;
  departureTime?: Date;
  id: string;
}

// Helper function to get status colors (consistent with marker popups)
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return { bg: "#fef3c7", text: "#92400e" };
    case "in-progress":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "completed":
      return { bg: "#d1fae5", text: "#065f46" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
};

// Create expanded tooltip content similar to marker popups
const createExpandedTooltipContent = (order: Order) => {
  const statusColors = getStatusColor(order.status);

  return (
    <div className="p-4 max-w-[320px] bg-background border border-border rounded-lg shadow-lg">
      <div className="font-semibold text-lg mb-3 text-foreground">
        {order.product?.name || "Unknown Order"}
      </div>

      <div className="space-y-3 text-sm">
        {/* Customer */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">👤</span>
          <div>
            <div className="font-medium text-foreground">Customer</div>
            <div className="text-muted-foreground">{order.customer}</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">📋</span>
          <div>
            <div className="font-medium text-foreground">Status</div>
            <div
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text,
              }}
            >
              {order.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">⚡</span>
          <div>
            <div className="font-medium text-foreground">Priority</div>
            <div className="text-primary font-medium">{order.priority}</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">📍</span>
          <div>
            <div className="font-medium text-foreground">Location</div>
            <div className="text-muted-foreground text-xs">
              Lat: {order.location.lat.toFixed(4)}, Lng:{" "}
              {order.location.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Product Details */}
        {order.product && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground mt-0.5">📦</span>
            <div>
              <div className="font-medium text-foreground">Product Details</div>
              <div className="text-muted-foreground text-xs">
                {order.product.name} - €{order.product.price.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                Complexity: {order.product.complexity} (≈
                {order.product.complexity * 30} min assembly)
              </div>
            </div>
          </div>
        )}

        {/* Comment */}
        {order.comment && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground mt-0.5">💬</span>
            <div>
              <div className="font-medium text-foreground">Notes</div>
              <div className="text-muted-foreground text-xs italic">
                {order.comment}
              </div>
            </div>
          </div>
        )}

        {/* Total Amount */}
        {order.totalAmount && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground mt-0.5">💰</span>
            <div>
              <div className="font-medium text-foreground">Total Amount</div>
              <div className="text-green-600 font-medium">
                €{order.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DeliveryOrderItem = memo<DeliveryOrderItemProps>(
  function DeliveryOrderItem({
    order,
    isHighlighted = false,
    onMouseEnter,
    onMouseLeave,
    onRemove,
    arrivalTime,
    departureTime,
    id,
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : "auto",
    };
    // Format time as HH:MM
    const formatTimeHM = (date: Date) => {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Calculate assembly time based on complexity (30 minutes per complexity level)
    const getAssemblyTime = () => {
      const complexity = order.product?.complexity || 1; // Default to 1 if not specified
      const minutes = complexity * 30;
      return `${minutes} minutes`;
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering mouse leave/enter on parent
      e.preventDefault(); // Prevent any drag operations
      onRemove?.(order.id);
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md ${
          isHighlighted ? "ring-2 ring-ring" : ""
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-start justify-between gap-3 p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="h-6 w-6 shrink-0 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove order ${order.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="truncate text-sm font-medium text-foreground cursor-help">
                      {order.product?.name ||
                        order.comment ||
                        "Unknown Product"}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    className="p-0 overflow-hidden"
                  >
                    {createExpandedTooltipContent(order)}
                  </TooltipContent>
                </Tooltip>
                <p className="truncate text-xs text-muted-foreground">
                  {order.customer}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <div className="flex items-center gap-1 text-muted-foreground/80 flex-1 min-w-0">
                <Clock data-testid="status-icon" className="h-3 w-3 shrink-0" />
                <span className="truncate">{order.status}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground/80 flex-1 min-w-0">
                <Hammer
                  data-testid="assembly-icon"
                  className="h-3 w-3 shrink-0"
                />
                <span className="truncate">{getAssemblyTime()}</span>
              </div>
              <div className="shrink-0 text-muted-foreground/60">
                {arrivalTime && departureTime ? (
                  <>
                    <span className="font-medium text-foreground">
                      {formatTimeHM(arrivalTime)} -{" "}
                      {formatTimeHM(departureTime)}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      title={`Lat: ${order.location.lat.toFixed(
                        4
                      )}, Lng: ${order.location.lng.toFixed(4)}`}
                    >
                      <MapPin
                        data-testid="location-icon"
                        className="h-4 w-4 text-muted-foreground/80 hover:text-foreground cursor-help"
                      />
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="w-6">{/* Spacer to maintain layout balance */}</div>
        </div>
        <div className="h-1 w-full bg-linear-to-r from-transparent via-primary/10 to-transparent"></div>
      </li>
    );
  }
);
