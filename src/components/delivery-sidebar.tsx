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
import { UnassignedOrderList } from "@/components/delivery/unassigned-order-list";
import { OrdersApi } from "@/services/ordersApi";
import { applyPendingOrderUpdates } from "@/lib/local-storage-utils";

interface DeliverySidebarProps {
  onOrderRemoved?: () => void;
  onDeliveryOrdersUpdated?: (updatedOrders: Order[]) => void;
  unassignedOrders?: Order[];
  onAddOrderToDelivery?: (orderId: string) => void;
}

const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  onOrderRemoved,
  onDeliveryOrdersUpdated,
  unassignedOrders = [],
  onAddOrderToDelivery,
}) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const { currentDelivery, removeOrderFromDelivery } = useDelivery();
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(true);
  const [isUnassignedCollapsed, setIsUnassignedCollapsed] = useState(false); // expanded by default

  // Handle delivery expand/collapse state change
  const handleDeliveryExpandChange = (expanded: boolean) => {
    setIsDeliveryExpanded(expanded);
    // If delivery is being expanded, close unassigned
    if (expanded) {
      setIsUnassignedCollapsed(true);
    }
  };

  // Handle unassigned collapsible state change
  const handleUnassignedCollapseChange = (open: boolean) => {
    setIsUnassignedCollapsed(!open);
    // If unassigned is being opened, expand delivery
    if (open) {
      setIsDeliveryExpanded(true);
    }
  };

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

        // Apply pending optimistic updates
        const ordersWithPendingUpdates = applyPendingOrderUpdates(allOrders);

        const ordersInDelivery = ordersWithPendingUpdates.filter(
          (order) => order.deliveryId === currentDelivery.id
        );
        console.log("Orders in delivery:", ordersInDelivery);
        console.log("Orders in delivery count:", ordersInDelivery.length);
        console.log("All orders count:", allOrders.length);

        // Debug: Check if any order IDs match
        const matchingIds = ordersWithPendingUpdates
          .filter((order) => order.deliveryId === currentDelivery.id)
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

  const handleAddOrderToDelivery = async (orderId: string) => {
    console.log("handleAddOrderToDelivery called with orderId:", orderId);
    // Optimistic update
    const orderToAdd = unassignedOrders.find((order) => order.id === orderId);
    console.log("orderToAdd:", orderToAdd);
    console.log("currentDelivery:", currentDelivery);

    if (orderToAdd && currentDelivery) {
      // Add the order with the correct deliveryId set
      const orderWithDeliveryId = {
        ...orderToAdd,
        deliveryId: currentDelivery.id,
      };
      console.log("Adding order optimistically:", orderWithDeliveryId);
      setDeliveryOrders((prev) => {
        const newOrders = [...prev, orderWithDeliveryId];
        console.log("Updated delivery orders count:", newOrders.length);
        return newOrders;
      });
    } else if (orderToAdd && !currentDelivery) {
      console.log(
        "currentDelivery not available yet, will rely on DeliveryProvider update"
      );
    }

    await onAddOrderToDelivery?.(orderId);
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
      className="bg-background/95 backdrop-blur-sm text-foreground shadow-2xl relative z-20 flex flex-col h-screen pointer-events-auto w-96 transition-all duration-300"
    >
      {/* Distinctive Header with Brand Accent */}
      <SidebarHeader className="px-6 py-5 border-b-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/10"></div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-5 bg-primary text-primary-foreground rounded-sm flex items-center justify-center shadow-s">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground tracking-wide">
              Profi-Stahl
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
      </SidebarHeader>

      {/* Content Area with Clear Separation */}
      <SidebarContent className="flex-1 overflow-hidden bg-background border-t border-border/30">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin mx-auto w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full mb-4"></div>
            <p className="text-sm text-muted-foreground font-medium">
              Loading delivery orders...
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Delivery Orders Section - Always partially visible, can expand to full height */}
            <div
              className={`flex flex-col bg-background rounded-2sm shadow-sm border border-border/50 overflow-hidden m-4 max-w-full ${
                isDeliveryExpanded
                  ? isUnassignedCollapsed
                    ? "flex-1"
                    : "h-[67%] min-h-[300px]"
                  : "h-1/2 min-h-50"
              }`}
            >
              <button
                onClick={() => handleDeliveryExpandChange(!isDeliveryExpanded)}
                className="max-w-full flex items-center justify-between px-6 py-5 border-b border-border/50 bg-primary/5 hover:bg-primary/10 text-left transition-colors"
                aria-label={
                  isDeliveryExpanded
                    ? "Collapse delivery orders"
                    : "Expand delivery orders"
                }
              >
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11l3-3m-3 3l-3-3m3 3v-6"
                    />
                  </svg>
                  {deliveryOrders.length} orders assigned to this delivery
                </span>
                <span className="ml-2 text-muted-foreground">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={
                        isDeliveryExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"
                      }
                    />
                  </svg>
                </span>
              </button>
              <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
                <div className="max-w-full">
                  <div className="max-w-full overflow-hidden">
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
              </div>
            </div>

            {/* Unassigned Orders Section - Always at bottom, full height when expanded */}
            {isUnassignedCollapsed ? (
              unassignedOrders.length > 0 && (
                <button
                  onClick={() => handleUnassignedCollapseChange(true)}
                  className="max-w-full flex items-center justify-between px-4 py-3 rounded-2sm shadow-sm border border-border/50 bg-background hover:bg-accent/10 transition-colors mx-4 mb-4"
                  aria-expanded={false}
                  aria-controls="unassigned-orders-section"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unassigned ({unassignedOrders.length})
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19V5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12l7-7 7 7"
                      />
                    </svg>
                  </span>
                </button>
              )
            ) : (
              <div className="flex flex-col bg-background rounded-2sm shadow-sm border border-border/50 overflow-hidden mx-4 mb-4 max-w-full h-[33%] min-h-[200px]">
                <button
                  onClick={() => handleUnassignedCollapseChange(false)}
                  className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-transparent text-left hover:bg-accent/10 transition-colors"
                  aria-label="Collapse unassigned orders"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unassigned ({unassignedOrders.length})
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </span>
                </button>
                <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
                  <div className="max-w-full">
                    <div className="max-w-full overflow-hidden">
                      <UnassignedOrderList
                        unassignedOrders={unassignedOrders}
                        onAddToDelivery={handleAddOrderToDelivery}
                        title=""
                        highlightedOrderId={highlightedOrderId}
                        setHighlightedOrderId={setHighlightedOrderId}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </SidebarContent>

      {/* Modern Footer */}
      <SidebarFooter className="text-xs text-muted-foreground px-6 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            © {new Date().getFullYear()} Delivery Manager
          </span>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
