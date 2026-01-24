/**
 * Shared Order Popup Content Component
 * Used by both Leaflet and Mapy.cz map adapters for consistent popup styling
 */
import React from "react";
import type { Order } from "@/types/order";
import { pl } from "@/lib/translations";

interface OrderPopupContentProps {
  order: Order;
  isUnassigned: boolean;
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
  isUnassigned,
  onToggle,
  toggleText,
}) => {
  const statusColors = getStatusColor(order.status);
  const buttonColor = isUnassigned ? "#10b981" : "#ef4444";

  return (
    <div className="p-4 max-w-70 font-sans bg-white/90 rounded-lg shadow-lg border border-gray-200">
      {/* Header with Order ID */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-gray-100">
        <span className="text-base font-bold text-gray-800">{order.id}</span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={{
            backgroundColor: statusColors.bg,
            color: statusColors.text,
          }}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Order/Product Name */}
      <div className="font-semibold mb-3 text-sm text-gray-900">
        {order.product?.name || pl.unknownOrder}
      </div>

      {/* Unassigned/Assigned Badge */}
      <div
        className="p-2 rounded-lg mb-3 border-l-4"
        style={{
          backgroundColor: isUnassigned
            ? "rgba(243, 244, 246, 0.8)"
            : "rgba(219, 234, 254, 0.6)",
          borderLeftColor: isUnassigned ? "#9ca3af" : "#3b82f6",
        }}
      >
        <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
          {isUnassigned ? pl.unassignedOrder : pl.assignedOrder}
        </div>
      </div>

      {/* Customer */}
      <div className="mb-2.5">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
          {pl.customer}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {order.customer}
        </div>
      </div>

      {/* Priority */}
      <div className="mb-2.5">
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
          {pl.priorityLabel}
        </div>
        <div className="text-sm font-semibold text-blue-600 uppercase">
          {order.priority}
        </div>
      </div>

      {/* Location */}
      <div className="text-sm text-emerald-600 mb-2.5">
        <strong className="text-gray-700">{pl.location}:</strong>{" "}
        {order.location.lat.toFixed(4)}, {order.location.lng.toFixed(4)}
      </div>

      {/* Total Amount */}
      {order.totalAmount != null && (
        <div className="text-sm pt-2.5 border-t border-gray-200 mb-3">
          <strong className="text-gray-700">{pl.total}:</strong> €
          {order.totalAmount.toLocaleString()}
        </div>
      )}

      {/* Toggle Button - Outlined style */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="w-full py-2 px-3 bg-transparent border rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-opacity-10"
        style={{
          color: buttonColor,
          borderColor: buttonColor,
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
