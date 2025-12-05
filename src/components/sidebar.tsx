import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";

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
  const {
    addOrderToRoute,
    refreshOrders,
    setRouteOrders,
    routeOrders,
    availableOrders,
  } = useOrderRoute();
  const { highlightedOrderId, setHighlightedOrderId, highlightMarkerRef } =
    useMarkerHighlight();

  // Derive active and inactive orders from availableOrders
  const activeOrders = availableOrders.filter((order) => order.active);
  const inactiveOrders = availableOrders.filter((order) => !order.active);

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setHighlightedOrderId(null); // Clear any highlights during drag
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = routeOrders.findIndex((order) => order.id === active.id);
    const newIndex = routeOrders.findIndex((order) => order.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newRouteOrders = arrayMove(routeOrders, oldIndex, newIndex);
      setRouteOrders(newRouteOrders);
    }
  };

  // Handle order state change (checkbox toggle)
  const handleOrderStateChange = async (
    order: Order,
    newActiveState: boolean
  ) => {
    try {
      if (newActiveState) {
        // Activating: Update active status
        await OrdersApi.updateOrderActiveStatus(order.id, true);
        // Add to route
        addOrderToRoute({ ...order, active: true });
      } else {
        // Deactivating: Clear both active status and deliveryId (return to pool)
        await OrdersApi.updateOrder(order.id, {
          active: false,
          deliveryId: undefined,
        });
        // Remove from routeOrders
        setRouteOrders(routeOrders.filter((o) => o.id !== order.id));
      }

      // Refresh orders from API to update availableOrders in context
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order state:", error);
    }
  };

  // Order Item Component for Active Orders using dnd-kit
  const OrderItem = ({ order }: { order: Order }) => {
    const isHighlighted = highlightedOrderId === order.id;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: order.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    // Helper to format status color
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

    const statusColor = getStatusColor(order.status);

    return (
      <Tooltip open={isHighlighted && !isDragging}>
        <TooltipTrigger asChild>
          <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Item
              onMouseEnter={() => {
                setHighlightedOrderId(order.id);
                // Call the ref function directly (no re-renders!)
                if (highlightMarkerRef.current) {
                  highlightMarkerRef.current(order.id);
                }
              }}
              onMouseLeave={() => {
                setHighlightedOrderId(null);
                // Clear marker highlight
                if (highlightMarkerRef.current) {
                  highlightMarkerRef.current(null);
                }
              }}
              variant="default"
              size="sm"
              style={{
                cursor: "move",
                padding: "6px 10px",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: isDragging
                  ? "#e0f2fe"
                  : isHighlighted
                  ? "#d1fae5"
                  : "transparent",
                transition:
                  "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Toggle
                pressed={true}
                onPressedChange={(pressed) => {
                  if (!pressed) {
                    handleOrderStateChange(order, false);
                  }
                }}
                size="sm"
                className="shrink-0 h-6 w-6 p-0 data-[state=on]:bg-green-500 data-[state=on]:text-white hover:bg-green-100"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Toggle>
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
        </TooltipTrigger>
        <TooltipContent side="left" className="w-80 p-4 text-sm">
          <div className="space-y-2">
            <div className="font-bold text-base">{order.name}</div>
            <div className="text-muted-foreground">
              <strong>Customer:</strong> {order.customer}
            </div>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                }}
              >
                {order.status.toUpperCase()}
              </span>
            </div>
            <div>
              <strong>Priority:</strong> {order.priority.toUpperCase()}
            </div>
            <div className="text-green-600">
              <strong>📍 Location:</strong> {order.location.lat.toFixed(4)},{" "}
              {order.location.lng.toFixed(4)}
            </div>
            {order.totalAmount && (
              <div>
                <strong>Total:</strong> €{order.totalAmount.toLocaleString()}
              </div>
            )}
            {order.comment && (
              <div className="mt-2 pt-2 border-t text-muted-foreground italic">
                {order.comment}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
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
        <Toggle
          pressed={false}
          onPressedChange={(pressed) => {
            if (pressed) {
              handleOrderStateChange(order, true);
            }
          }}
          size="sm"
          className="shrink-0 h-6 w-6 p-0 data-[state=on]:bg-green-500 data-[state=on]:text-white hover:bg-green-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </Toggle>
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={routeOrders.map((order) => order.id)}
                strategy={verticalListSortingStrategy}
              >
                <ItemGroup className="gap-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {routeOrders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </ItemGroup>
              </SortableContext>
            </DndContext>
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
