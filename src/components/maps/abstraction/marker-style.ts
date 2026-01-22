// Shared marker style logic for all map providers
import L from "leaflet";
import type { MapMarkerData } from "./map-data";
import type { MapFiltersState } from "../../../contexts/MapFiltersContextTypes";

// Marker icon URLs (should match across providers)
const ICONS = {
  default: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  pool: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  highlight: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  current: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  previous: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  green: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  orange: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  violet: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  shadow: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

export function getMarkerStyle(marker: MapMarkerData, filters?: MapFiltersState) {
  // Determine icon URL
  let iconUrl = ICONS.pool;

  // Color mapping for filter values (should match filter toggle button colors)
  const PRIORITY_COLORS = {
    low: ICONS.green, // green-50
    medium: ICONS.orange, // orange/yellow-50
    high: ICONS.highlight, // red-50
  };
  const STATUS_COLORS = {
    pending: ICONS.current, // blue-50
    "in-progress": ICONS.violet, // purple-50
    completed: ICONS.green, // emerald-50
    cancelled: ICONS.pool, // gray-50
  };
  const AMOUNT_COLORS = {
    low: ICONS.current, // indigo-50
    medium: ICONS.violet, // purple-50
    high: ICONS.highlight, // pink-50 (use red for now)
  };
  const COMPLEXITY_COLORS = {
    simple: ICONS.green, // sky-50
    moderate: ICONS.previous, // amber-50 (yellow)
    complex: ICONS.highlight, // red-50
  };

  // Special case: outfiltered markers always gray
  if (marker.type === "outfiltered") {
    iconUrl = ICONS.pool;
  } else if (marker.type === "pool" || marker.type === "pool-high-value") {
    if (filters) {
      // Priority filters
      if (filters.priorityFilters[marker.priority as keyof typeof filters.priorityFilters]) {
        iconUrl = PRIORITY_COLORS[marker.priority as keyof typeof PRIORITY_COLORS] || ICONS.default;
      }
      // Status filters
      else if (filters.statusFilters[marker.status as keyof typeof filters.statusFilters]) {
        iconUrl = STATUS_COLORS[marker.status as keyof typeof STATUS_COLORS] || ICONS.default;
      }
      // Amount filters
      else if (marker.totalAmount !== undefined) {
        const amountTier = marker.totalAmount <= 300000 ? "low" : marker.totalAmount <= 1000000 ? "medium" : "high";
        if (filters.amountFilters[amountTier as keyof typeof filters.amountFilters]) {
          iconUrl = AMOUNT_COLORS[amountTier as keyof typeof AMOUNT_COLORS] || ICONS.default;
        }
      }
      // Complexity filters
      else if (marker.product?.complexity !== undefined) {
        const complexityTier = marker.product.complexity === 1 ? "simple" : marker.product.complexity === 2 ? "moderate" : "complex";
        if (filters.complexityFilters[complexityTier as keyof typeof filters.complexityFilters]) {
          iconUrl = COMPLEXITY_COLORS[complexityTier as keyof typeof COMPLEXITY_COLORS] || ICONS.default;
        }
      }
      // If no specific filter match, use default pool
      else {
        iconUrl = ICONS.pool;
      }
    } else {
      iconUrl = ICONS.pool;
    }
  } else {
    // For delivery markers, use default logic
    if (marker.isHighlighted) {
      iconUrl = ICONS.highlight;
    } else if (marker.isDisabled) {
      iconUrl = ICONS.pool;
    } else if (marker.isCurrentOrder) {
      iconUrl = ICONS.current;
    } else if (marker.isPreviousOrder) {
      iconUrl = ICONS.previous;
    } else {
      iconUrl = ICONS.default;
    }
  }

  // Attach waypoint index badge only for delivery markers with a known sequence
  if (marker.type === "delivery" && marker.waypointIndex !== undefined) {
    return {
      icon: createNumberedIcon(iconUrl, marker.waypointIndex),
      opacity: 1.0,
    };
  }

  // Faded if filtered out
  const opacity = marker.matchesFilters === false ? 0.4 : 1.0;

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
