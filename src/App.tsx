import LeafletMapPlaceholder from "@/components/leaflet-map-placeholder";
import { DeliveryPlacSidebar } from "@/components/DeliveryPlacSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  return (
    <SidebarProvider>
      <div className="h-screen w-screen overflow-hidden relative flex">
        {/* Main map area, leaves space for sidebar */}
        <div className="flex-1 h-full">
          <LeafletMapPlaceholder />
        </div>
        {/* Sidebar on the right */}
        <DeliveryPlacSidebar
          header={<div className="font-bold text-lg">Delivery Plac</div>}
          footer={<div className="text-xs text-gray-500">© 2025 Profi-Stahl</div>}
        >
          {/* Place your sidebar content here */}
        </DeliveryPlacSidebar>
      </div>
    </SidebarProvider>
  );
}

export default App;
