import React, { type ReactNode, useEffect, useState } from "react";
import { useMapFilters } from "@/hooks/use-map-filters";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-route-sidebar";
import { MapControls } from "@/components/map-controls";
import { pl, getOrdersCountText } from "@/lib/translations";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { UnassignedOrderList } from "@/components/delivery-route/unassigned-order-list";

import { OrderFilters } from "@/components/delivery-route/order-filters";
import type {
  AmountFilterState,
  ComplexityFilterState,
} from "@/components/delivery-route/order-filters";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import type { Order } from "@/types/order";
import { resetLocalStorageAndFetchData } from "@/lib/local-storage-utils";

interface DeliveryRouteMapLayoutProps {
  renderMap: (
    displayedOrders: Order[],
    allUnassignedOrders: Order[],
    unassignedOrderFilterStatus: Map<string, boolean>,
    onOrderAddedToDelivery: (orderId?: string) => Promise<void>,
    onRefreshRequested: () => void,
  ) => ReactNode;
}

export default function DeliveryRouteMapLayout({
  renderMap,
}: DeliveryRouteMapLayoutProps) {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();

  // Detect current map provider from URL
  const getCurrentMapProvider = () => {
    const pathname = window.location.pathname;
    if (pathname.includes("/mapy")) return "mapy";
    return "leaflet"; // default
  };

  const [currentMapProvider, setCurrentMapProvider] = useState<
    "leaflet" | "mapy"
  >(getCurrentMapProvider());

  const handleMapProviderChange = (provider: "leaflet" | "mapy") => {
    const currentDeliveryId = deliveryId || "DEL-001"; // fallback
    setCurrentMapProvider(provider);

    if (provider === "mapy") {
      navigate(`/delivery_routes/${currentDeliveryId}/mapy`);
    } else {
      navigate(`/delivery_routes/${currentDeliveryId}/leaflet`);
    }
  };

  const handleResetData = async () => {
    try {
      await resetLocalStorageAndFetchData(async () => {
        await Promise.all([
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
  const {
    addOrderToDelivery,
    unassignedOrders,
    deliveryOrders,
    deliveries,
    currentDelivery,
    setCurrentDelivery,
    refreshUnassignedOrders,
    refreshDeliveryOrders,
  } = useDeliveryRoute();

  // Local state to track reordered orders for the map
  const [displayedOrders, setDisplayedOrders] =
    useState<Order[]>(deliveryOrders);

  // Use shared filter state from context
  const { filters, setFilters } = useMapFilters();
  const priorityFilters = React.useMemo(
    () => filters.priorityFilters ?? { low: true, medium: true, high: true },
    [filters.priorityFilters],
  );
  const statusFilters = React.useMemo(
    () =>
      filters.statusFilters ?? {
        pending: true,
        "in-progress": true,
        completed: true,
        cancelled: true,
      },
    [filters.statusFilters],
  );
  const amountFilters = React.useMemo(
    () => filters.amountFilters ?? { low: true, medium: true, high: true },
    [filters.amountFilters],
  );
  const complexityFilters = React.useMemo(
    () =>
      filters.complexityFilters ?? {
        simple: true,
        moderate: true,
        complex: true,
      },
    [filters.complexityFilters],
  );

  // Remove localStorage filter logic (now handled by context)

  // Helper function to determine amount tier
  // Accept both totalAmount and totalamount fields for compatibility
  type OrderWithAmount = Order & {
    totalAmount?: number | string;
    totalamount?: number | string;
  };

  const getOrderAmount = React.useCallback((order: OrderWithAmount): number => {
    // Prefer camelCase, fallback to lowercase
    const value =
      order.totalAmount !== undefined ? order.totalAmount : order.totalamount;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Remove spaces, replace comma with dot if needed, remove thousands separator
      const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
      // If value is like "2,19800" (should be 219800), just remove comma
      const parsed = parseInt(cleaned, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  }, []);

  const getAmountTier = (amount: number): keyof AmountFilterState => {
    if (amount <= 600) return "low";
    if (amount <= 1300) return "medium";
    return "high";
  };

  // Helper function to determine complexity tier
  const getComplexityTier = (order: Order): keyof ComplexityFilterState => {
    const complexity = order.complexity ? order.complexity : 1;
    if (complexity === 1) return "simple";
    if (complexity === 2) return "moderate";
    return "complex";
  };

  // Map integer priority to filter bucket
  // 0-1: low, 2: medium, 3+: high
  const getPriorityTier = (priority: number): keyof PriorityFilterState => {
    if (priority === 0 || priority === 1) return "low";
    if (priority === 2) return "medium";
    return "high";
  };

  // Check if any filter groups are active
  const hasActiveFilters = React.useMemo(() => {
    return (
      Object.values(priorityFilters).some(Boolean) ||
      Object.values(statusFilters).some(Boolean) ||
      Object.values(amountFilters).some(Boolean) ||
      Object.values(complexityFilters).some(Boolean)
    );
  }, [priorityFilters, statusFilters, amountFilters, complexityFilters]);

  // Filter unassigned orders based on active filters (for UI display)
  const filteredUnassignedOrders = unassignedOrders.filter((order) => {
    if (!hasActiveFilters) {
      return true; // No filters active, so show all orders
    }

    const priorityKey = getPriorityTier(order.priority ?? 0);
    const priorityMatch = priorityFilters[priorityKey] ?? false;
    const statusMatch = statusFilters[order.status] ?? false;
    const amountMatch =
      amountFilters[getAmountTier(getOrderAmount(order))] ?? false;
    const complexityMatch =
      complexityFilters[getComplexityTier(order)] ?? false;

    // Only apply filter if the group has any filters checked
    const activePriorityMatch = Object.values(priorityFilters).some(Boolean)
      ? priorityMatch
      : true;
    const activeStatusMatch = Object.values(statusFilters).some(Boolean)
      ? statusMatch
      : true;
    const activeAmountMatch = Object.values(amountFilters).some(Boolean)
      ? amountMatch
      : true;
    const activeComplexityMatch = Object.values(complexityFilters).some(Boolean)
      ? complexityMatch
      : true;

    return (
      activePriorityMatch &&
      activeStatusMatch &&
      activeAmountMatch &&
      activeComplexityMatch
    );
  });

  // Create filter match status for all unassigned orders
  const unassignedOrderFilterStatus = React.useMemo(() => {
    const statusMap = new Map<string, boolean>();
    unassignedOrders.forEach((order) => {
      if (!hasActiveFilters) {
        statusMap.set(order.id, true); // No filters active, so all orders match
        return;
      }

      const priorityKey = getPriorityTier(order.priority ?? 0);
      const priorityMatch = priorityFilters[priorityKey] ?? false;
      const statusMatch = statusFilters[order.status] ?? false;
      const amountMatch =
        amountFilters[getAmountTier(getOrderAmount(order))] ?? false;
      const complexityMatch =
        complexityFilters[getComplexityTier(order)] ?? false;

      // Only apply filter if the group has any filters checked
      const activePriorityMatch = Object.values(priorityFilters).some(Boolean)
        ? priorityMatch
        : true;
      const activeStatusMatch = Object.values(statusFilters).some(Boolean)
        ? statusMatch
        : true;
      const activeAmountMatch = Object.values(amountFilters).some(Boolean)
        ? amountMatch
        : true;
      const activeComplexityMatch = Object.values(complexityFilters).some(
        Boolean,
      )
        ? complexityMatch
        : true;

      const matchesFilters =
        activePriorityMatch &&
        activeStatusMatch &&
        activeAmountMatch &&
        activeComplexityMatch;
      statusMap.set(order.id, matchesFilters);
    });
    return statusMap;
  }, [
    unassignedOrders,
    hasActiveFilters,
    priorityFilters,
    statusFilters,
    amountFilters,
    complexityFilters,
    getOrderAmount,
  ]);

  const totalAvailableOrders = displayedOrders.length + unassignedOrders.length;
  const totalOrdersCount =
    displayedOrders.length + filteredUnassignedOrders.length;

  useEffect(() => {
    void refreshDeliveryOrders(deliveryId);
    void refreshUnassignedOrders();
  }, [deliveryId, refreshDeliveryOrders, refreshUnassignedOrders]);

  // Keep context currentDelivery in sync with the route param when present
  useEffect(() => {
    if (!deliveryId) return;
    const match = deliveries.find((d) => d.id === deliveryId);
    if (match && match.id !== currentDelivery?.id) {
      setCurrentDelivery(match);
    }
  }, [deliveryId, deliveries, currentDelivery, setCurrentDelivery]);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    void refreshDeliveryOrders(deliveryId);
    void refreshUnassignedOrders();
  };

  // Update displayed orders when context orders change (initial load or API refresh)
  useEffect(() => {
    setDisplayedOrders(deliveryOrders);
  }, [deliveryOrders]);

  // Update delivery orders when an order is removed or added
  const handleDeliveryOrdersUpdated = (updatedOrders?: Order[]) => {
    if (updatedOrders) {
      // Update the displayed orders with the reordered sequence
      setDisplayedOrders(updatedOrders);
    }
    void refreshUnassignedOrders();
  };

  return (
    <SidebarProvider>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <main className="h-screen w-screen overflow-hidden relative flex">
          {/* Map layer at the bottom */}
          <div className="absolute inset-0 z-0">
            {renderMap(
              displayedOrders,
              unassignedOrders,
              unassignedOrderFilterStatus,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              async (_orderId?: string) => {
                await refreshDeliveryOrders(deliveryId);
                handleDeliveryOrdersUpdated();
              },
              handleOrderRemoved,
            )}
          </div>

          {/* UI overlays above the map, pointer-events-none except sidebar */}
          <div className="relative w-full flex justify-end items-start z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <DeliverySidebar
                onOrderRemoved={handleOrderRemoved}
                onDeliveryOrdersUpdated={handleDeliveryOrdersUpdated}
                deliveryOrders={displayedOrders}
                onAddOrderToDelivery={async (orderId: string) => {
                  try {
                    // Use the delivery context's addOrderToDelivery method
                    const targetDeliveryId = deliveryId || currentDelivery?.id;
                    if (!targetDeliveryId) {
                      throw new Error("No delivery selected");
                    }
                    await addOrderToDelivery(targetDeliveryId, orderId);

                    await refreshDeliveryOrders(deliveryId);
                    handleDeliveryOrdersUpdated();
                  } catch (error) {
                    console.error("Failed to add order to delivery:", error);
                    alert("Failed to add order to delivery");
                  }
                }}
              />
            </div>
          </div>

          {/* Back button and orders count display at top left */}
          <MapControls
            totalOrdersCount={totalOrdersCount}
            totalAvailableOrders={totalAvailableOrders}
            onResetData={handleResetData}
            currentMapProvider={currentMapProvider}
            onMapProviderChange={handleMapProviderChange}
            onResetFilters={() => {
              setFilters({
                priorityFilters: { low: true, medium: true, high: true },
                statusFilters: {
                  pending: true,
                  "in-progress": true,
                  completed: true,
                  cancelled: true,
                },
                amountFilters: { low: true, medium: true, high: true },
                complexityFilters: {
                  simple: true,
                  moderate: true,
                  complex: true,
                },
              });
            }}
          />

          {/* Sidebar trigger at top right */}
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <SidebarTrigger className="bg-background border border-border shadow-lg hover:bg-accent" />
          </div>

          {/* Drawer trigger at bottom center */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
            <DrawerTrigger asChild>
              <Button className="bg-background/50 hover:bg-accent/80 hover:text-accent-foreground text-foreground font-medium px-8 py-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-border/30 transition-colors inline-flex items-center justify-center h-14 min-w-56 cursor-pointer">
                <Filter className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
          </div>
        </main>

        <DrawerContent
          side="bottom"
          className="border-t border-border/50 bg-linear-to-b from-background via-background to-muted/30"
        >
          <div className="w-full flex flex-col max-h-[60vh] overflow-hidden">
            <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 py-3">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <DrawerTitle className="text-lg font-bold tracking-tight text-foreground shrink-0">
                  {pl.unassignedOrders}
                </DrawerTitle>
                <span className="text-muted-foreground/60 shrink-0">·</span>
                <span className="text-sm text-muted-foreground inline">
                  {getOrdersCountText(filteredUnassignedOrders.length)}
                </span>
              </div>
            </div>
            <div className="border-b border-border/50 bg-background/50 backdrop-blur-xs">
              <div className="w-full px-4 py-3">
                <div className="flex gap-3">
                  <div className="flex items-center">
                    <h3
                      className="text-sm font-semibold text-foreground/70 tracking-wider whitespace-nowrap"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }}
                    >
                      FILTRY
                    </h3>
                  </div>
                  <div className="flex-1">
                    <OrderFilters
                      priorityFilters={priorityFilters}
                      statusFilters={statusFilters}
                      amountFilters={amountFilters}
                      complexityFilters={complexityFilters}
                      onPriorityChange={(filters) =>
                        setFilters((prev) => ({
                          ...prev,
                          priorityFilters: filters,
                        }))
                      }
                      onStatusChange={(filters) =>
                        setFilters((prev) => ({
                          ...prev,
                          statusFilters: filters,
                        }))
                      }
                      onAmountChange={(filters) =>
                        setFilters((prev) => ({
                          ...prev,
                          amountFilters: filters,
                        }))
                      }
                      onComplexityChange={(filters) =>
                        setFilters((prev) => ({
                          ...prev,
                          complexityFilters: filters,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[25vh] min-h-[25vh] max-h-[25vh] overflow-y-auto px-6 pb-6 bg-background/40">
              {filteredUnassignedOrders.length > 0 ? (
                <UnassignedOrderList
                  unassignedOrders={filteredUnassignedOrders}
                  onAddToDelivery={async (orderId: string) => {
                    try {
                      const targetDeliveryId =
                        deliveryId || currentDelivery?.id;
                      if (!targetDeliveryId) {
                        throw new Error("No delivery selected");
                      }
                      await addOrderToDelivery(targetDeliveryId, orderId);
                      await refreshDeliveryOrders(deliveryId);
                      handleDeliveryOrdersUpdated();
                    } catch (error) {
                      console.error("Failed to add order to delivery:", error);
                      alert("Failed to add order to delivery");
                    }
                  }}
                  title=""
                  highlightedOrderId={highlightedOrderId}
                  setHighlightedOrderId={setHighlightedOrderId}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground text-center">
                    {pl.allOrdersAssigned}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </SidebarProvider>
  );
}
