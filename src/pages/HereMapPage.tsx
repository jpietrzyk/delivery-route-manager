import HereMapView from "@/components/maps/abstraction/here-map-view";
import DeliveryRouteMapLayout from "@/components/delivery-route-map-layout";
import { useParams } from "react-router-dom";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import type { Order } from "@/types/order";

export default function HereMapPage() {
  useParams<{ deliveryId: string }>();
  useDeliveryRoute();

  return (
    <DeliveryRouteMapLayout
      renderMap={(
        displayedOrders: Order[],
        allUnassignedOrders: Order[],
        unassignedOrderFilterStatus: Map<string, boolean>,
        onOrderAddedToDelivery,
        onRefreshRequested,
      ) => {
        const filteredUnassignedOrders = allUnassignedOrders.filter(
          (order) => unassignedOrderFilterStatus.get(order.id) ?? false,
        );
        return (
          <HereMapView
            orders={displayedOrders}
            unassignedOrders={allUnassignedOrders}
            filteredUnassignedOrders={filteredUnassignedOrders}
            onOrderAddedToDelivery={onOrderAddedToDelivery}
            onRefreshRequested={onRefreshRequested}
          />
        );
      }}
    />
  );
}
