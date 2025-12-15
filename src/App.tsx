import LeafletMap from "@/components/leaflet-map";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";

function App() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    OrdersApi.getOrders().then(setOrders);
  }, []);

  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <LeafletMap orders={orders} />
        </div>
        {/* UI overlays above the map, pointer-events-none except sidebar */}
        <div className="relative w-full flex justify-end items-start z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <SidebarTrigger />
          </div>
        </div>
        <div className="pointer-events-auto">
          <DeliverySidebar
            orders={orders.filter((order) => order.deliveryId)}
          />
        </div>
      </main>
    </SidebarProvider>
  );
}

export default App;
