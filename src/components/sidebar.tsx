import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import type { Order } from "@/types/order";
import { OrdersApi } from "@/services/ordersApi";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";
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
  const [isRecalculatingRoute, setIsRecalculatingRoute] = useState(false);
  const {
    addOrderToRoute,
    refreshOrders,
    setRouteOrders,
    routeOrders,
    availableOrders,
  } = useOrderRoute();
  const {
    highlightedOrderId,
    setHighlightedOrderId,
    isDragging,
    setIsDragging,
  } = useMarkerHighlight();

  // Derive active and inactive orders from availableOrders
  const activeOrders = availableOrders.filter((order) => order.active);
  const inactiveOrders = availableOrders.filter((order) => !order.active);

  // Handle drag start - prevent other updates during drag
  const handleDragStart = () => {
    setIsDragging(true);
    setHighlightedOrderId(null); // Clear any highlights during drag
  };

  // Handle drag end for reordering active orders
  const handleDragEnd = (result: DropResult) => {
    // Always reset dragging state first, regardless of the result
    setIsDragging(false);

    // If dropped outside the list or no destination, just exit
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // If dropped in the same position, no need to update
    if (sourceIndex === destinationIndex) {
      return;
    }

    // Reorder routeOrders directly (not activeOrders)
    const newRouteOrders = Array.from(routeOrders);
    const [reorderedItem] = newRouteOrders.splice(sourceIndex, 1);
    newRouteOrders.splice(destinationIndex, 0, reorderedItem);

    // Lock drag-and-drop while route is recalculating
    setIsRecalculatingRoute(true);

    // Update route orders with the new sequence
    setRouteOrders(newRouteOrders);

    // Unlock after route calculation with a small delay for rendering
    setTimeout(() => {
      setIsRecalculatingRoute(false);
    }, 500);
  };

  // Remove the fetchOrders function - we now use availableOrders from context
  // Remove the useEffect that called fetchOrders - orders come from context

  // Handle order state change (checkbox toggle)
  const handleOrderStateChange = async (
    order: Order,
    newActiveState: boolean
  ) => {
    // Prevent checkbox changes during drag
    if (isDragging) {
      return;
    }

    try {
      // Update the order status in the API
      await OrdersApi.updateOrderActiveStatus(order.id, newActiveState);

      if (newActiveState) {
        // Add to route
        addOrderToRoute({ ...order, active: true });
      }

      // Refresh orders from API to update availableOrders in context
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order state:", error);
    }
  };

  // Order Item Component for Active Orders
  const OrderItem = ({ order, index }: { order: Order; index: number }) => {
    const isHighlighted = highlightedOrderId === order.id;

    return (
      <Draggable
        draggableId={order.id}
        index={index}
        isDragDisabled={isRecalculatingRoute}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1,
            }}
          >
            <Item
              onMouseEnter={() => {
                // Don't update highlights during or immediately after drag
                if (!isDragging && !isRecalculatingRoute) {
                  setHighlightedOrderId(order.id);
                }
              }}
              onMouseLeave={() => {
                // Don't update highlights during or immediately after drag
                if (!isDragging && !isRecalculatingRoute) {
                  setHighlightedOrderId(null);
                }
              }}
              variant="default"
              size="sm"
              style={{
                cursor: "move",
                padding: "6px 10px",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: snapshot.isDragging
                  ? "#e0f2fe"
                  : isHighlighted
                  ? "#d1fae5"
                  : "transparent",
                transition:
                  "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                  {order.name.slice(0, 40)}
                </ItemDescription>
              </ItemContent>
            </Item>
          </div>
        )}
      </Draggable>
    );
  };

  // Order Item Component for Inactive Orders
  const InactiveOrderItem = ({ order }: { order: Order }) => {
    return (
      <Item
        variant="default"
        size="sm"
        style={{
          cursor: "default",
          opacity: 0.7,
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
              🚚
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
              Delivery Plan
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
                🚚 Delivery Route
              </span>
            </div>
            <DragDropContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Droppable
                droppableId="active-orders"
                isDropDisabled={isRecalculatingRoute}
              >
                {(provided, snapshot) => (
                  <ItemGroup
                    className="gap-1 max-h-[calc(100vh-200px)] overflow-y-auto"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? "#f0f9ff"
                        : "transparent",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {routeOrders.map((order, index) => (
                      <OrderItem key={order.id} order={order} index={index} />
                    ))}
                    {provided.placeholder}
                  </ItemGroup>
                )}
              </Droppable>
            </DragDropContext>
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
        {!collapsed && (
          <div style={{ flex: 1, textAlign: "center" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              © PFS 2025
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
