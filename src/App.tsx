import HereMap from "@/components/here-map.tsx";
import Sidebar from "@/components/sidebar";
import OrderMarkers from "@/components/order-markers";
import HereMultiSegmentRouting from "@/components/here-multi-segment-routing";
import RouteManager from "@/components/RouteManager";
// import SimpleRouteTest from "@/components/simple-route-test";
import { MarkerHighlightProvider } from "@/contexts/MarkerHighlightContext";
import { OrderRouteProvider } from "@/contexts/OrderRouteContext";
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
            {/* <SimpleRouteTest /> */}
            {/* <PublicTransitToggle /> */} {/* TODO: Convert to TypeScript */}
          </div>

          {/* Sidebar overlaid on top of the map */}
          <div className="absolute inset-y-0 left-0 z-9999">
            <Sidebar>
              <RouteManager />
            </Sidebar>
          </div>
        </div>
      </OrderRouteProvider>
    </MarkerHighlightProvider>
  );
}

export default App;
