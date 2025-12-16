import React from "react";

interface DeliveryDriveSegmentProps {
  fromOrderId: string | number;
  toOrderId: string | number;
  driveMinutes: number;
  handlingMinutes: number;
}

export const DeliveryDriveSegment: React.FC<DeliveryDriveSegmentProps> = ({
  fromOrderId,
  toOrderId,
  driveMinutes,
  handlingMinutes,
}) => (
  <li
    key={`time-${fromOrderId}-${toOrderId}`}
    className="flex items-center justify-center text-xs text-muted-foreground/80"
  >
    ↳ czas przejazdu: {driveMinutes}min, obsługa:{handlingMinutes} min
  </li>
);
