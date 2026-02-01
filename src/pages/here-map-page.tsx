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
        onOrderAddedToDelivery: (orderId?: string) => Promise<void>,
        onRefreshRequested: () => void,
      ) => {
        return (
          <HereMapView
            orders={displayedOrders}
            unassignedOrders={allUnassignedOrders}
            filteredUnassignedOrders={allUnassignedOrders}
            onOrderAddedToDelivery={onOrderAddedToDelivery}
            onRefreshRequested={onRefreshRequested}
          />
        );
      }}
    />
  );
}
