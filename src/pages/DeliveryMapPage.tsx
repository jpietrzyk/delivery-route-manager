import MapView from "@/components/maps/abstraction/map-view";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import { useParams } from "react-router-dom";
import { useDelivery } from "@/hooks/use-delivery";

export default function DeliveryMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const { addOrderToDelivery } = useDelivery();
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);

  useEffect(() => {
    console.log("DeliveryMapPage: Fetching orders for deliveryId:", deliveryId);
    OrdersApi.getOrders().then((fetchedOrders) => {
      console.log("DeliveryMapPage: Fetched orders:", fetchedOrders.length);
      // Filter orders for the specific delivery
      const deliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId === deliveryId
      );
      console.log("DeliveryMapPage: Delivery orders:", deliveryOrders.length);
      setDeliveryOrders(deliveryOrders);

      // Get unassigned orders
      const initialUnassignedOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      console.log(
        "DeliveryMapPage: Unassigned orders:",
        initialUnassignedOrders.length
      );
      setUnassignedOrders(initialUnassignedOrders);

      // Calculate total orders count (both assigned and unassigned)
      setTotalOrdersCount(fetchedOrders.length);
    });
  }, [deliveryId]);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    OrdersApi.getOrders().then((fetchedOrders) => {
      const deliveryOrders = fetchedOrders.filter(
        (order) => order.deliveryId === deliveryId
      );
      setDeliveryOrders(deliveryOrders);
      const initialUnassignedOrders = fetchedOrders.filter(
        (order) => !order.deliveryId
      );
      setUnassignedOrders(initialUnassignedOrders);
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
          <MapView
            orders={deliveryOrders}
            unassignedOrders={unassignedOrders}
            onOrderAddedToDelivery={async () => {
              // Refresh both delivery and unassigned orders
              const allOrders = await OrdersApi.getOrders();
              const updatedDeliveryOrders = allOrders.filter(
                (order) => order.deliveryId === deliveryId
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
            unassignedOrders={unassignedOrders}
            onAddOrderToDelivery={async (orderId: string) => {
              try {
                // Use the delivery context's addOrderToDelivery method
                const targetDeliveryId = deliveryId || "DEL-001";
                await addOrderToDelivery(targetDeliveryId, orderId);

                // Refresh local state to match the updated context
                const allOrders = await OrdersApi.getOrders();
                const updatedDeliveryOrders = allOrders.filter(
                  (order) => order.deliveryId === deliveryId
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
