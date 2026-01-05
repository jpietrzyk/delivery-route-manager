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
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";

interface DeliveryOrderItemProps {
  order: Order;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onRemove?: (orderId: string) => void;
  id: string;
  arrivalTime?: Date;
  departureTime?: Date;
  sequence?: number;
}

export const DeliveryOrderItem = memo<DeliveryOrderItemProps>(
  function DeliveryOrderItem({
    order,
    isHighlighted = false,
    onMouseEnter,
    onMouseLeave,
    onRemove,
    id,
    sequence,
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const { highlightedSegmentId } = useSegmentHighlight();

    // Determine if this order is the "fromOrder" of the currently highlighted segment
    const isPreviousOrderInSegment = highlightedSegmentId
      ? highlightedSegmentId.startsWith(`${order.id}-`)
      : false;

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : "auto",
      cursor: "grab", // Show grab cursor to indicate draggable
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
        className={`group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md hover:cursor-grab ${
          isHighlighted ? "ring-2 ring-ring" : ""
        } ${isPreviousOrderInSegment ? "ring-2 ring-primary/50" : ""}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex items-center gap-2 p-2 select-none">
          <div className="shrink-0 h-6 w-6 flex items-center justify-center bg-primary hover:bg-primary/90 rounded font-semibold text-xs text-primary-foreground">
            {sequence !== undefined ? sequence + 1 : "•"}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="shrink-0 h-6 w-6 p-1 bg-muted hover:bg-muted/90"
                aria-label={`Info about order ${order.id}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5a1 1 0 11-2 0V4a1 1 0 011-1zm-3.293 1.293a1 1 0 011.414 0L10 6.586l2.293-2.293a1 1 0 111.414 1.414L11.414 8l2.293 2.293a1 1 0 01-1.414 1.414L10 9.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 8 6.293 5.707a1 1 0 010-1.414zM10 13a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
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
          <div className="min-w-0 flex-1">
            <div className="w-full max-w-full overflow-hidden">
              <h4 className="truncate text-sm font-medium text-foreground flex items-center gap-2">
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
