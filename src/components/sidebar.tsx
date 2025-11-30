import React, { useState, useEffect } from "react";
import type { Order } from "@/types/order";
import { OrdersApi } from "@/services/ordersApi";
import { useMarkerHighlight } from "@/hooks/useMarkerHighlight";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "", children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [inactiveOrders, setInactiveOrders] = useState<Order[]>([]);
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const { addOrderToRoute } = useOrderRoute();

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

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Find the dragged order
    const draggedOrder = [...activeOrders, ...inactiveOrders].find(
      (order) => order.id === active.id
    );

    if (!draggedOrder) return;

    // Check if it's being dropped in the active orders area
    const isDroppedInActiveArea =
      activeOrders.some((order) => order.id === over.id) ||
      over.id === "active-drop-zone";

    if (isDroppedInActiveArea && !draggedOrder.active) {
      // Update the order status in the API
      OrdersApi.updateOrderActiveStatus(draggedOrder.id, true)
        .then((updatedOrder) => {
          if (updatedOrder) {
            // Remove from inactive and add to active
            setInactiveOrders((prev) =>
              prev.filter((order) => order.id !== draggedOrder.id)
            );
            setActiveOrders((prev) => [...prev, updatedOrder]);

            // Add to route
            addOrderToRoute(updatedOrder);
          }
        })
        .catch((error) => {
          console.error("Failed to activate order:", error);
        });
    } else if (active.id !== over.id) {
      // Handle reordering within active orders
      setActiveOrders((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  // Sortable Item Component for Active Orders
  const SortableItem = ({ order, index }: { order: Order; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: order.id });

    // Check if this order is currently highlighted
    const isHighlighted = highlightedOrderId === order.id;

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="sortable-item"
        {...attributes}
        {...listeners}
      >
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            backgroundColor: isHighlighted ? "#dbeafe" : "#f9fafb",
            border: `1px solid ${isHighlighted ? "#1d4ed8" : "#e5e7eb"}`,
            cursor: isDragging ? "grabbing" : "grab",
            transition: "all 0.2s",
            position: "relative" as const,
          }}
          onMouseEnter={() => setHighlightedOrderId(order.id)}
          onMouseLeave={() => setHighlightedOrderId(null)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "9px",
                  color: "#9ca3af",
                  fontWeight: "600",
                  minWidth: "16px",
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                {order.name}
              </span>
            </div>
            <span
              style={{
                fontSize: "9px",
                padding: "2px 6px",
                borderRadius: "8px",
                backgroundColor: getStatusColor(order.status).bg,
                color: getStatusColor(order.status).text,
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              {order.status.replace("-", " ").toUpperCase()}
            </span>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              marginBottom: "4px",
              fontWeight: "500",
            }}
          >
            {order.customer}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "10px",
              color: "#6b7280",
            }}
          >
            <span>
              Pri: {order.priority.toUpperCase()} | ID: {order.id}
            </span>
            {order.totalAmount && (
              <span style={{ fontWeight: "600", color: "#111827" }}>
                €{order.totalAmount.toLocaleString()}
              </span>
            )}
          </div>
          {/* Drag handle indicator */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              fontSize: "12px",
              color: isDragging ? "#0284c7" : "#d1d5db",
              opacity: isDragging ? 1 : 0.6,
              transition: "color 0.2s",
              pointerEvents: "none" as const,
            }}
          >
            ⋮⋮
          </div>
        </div>
      </div>
    );
  };

  // Sortable Item Component for Inactive Orders
  const InactiveSortableItem = ({
    order,
    index,
  }: {
    order: Order;
    index: number;
  }) => {
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
      opacity: isDragging ? 0.8 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="sortable-item"
        {...attributes}
        {...listeners}
      >
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            cursor: isDragging ? "grabbing" : "grab",
            transition: "all 0.2s",
            position: "relative" as const,
            opacity: 0.7,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: "#9ca3af",
                  fontWeight: "600",
                  minWidth: "16px",
                }}
              >
                {activeOrders.length + index + 1}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {order.name}
              </span>
            </div>
            <span
              style={{
                fontSize: "9px",
                padding: "2px 6px",
                borderRadius: "8px",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                fontWeight: "600",
                whiteSpace: "nowrap",
              }}
            >
              INACTIVE
            </span>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              marginBottom: "4px",
              fontWeight: "500",
            }}
          >
            {order.customer}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
            }}
          >
            Pri: {order.priority.toUpperCase()} | ID: {order.id}
          </div>
          {/* Drag handle indicator */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              fontSize: "12px",
              color: isDragging ? "#0284c7" : "#d1d5db",
              opacity: isDragging ? 1 : 0.6,
              transition: "color 0.2s",
              pointerEvents: "none" as const,
            }}
          >
            ⋮⋮
          </div>
        </div>
      </div>
    );
  };

  // Inline styles to ensure visibility
  const sidebarStyle = {
    width: collapsed ? "64px" : "256px",
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={[...activeOrders, ...inactiveOrders]}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxHeight: "calc(50vh - 150px)",
                    overflowY: "auto",
                  }}
                >
                  {activeOrders.map((order, index) => (
                    <SortableItem key={order.id} order={order} index={index} />
                  ))}
                </div>
              </SortableContext>
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      maxHeight: "calc(50vh - 150px)",
                      overflowY: "auto",
                    }}
                  >
                    {inactiveOrders.map((order, index) => (
                      <InactiveSortableItem
                        key={order.id}
                        order={order}
                        index={index}
                      />
                    ))}
                  </div>
                </>
              )}
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
