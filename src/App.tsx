import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveriesListPage from "@/pages/DeliveriesListPage";
import DeliveryMapPage from "@/pages/DeliveryRouteMapPage";
import MapyCzMapPage from "@/pages/MapyCzMapPage";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";

function App() {
  return (
    <Router>
      <DeliveryRouteManagerProvider>
        <Routes>
          {/* Deliveries list page */}
          <Route path="/delivery_routes" element={<DeliveriesListPage />} />
          {/* Delivery route map pages */}
          <Route
            path="/delivery_routes/:deliveryId"
            element={<DeliveryMapPage />}
          />
          <Route
            path="/delivery_routes/:deliveryId/leaflet"
            element={<DeliveryMapPage />}
          />
          <Route
            path="/delivery_routes/:deliveryId/mapy"
            element={<MapyCzMapPage />}
          />
          {/* Default route */}
          <Route path="/" element={<DeliveriesListPage />} />
        </Routes>
      </DeliveryRouteManagerProvider>
    </Router>
  );
}

export default App;
