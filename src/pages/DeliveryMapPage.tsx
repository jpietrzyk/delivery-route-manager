import MapView from "@/components/maps/abstraction/map-view";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDelivery } from "@/hooks/use-delivery";

export default function DeliveryMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const {
    addOrderToDelivery,
    unassignedOrders,
    deliveryOrders,
    refreshUnassignedOrders,
    refreshDeliveryOrders,
  } = useDelivery();

  const totalOrdersCount = deliveryOrders.length + unassignedOrders.length;

  useEffect(() => {
    void refreshDeliveryOrders(deliveryId);
    void refreshUnassignedOrders();
  }, [deliveryId, refreshDeliveryOrders, refreshUnassignedOrders]);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    void refreshDeliveryOrders(deliveryId);
    void refreshUnassignedOrders();
  };

  // Update delivery orders when an order is removed or added
  const handleDeliveryOrdersUpdated = () => {
    void refreshUnassignedOrders();
  };

  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <MapView
            orders={deliveryOrders}
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
            deliveryOrders={deliveryOrders}
            unassignedOrders={unassignedOrders}
            onAddOrderToDelivery={async (orderId: string) => {
              try {
                // Use the delivery context's addOrderToDelivery method
                const targetDeliveryId = deliveryId || "DEL-001";
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
  );
}
