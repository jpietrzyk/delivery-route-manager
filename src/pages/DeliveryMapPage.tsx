import LeafletMap from "@/components/maps/leaflet/leaflet-map";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import { useParams } from "react-router-dom";

export default function DeliveryMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    OrdersApi.getOrders().then((fetchedOrders) => {
      // Filter orders for the specific delivery or all deliveries if no deliveryId
      const deliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId === deliveryId || !deliveryId
      );
      setDeliveryOrders(deliveryOrders);

      // Get unassigned orders
      const initialUnassignedOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setUnassignedOrders(initialUnassignedOrders);
    });
  }, [deliveryId]);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    OrdersApi.getOrders().then((fetchedOrders) => {
      const deliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId === deliveryId || !deliveryId
      );
      setDeliveryOrders(deliveryOrders);
      const initialUnassignedOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setUnassignedOrders(initialUnassignedOrders);
      // Trigger sidebar refresh
      setRefreshTrigger((prev) => prev + 1);
    });
  };

  // Update delivery orders when an order is removed or added
  const handleDeliveryOrdersUpdated = (updatedOrders: Order[]) => {
    setDeliveryOrders(updatedOrders);
    // When delivery orders are updated, we need to refresh unassigned orders too
    OrdersApi.getOrders().then((fetchedOrders) => {
      const initialUnassignedOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setUnassignedOrders(initialUnassignedOrders);
    });
  };

  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <LeafletMap
            orders={[...deliveryOrders, ...unassignedOrders]}
            onOrderAddedToDelivery={async () => {
              // Refresh both delivery and unassigned orders
              const allOrders = await OrdersApi.getOrders();
              const updatedDeliveryOrders = allOrders.filter(
                (order) => order.deliveryId === deliveryId || !deliveryId
              );
              const updatedUnassignedOrders = allOrders.filter(
                (order) => !order.deliveryId
              );
              setDeliveryOrders(updatedDeliveryOrders);
              setUnassignedOrders(updatedUnassignedOrders);
              handleDeliveryOrdersUpdated(updatedDeliveryOrders);
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
        <div className="pointer-events-auto">
          <DeliverySidebar
            onOrderRemoved={handleOrderRemoved}
            onDeliveryOrdersUpdated={handleDeliveryOrdersUpdated}
            unassignedOrders={unassignedOrders}
            refreshTrigger={refreshTrigger}
            onAddOrderToDelivery={async (orderId: string) => {
              try {
                // Update the order to assign it to the current delivery or default
                const targetDeliveryId = deliveryId || "DEL-001";
                await OrdersApi.updateOrder(orderId, {
                  deliveryId: targetDeliveryId,
                });
                // Refresh both delivery and unassigned orders
                const allOrders = await OrdersApi.getOrders();
                const updatedDeliveryOrders = allOrders.filter(
                  (order) => order.deliveryId === deliveryId || !deliveryId
                );
                const updatedUnassignedOrders = allOrders.filter(
                  (order) => !order.deliveryId
                );
                setDeliveryOrders(updatedDeliveryOrders);
                setUnassignedOrders(updatedUnassignedOrders);
                handleDeliveryOrdersUpdated(updatedDeliveryOrders);
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
