// Shared marker style logic for all map providers
import L from "leaflet";
import type { MapMarkerData } from "./map-data";
import type { MapFiltersState } from "../../../contexts/MapFiltersContextTypes";

// Marker icon URLs (should match across providers)
const ICONS = {
    waypoint: "/markers/marker-waypoint.svg",
  default: "/markers/unassigned-marker.svg",
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

export function getMarkerStyle(marker: MapMarkerData, filters?: MapFiltersState) {
  // Determine icon URL
  let iconUrl = ICONS.unassigned;

  // Color mapping for filter values (should match filter toggle button colors)
  const PRIORITY_COLORS = {
    low: ICONS.priorityLow,
    medium: ICONS.priorityMedium,
    high: ICONS.priorityHigh,
  };
  const STATUS_COLORS = {
    pending: ICONS.statusPending,
    "in-progress": ICONS.statusInProgress,
    completed: ICONS.statusCompleted,
    cancelled: ICONS.statusCancelled,
  };
  const AMOUNT_COLORS = {
    low: ICONS.amountLow,
    medium: ICONS.amountMedium,
    high: ICONS.amountHigh,
  };
  const COMPLEXITY_COLORS = {
    simple: ICONS.complexitySimple,
    moderate: ICONS.complexityModerate,
    complex: ICONS.complexityComplex,
  };

  // Special case: outfiltered markers always gray
  if (marker.type === "outfiltered") {
    iconUrl = ICONS.unassigned;
  } else if (marker.type === "unassigned") {
    if (filters) {
      // Complexity filters take precedence
      if (marker.product?.complexity !== undefined) {
        const complexityTier = marker.product.complexity === 1 ? "simple" : marker.product.complexity === 2 ? "moderate" : "complex";
        if (filters.complexityFilters[complexityTier as keyof typeof filters.complexityFilters]) {
          iconUrl = COMPLEXITY_COLORS[complexityTier as keyof typeof COMPLEXITY_COLORS] || ICONS.default;
        }
        // If not active, check other filters
        else if (filters.priorityFilters[marker.priority as keyof typeof filters.priorityFilters]) {
          iconUrl = PRIORITY_COLORS[marker.priority as keyof typeof PRIORITY_COLORS] || ICONS.default;
        } else if (filters.statusFilters[marker.status as keyof typeof filters.statusFilters]) {
          iconUrl = STATUS_COLORS[marker.status as keyof typeof STATUS_COLORS] || ICONS.default;
        } else if (marker.totalAmount !== undefined) {
          const amountTier = marker.totalAmount <= 300000 ? "low" : marker.totalAmount <= 1000000 ? "medium" : "high";
          if (filters.amountFilters[amountTier as keyof typeof filters.amountFilters]) {
            iconUrl = AMOUNT_COLORS[amountTier as keyof typeof AMOUNT_COLORS] || ICONS.default;
          } else {
            iconUrl = ICONS.unassigned;
          }
        } else {
          iconUrl = ICONS.unassigned;
        }
      } else if (filters.priorityFilters[marker.priority as keyof typeof filters.priorityFilters]) {
        iconUrl = PRIORITY_COLORS[marker.priority as keyof typeof PRIORITY_COLORS] || ICONS.default;
      } else if (filters.statusFilters[marker.status as keyof typeof filters.statusFilters]) {
        iconUrl = STATUS_COLORS[marker.status as keyof typeof STATUS_COLORS] || ICONS.default;
      } else if (marker.totalAmount !== undefined) {
        const amountTier = marker.totalAmount <= 300000 ? "low" : marker.totalAmount <= 1000000 ? "medium" : "high";
        if (filters.amountFilters[amountTier as keyof typeof filters.amountFilters]) {
          iconUrl = AMOUNT_COLORS[amountTier as keyof typeof AMOUNT_COLORS] || ICONS.default;
        } else {
          iconUrl = ICONS.unassigned;
        }
      } else {
        iconUrl = ICONS.unassigned;
      }
    } else {
      iconUrl = ICONS.unassigned;
    }
  } else {
    // For delivery markers, use color mapping based on marker properties
    if (marker.product?.complexity !== undefined) {
      // Use complexity color if available
      const complexityTier = marker.product.complexity === 1 ? "simple" : marker.product.complexity === 2 ? "moderate" : "complex";
      iconUrl = COMPLEXITY_COLORS[complexityTier as keyof typeof COMPLEXITY_COLORS] || ICONS.default;
    } else if (marker.priority && PRIORITY_COLORS[marker.priority as keyof typeof PRIORITY_COLORS]) {
      iconUrl = PRIORITY_COLORS[marker.priority as keyof typeof PRIORITY_COLORS] || ICONS.default;
    } else if (marker.status && STATUS_COLORS[marker.status as keyof typeof STATUS_COLORS]) {
      iconUrl = STATUS_COLORS[marker.status as keyof typeof STATUS_COLORS] || ICONS.default;
    } else if (marker.totalAmount !== undefined) {
      const amountTier = marker.totalAmount <= 300000 ? "low" : marker.totalAmount <= 1000000 ? "medium" : "high";
      iconUrl = AMOUNT_COLORS[amountTier as keyof typeof AMOUNT_COLORS] || ICONS.default;
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
