import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useDelivery } from "@/hooks/use-delivery";

import type { Order } from "@/types/order";
import { DeliveryOrderList } from "./delivery-order-list";

const DeliverySidebar = ({ orders = [] }: { orders?: Order[] }) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  const { currentDelivery, removeOrderFromDelivery } = useDelivery();

  const handleRemoveOrder = async (orderId: string) => {
    if (!currentDelivery) {
      console.warn("No current delivery selected");
      return;
    }

    try {
      await removeOrderFromDelivery(currentDelivery.id, orderId);
    } catch (error) {
      console.error("Failed to remove order:", error);
    }
  };

  return (
    <Sidebar
      side="right"
      className="border-l bg-sidebar text-sidebar-foreground shadow-lg relative z-20 flex flex-col h-screen pointer-events-auto"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        Trasa D-001
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <DeliveryOrderList
          orders={orders}
          highlightedOrderId={highlightedOrderId}
          setHighlightedOrderId={setHighlightedOrderId}
          onRemoveOrder={handleRemoveOrder}
          title="Zamówienia przypisane do dostawy"
        />
      </SidebarContent>
      <SidebarFooter className="text-xs text-muted-foreground px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
