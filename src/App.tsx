import LeafletMap from "@/components/leaflet-map";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";

function App() {
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [poolOrders, setPoolOrders] = useState<Order[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    OrdersApi.getOrders().then((fetchedOrders) => {
      // Initialize deliveryOrders with orders that are assigned to a delivery
      const initialDeliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId
      );
      setDeliveryOrders(initialDeliveryOrders);
      // Initialize poolOrders with orders that are NOT assigned to a delivery
      const initialPoolOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setPoolOrders(initialPoolOrders);
    });
  }, []);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    OrdersApi.getOrders().then((fetchedOrders) => {
      const initialDeliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId
      );
      setDeliveryOrders(initialDeliveryOrders);
      const initialPoolOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setPoolOrders(initialPoolOrders);
      // Trigger sidebar refresh
      setRefreshTrigger((prev) => prev + 1);
    });
  };

  // Update delivery orders when an order is removed or added
  const handleDeliveryOrdersUpdated = (updatedOrders: Order[]) => {
    setDeliveryOrders(updatedOrders);
    // When delivery orders are updated, we need to refresh pool orders too
    OrdersApi.getOrders().then((fetchedOrders) => {
      const initialPoolOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setPoolOrders(initialPoolOrders);
    });
  };

  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <LeafletMap
            orders={[...deliveryOrders, ...poolOrders]}
            onOrderAddedToDelivery={async () => {
              // Refresh both delivery and pool orders
              const allOrders = await OrdersApi.getOrders();
              const updatedDeliveryOrders = allOrders.filter(
                (order) => order.deliveryId
              );
              const updatedPoolOrders = allOrders.filter(
                (order) => !order.deliveryId
              );
              setDeliveryOrders(updatedDeliveryOrders);
              setPoolOrders(updatedPoolOrders);
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
            poolOrders={poolOrders}
            refreshTrigger={refreshTrigger}
            onAddOrderToDelivery={async (orderId: string) => {
              try {
                // Update the order to assign it to default delivery
                await OrdersApi.updateOrder(orderId, {
                  deliveryId: "DEL-001", // Default delivery ID
                });
                // Refresh both delivery and pool orders
                const allOrders = await OrdersApi.getOrders();
                const updatedDeliveryOrders = allOrders.filter(
                  (order) => order.deliveryId
                );
                const updatedPoolOrders = allOrders.filter(
                  (order) => !order.deliveryId
                );
                setDeliveryOrders(updatedDeliveryOrders);
                setPoolOrders(updatedPoolOrders);
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

export default App;
