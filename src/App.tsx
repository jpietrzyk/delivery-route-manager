import LeafletMap from "@/components/leaflet-map";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);

  useEffect(() => {
    OrdersApi.getOrders().then((fetchedOrders) => {
      setOrders(fetchedOrders);
      // Initialize deliveryOrders with orders that are assigned to a delivery
      const initialDeliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId
      );
      setDeliveryOrders(initialDeliveryOrders);
    });
  }, []);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    OrdersApi.getOrders().then(setOrders);
  };

  // Update delivery orders when an order is removed
  const handleDeliveryOrdersUpdated = (updatedOrders: Order[]) => {
    setDeliveryOrders(updatedOrders);
  };

  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <LeafletMap orders={deliveryOrders} />
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
          />
        </div>
      </main>
    </SidebarProvider>
  );
}

export default App;
