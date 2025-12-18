import React from "react";
import type { RouteSegment } from "@/types/map-provider";
import type { RouteManager } from "@/services/RouteManager";

interface DeliveryRouteSegmentProps {
  segment: RouteSegment;
  onRecalculate?: () => void;
  isCalculating?: boolean;
  onHover?: () => void;
  routeManager?: RouteManager;
}

export const DeliveryRouteSegment: React.FC<DeliveryRouteSegmentProps> = ({
  segment,
  onRecalculate,
  isCalculating = false,
  onHover,
  routeManager,
}) => {
  const handleRecalculate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRecalculate?.();
  };

  const handleMouseEnter = () => {
    onHover?.();
    if (routeManager) {
      routeManager.highlightSegment(segment.id);
    }
  };

  const handleMouseLeave = () => {
    if (routeManager) {
      routeManager.unhighlightSegment(segment.id);
    }
  };

  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    return Math.round(seconds / 60).toString();
  };

  // Format distance from meters to kilometers
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2) + " km";
  };

  return (
    <div
      className="delivery-route-segment"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>Segment ID: {segment.id}</div>
      <div>
        Start: {segment.fromOrder.location.lat.toFixed(6)},{" "}
        {segment.fromOrder.location.lng.toFixed(6)}
      </div>
      <div>
        End: {segment.toOrder.location.lat.toFixed(6)},{" "}
        {segment.toOrder.location.lng.toFixed(6)}
      </div>
      <div>
        Duration:{" "}
        {segment.duration
          ? formatDuration(segment.duration) + " min"
          : "Nie dostępna"}
      </div>
      <div>
        Distance:{" "}
        {segment.routeData?.distance
          ? formatDistance(segment.routeData.distance)
          : "Nie dostępna"}
      </div>
      <button onClick={handleRecalculate} disabled={isCalculating}>
        {isCalculating ? "Recalculating..." : "Recalculate"}
      </button>
    </div>
  );
};
