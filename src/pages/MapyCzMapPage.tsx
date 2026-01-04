import MapyMapView from "@/components/maps/abstraction/mapy-map-view";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-route-sidebar";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import type { Order } from "@/types/order";

export default function MapyCzMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
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
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <MapyMapView
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
          <div className="pointer-events-auto">
            <DeliverySidebar
              onOrderRemoved={handleOrderRemoved}
              onDeliveryOrdersUpdated={handleDeliveryOrdersUpdated}
              deliveryOrders={displayedOrders}
              unassignedOrders={unassignedOrders}
              onAddOrderToDelivery={async (orderId: string) => {
                try {
                  // Use the delivery context's addOrderToDelivery method
                  const targetDeliveryId = deliveryId || currentDelivery?.id;
                  if (!targetDeliveryId) {
                    throw new Error("No delivery selected");
                  }
                  await addOrderToDelivery(targetDeliveryId, orderId);

                  void refreshDeliveryOrders(deliveryId);
                  void refreshUnassignedOrders();
                } catch (error) {
                  console.error("Failed to add order to delivery:", error);
                  alert("Failed to add order to delivery");
                }
              }}
            />
          </div>
        </div>

        {/* Orders count display at top center */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <OrdersCountDisplay count={totalOrdersCount} />
        </div>

        {/* Sidebar trigger */}
        <div className="absolute top-6 right-6 z-30 pointer-events-auto">
          <SidebarTrigger className="bg-background border border-border shadow-lg hover:bg-accent" />
        </div>
      </main>
    </SidebarProvider>
  );
}
