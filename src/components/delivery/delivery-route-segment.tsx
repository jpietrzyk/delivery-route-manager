import React from "react";
import type { RouteSegment } from "@/types/map-provider";
import type { RouteManager } from "@/services/RouteManager";
import { RefreshCcw } from "lucide-react";

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

  // Format duration from seconds to hours and minutes
  const formatDuration = (seconds: number): string => {
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} hours ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  };

  // Format distance from meters to kilometers
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2) + " km";
  };

  return (
    <div
      className="delivery-route-segment bg-card rounded-lg border border-border p-3 mb-2 shadow-sm hover:shadow-md transition-shadow duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">
            Route Segment:{" "}
            <span className="font-medium text-foreground">{segment.id}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium text-foreground">
                {segment.routeData?.distance
                  ? formatDistance(segment.routeData.distance)
                  : "Nie dostępna"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium text-foreground">
                {segment.routeData?.duration
                  ? formatDuration(segment.routeData.duration)
                  : "Nie dostępna"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isCalculating ? "Recalculating..." : "Refresh route"}
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
