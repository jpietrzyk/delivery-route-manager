import type { Order } from "@/types/order";

// Helper function to get status colors (consistent with marker popups)
export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return { bg: "#fef3c7", text: "#92400e" };
    case "in-progress":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "completed":
      return { bg: "#d1fae5", text: "#065f46" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
};

// Create expanded tooltip content similar to marker popups
export const createExpandedTooltipContent = (order: Order) => {
  const statusColors = getStatusColor(order.status);

  return (
    <div className="p-4 max-w-[320px] bg-white/90 backdrop-blur-sm border border-border rounded-sm shadow-sm">
      <div className="font-semibold text-sm mb-3 text-foreground">
        {order.product?.name || "Unknown Order"} (ID: {order.id})
      </div>

      <div className="space-y-3 text-sm">
        {/* Customer */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">👤</span>
          <div>
            <div className="font-medium text-foreground">Customer</div>
            <div className="text-muted-foreground">{order.customer}</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">📋</span>
          <div>
            <div className="font-medium text-foreground">Status</div>
            <div
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text,
              }}
            >
              {order.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">⚡</span>
          <div>
            <div className="font-medium text-foreground">Priority</div>
            <div className="text-primary font-medium">{order.priority}</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground mt-0.5">📍</span>
          <div>
            <div className="font-medium text-foreground">Location</div>
            <div className="text-muted-foreground text-xs">
              Lat: {order.location.lat.toFixed(4)}, Lng:{" "}
              {order.location.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Product Details */}
        {order.product && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground mt-0.5">📦</span>
            <div>
              <div className="font-medium text-foreground">Product Details</div>
              <div className="text-muted-foreground text-xs line-clamp-2">
                {order.product.name} - €{order.product.price.toLocaleString()} |
                Complexity: {order.product.complexity} (≈
                {order.product.complexity * 30} min)
              </div>
            </div>
          </div>
        )}

        {/* Comment */}
        {order.comment && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground mt-0.5">💬</span>
            <div>
              <div className="font-medium text-foreground">Notes</div>
              <div className="text-muted-foreground text-xs italic line-clamp-2">
                {order.comment}
              </div>
            </div>
          </div>
        )}

        {/* Total Amount */}
        {order.totalAmount && (
          <div className="flex items-start gap-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground mt-0.5">💰</span>
            <div>
              <div className="font-medium text-foreground">Total Amount</div>
              <div className="text-green-600 font-medium">
                €{order.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
