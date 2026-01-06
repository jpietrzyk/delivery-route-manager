import React from "react";
import type { Order } from "@/types/order";
import LeafletMapRenderer from "../leaflet/leaflet-map-renderer";
import OrderMapAdapter from "./order-map-adapter";

interface MapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  filteredUnassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

/**
 * MapView - Main map facade component
 * Uses adapter pattern to separate business logic from rendering
 */
const MapView: React.FC<MapViewProps> = ({
  orders,
  unassignedOrders = [],
  filteredUnassignedOrders,
  onOrderAddedToDelivery,
  onRefreshRequested,
}) => {
  return (
    <OrderMapAdapter
      orders={orders}
      unassignedOrders={unassignedOrders}
      filteredUnassignedOrders={filteredUnassignedOrders}
      onOrderAddedToDelivery={onOrderAddedToDelivery}
      onRefreshRequested={onRefreshRequested}
    >
      {(mapData) => <LeafletMapRenderer {...mapData} />}
    </OrderMapAdapter>
  );
};

export default MapView;
