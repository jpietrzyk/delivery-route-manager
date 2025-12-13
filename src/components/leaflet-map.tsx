import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import React from "react";

interface LeafletMapProps {
  orders?: Array<{
    id: string;
    name: string;
    customer: string;
    location: { lat: number; lng: number };
  }>;
}

function MapCenterer({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ orders = [] }) => {
  const center =
    orders.length > 0 ? orders[0].location : { lat: 51.505, lng: -0.09 };
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      engineType="DEFAULT"
      pixelRatio={window.devicePixelRatio || 1}
    >
      <MapCenterer center={center} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {orders.map((order) => {
        const isGrayed = !order.deliveryId;
        const icon = L.icon({
          iconUrl: isGrayed
            ? "/marker-icon-grey.svg"
            : "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          shadowSize: [41, 41],
        });
        return (
          <Marker key={order.id} position={order.location} icon={icon}>
            <Popup>
              {order.name}
              <br />
              {order.customer}
              <br />({order.location.lat}, {order.location.lng})
              {isGrayed && (
                <div style={{ color: "#888" }}>No delivery assigned</div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
