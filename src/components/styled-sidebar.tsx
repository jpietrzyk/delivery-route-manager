import React, { useState } from "react";
import type { Order } from "@/types/order";
import { sampleOrders } from "@/types/order";

interface StyledSidebarProps {
  className?: string;
}

const StyledSidebar: React.FC<StyledSidebarProps> = ({ className = "" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedItem(orderId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetOrderId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetOrderId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = orders.findIndex((order) => order.id === draggedItem);
    const targetIndex = orders.findIndex((order) => order.id === targetOrderId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const newOrders = [...orders];
    const draggedOrder = newOrders[draggedIndex];

    // Remove the dragged item
    newOrders.splice(draggedIndex, 1);

    // Insert at the new position
    const insertIndex = draggedIndex < targetIndex ? targetIndex : targetIndex;
    newOrders.splice(insertIndex, 0, draggedOrder);

    setOrders(newOrders);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
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
                <div
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, order.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor:
                      draggedItem === order.id ? "#e0f2fe" : "#f9fafb",
                    border: `2px solid ${
                      draggedItem === order.id ? "#0284c7" : "#e5e7eb"
                    }`,
                    cursor: "grab",
                    transition: "all 0.2s",
                    boxShadow:
                      draggedItem === order.id
                        ? "0 8px 25px -8px rgba(2, 132, 199, 0.3)"
                        : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                    opacity: draggedItem === order.id ? 0.8 : 1,
                    transform:
                      draggedItem === order.id ? "rotate(2deg)" : "none",
                    position: "relative" as const,
                  }}
                  onMouseEnter={(e) => {
                    if (draggedItem !== order.id) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (draggedItem !== order.id) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px 0 rgba(0, 0, 0, 0.1)";
                    }
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
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
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>Priority: {order.priority.toUpperCase()}</span>
                      <span style={{ fontSize: "10px" }}>ID: {order.id}</span>
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
                        <div style={{ fontSize: "10px", color: "#6b7280" }}>
                          Total
                        </div>
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
                      color: draggedItem === order.id ? "#0284c7" : "#d1d5db",
                      opacity: draggedItem === order.id ? 1 : 0.6,
                      transition: "color 0.2s",
                      pointerEvents: "none" as const,
                    }}
                  >
                    ⋮⋮
                  </div>
                </div>
              ))}
            </div>
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
