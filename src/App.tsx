import LeafletMapPlaceholder from "@/components/leaflet-map-placeholder";
import { Sidebar, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
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
        <Sidebar
          side="right"
          className="border-l bg-white shadow-lg z-50 flex flex-col h-full"
        >
          <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
            Trasa D-001
          </SidebarHeader>
          <div className="flex-1 overflow-y-auto">
            {/* Place your sidebar content here */}
          </div>
          <SidebarFooter className="text-xs text-gray-500 px-4 py-3 border-t">
            Panel boczny - stopka
          </SidebarFooter>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}

export default App;
