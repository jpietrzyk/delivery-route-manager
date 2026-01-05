import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { useRouteManager } from "@/hooks/use-route-manager";
import { useEffect, useState } from "react";
import { Package, Clock, Route } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useNavigate } from "react-router-dom";

import type { Order } from "@/types/order";
import { DeliveryOrderList } from "@/components/delivery-route/delivery-order-list";
import { resetLocalStorageAndFetchData } from "@/lib/local-storage-utils";
import {
  calculateTotalEstimatedTime,
  calculateTotalDistance,
  formatDuration,
  formatDistance,
} from "@/lib/delivery-route-time-calculator";

interface DeliverySidebarProps {
  onOrderRemoved?: () => void;
  onDeliveryOrdersUpdated?: (updatedOrders: Order[]) => void;
  deliveryOrders?: Order[];
  onAddOrderToDelivery?: (orderId: string) => void;
}

const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  onOrderRemoved,
  onDeliveryOrdersUpdated,
  deliveryOrders: deliveryOrdersProp = [],
  onAddOrderToDelivery,
}) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const { currentOrderId, setCurrentOrderId, setPreviousOrderId } =
    useOrderHighlight();
  const {
    currentDelivery,
    removeOrderFromDelivery,
    refreshDeliveries,
    refreshDeliveryOrders,
    refreshUnassignedOrders,
  } = useDeliveryRoute();
  const routeManagerContext = useRouteManager();
  const routeManager = routeManagerContext?.routeManager ?? null;

  // Get current route params and navigation
  const params = useParams<{ deliveryId?: string }>();
  const navigate = useNavigate();

  // Detect current map provider from URL
  const getCurrentMapProvider = () => {
    const pathname = window.location.pathname;
    if (pathname.includes("/mapy")) return "mapy";
    if (pathname.includes("/delivery_routes") && pathname.includes("/mapy"))
      return "mapy";
    return "leaflet"; // default
  };

  const [currentMapProvider, setCurrentMapProvider] = useState<
    "leaflet" | "mapy"
  >(getCurrentMapProvider());

  const handleMapProviderChange = (provider: "leaflet" | "mapy") => {
    const deliveryId = params.deliveryId || "DEL-001"; // fallback to DEL-001 if no ID
    setCurrentMapProvider(provider);

    if (provider === "mapy") {
      navigate(`/delivery_routes/${deliveryId}/mapy`);
    } else {
      navigate(`/delivery_routes/${deliveryId}/leaflet`);
    }
  };

  const handleReset = async () => {
    try {
      await resetLocalStorageAndFetchData(async () => {
        // Refresh all data from the context
        await Promise.all([
          refreshDeliveries(),
          refreshUnassignedOrders(),
          currentDelivery
            ? refreshDeliveryOrders(currentDelivery.id)
            : Promise.resolve([]),
        ]);
      });
    } catch (error) {
      console.error("Error during reset:", error);
    }
  };

  const [deliveryOrders, setDeliveryOrders] =
    useState<Order[]>(deliveryOrdersProp);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(true);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  // Handle delivery expand/collapse state change
  const handleDeliveryExpandChange = (expanded: boolean) => {
    setIsDeliveryExpanded(expanded);
  };

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
      setIsOperationInProgress(true);
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
    } finally {
      setIsOperationInProgress(false);
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
          {/* Delivery Orders Section - Takes full available space */}
          <div className="flex flex-col bg-background rounded-2sm shadow-sm border border-border/50 overflow-hidden m-4 max-w-full relative flex-1">
            {/* Loading Overlay */}
            {isOperationInProgress && (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-50 flex items-center justify-center rounded-2sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin"></div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Calculating route...
                  </span>
                </div>
              </div>
            )}
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
                    routeManager={routeManager}
                    title=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      {/* Modern Footer */}
      <SidebarFooter className="text-xs text-muted-foreground px-6 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            © {new Date().getFullYear()} Delivery Manager
          </span>
          <div className="flex items-center gap-3">
            {/* Map Provider Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors duration-200 px-2 py-1 rounded text-xs font-medium border border-border/50 hover:border-border">
                  {currentMapProvider === "mapy" ? "Mapy.cz" : "Leaflet"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top">
                <DropdownMenuItem
                  onClick={() => handleMapProviderChange("leaflet")}
                  className={
                    currentMapProvider === "leaflet" ? "bg-accent" : ""
                  }
                >
                  Leaflet
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleMapProviderChange("mapy")}
                  className={currentMapProvider === "mapy" ? "bg-accent" : ""}
                >
                  Mapy.cz
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Button */}
            <button
              onClick={handleReset}
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
