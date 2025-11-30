import HereMap from "@/components/here-map.tsx";
import Sidebar from "@/components/sidebar";
import OrderMarkers from "@/components/order-markers";
import HereMultiSegmentRouting from "@/components/here-multi-segment-routing";

import { MarkerHighlightProvider } from "@/contexts/MarkerHighlightProvider";
import { OrderRouteProvider } from "@/contexts/OrderRouteProvider";
// import PublicTransitToggle from "@/components/public-transit-toggle.jsx"; // TODO: Convert to TypeScript

function App() {
  return (
    <MarkerHighlightProvider>
      <OrderRouteProvider>
        <div className="h-screen w-screen overflow-hidden relative">
          {/* Map in the background */}
          <div className="absolute inset-0 z-0">
            <HereMap />
            <OrderMarkers />
            <HereMultiSegmentRouting />
            {/* <PublicTransitToggle /> */} {/* TODO: Convert to TypeScript */}
          </div>

          {/* Sidebar overlaid on top of the map */}
          <div className="absolute inset-y-0 left-0 z-9999">
            <Sidebar />
          </div>
        </div>
      </OrderRouteProvider>
    </MarkerHighlightProvider>
  );
}

export default App;
