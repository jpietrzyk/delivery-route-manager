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
      key={window.location.pathname}
      renderMap={(
        displayedOrders: Order[],
        allUnassignedOrders: Order[],
        unassignedOrderFilterStatus: Map<string, boolean>,
        onOrderAddedToDelivery,
        onRefreshRequested,
      ) => (
        <MapView
          orders={displayedOrders}
          unassignedOrders={allUnassignedOrders}
          unassignedOrderFilterStatus={unassignedOrderFilterStatus}
          onOrderAddedToDelivery={onOrderAddedToDelivery}
          onRefreshRequested={onRefreshRequested}
        />
      )}
    />
  );
}
