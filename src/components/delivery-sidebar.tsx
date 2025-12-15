import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useDelivery } from "@/hooks/use-delivery";
import { useEffect, useState } from "react";

import type { Order } from "@/types/order";
import { DeliveryOrderList } from "./delivery-order-list";
import { OrdersApi } from "@/services/ordersApi";

const DeliverySidebar = () => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const { currentDelivery, removeOrderFromDelivery } = useDelivery();
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("DeliverySidebar: currentDelivery", currentDelivery);

  // Sync delivery orders with current delivery and all orders
  useEffect(() => {
    const updateDeliveryOrders = async () => {
      console.log("Updating delivery orders...");
      setIsLoading(true);

      if (!currentDelivery) {
        console.log("No current delivery");
        setDeliveryOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Current delivery orders:", currentDelivery.orders);
        // Get all orders and filter to only those in current delivery
        const allOrders = await OrdersApi.getOrders();
        console.log("All orders:", allOrders);
        console.log(
          "All order IDs:",
          allOrders.map((o) => o.id)
        );
        const currentDeliveryOrderIds = currentDelivery.orders.map(
          (deliveryOrder) => deliveryOrder.orderId
        );
        console.log("Current delivery order IDs:", currentDeliveryOrderIds);
        const ordersInDelivery = allOrders.filter((order) =>
          currentDeliveryOrderIds.includes(order.id)
        );
        console.log("Orders in delivery:", ordersInDelivery);

        // Debug: Check if any order IDs match
        const matchingIds = allOrders
          .filter((order) => currentDeliveryOrderIds.includes(order.id))
          .map((o) => o.id);
        console.log("Matching order IDs:", matchingIds);
        setDeliveryOrders(ordersInDelivery);
      } catch (error) {
        console.error("Error updating delivery orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    updateDeliveryOrders();
  }, [currentDelivery]);

  const handleRemoveOrder = async (orderId: string) => {
    if (!currentDelivery) {
      console.warn("No current delivery selected");
      return;
    }

    try {
      await removeOrderFromDelivery(currentDelivery.id, orderId);
      // After removal, update the local state to reflect the change
      const updatedOrders = deliveryOrders.filter(
        (order) => order.id !== orderId
      );
      setDeliveryOrders(updatedOrders);
    } catch (error) {
      console.error("Failed to remove order:", error);
    }
  };

  return (
    <Sidebar
      side="right"
      className="border-l bg-sidebar text-sidebar-foreground shadow-lg relative z-20 flex flex-col h-screen pointer-events-auto"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        {currentDelivery ? `Trasa ${currentDelivery.name}` : "Trasa D-001"}
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-2 text-xs text-muted-foreground">
            Ładowanie zamówień...
          </div>
        ) : (
          <DeliveryOrderList
            orders={deliveryOrders}
            highlightedOrderId={highlightedOrderId}
            setHighlightedOrderId={setHighlightedOrderId}
            onRemoveOrder={handleRemoveOrder}
            title="Zamówienia przypisane do dostawy"
          />
        )}
      </SidebarContent>
      <SidebarFooter className="text-xs text-muted-foreground px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
