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
import { DeliveryOrderList } from "@/components/delivery/delivery-order-list";
import { PoolOrderList } from "@/components/delivery/pool-order-list";
import { OrdersApi } from "@/services/ordersApi";

interface DeliverySidebarProps {
  onOrderRemoved?: () => void;
  onDeliveryOrdersUpdated?: (updatedOrders: Order[]) => void;
  poolOrders?: Order[];
  onAddOrderToDelivery?: (orderId: string) => void;
  refreshTrigger?: number;
}

const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  onOrderRemoved,
  onDeliveryOrdersUpdated,
  poolOrders = [],
  onAddOrderToDelivery,
  refreshTrigger = 0,
}) => {
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
        console.log("Orders in delivery count:", ordersInDelivery.length);
        console.log("All orders count:", allOrders.length);

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
  }, [currentDelivery, refreshTrigger]);

  const handleRemoveOrder = async (orderId: string) => {
    if (!currentDelivery) {
      console.warn("No current delivery selected");
      return;
    }

    try {
      // Optimistic UI update - remove immediately for better UX
      const updatedOrders = deliveryOrders.filter(
        (order) => order.id !== orderId
      );
      setDeliveryOrders(updatedOrders);

      // Perform API call in background
      await removeOrderFromDelivery(currentDelivery.id, orderId);

      console.log(`Successfully removed order ${orderId} from delivery`);
      onOrderRemoved?.();
      onDeliveryOrdersUpdated?.(updatedOrders);
    } catch (error) {
      console.error("Failed to remove order:", error);
      // TODO: Revert optimistic update on error (would need to refetch or cache previous state)
    }
  };

  const handleReorder = (newOrders: Order[]) => {
    // Update the local state with the new order
    setDeliveryOrders(newOrders);

    // Call the callback to notify parent components about the update
    onDeliveryOrdersUpdated?.(newOrders);
  };

  return (
    <Sidebar
      side="right"
      className="border-l bg-background text-foreground shadow-xl relative z-20 flex flex-col h-screen pointer-events-auto w-96 transition-all duration-300"
    >
      {/* Enhanced Header with Gradient */}
      <SidebarHeader className="font-bold text-xl px-6 py-4 border-b bg-linear-to-r from-primary to-primary/90 text-primary-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <span>
              {currentDelivery
                ? `Route ${currentDelivery.name}`
                : "Route D-001"}
            </span>
          </div>
          <div className="bg-primary-foreground/30 text-primary-foreground text-xs px-2 py-1 rounded-full">
            {deliveryOrders.length} orders
          </div>
        </div>
      </SidebarHeader>

      {/* Enhanced Content with Better Spacing and Typography */}
      <SidebarContent className="flex-1 overflow-y-auto bg-muted/50">
        {isLoading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin mx-auto w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* Delivery Orders Section */}
            <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Assigned Orders
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {deliveryOrders.length} orders in this delivery
                </p>
              </div>
              <div className="p-1">
                <DeliveryOrderList
                  orders={deliveryOrders}
                  highlightedOrderId={highlightedOrderId}
                  setHighlightedOrderId={setHighlightedOrderId}
                  onRemoveOrder={handleRemoveOrder}
                  onReorder={handleReorder}
                  title=""
                />
              </div>
            </div>

            {/* Pool Orders Section */}
            {poolOrders.length > 0 && (
              <div className="bg-background rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Available Pool Orders
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {poolOrders.length} orders available to assign
                  </p>
                </div>
                <div className="p-1">
                  <PoolOrderList
                    poolOrders={poolOrders}
                    onAddToDelivery={onAddOrderToDelivery || (() => {})}
                    title=""
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </SidebarContent>

      {/* Enhanced Footer */}
      <SidebarFooter className="text-xs text-muted-foreground px-6 py-4 border-t bg-background">
        <div className="flex items-center justify-between">
          <span>© {new Date().getFullYear()} Delivery Manager</span>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
