import MapView from "@/components/maps/abstraction/map-view";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-route-sidebar";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { UnassignedOrderList } from "@/components/delivery-route/unassigned-order-list";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import type { Order } from "@/types/order";

export default function DeliveryMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const {
    addOrderToDelivery,
    unassignedOrders,
    deliveryOrders,
    deliveries,
    currentDelivery,
    setCurrentDelivery,
    refreshUnassignedOrders,
    refreshDeliveryOrders,
  } = useDeliveryRoute();

  // Local state to track reordered orders for the map
  const [displayedOrders, setDisplayedOrders] =
    useState<Order[]>(deliveryOrders);

  const totalOrdersCount = displayedOrders.length + unassignedOrders.length;

  useEffect(() => {
    void refreshDeliveryOrders(deliveryId);
    void refreshUnassignedOrders();
  }, [deliveryId, refreshDeliveryOrders, refreshUnassignedOrders]);

  // Keep context currentDelivery in sync with the route param when present
  useEffect(() => {
    if (!deliveryId) return;
    const match = deliveries.find((d) => d.id === deliveryId);
    if (match && match.id !== currentDelivery?.id) {
      setCurrentDelivery(match);
    }
  }, [deliveryId, deliveries, currentDelivery, setCurrentDelivery]);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    void refreshDeliveryOrders(deliveryId);
    void refreshUnassignedOrders();
  };

  // Update displayed orders when context orders change (initial load or API refresh)
  useEffect(() => {
    setDisplayedOrders(deliveryOrders);
  }, [deliveryOrders]);

  // Update delivery orders when an order is removed or added
  const handleDeliveryOrdersUpdated = (updatedOrders?: Order[]) => {
    if (updatedOrders) {
      // Update the displayed orders with the reordered sequence
      setDisplayedOrders(updatedOrders);
    }
    void refreshUnassignedOrders();
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SidebarProvider>
        <main className="h-screen w-screen overflow-hidden relative flex">
          {/* Map layer at the bottom */}
          <div className="absolute inset-0 z-0">
            <MapView
              orders={displayedOrders}
              unassignedOrders={unassignedOrders}
              onOrderAddedToDelivery={async () => {
                await refreshDeliveryOrders(deliveryId);
                handleDeliveryOrdersUpdated();
              }}
              onRefreshRequested={handleOrderRemoved}
            />
          </div>
          {/* UI overlays above the map, pointer-events-none except sidebar */}
          <div className="relative w-full flex justify-end items-start z-10 pointer-events-none">
            <div className="pointer-events-auto flex gap-2">
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  Unassigned ({unassignedOrders.length})
                </Button>
              </DrawerTrigger>
              <SidebarTrigger />
            </div>
          </div>
          {/* Total orders count display - positioned at top left, moved right to avoid zoom buttons */}
          <div className="absolute top-4 left-16 z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <OrdersCountDisplay count={totalOrdersCount} />
            </div>
          </div>
          <div className="pointer-events-auto">
            <DeliverySidebar
              onOrderRemoved={handleOrderRemoved}
              onDeliveryOrdersUpdated={handleDeliveryOrdersUpdated}
              deliveryOrders={displayedOrders}
              onAddOrderToDelivery={async (orderId: string) => {
                try {
                  // Use the delivery context's addOrderToDelivery method
                  const targetDeliveryId = deliveryId || currentDelivery?.id;
                  if (!targetDeliveryId) {
                    throw new Error("No delivery selected");
                  }
                  await addOrderToDelivery(targetDeliveryId, orderId);

                  await refreshDeliveryOrders(deliveryId);
                  handleDeliveryOrdersUpdated();
                } catch (error) {
                  console.error("Failed to add order to delivery:", error);
                  alert("Failed to add order to delivery");
                }
              }}
            />
          </div>
        </main>
      </SidebarProvider>

      <DrawerContent side="bottom">
        <div className="w-full flex flex-col max-h-[60vh] overflow-hidden">
          <DrawerHeader>
            <DrawerTitle>Unassigned Orders</DrawerTitle>
            <DrawerDescription>
              {unassignedOrders.length} order
              {unassignedOrders.length !== 1 ? "s" : ""} waiting to be assigned
              to a delivery route
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {unassignedOrders.length > 0 ? (
              <UnassignedOrderList
                unassignedOrders={unassignedOrders}
                onAddToDelivery={async (orderId: string) => {
                  try {
                    const targetDeliveryId = deliveryId || currentDelivery?.id;
                    if (!targetDeliveryId) {
                      throw new Error("No delivery selected");
                    }
                    await addOrderToDelivery(targetDeliveryId, orderId);
                    await refreshDeliveryOrders(deliveryId);
                    handleDeliveryOrdersUpdated();
                  } catch (error) {
                    console.error("Failed to add order to delivery:", error);
                    alert("Failed to add order to delivery");
                  }
                }}
                title=""
                highlightedOrderId={highlightedOrderId}
                setHighlightedOrderId={setHighlightedOrderId}
              />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                All orders are assigned! 🎉
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
