import React from "react";
import type { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface UnassignedOrderListProps {
  unassignedOrders: Order[];
  onAddToDelivery: (orderId: string) => void;
  title?: string;
}

export const UnassignedOrderList: React.FC<UnassignedOrderListProps> = ({
  unassignedOrders,
  onAddToDelivery,
  title = "Available Unassigned Orders",
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
      {unassignedOrders.length === 0 ? (
        <div className="text-xs text-muted-foreground">
          No unassigned orders available
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter}>
          <SortableContext
            items={unassignedOrders}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1">
              {unassignedOrders.map((order) => (
                <li
                  key={order.id}
                  className="group relative overflow-hidden rounded border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer p-2"
                  onClick={() => onAddToDelivery(order.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-medium text-foreground">
                          {order.product?.name || `Order ${order.id}`}
                        </h4>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToDelivery(order.id);
                      }}
                      size="icon"
                      className="shrink-0 h-6 w-6 p-1 bg-primary hover:bg-primary/90"
                      aria-label={`Add order ${order.id} to delivery`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
