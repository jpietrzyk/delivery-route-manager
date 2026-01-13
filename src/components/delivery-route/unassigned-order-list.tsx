import React from "react";
import type { Order } from "@/types/order";
import { pl } from "@/lib/translations";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { createExpandedTooltipContent } from "./order-tooltip-utils";

interface UnassignedOrderListProps {
  unassignedOrders: Order[];
  onAddToDelivery: (orderId: string) => void;
  title?: string;
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (orderId: string | null) => void;
}

export const UnassignedOrderList: React.FC<UnassignedOrderListProps> = ({
  unassignedOrders,
  onAddToDelivery,
  title = pl.availableUnassignedOrders,
  highlightedOrderId,
  setHighlightedOrderId,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="px-4 py-2">
      <div className="font-semibold text-sm mb-2 text-foreground/70">
        {title}
      </div>
      <div>
        {unassignedOrders.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {pl.noUnassignedOrders}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext
              items={unassignedOrders}
              strategy={verticalListSortingStrategy}
            >
              <ul className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2">
                {unassignedOrders.map((order) => (
                  <li key={order.id} className="h-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={`relative w-full aspect-[3/1] rounded border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer flex items-center justify-center ${
                            highlightedOrderId === order.id
                              ? "ring-1 ring-blue-400 bg-blue-50/50 border-blue-200"
                              : ""
                          }`}
                          onClick={() => onAddToDelivery(order.id)}
                          onMouseEnter={() => setHighlightedOrderId?.(order.id)}
                          onMouseLeave={() => setHighlightedOrderId?.(null)}
                          aria-label={`Add order ${order.id} to delivery`}
                        >
                          {/* Marker icon (map pin) */}
                          <svg
                            className="h-5 w-5 text-blue-600 opacity-80"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10zm0-7a3 3 0 100-6 3 3 0 000 6z"
                            />
                          </svg>
                        </button>
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
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
