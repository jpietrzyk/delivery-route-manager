import React from "react";
import type { RouteSegment } from "@/types/map-provider";
import type { RouteManager } from "@/services/RouteManager";
import { RefreshCcw, Route, Clock, ArrowRight } from "lucide-react";

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
      return `${hours} h ${minutes} m`;
    } else {
      return `${minutes} m`;
    }
  };

  // Format distance from meters to kilometers
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(2) + " km";
  };

  return (
    <div
      className="delivery-route-segment bg-card/50 rounded-lg p-2 mb-1 hover:bg-card transition-colors duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between gap-2">
        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">
            Route Segment:{" "}
            <span className="font-medium text-foreground">{segment.id}</span>
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {segment.routeData?.distance
                  ? formatDistance(segment.routeData.distance)
                  : "Nie dostępna"}
              </span>
              <span className="text-muted-foreground">|</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
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
            className="p-2 hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:text-primary"
            aria-label={isCalculating ? "Recalculating..." : "Refresh route"}
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
