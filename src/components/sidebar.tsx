import React, { useState, useEffect } from "react";
import type { Order } from "@/types/order";
import { OrdersApi } from "@/services/ordersApi";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";


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
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
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
    const isHighlighted = highlightedOrderId === order.id;
    const isBeingDragged = draggedItemId === order.id;

    const handleDragStart = (e: React.DragEvent) => {
      setDraggedItemId(order.id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ order, index, type: "active" })
      );
    };
    const handleDragEnd = () => {
      setDraggedItemId(null);
    };
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
    const handleDragLeave = () => {};
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (dragData.type === "active" && dragData.index !== index) {
          const newActiveOrders = [...activeOrders];
          const [draggedOrder] = newActiveOrders.splice(dragData.index, 1);
          newActiveOrders.splice(index, 0, draggedOrder);
          setActiveOrders(newActiveOrders);
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }
      setDraggedItemId(null);
    };
    return (
      <Item
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        variant="default"
        size="sm"
        onMouseEnter={() => setHighlightedOrderId(order.id)}
        onMouseLeave={() => setHighlightedOrderId(null)}
        style={{
          cursor: "move",
          opacity: isBeingDragged ? 0.4 : 1,
          padding: "6px 10px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: isHighlighted ? "#f5f5f5" : "transparent",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <input
          type="checkbox"
          checked={true}
          onChange={() => handleOrderStateChange(order, false)}
          className="h-4 w-4 shrink-0 cursor-pointer"
        />
        <ItemContent className="flex-1">
          <ItemTitle className="text-xs font-semibold text-foreground">
            {trimCustomerName(order.customer)}
          </ItemTitle>
          <ItemDescription className="text-xs text-muted-foreground font-medium">
            {order.name.slice(0, 15)}
          </ItemDescription>
        </ItemContent>
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
    const isBeingDragged = draggedItemId === order.id;
    const handleDragStart = (e: React.DragEvent) => {
      setDraggedItemId(order.id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ order, index, type: "inactive" })
      );
    };
    const handleDragEnd = () => {
      setDraggedItemId(null);
    };
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
    const handleDragLeave = () => {};
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (dragData.type === "inactive" && dragData.index !== index) {
          const newInactiveOrders = [...inactiveOrders];
          const [draggedOrder] = newInactiveOrders.splice(dragData.index, 1);
          newInactiveOrders.splice(index, 0, draggedOrder);
          setInactiveOrders(newInactiveOrders);
        }
      } catch (error) {
        console.error("Error handling drop:", error);
      }
      setDraggedItemId(null);
    };
    return (
      <Item
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        variant="default"
        size="sm"
        style={{
          cursor: "move",
          opacity: isBeingDragged ? 0.4 : 0.7,
          padding: "6px 10px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "transparent",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <input
          type="checkbox"
          checked={false}
          onChange={() => handleOrderStateChange(order, true)}
          className="h-4 w-4 shrink-0 cursor-pointer"
        />
        <ItemContent className="flex-1">
          <ItemTitle className="text-xs font-semibold text-muted-foreground">
            {trimCustomerName(order.customer)}
          </ItemTitle>
          <ItemDescription className="text-xs text-muted-foreground font-medium">
            {order.name.slice(0, 15)}
          </ItemDescription>
        </ItemContent>
      </Item>
    );
  };

  // Inline styles to ensure visibility
  const sidebarStyle = {
    width: collapsed ? "80px" : "400px",
    height: "100vh",
    backgroundColor: "#fafafa",
    borderLeft: "1px solid #f0f0f0",
    boxShadow: "none",
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
          borderBottom: "1px solid #f0f0f0",
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
          borderTop: "1px solid #f0f0f0",
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
