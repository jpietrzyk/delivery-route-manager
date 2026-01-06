import React from "react";
import { Badge } from "./badge";
import { pl } from "@/lib/translations";
import { Link } from "react-router-dom";

interface OrdersCountDisplayProps {
  count: number;
  className?: string;
}

const OrdersCountDisplay: React.FC<OrdersCountDisplayProps> = ({
  count,
  className = "",
}) => {
  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <Link
        to="/delivery_routes"
        className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium px-3 py-2 rounded shadow-md transition-colors"
        title={pl.backToDeliveries}
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        {pl.backToDeliveries}
      </Link>
      <Badge variant="secondary" className={`text-sm font-medium gap-1`}>
        <span>
          {pl.totalOrders}: {count}
        </span>
      </Badge>
    </div>
  );
};

export default OrdersCountDisplay;
