import React, { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { pl } from "@/lib/translations";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrdersCountDisplayProps {
  count: number;
  totalCount: number;
  className?: string;
  onResetFilters?: () => void;
}

export function BackToDeliveriesLink() {
  return (
    <Link
      to="/delivery_routes"
      className="inline-flex items-center gap-2 border border-border/50 bg-background/50 hover:bg-accent/50 text-sm font-medium px-3 py-2 rounded shadow-sm transition-colors h-9"
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
  );
}

const OrdersCountDisplay: React.FC<OrdersCountDisplayProps> = ({
  count,
  totalCount,
  className = "",
  onResetFilters,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    onResetFilters?.();
    setShowResetDialog(false);
  };

  if (onResetFilters) {
    return (
      <>
        <Button
          onClick={() => setShowResetDialog(true)}
          className="border border-border/50 bg-background/50 hover:bg-accent/50 text-sm font-medium px-3 py-2 rounded shadow-sm transition-colors inline-flex items-center gap-1 h-9"
          variant="ghost"
        >
          Zamówienia: {count} / {totalCount}
        </Button>

        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>{pl.resetFiltersTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {pl.resetFiltersDescription}
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>{pl.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                {pl.resetFilters}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

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
