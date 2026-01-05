import React from "react";
import { Badge } from "./badge";
import { pl } from "@/lib/translations";

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
      <span>
        {pl.totalOrders}: {count}
      </span>
    </Badge>
  );
};

export default OrdersCountDisplay;
