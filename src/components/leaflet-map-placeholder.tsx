import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import React from "react";

const center = { lat: 51.505, lng: -0.09 };

const LeafletMapPlaceholder: React.FC = () => (
  <MapContainer
    center={center}
    zoom={13}
    style={{ width: "100%", height: "100%" }}
    pixelRatio={window.devicePixelRatio || 1}
    engineType="default"
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={{ lat: 51.51, lng: -0.1 }} lat={51.51} lng={-0.1}>
      <Popup>
        Marker near London
        <br />
        (51.51, -0.1)
      </Popup>
    </Marker>
  </MapContainer>
);

export default LeafletMapPlaceholder;
