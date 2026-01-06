import MapView from "@/components/maps/abstraction/map-view";
import DeliveryRouteMapLayout from "@/components/delivery-route-map-layout";
import { useParams } from "react-router-dom";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import type { Order } from "@/types/order";

export default function DeliveryMapPage() {
  useParams<{ deliveryId: string }>();
  useDeliveryRoute();

  return (
    <DeliveryRouteMapLayout
      renderMap={(
        displayedOrders: Order[],
        filteredUnassignedOrders: Order[],
        allUnassignedOrders: Order[],
        onOrderAddedToDelivery,
        onRefreshRequested
      ) => (
        <MapView
          orders={displayedOrders}
          unassignedOrders={allUnassignedOrders}
          filteredUnassignedOrders={filteredUnassignedOrders}
          onOrderAddedToDelivery={onOrderAddedToDelivery}
          onRefreshRequested={onRefreshRequested}
        />
      )}
    />
  );
}
