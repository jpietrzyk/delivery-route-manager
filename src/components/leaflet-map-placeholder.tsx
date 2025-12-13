import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import React from "react";

const center = { lat: 51.505, lng: -0.09 };

const LeafletMapPlaceholder: React.FC = () => (
  <MapContainer
    center={center}
    zoom={13}
    style={{ width: "100%", height: "100%" }}
    engineType="DEFAULT"
    pixelRatio={window.devicePixelRatio || 1}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  </MapContainer>
);

export default LeafletMapPlaceholder;
