import React, { useState, useEffect } from "react";
import type { Order } from "@/types/order";
import { OrdersApi } from "@/services/ordersApi";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";

// Utility function to trim product names for compact display
const trimProductName = (name: string, maxLength: number = 25): string => {
  if (name.length <= maxLength) return name;

  // Try to find good break points
  const words = name.split(" ");

  // If it's a dimension + description pattern (like "3x5 spad do tyłu...")
  if (words.length >= 3 && /^\d+x\d+/.test(words[0])) {
    const dimension = words[0];
    const type = words.slice(1, 3).join(" "); // Take first 2 words after dimension
    return `${dimension} ${type}...`;
  }

  // For very long names, take first few words
  const shortWords = words.slice(0, 4);
  return shortWords.join(" ") + "...";
};

// Utility function to trim customer names
const trimCustomerName = (name: string, maxLength: number = 15): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 1) + ".";
};

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "", children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [inactiveOrders, setInactiveOrders] = useState<Order[]>([]);
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const { addOrderToRoute, refreshOrders } = useOrderRoute();

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await OrdersApi.getAllOrders();
        const active = fetchedOrders.filter((order) => order.active);
        const inactive = fetchedOrders.filter((order) => !order.active);
        setActiveOrders(active);
        setInactiveOrders(inactive);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Helper function to get status colors
  const getStatusColor = (status: Order["status"]) => {
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

  // Handle order state change (checkbox toggle)
  const handleOrderStateChange = async (
    order: Order,
    newActiveState: boolean
  ) => {
    try {
      // Update the order status in the API
      await OrdersApi.updateOrderActiveStatus(order.id, newActiveState);

      if (newActiveState) {
        // Move from inactive to active
        setInactiveOrders((prev) => prev.filter((o) => o.id !== order.id));
        setActiveOrders((prev) => [...prev, { ...order, active: true }]);
        // Add to route
        addOrderToRoute({ ...order, active: true });
      } else {
        // Move from active to inactive
        setActiveOrders((prev) => prev.filter((o) => o.id !== order.id));
        setInactiveOrders((prev) => [...prev, { ...order, active: false }]);
        // Remove from route by refreshing orders (routeOrders will filter out inactive)
      }

      // Refresh the OrderRouteProvider's orders to update routeOrders
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order state:", error);
    }
  };

  // Order Item Component for Active Orders
  const OrderItem = ({ order, index }: { order: Order; index: number }) => {
    // Check if this order is currently highlighted
    const isHighlighted = highlightedOrderId === order.id;
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
      setIsDragging(true);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({ order, index, type: "active" }));
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        // Only allow reordering within active orders
        if (dragData.type === "active" && dragData.index !== index) {
          // Reorder active orders
          const newActiveOrders = [...activeOrders];
          const [draggedOrder] = newActiveOrders.splice(dragData.index, 1);
          newActiveOrders.splice(index, 0, draggedOrder);
          setActiveOrders(newActiveOrders);
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }
      setIsDragging(false);
    };

    return (
      <Item
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        variant={isHighlighted ? "default" : "muted"}
        size="sm"
        onMouseEnter={() => setHighlightedOrderId(order.id)}
        onMouseLeave={() => setHighlightedOrderId(null)}
        style={{ 
          cursor: "move",
          opacity: isDragging ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <ItemMedia>
          <Switch
            checked={true}
            onCheckedChange={() => handleOrderStateChange(order, false)}
            className="scale-75"
          />
          <span className="text-xs text-muted-foreground font-semibold min-w-4">
            {index + 1}
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-sm font-semibold text-foreground">
            {trimProductName(order.name)}
          </ItemTitle>
          <ItemDescription className="text-xs text-muted-foreground font-medium">
            {trimCustomerName(order.customer)}
          </ItemDescription>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Pri: {order.priority.toUpperCase()} | ID: {order.id}
            </span>
            {order.totalAmount && (
              <span className="font-semibold text-foreground">
                €{order.totalAmount.toLocaleString()}
              </span>
            )}
          </div>
        </ItemContent>
        <ItemActions>
          <span
            className="text-xs px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap"
            style={{
              backgroundColor: getStatusColor(order.status).bg,
              color: getStatusColor(order.status).text,
            }}
          >
            {order.status.replace("-", " ").toUpperCase()}
          </span>
        </ItemActions>
      </Item>
    );
  };

  // Order Item Component for Inactive Orders
  const InactiveOrderItem = ({
    order,
    index,
  }: {
    order: Order;
    index: number;
  }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
      setIsDragging(true);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({ order, index, type: "inactive" }));
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        // Only allow reordering within inactive orders
        if (dragData.type === "inactive" && dragData.index !== index) {
          // Reorder inactive orders
          const newInactiveOrders = [...inactiveOrders];
          const [draggedOrder] = newInactiveOrders.splice(dragData.index, 1);
          newInactiveOrders.splice(index, 0, draggedOrder);
          setInactiveOrders(newInactiveOrders);
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }
      setIsDragging(false);
    };

    return (
      <Item
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        variant="muted"
        size="sm"
        className="opacity-70"
        style={{ 
          cursor: "move",
          opacity: isDragging ? 0.35 : 0.7,
          transition: "opacity 0.2s",
        }}
      >
        <ItemMedia>
          <Switch
            checked={false}
            onCheckedChange={() => handleOrderStateChange(order, true)}
            className="scale-75"
          />
          <span className="text-xs text-muted-foreground font-semibold min-w-3.5">
            {activeOrders.length + index + 1}
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-sm font-semibold text-muted-foreground">
            {trimProductName(order.name, 20)}
          </ItemTitle>
        </ItemContent>
        <ItemActions>
          <span className="text-xs px-1 py-0.5 rounded bg-destructive/10 text-destructive font-semibold whitespace-nowrap">
            INACTIVE
          </span>
        </ItemActions>
      </Item>
    );
  };

  // Inline styles to ensure visibility
  const sidebarStyle = {
    width: collapsed ? "128px" : "512px",
    height: "100vh",
    backgroundColor: "#ffffff",
    borderLeft: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: "width 0.3s ease-in-out",
    display: "flex",
    flexDirection: "column" as const,
    position: "fixed" as const,
    right: 0,
    top: 0,
    zIndex: 9999,
  };

  const buttonStyle = {
    width: "32px",
    height: "32px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={sidebarStyle} className={className}>
      {/* Header */}
      <div
        style={{
          height: "64px",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              P
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
              PFS Maps
            </h2>
          </div>
        )}
        <button
          style={buttonStyle}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f3f4f6")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Content Section */}
      <nav style={{ flex: 1, padding: "8px" }}>
        {!collapsed && children ? (
          <div style={{ height: "100%" }}>{children}</div>
        ) : !collapsed ? (
          <>
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#111827",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📋 Active Orders
              </span>
            </div>
            <ItemGroup 
              className="gap-1 max-h-[calc(50vh-120px)] overflow-y-auto"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                // Drop handling will be managed at individual item level or can be extended
              }}
            >
              {activeOrders.map((order, index) => (
                <OrderItem key={order.id} order={order} index={index} />
              ))}
            </ItemGroup>
            {inactiveOrders.length > 0 && (
              <>
                <div style={{ marginTop: "16px", marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Inactive Orders
                  </span>
                </div>
                <ItemGroup 
                  className="gap-0.5 max-h-[calc(50vh-80px)] overflow-y-auto"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    // Drop handling will be managed at individual item level or can be extended
                  }}
                >
                  {inactiveOrders.map((order, index) => (
                    <InactiveOrderItem
                      key={order.id}
                      order={order}
                      index={index}
                    />
                  ))}
                </ItemGroup>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              paddingTop: "16px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              ROUTE
            </span>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#d1d5db",
            color: "#374151",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          JD
        </div>
        {!collapsed && (
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "500",
                margin: 0,
                color: "#111827",
              }}
            >
              John Doe
            </p>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              john.doe@profistahl.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
