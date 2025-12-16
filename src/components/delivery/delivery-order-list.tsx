import React from "react";
import type { Order } from "@/types/order";
import { DeliveryOrderItem } from "@/components/delivery/delivery-order-item";
import { DeliveryDriveSegment } from "@/components/delivery/delivery-drive-segment";
import {
  getDistanceKm,
  getDriveMinutes,
  getHandlingMinutes,
} from "@/lib/delivery-time-utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DeliveryOrderListProps {
  orders: Order[];
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (id: string | null) => void;
  onRemoveOrder?: (orderId: string) => void;
  title?: string;
  onReorder?: (newOrders: Order[]) => void;
}

export const DeliveryOrderList: React.FC<DeliveryOrderListProps> = ({
  orders,
  highlightedOrderId,
  setHighlightedOrderId,
  onRemoveOrder,
  title = "Zamówienia",
  onReorder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = orders.findIndex((order) => order.id === active.id);
      const newIndex = orders.findIndex((order) => order.id === over.id);
      const newOrders = arrayMove(orders, oldIndex, newIndex);
      onReorder?.(newOrders);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orders} strategy={verticalListSortingStrategy}>
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-foreground/70">
            {title}
          </div>
          {orders.length === 0 ? (
            <div className="text-xs text-muted-foreground">Brak zamówień</div>
          ) : (
            <ul className="space-y-2">
              {orders.map((order, idx) => (
                <React.Fragment key={order.id}>
                  <DeliveryOrderItem
                    id={order.id}
                    order={order}
                    isHighlighted={highlightedOrderId === order.id}
                    onMouseEnter={() => setHighlightedOrderId?.(order.id)}
                    onMouseLeave={() => setHighlightedOrderId?.(null)}
                    onRemove={onRemoveOrder}
                  />
                  {idx < orders.length - 1 && (
                    <DeliveryDriveSegment
                      fromOrderId={order.id}
                      toOrderId={orders[idx + 1].id}
                      driveMinutes={getDriveMinutes(
                        getDistanceKm(order.location, orders[idx + 1].location)
                      )}
                      handlingMinutes={getHandlingMinutes(
                        orders[idx + 1].product?.complexity ?? 1
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};
