import { type ReactNode, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-route-sidebar";
import { MapControls } from "@/components/map-controls";
import { pl, getOrdersCountText } from "@/lib/translations";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { UnassignedOrderList } from "@/components/delivery-route/unassigned-order-list";
import {
  OrderFilters,
  type PriorityFilterState,
  type StatusFilterState,
  type AmountFilterState,
  type ComplexityFilterState,
  type UpdatedAtFilterState,
} from "@/components/delivery-route/order-filters";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import type { Order } from "@/types/order";
import { resetLocalStorageAndFetchData } from "@/lib/local-storage-utils";

interface DeliveryRouteMapLayoutProps {
  renderMap: (
    displayedOrders: Order[],
    filteredUnassignedOrders: Order[],
    onOrderAddedToDelivery: () => Promise<void>,
    onRefreshRequested: () => void
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

  // Priority filter state
  const [priorityFilters, setPriorityFilters] = useState<PriorityFilterState>({
    low: true,
    medium: true,
    high: true,
  });

  // Status filter state
  const [statusFilters, setStatusFilters] = useState<StatusFilterState>({
    pending: true,
    "in-progress": true,
    completed: true,
    cancelled: true,
  });

  // Amount filter state
  const [amountFilters, setAmountFilters] = useState<AmountFilterState>({
    low: true,
    medium: true,
    high: true,
  });

  // Complexity filter state
  const [complexityFilters, setComplexityFilters] =
    useState<ComplexityFilterState>({
      simple: true,
      moderate: true,
      complex: true,
    });

  // UpdatedAt filter state
  const [updatedAtFilters, setUpdatedAtFilters] =
    useState<UpdatedAtFilterState>({
      recent: true,
      moderate: true,
      old: true,
    });

  // Helper function to determine amount tier
  const getAmountTier = (amount: number): keyof AmountFilterState => {
    if (amount <= 10000) return "low";
    if (amount <= 100000) return "medium";
    return "high";
  };

  // Helper function to determine complexity tier based on product complexity
  const getComplexityTier = (
    productComplexity: 1 | 2 | 3
  ): keyof ComplexityFilterState => {
    if (productComplexity === 1) return "simple";
    if (productComplexity === 2) return "moderate";
    return "complex";
  };

  // Helper function to determine updatedAt period
  const getUpdatedAtPeriod = (updatedAt: Date): keyof UpdatedAtFilterState => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(updatedAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 7) return "recent";
    if (diffDays < 30) return "moderate";
    return "old";
  };

  // Filter unassigned orders based on all filters
  const filteredUnassignedOrders = unassignedOrders.filter(
    (order) =>
      priorityFilters[order.priority] &&
      statusFilters[order.status] &&
      amountFilters[getAmountTier(order.totalAmount)] &&
      complexityFilters[getComplexityTier(order.product.complexity)] &&
      updatedAtFilters[getUpdatedAtPeriod(order.updatedAt)]
  );

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
              filteredUnassignedOrders,
              async () => {
                await refreshDeliveryOrders(deliveryId);
                handleDeliveryOrdersUpdated();
              },
              handleOrderRemoved
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

          {/* Back button, drawer trigger, and orders count display at top left */}
          <MapControls
            totalOrdersCount={totalOrdersCount}
            totalAvailableOrders={totalAvailableOrders}
            filteredUnassignedOrdersCount={filteredUnassignedOrders.length}
            onResetData={handleResetData}
            currentMapProvider={currentMapProvider}
            onMapProviderChange={handleMapProviderChange}
            onResetFilters={() => {
              setPriorityFilters({
                low: true,
                medium: true,
                high: true,
              });
              setStatusFilters({
                pending: true,
                "in-progress": true,
                completed: true,
                cancelled: true,
              });
              setAmountFilters({
                low: true,
                medium: true,
                high: true,
              });
              setComplexityFilters({
                simple: true,
                moderate: true,
                complex: true,
              });
              setUpdatedAtFilters({
                recent: true,
                moderate: true,
                old: true,
              });
            }}
          />

          {/* Sidebar trigger at top right */}
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <SidebarTrigger className="bg-background border border-border shadow-lg hover:bg-accent" />
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
              <OrderFilters
                onPriorityChange={setPriorityFilters}
                onStatusChange={setStatusFilters}
                onAmountChange={setAmountFilters}
                onComplexityChange={setComplexityFilters}
                onUpdatedAtChange={setUpdatedAtFilters}
              />
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
