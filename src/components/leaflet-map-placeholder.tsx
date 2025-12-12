import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import React from "react";

const LeafletMapPlaceholder: React.FC = () => (
  <MapContainer
    center={[51.505, -0.09]}
    zoom={13}
    style={{ width: "100%", height: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
  </MapContainer>
);

export default LeafletMapPlaceholder;
