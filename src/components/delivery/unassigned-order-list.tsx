import React from "react";
import type { Order } from "@/types/order";
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
            <ul className="space-y-2">
              {unassignedOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded border p-2 bg-accent/40 cursor-pointer hover:bg-accent/60 transition-colors"
                  onClick={() => onAddToDelivery(order.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground">
                        {order.product?.name || `Order ${order.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer}
                      </div>
                      <div className="text-xs text-muted-foreground/80">
                        Status: {order.status}
                      </div>
                      <div className="text-xs text-muted-foreground/80 mt-1">
                        Location: ({order.location.lat.toFixed(4)},{" "}
                        {order.location.lng.toFixed(4)})
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToDelivery(order.id);
                      }}
                      className="shrink-0 mt-0.5 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      + Add
                    </button>
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
