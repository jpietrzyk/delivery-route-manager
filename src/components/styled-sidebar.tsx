import React, { useState } from "react";
import type { Order } from "@/types/order";
import { sampleOrders } from "@/types/order";
import { useMarkerHighlight } from "@/contexts/MarkerHighlightContext";
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

interface StyledSidebarProps {
  className?: string;
}

const StyledSidebar: React.FC<StyledSidebarProps> = ({ className = "" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();

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

    if (active.id !== over?.id) {
      setOrders((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Sortable Item Component
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
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: isDragging
              ? "#e0f2fe"
              : isHighlighted
              ? "#dbeafe"
              : "#f9fafb",
            border: `2px solid ${
              isDragging ? "#0284c7" : isHighlighted ? "#1d4ed8" : "#e5e7eb"
            }`,
            cursor: isDragging ? "grabbing" : "grab",
            transition: "all 0.2s",
            boxShadow: isDragging
              ? "0 8px 25px -8px rgba(2, 132, 199, 0.3)"
              : isHighlighted
              ? "0 4px 12px -2px rgba(29, 78, 216, 0.2)"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            transform: isDragging
              ? "rotate(2deg)"
              : isHighlighted
              ? "translateY(-1px)"
              : "none",
            position: "relative" as const,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              // Set the highlighted order ID in context
              setHighlightedOrderId(order.id);

              e.currentTarget.style.backgroundColor = isHighlighted
                ? "#dbeafe"
                : "#f3f4f6";
              e.currentTarget.style.borderColor = isHighlighted
                ? "#1d4ed8"
                : "#d1d5db";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = isHighlighted
                ? "0 4px 12px -2px rgba(29, 78, 216, 0.2)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }
            setHighlightedOrderId?.(order.id);
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              // Clear the highlighted order ID in context
              setHighlightedOrderId(null);

              e.currentTarget.style.backgroundColor = isHighlighted
                ? "#dbeafe"
                : "#f9fafb";
              e.currentTarget.style.borderColor = isHighlighted
                ? "#1d4ed8"
                : "#e5e7eb";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = isHighlighted
                ? "0 4px 12px -2px rgba(29, 78, 216, 0.2)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
            }
            setHighlightedOrderId?.(null);
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  fontWeight: "600",
                  minWidth: "20px",
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#111827",
                  lineHeight: "1.3",
                }}
              >
                {order.name}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                padding: "3px 8px",
                borderRadius: "12px",
                backgroundColor: getStatusColor(order.status).bg,
                color: getStatusColor(order.status).text,
                fontWeight: "600",
                whiteSpace: "nowrap",
                marginLeft: "8px",
              }}
            >
              {order.status.replace("-", " ").toUpperCase()}
            </span>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "6px",
              fontWeight: "500",
            }}
          >
            {order.customer}
          </div>
          {order.comment && (
            <div
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                fontStyle: "italic",
                lineHeight: "1.4",
                marginBottom: "8px",
              }}
            >
              {order.comment.length > 50
                ? `${order.comment.substring(0, 50)}...`
                : order.comment}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "6px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span>Priority: {order.priority.toUpperCase()}</span>
              <span style={{ fontSize: "10px" }}>ID: {order.id}</span>
              <span style={{ fontSize: "10px", color: "#059669" }}>
                📍 {order.location.lat.toFixed(4)},{" "}
                {order.location.lng.toFixed(4)}
              </span>
            </div>
            {order.totalAmount && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: "700",
                    color: "#111827",
                    fontSize: "12px",
                  }}
                >
                  €{order.totalAmount.toLocaleString()}
                </div>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>Total</div>
              </div>
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

      {/* Orders Section Only */}
      <nav style={{ flex: 1, padding: "8px" }}>
        {!collapsed && (
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
                📋 Orders
              </span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orders}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxHeight: "calc(100vh - 200px)",
                    overflowY: "auto",
                  }}
                >
                  {orders.map((order, index) => (
                    <SortableItem key={order.id} order={order} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
        {collapsed && (
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
              ORDERS
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

export default StyledSidebar;
