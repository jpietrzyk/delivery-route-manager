import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";

const DeliverySidebar = ({ orders = [] }: { orders?: any[] }) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  return (
    <Sidebar
      side="right"
      className="border-l bg-white shadow-lg z-50 flex flex-col h-full"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        Trasa D-001
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-gray-700">
            Zamówienia przypisane do dostawy
          </div>
          <ul className="space-y-2">
            {orders.length === 0 && (
              <li className="text-xs text-gray-400">Brak zamówień</li>
            )}
            {orders.map((order) => (
              <li
                key={order.id}
                className={`rounded border p-2 bg-gray-50 ${
                  highlightedOrderId === order.id ? "ring-2 ring-blue-400" : ""
                }`}
                onMouseEnter={() => setHighlightedOrderId(order.id)}
                onMouseLeave={() => setHighlightedOrderId(null)}
              >
                <div className="font-medium text-sm text-gray-900">
                  {order.name}
                </div>
                <div className="text-xs text-gray-500">{order.customer}</div>
                <div className="text-xs text-gray-400">
                  Status: {order.status}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SidebarContent>
      <SidebarFooter className="text-xs text-gray-500 px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
