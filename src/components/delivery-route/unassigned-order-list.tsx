import React from "react";
import type { Order } from "@/types/order";
import { pl } from "@/lib/translations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface UnassignedOrderListProps {
  unassignedOrders: Order[];
  onAddToDelivery: (orderId: string) => void;
  title?: string;
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (orderId: string | null) => void;
}

export const UnassignedOrderList: React.FC<UnassignedOrderListProps> = ({
  unassignedOrders,
  onAddToDelivery,
  title = pl.availableUnassignedOrders,
  highlightedOrderId,
  setHighlightedOrderId,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="font-semibold text-sm mb-4 text-foreground/70">
        {title}
      </div>
      <div>
        {unassignedOrders.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {pl.noUnassignedOrders}
          </div>
        ) : (
          <div className="bg-card/50 rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50 hover:bg-muted/50">
                  <TableHead className="font-semibold text-foreground/80 w-[20%]">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Priority
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Location
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Created
                  </TableHead>
                  <TableHead className="font-semibold text-foreground/80">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedOrders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className={`border-border/30 ${
                      index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                    } ${
                      highlightedOrderId === order.id
                        ? "bg-blue-50/80 border-blue-200/50"
                        : "hover:bg-muted/40"
                    }`}
                    onMouseEnter={() => setHighlightedOrderId?.(order.id)}
                    onMouseLeave={() => setHighlightedOrderId?.(null)}
                  >
                    <TableCell className="font-medium text-foreground w-[20%]">
                      {order.customer?.name || `Order ${order.id || "?"}`}
                    </TableCell>
                    <TableCell className="text-foreground/80">
                      {order.customer?.name || "?"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getPriorityColor(String(order.priority))} border-0`}
                      >
                        {order.priority ?? "?"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(String(order.status))} border-0`}
                      >
                        {order.status ?? "?"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-foreground/80">
                      €
                      {typeof order.totalAmount === "number"
                        ? order.totalAmount.toLocaleString()
                        : order.totalAmount || "0"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground/70">
                      {order.location?.lat !== undefined &&
                      order.location?.lng !== undefined
                        ? `${order.location.lat.toFixed(4)}, ${order.location.lng.toFixed(4)}`
                        : "?"}
                    </TableCell>
                    <TableCell className="text-foreground/70 text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "?"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToDelivery(order.id);
                        }}
                        aria-label={`Add order ${order.id} to delivery`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
