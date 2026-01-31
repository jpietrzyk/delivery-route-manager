// Shared marker style logic for all map providers
import L from "leaflet";
import type { MapMarkerData } from "./map-data";

// Marker icon URLs (should match across providers)
const ICONS = {
    waypoint: "/markers/marker-waypoint.svg",
  default: "/markers/marker-default.svg",
  unassigned: "/markers/unassigned-marker.svg",
  shadow: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  // Priority
  priorityLow: "/markers/marker-priority-low.svg",
  priorityMedium: "/markers/marker-priority-medium.svg",
  priorityHigh: "/markers/marker-priority-high.svg",
  // Status
  statusPending: "/markers/marker-status-pending.svg",
  statusInProgress: "/markers/marker-status-in-progress.svg",
  statusCompleted: "/markers/marker-status-completed.svg",
  statusCancelled: "/markers/marker-status-cancelled.svg",
  // Amount
  amountLow: "/markers/marker-amount-low.svg",
  amountMedium: "/markers/marker-amount-medium.svg",
  amountHigh: "/markers/marker-amount-high.svg",
  // Complexity
  complexitySimple: "/markers/marker-complexity-low.svg",
  complexityModerate: "/markers/marker-complexity-medium.svg",
  complexityComplex: "/markers/marker-complexity-high.svg",
};

export function createNumberedIcon(iconUrl: string, badgeNumber?: number) {
  const badge =
    badgeNumber !== undefined
      ? `<span style="position:absolute;top:2px;left:50%;transform:translateX(-50%);background:#111827;color:white;border-radius:9999px;padding:0 6px;font-size:12px;font-weight:700;line-height:18px;box-shadow:0 1px 2px rgba(0,0,0,0.25);">${badgeNumber}</span>`
      : "";
  return L.divIcon({
    html:
      `<div style="position:relative;display:inline-block;width:25px;height:41px;">` +
      `<img src="${iconUrl}" alt="marker" style="width:25px;height:41px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));" />` +
      badge +
      "</div>",
    className: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

export function getMarkerStyle(marker: MapMarkerData) {
  // Always use default icon for unassigned/outfiltered markers
  let iconUrl = ICONS.default;

  // For delivery markers, keep numbered badge
  if (marker.type === "delivery" && marker.waypointIndex !== undefined) {
    return {
      icon: createNumberedIcon(iconUrl, marker.waypointIndex),
      opacity: 1.0,
    };
  }

  // Faded if filtered out
  const opacity = marker.matchesFilters === false ? 0.4 : 1.0;

  // Fallback for undefined iconUrl
  if (!iconUrl) {
    console.warn("Marker iconUrl is undefined for marker:", marker);
    iconUrl = ICONS.default;
  }

  return {
    icon: L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: ICONS.shadow,
      shadowSize: [41, 41],
    }),
    opacity,
  };
}
