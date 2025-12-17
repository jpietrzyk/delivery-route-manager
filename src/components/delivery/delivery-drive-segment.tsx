import React from "react";
import type { RouteSegment } from "@/types/map-provider";

interface DeliveryDriveSegmentProps {
  segment: RouteSegment;
  onRecalculate?: () => void;
  isCalculating?: boolean;
  onHover?: () => void;
}

export const DeliveryDriveSegment: React.FC<DeliveryDriveSegmentProps> = ({
  segment,
  onRecalculate,
  isCalculating = false,
  onHover,
}) => {
  const handleRecalculate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRecalculate?.();
  };

  const handleMouseEnter = () => {
    onHover?.();
  };

  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    return Math.round(seconds / 60).toString();
  };

  // Format distance from meters to kilometers
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(1);
  };

  return (
    <li
      key={`segment-${segment.id}`}
      className="flex items-center justify-center text-xs text-muted-foreground/80 py-1"
      onMouseEnter={handleMouseEnter}
    >
      {isCalculating ? (
        <span className="animate-pulse flex items-center gap-1">
          <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
          Calculating route...
        </span>
      ) : segment.routeData ? (
        <div className="flex items-center gap-2">
          <span>
            ↳ Drive: {formatDuration(segment.routeData.duration)}min, Distance:{" "}
            {formatDistance(segment.routeData.distance)}km
          </span>
          {segment.status === "failed" && (
            <span className="text-red-500 ml-2" title={segment.routeData.error}>
              ⚠️
            </span>
          )}
          <button
            onClick={handleRecalculate}
            className="text-blue-500 hover:text-blue-600 transition-colors"
            title="Recalculate route"
          >
            ⭯
          </button>
        </div>
      ) : (
        <span className="text-yellow-500 flex items-center gap-1">
          <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
          Route not calculated
        </span>
      )}
    </li>
  );
};
