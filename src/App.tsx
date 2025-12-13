import LeafletMapPlaceholder from "@/components/leaflet-map-placeholder";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DeliverySidebar } from "@/components/DeliverySidebar";

function App() {
  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        <SidebarTrigger className="absolute top-4 right-80 z-50" />
        <div className="flex-1 h-full">
          <LeafletMapPlaceholder />
        </div>
        <DeliverySidebar />
      </main>
    </SidebarProvider>
  );
}

export default App;
