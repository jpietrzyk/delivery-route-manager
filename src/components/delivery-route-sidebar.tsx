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
import { useRouteSegments } from "@/hooks/use-route-segments";
import { useEffect, useState } from "react";
import { Package, Clock, Route, ArrowRight, X } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import type { Order } from "@/types/order";
import { DeliveryOrderList } from "@/components/delivery-route/delivery-order-list";
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
}) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const { currentOrderId, setCurrentOrderId, setPreviousOrderId } =
    useOrderHighlight();
  const { currentDelivery, removeOrderFromDelivery } = useDeliveryRoute();
  const routeManagerContext = useRouteManager();
  const routeManager = routeManagerContext?.routeManager ?? null;
  const { routeSegments } = useRouteSegments();

  const [deliveryOrders, setDeliveryOrders] =
    useState<Order[]>(deliveryOrdersProp);
  const [totalEstimatedTime, setTotalEstimatedTime] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  // Sync internal state when props change
  useEffect(() => {
    setDeliveryOrders(deliveryOrdersProp);
  }, [deliveryOrdersProp]);

  // Recalculate time and distance when sequence changes or route segments update
  useEffect(() => {
    if (deliveryOrders.length === 0) {
      setTotalEstimatedTime(0);
      setTotalDistance(0);
      return;
    }

    if (
      routeSegments.length > 0 &&
      routeSegments.length === deliveryOrders.length - 1
    ) {
      let totalTime = 0;
      let totalDistanceMeters = 0;

      for (const segment of routeSegments) {
        totalDistanceMeters += segment.distance;
        totalTime += segment.duration;
      }

      const distance = totalDistanceMeters / 1000;
      const time = Math.round(totalTime / 60);
      setTotalEstimatedTime(time);
      setTotalDistance(distance);
      return;
    }

    const totalTime = Math.round(calculateTotalEstimatedTime(deliveryOrders));
    const distance = calculateTotalDistance(deliveryOrders);
    setTotalEstimatedTime(totalTime);
    setTotalDistance(distance);
  }, [deliveryOrders, routeSegments]);

  const handleRemoveOrder = async (orderId: string) => {
    if (!currentDelivery) {
      console.warn("No current delivery selected");
      return;
    }

    try {
      setIsOperationInProgress(true);
      const updatedOrders = deliveryOrders.filter(
        (order) => order.id !== orderId
      );
      setDeliveryOrders(updatedOrders);

      await removeOrderFromDelivery(currentDelivery.id, orderId);

      onOrderRemoved?.();
      onDeliveryOrdersUpdated?.(updatedOrders);
    } catch (error) {
      console.error("Failed to remove order:", error);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const handleReorder = (newOrders: Order[]) => {
    setDeliveryOrders(newOrders);
    onDeliveryOrdersUpdated?.(newOrders);
  };

  return (
    <Sidebar
      side="right"
      className="bg-background/95 backdrop-blur-sm text-foreground shadow-2xl relative z-20 flex flex-col h-screen pointer-events-auto w-96 transition-all duration-300"
    >
      <SidebarHeader className="px-6 py-4 border-b-0 bg-card/30">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Route className="w-6 h-6 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (deliveryOrders.length > 0) {
                  const currentIndex = deliveryOrders.findIndex(
                    (order) => order.id === currentOrderId
                  );
                  if (
                    currentIndex >= 0 &&
                    currentIndex < deliveryOrders.length - 1
                  ) {
                    setPreviousOrderId(currentOrderId);
                    setCurrentOrderId(deliveryOrders[currentIndex + 1].id);
                  } else if (currentIndex === -1) {
                    setCurrentOrderId(deliveryOrders[0].id);
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border/50 bg-background/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 rounded transition-colors"
              title="Set Next Order as Current"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Next
            </button>
            <button
              onClick={() => {
                setCurrentOrderId(null);
                setPreviousOrderId(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border/50 bg-background/50 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded transition-colors"
              title="Clear Highlights"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-hidden bg-background border-t border-border/30">
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex flex-col bg-background rounded-2sm shadow-sm border border-border/50 overflow-hidden m-4 max-w-full relative flex-1">
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

            <div className="max-w-full flex items-center justify-between px-4 py-3 border-b border-border/50 bg-primary/2">
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
                      Łączny czas: {formatDuration(totalEstimatedTime)}
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
                      Łączny dystans trasy: {formatDistance(totalDistance)}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

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

      <SidebarFooter className="text-xs text-muted-foreground px-6 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            © {new Date().getFullYear()} Delivery Manager
          </span>
          <div className="flex items-center gap-3" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
