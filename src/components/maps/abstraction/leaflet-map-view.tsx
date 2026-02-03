import LeafletMapRenderer from "@/components/maps/leaflet/leaflet-map-renderer";
import OrderMapAdapter from "@/components/maps/abstraction/order-map-adapter";
import type { Order } from "@/types/order";

interface LeafletMapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  filteredUnassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId?: string) => void | Promise<void>;
  onRefreshRequested?: () => void;
}

const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  orders,
  unassignedOrders = [],
  filteredUnassignedOrders,
  onOrderAddedToDelivery,
  onRefreshRequested,
}) => {
  return (
    <OrderMapAdapter
      orders={orders}
      unassignedOrders={filteredUnassignedOrders || unassignedOrders}
      enableHereRouting
      onOrderAddedToDelivery={onOrderAddedToDelivery}
      onRefreshRequested={onRefreshRequested}
    >
      {(mapData) => <LeafletMapRenderer {...mapData} />}
    </OrderMapAdapter>
  );
};

export default LeafletMapView;
