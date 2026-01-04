import React from "react";
import type { Order } from "@/types/order";
import MapyMapRenderer from "../mapy/mapy-map-renderer";
import MapyOrderMapAdapter from "./mapy-order-map-adapter";

interface MapyMapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

/**
 * MapyMapView - Mapy.cz map facade component with routing
 * Uses enhanced adapter with Mapy.cz routing API integration
 * Matches the interface of the default MapView but uses Mapy.cz renderer and routing
 */
const MapyMapView: React.FC<MapyMapViewProps> = ({
  orders,
  unassignedOrders = [],
  onOrderAddedToDelivery,
  onRefreshRequested,
}) => {
  return (
    <MapyOrderMapAdapter
      orders={orders}
      unassignedOrders={unassignedOrders}
      onOrderAddedToDelivery={onOrderAddedToDelivery}
      onRefreshRequested={onRefreshRequested}
    >
      {(mapData) => <MapyMapRenderer {...mapData} />}
    </MapyOrderMapAdapter>
  );
};

export default MapyMapView;
