/**
 * Shared Order Popup Content Component
 * Used by both Leaflet and Mapy.cz map adapters for consistent popup styling
 */
import React from "react";
import type { Order } from "@/types/order";
import { pl } from "@/lib/translations";

interface OrderPopupContentProps {
  order: Order;
  isPool: boolean;
  onToggle: () => void;
  toggleText: string;
}

const getStatusColor = (status: string) => {
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

export const OrderPopupContent: React.FC<OrderPopupContentProps> = ({
  order,
  isPool,
  onToggle,
  toggleText,
}) => {
  const statusColors = getStatusColor(order.status);
  const buttonColor = isPool ? "#10b981" : "#ef4444";

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "280px",
        fontFamily: "system-ui, sans-serif",
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Header with Order ID */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "12px",
          borderBottom: "2px solid #f3f4f6",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#1f2937",
          }}
        >
          {order.id}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "600",
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor: statusColors.bg,
            color: statusColors.text,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Order/Product Name */}
      <div
        style={{
          fontWeight: "600",
          marginBottom: "12px",
          fontSize: "15px",
          color: "#111827",
        }}
      >
        {order.product?.name || pl.unknownOrder}
      </div>

      {/* Pool/Delivery Badge */}
      <div
        style={{
          padding: "8px 12px",
          backgroundColor: isPool
            ? "rgba(243, 244, 246, 0.8)"
            : "rgba(219, 234, 254, 0.6)",
          borderRadius: "8px",
          marginBottom: "12px",
          borderLeft: "3px solid " + (isPool ? "#9ca3af" : "#3b82f6"),
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            textTransform: "uppercase",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          {isPool ? pl.poolOrder : pl.deliveryOrder}
        </div>
      </div>

      {/* Customer */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}
        >
          {pl.customer}
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
          }}
        >
          {order.customer}
        </div>
      </div>

      {/* Priority */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#6b7280",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px",
          }}
        >
          {pl.priorityLabel}
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#3b82f6",
            textTransform: "uppercase",
          }}
        >
          {order.priority}
        </div>
      </div>

      {/* Location */}
      <div
        style={{
          fontSize: "13px",
          color: "#10b981",
          marginBottom: "10px",
        }}
      >
        <strong style={{ color: "#374151" }}>{pl.location}:</strong>{" "}
        {order.location.lat.toFixed(4)}, {order.location.lng.toFixed(4)}
      </div>

      {/* Total Amount */}
      {order.totalAmount != null && (
        <div
          style={{
            fontSize: "13px",
            paddingTop: "10px",
            borderTop: "1px solid #e5e7eb",
            marginBottom: "12px",
          }}
        >
          <strong style={{ color: "#374151" }}>{pl.total}:</strong> €
          {order.totalAmount.toLocaleString()}
        </div>
      )}

      {/* Toggle Button - Outlined style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: "100%",
          padding: "10px 16px",
          backgroundColor: "transparent",
          color: buttonColor,
          border: `1.5px solid ${buttonColor}`,
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = `${buttonColor}10`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {toggleText}
      </button>
    </div>
  );
};
