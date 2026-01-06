import React, { useEffect } from "react";
import type { Order } from "@/types/order";
import { DeliveryOrderItem } from "@/components/delivery-route/delivery-order-item";
import { DeliveryRouteSegment } from "@/components/delivery-route/delivery-route-segment";
import { pl } from "@/lib/translations";
import {
  getDistanceKm,
  getDriveMinutes,
} from "@/lib/delivery-route-time-utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { RouteManager } from "@/services/RouteManager";
import { useRouteSegments } from "@/hooks/use-route-segments";

interface DeliveryOrderListProps {
  orders: Order[];
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (id: string | null) => void;
  onRemoveOrder?: (orderId: string) => void;
  title?: string;
  onReorder?: (newOrders: Order[]) => void;
  routeManager?: RouteManager | null;
}

export const DeliveryOrderList: React.FC<DeliveryOrderListProps> = ({
  orders,
  highlightedOrderId,
  setHighlightedOrderId,
  onRemoveOrder,
  title = pl.orders,
  onReorder,
  routeManager,
}) => {
  const { routeSegments } = useRouteSegments();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active?.id !== over?.id) {
      const oldIndex = orders.findIndex(
        (order) => order.id === String(active?.id)
      );
      const newIndex = orders.findIndex(
        (order) => order.id === String(over?.id)
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrders = arrayMove(orders, oldIndex, newIndex);
        onReorder?.(newOrders);
      }
    }
  };

  // Manage route segments when orders change
  useEffect(() => {
    if (!routeManager || orders.length < 2) {
      return;
    }

    // Update all segments for consecutive orders
    for (let i = 0; i < orders.length - 1; i++) {
      routeManager.upsertSegment(orders[i], orders[i + 1]);
    }

    // Remove segments that no longer exist
    const currentSegmentIds = new Set<string>();
    for (let i = 0; i < orders.length - 1; i++) {
      currentSegmentIds.add(`${orders[i].id}-${orders[i + 1].id}`);
    }

    // Remove obsolete segments
    routeManager.getAllSegments().forEach((segment) => {
      if (!currentSegmentIds.has(segment.id)) {
        routeManager.removeSegment(segment.id);
      }
    });
  }, [orders, routeManager]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orders} strategy={verticalListSortingStrategy}>
        <div className="p-2">
          {title && (
            <div className="font-semibold text-sm mb-3 text-muted-foreground px-2">
              {title}
            </div>
          )}
          {orders.length === 0 ? (
            <div className="text-xs text-muted-foreground/80 text-center py-4">
              {pl.noOrdersAssignedShort}
            </div>
          ) : (
            <ul className="space-y-2">
              {orders
                .flatMap((order, idx) => [
                  <DeliveryOrderItem
                    key={order.id}
                    id={order.id}
                    order={order}
                    sequence={idx}
                    isHighlighted={highlightedOrderId === order.id}
                    onMouseEnter={() => {
                      setHighlightedOrderId?.(order.id);
                      // Highlight both previous and next route segments
                      if (routeManager) {
                        // Highlight next segment (current order to next order)
                        if (idx < orders.length - 1) {
                          const nextSegmentId = `${order.id}-${
                            orders[idx + 1].id
                          }`;
                          routeManager.highlightSegment(nextSegmentId);
                        }
                        // Highlight previous segment (previous order to current order)
                        if (idx > 0) {
                          const previousSegmentId = `${orders[idx - 1].id}-${
                            order.id
                          }`;
                          routeManager.highlightSegment(previousSegmentId);
                        }
                      }
                    }}
                    onMouseLeave={() => {
                      setHighlightedOrderId?.(null);
                      // Unhighlight both previous and next route segments
                      if (routeManager) {
                        // Unhighlight next segment (current order to next order)
                        if (idx < orders.length - 1) {
                          const nextSegmentId = `${order.id}-${
                            orders[idx + 1].id
                          }`;
                          routeManager.unhighlightSegment(nextSegmentId);
                        }
                        // Unhighlight previous segment (previous order to current order)
                        if (idx > 0) {
                          const previousSegmentId = `${orders[idx - 1].id}-${
                            order.id
                          }`;
                          routeManager.unhighlightSegment(previousSegmentId);
                        }
                      }
                    }}
                    onRemove={onRemoveOrder}
                  />,
                  idx < orders.length - 1 && routeManager && (
                    <DeliveryRouteSegment
                      key={`${order.id}-${orders[idx + 1].id}-segment`}
                      segment={
                        routeManager.getSegment(
                          `${order.id}-${orders[idx + 1].id}`
                        ) || {
                          id: `${order.id}-${orders[idx + 1].id}`,
                          fromOrder: order,
                          toOrder: orders[idx + 1],
                          status: "idle",
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        }
                      }
                      onRecalculate={() =>
                        routeManager.recalculateSegment(
                          `${order.id}-${orders[idx + 1].id}`
                        )
                      }
                      isCalculating={routeManager.isCalculating(
                        `${order.id}-${orders[idx + 1].id}`
                      )}
                      routeManager={routeManager}
                    />
                  ),
                  idx < orders.length - 1 &&
                    !routeManager &&
                    (() => {
                      const segmentId = `${order.id}-${orders[idx + 1].id}`;
                      const routeSegment = routeSegments.find(
                        (seg) => seg.id === segmentId
                      );

                      return (
                        <DeliveryRouteSegment
                          key={segmentId}
                          segment={{
                            id: segmentId,
                            fromOrder: order,
                            toOrder: orders[idx + 1],
                            routeData: routeSegment
                              ? {
                                  polyline: [],
                                  distance: routeSegment.distance,
                                  duration: routeSegment.duration,
                                  status: "calculated",
                                }
                              : {
                                  polyline: [],
                                  distance:
                                    getDistanceKm(
                                      order.location,
                                      orders[idx + 1].location
                                    ) * 1000,
                                  duration:
                                    getDriveMinutes(
                                      getDistanceKm(
                                        order.location,
                                        orders[idx + 1].location
                                      )
                                    ) * 60,
                                  status: "calculated",
                                },
                            status: "calculated",
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          }}
                        />
                      );
                    })(),
                ])
                .filter(Boolean)}
            </ul>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
};
