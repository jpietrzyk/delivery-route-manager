// @ts-ignore
import markerColors from "./marker-colors.json";
/**
 * Map Configuration
 *
 * Centralized configuration for map-related settings
 */

export const mapConfig = {
  unassignedMarkers: {
    useBitmap: false,
  },
  markerColors: markerColors,
  deliveryMarkers: {
    // Future: Add delivery marker config here if needed
  },
} as const;

export type MapConfig = typeof mapConfig;
