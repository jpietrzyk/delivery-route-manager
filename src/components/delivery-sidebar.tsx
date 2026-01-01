import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { useDelivery } from "@/hooks/use-delivery";
import { useEffect, useState } from "react";
import { Package, Clock, Route } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import type { Order } from "@/types/order";
import { DeliveryOrderList } from "@/components/delivery/delivery-order-list";
import { UnassignedOrderList } from "@/components/delivery/unassigned-order-list";
import { resetLocalStorageAndFetchData } from "@/lib/local-storage-utils";
import {
  calculateTotalEstimatedTime,
  calculateTotalDistance,
  formatDuration,
  formatDistance,
} from "@/lib/delivery-time-calculator";

interface DeliverySidebarProps {
  onOrderRemoved?: () => void;
  onDeliveryOrdersUpdated?: (updatedOrders: Order[]) => void;
  deliveryOrders?: Order[];
  unassignedOrders?: Order[];
  onAddOrderToDelivery?: (orderId: string) => void;
}

const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  onOrderRemoved,
  onDeliveryOrdersUpdated,
  deliveryOrders: deliveryOrdersProp = [],
  unassignedOrders = [],
  onAddOrderToDelivery,
}) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const { currentOrderId, setCurrentOrderId, setPreviousOrderId } =
    useOrderHighlight();
  const { currentDelivery, removeOrderFromDelivery } = useDelivery();
  const [deliveryOrders, setDeliveryOrders] =
    useState<Order[]>(deliveryOrdersProp);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(true);
  const [isUnassignedCollapsed, setIsUnassignedCollapsed] = useState(true); // collapsed by default
  const [totalEstimatedTime, setTotalEstimatedTime] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);

  // Handle delivery expand/collapse state change
  const handleDeliveryExpandChange = (expanded: boolean) => {
    setIsDeliveryExpanded(expanded);
    // If delivery is being expanded, close unassigned
    if (expanded) {
      setIsUnassignedCollapsed(true);
    } else {
      // If delivery is being collapsed, open unassigned
      setIsUnassignedCollapsed(false);
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

  // Auto-expand unassigned list when data arrives (helps tests and UX)
  useEffect(() => {
    if (unassignedOrders.length > 0 && isUnassignedCollapsed) {
      setIsUnassignedCollapsed(false);
      setIsDeliveryExpanded(true);
    }
  }, [unassignedOrders.length, isUnassignedCollapsed]);

  console.log("DeliverySidebar: currentDelivery", currentDelivery);

  // Sync internal state when props change
  useEffect(() => {
    setDeliveryOrders(deliveryOrdersProp);
  }, [deliveryOrdersProp]);

  // Recalculate time and distance when delivery orders sequence changes
  useEffect(() => {
    console.log(
      "DeliverySidebar: Recalculating time and distance for reordered sequence"
    );
    if (deliveryOrders.length === 0) {
      setTotalEstimatedTime(0);
      setTotalDistance(0);
      return;
    }

    const totalTime = calculateTotalEstimatedTime(deliveryOrders);
    const distance = calculateTotalDistance(deliveryOrders);
    setTotalEstimatedTime(totalTime);
    setTotalDistance(distance);

    console.log("DeliverySidebar: Recalculated time:", totalTime, "minutes");
    console.log("DeliverySidebar: Recalculated distance:", distance, "km");
  }, [deliveryOrders]);

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
      <SidebarHeader className="px-6 py-4 border-b-0 bg-card/30">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Route className="w-6 h-6 text-primary" />
          </div>
          {/* Order Highlight Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                console.log(
                  "Next button clicked, deliveryOrders:",
                  deliveryOrders
                );
                console.log("Current currentOrderId:", currentOrderId);
                // Set previous order to current, then set current to next in sequence
                if (deliveryOrders.length > 0) {
                  const currentIndex = deliveryOrders.findIndex(
                    (order) => order.id === currentOrderId
                  );
                  console.log("Current index:", currentIndex);
                  if (
                    currentIndex >= 0 &&
                    currentIndex < deliveryOrders.length - 1
                  ) {
                    console.log(
                      "Setting previous to:",
                      currentOrderId,
                      "and current to:",
                      deliveryOrders[currentIndex + 1].id
                    );
                    setPreviousOrderId(currentOrderId);
                    setCurrentOrderId(deliveryOrders[currentIndex + 1].id);
                  } else if (currentIndex === -1) {
                    // No current order set, set first order as current
                    console.log(
                      "No current order, setting first order:",
                      deliveryOrders[0].id
                    );
                    setCurrentOrderId(deliveryOrders[0].id);
                  }
                }
              }}
              className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
              title="Set Next Order as Current"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                console.log("Clear button clicked");
                // Clear current and previous order highlights
                setCurrentOrderId(null);
                setPreviousOrderId(null);
              }}
              className="p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive"
              title="Clear Highlights"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </SidebarHeader>

      {/* Content Area with Clear Separation */}
      <SidebarContent className="flex-1 overflow-hidden bg-background border-t border-border/30">
        <div className="h-full flex flex-col overflow-hidden">
          {/* Delivery Orders Section - Always partially visible, can expand to full height */}
          <div
            className={`flex flex-col bg-background rounded-2sm shadow-sm border border-border/50 overflow-hidden m-4 max-w-full ${
              isDeliveryExpanded
                ? isUnassignedCollapsed
                  ? "flex-1"
                  : "h-[67%] min-h-75"
                : "h-[67%] min-h-75"
            }`}
          >
            <button
              onClick={() => handleDeliveryExpandChange(!isDeliveryExpanded)}
              className="max-w-full flex items-center justify-between px-4 py-3 border-b border-border/50 bg-primary/2 hover:bg-primary/5 text-left transition-colors"
              aria-label={
                isDeliveryExpanded
                  ? "Collapse delivery orders"
                  : "Expand delivery orders"
              }
            >
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {deliveryOrders.length}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {deliveryOrders.length}{" "}
                    {deliveryOrders.length === 1 ? "order" : "orders"} in this
                    delivery
                  </TooltipContent>
                </Tooltip>
                {totalEstimatedTime > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs text-foreground">
                          {formatDuration(totalEstimatedTime)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Total estimated time: {formatDuration(totalEstimatedTime)}
                    </TooltipContent>
                  </Tooltip>
                )}
                {totalDistance > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Route className="w-4 h-4 text-primary" />
                        <span className="text-xs text-foreground">
                          {formatDistance(totalDistance)}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Total route distance: {formatDistance(totalDistance)}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
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
                    d={isDeliveryExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
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
            <div className="flex flex-col bg-background rounded-2sm shadow-sm border border-border/50 overflow-hidden mx-4 mb-4 max-w-full h-[33%] min-h-50">
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
      </SidebarContent>

      {/* Modern Footer */}
      <SidebarFooter className="text-xs text-muted-foreground px-6 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            © {new Date().getFullYear()} Delivery Manager
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={resetLocalStorageAndFetchData}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="Reset Data"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
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
