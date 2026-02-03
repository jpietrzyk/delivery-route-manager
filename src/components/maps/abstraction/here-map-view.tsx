import HereMapRenderer from "@/components/maps/here-map-renderer";
import OrderMapAdapter from "@/components/maps/abstraction/order-map-adapter";
import type { Order } from "@/types/order";

interface HereMapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  filteredUnassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId?: string) => void | Promise<void>;
  onRefreshRequested?: () => void;
}

const HereMapView: React.FC<HereMapViewProps> = ({
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
      {(mapData) => <HereMapRenderer {...mapData} />}
    </OrderMapAdapter>
  );
};

export default HereMapView;
