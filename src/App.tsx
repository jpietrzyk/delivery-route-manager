import HereMap from "@/components/here-map.tsx";
import StyledSidebar from "@/components/styled-sidebar";
import OrderMarkers from "@/components/order-markers";
import OrderPolylines from "@/components/order-polylines";
import { MarkerHighlightProvider } from "@/contexts/MarkerHighlightContext";
// import PublicTransitToggle from "@/components/public-transit-toggle.jsx"; // TODO: Convert to TypeScript

function App() {
  return (
    <MarkerHighlightProvider>
      <div className="h-screen w-screen overflow-hidden relative">
        {/* Map in the background */}
        <div className="absolute inset-0 z-0">
          <HereMap />
          <OrderMarkers />
          <OrderPolylines />
          {/* <PublicTransitToggle /> */} {/* TODO: Convert to TypeScript */}
        </div>

        {/* Sidebar overlaid on top of the map */}
        <div className="absolute inset-y-0 left-0 z-9999">
          <StyledSidebar />
        </div>
      </div>
    </MarkerHighlightProvider>
  );
}

export default App;
