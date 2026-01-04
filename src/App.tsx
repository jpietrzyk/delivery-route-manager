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
          <Route path="/" element={<DeliveriesListPage />} />
          <Route path="/deliveries" element={<DeliveryMapPage />} />
          <Route path="/deliveries/:deliveryId" element={<DeliveryMapPage />} />
          <Route path="/mapy" element={<MapyCzMapPage />} />
          <Route path="/mapy/:deliveryId" element={<MapyCzMapPage />} />
        </Routes>
      </DeliveryRouteManagerProvider>
    </Router>
  );
}

export default App;
