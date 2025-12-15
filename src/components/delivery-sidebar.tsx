import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";

import type { Order } from "@/types/order";
import { DeliveryRouteManager } from "./delivery-route-manager";

const DeliverySidebar = ({ orders = [] }: { orders?: Order[] }) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  return (
    <Sidebar
      side="right"
      className="border-l bg-sidebar text-sidebar-foreground shadow-lg relative z-20 flex flex-col h-screen pointer-events-auto"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        Trasa D-001
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-foreground/70">
            Zamówienia przypisane do dostawy
          </div>
          <DeliveryRouteManager
            orders={orders}
            highlightedOrderId={highlightedOrderId}
            setHighlightedOrderId={setHighlightedOrderId}
          />
        </div>
      </SidebarContent>
      <SidebarFooter className="text-xs text-muted-foreground px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
