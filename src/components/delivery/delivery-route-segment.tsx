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
      className="delivery-route-segment bg-card/30 border-l-2 border-border/50 rounded p-1 ml-4 mb-1 hover:bg-card/50 transition-colors duration-200 flex items-center gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ArrowRight
        data-testid="connection-icon"
        className="h-4 w-4 text-muted-foreground shrink-0"
      />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Route className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium text-xs text-foreground truncate">
          {segment.routeData?.distance
            ? formatDistance(segment.routeData.distance)
            : "N/A"}
        </span>
        <span className="text-muted-foreground text-xs">|</span>
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium text-xs text-foreground truncate">
          {segment.routeData?.duration
            ? formatDuration(segment.routeData.duration)
            : "N/A"}
        </span>
      </div>
      <button
        onClick={handleRecalculate}
        disabled={isCalculating}
        className="p-1 hover:bg-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:text-primary"
        aria-label={isCalculating ? "Recalculating..." : "Refresh route"}
      >
        <RefreshCcw className="h-3 w-3" />
      </button>
    </div>
  );
};
