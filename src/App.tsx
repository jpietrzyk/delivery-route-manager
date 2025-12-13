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
        <div className="absolute top-4 right-80 z-9999">
          <SidebarTrigger />
        </div>
        <div className="flex-1 h-full">
          <LeafletMap orders={orders} />
        </div>
        <DeliverySidebar orders={orders.filter((order) => order.deliveryId)} />
      </main>
    </SidebarProvider>
  );
}

export default App;
