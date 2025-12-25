import React, { memo } from "react";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { createExpandedTooltipContent } from "./order-tooltip-utils";

interface DeliveryOrderItemProps {
  order: Order;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onRemove?: (orderId: string) => void;
  id: string;
}

export const DeliveryOrderItem = memo<DeliveryOrderItemProps>(
  function DeliveryOrderItem({
    order,
    isHighlighted = false,
    onMouseEnter,
    onMouseLeave,
    onRemove,
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
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full max-w-full overflow-hidden">
                  <h4 className="truncate text-sm font-medium text-foreground cursor-help flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate">
                        {order.product?.name || order.id}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {order.id} |{" "}
                        {order.product?.complexity
                          ? order.product.complexity * 30
                          : 0}{" "}
                        min | {order.priority}
                      </div>
                    </div>
                  </h4>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                align="center"
                sideOffset={12}
                className="p-0 overflow-hidden"
              >
                {createExpandedTooltipContent(order)}
              </TooltipContent>
            </Tooltip>
          </div>
          {onRemove && (
            <Button
              onClick={handleRemove}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              size="icon"
              className="shrink-0 h-6 w-6 p-1 bg-primary hover:bg-primary/90"
              aria-label={`Remove order ${order.id}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </li>
    );
  }
);
