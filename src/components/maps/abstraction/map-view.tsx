import React from "react";
import type { Order } from "@/types/order";
import LeafletMapRenderer from "../leaflet/leaflet-map-renderer";
import OrderMapAdapter from "./order-map-adapter";

interface MapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId?: string) => void | Promise<void>;
  onRefreshRequested?: () => void;
}

/**
 * MapView - Main map facade component
 * Uses adapter pattern to separate business logic from rendering
 */
const MapView: React.FC<MapViewProps> = ({
  orders,
  unassignedOrders = [],
  onOrderAddedToDelivery,
  onRefreshRequested,
}) => {
  return (
    <OrderMapAdapter
      orders={orders}
      unassignedOrders={unassignedOrders}
      onOrderAddedToDelivery={onOrderAddedToDelivery}
      onRefreshRequested={onRefreshRequested}
    >
      {(mapData) => <LeafletMapRenderer {...mapData} />}
    </OrderMapAdapter>
  );
};

export default MapView;
