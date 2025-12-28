import React from "react";
import type { Order } from "@/types/order";
import LeafletMap from "../leaflet/leaflet-map";

interface MapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

// For now, render LeafletMap as the default provider implementation
const MapView: React.FC<MapViewProps> = (props) => {
  return <LeafletMap {...props} />;
};

export default MapView;
