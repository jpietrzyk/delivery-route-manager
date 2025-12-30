import React from "react";
import { Badge } from "./badge";

interface OrdersCountDisplayProps {
  count: number;
  className?: string;
}

const OrdersCountDisplay: React.FC<OrdersCountDisplayProps> = ({
  count,
  className = "",
}) => {
  return (
    <Badge
      variant="secondary"
      className={`text-sm font-medium gap-1 ${className}`}
    >
      <span>📦 Total Orders: {count}</span>
    </Badge>
  );
};

export default OrdersCountDisplay;
