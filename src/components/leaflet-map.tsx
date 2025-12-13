import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import React from "react";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";

interface LeafletMapProps {
  orders?: Array<{
    id: string;
    name: string;
    customer: string;
    location: { lat: number; lng: number };
    deliveryId?: string;
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
  const { highlightedOrderId } = useMarkerHighlight();

  // Preload icons
  const defaultIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );
  const grayedIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl: "/marker-icon-grey.svg",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );
  const highlightIcon = React.useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        shadowSize: [41, 41],
      }),
    []
  );

  // Draw straight lines between the first-second and second-third order markers if they exist
  let polylinePositions1: [number, number][] | undefined = undefined;
  let polylinePositions2: [number, number][] | undefined = undefined;
  if (orders.length >= 2) {
    polylinePositions1 = [
      [orders[0].location.lat, orders[0].location.lng],
      [orders[1].location.lat, orders[1].location.lng],
    ];
  }
  if (orders.length >= 3) {
    polylinePositions2 = [
      [orders[1].location.lat, orders[1].location.lng],
      [orders[2].location.lat, orders[2].location.lng],
    ];
  }

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
      {polylinePositions1 && (
        <Polyline
          positions={polylinePositions1}
          pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.8 }}
        />
      )}
      {polylinePositions2 && (
        <Polyline
          positions={polylinePositions2}
          pathOptions={{ color: "#f59e42", weight: 4, opacity: 0.8 }}
        />
      )}
      {orders.map((order) => {
        const isGrayed = !order.deliveryId;
        let icon = isGrayed ? grayedIcon : defaultIcon;
        if (highlightedOrderId === order.id) {
          icon = highlightIcon;
        }
        return (
          <Marker
            key={order.id}
            position={order.location}
            // @ts-expect-error: icon is supported by react-leaflet Marker but not in type definitions
            icon={icon as L.Icon}
          >
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
