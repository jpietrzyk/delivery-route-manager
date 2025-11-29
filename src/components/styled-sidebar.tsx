import React, { useState } from "react";
import type { Order } from "@/types/order";
import { sampleOrders } from "@/types/order";

interface StyledSidebarProps {
  className?: string;
}

const StyledSidebar: React.FC<StyledSidebarProps> = ({ className = "" }) => {
  const [collapsed, setCollapsed] = useState(false);

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

  const navItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
    margin: "4px 8px",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
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

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px" }}>
        <a
          href="/"
          style={{ ...navItemStyle, ...(true ? activeNavItemStyle : {}) }}
        >
          <span>🏠</span>
          {!collapsed && <span>Dashboard</span>}
        </a>
        <a href="/maps" style={navItemStyle}>
          <span>🗺️</span>
          {!collapsed && <span>Maps</span>}
        </a>
        <a href="/layers" style={navItemStyle}>
          <span>📚</span>
          {!collapsed && <span>Layers</span>}
        </a>
        <a href="/analytics" style={navItemStyle}>
          <span>📊</span>
          {!collapsed && <span>Analytics</span>}
        </a>
        <a href="/team" style={navItemStyle}>
          <span>👥</span>
          {!collapsed && <span>Team</span>}
        </a>
        <a href="/projects" style={navItemStyle}>
          <span>📁</span>
          {!collapsed && <span>Projects</span>}
        </a>
        <a href="/settings" style={navItemStyle}>
          <span>⚙️</span>
          {!collapsed && <span>Settings</span>}
        </a>

        {/* Orders Section */}
        {!collapsed && (
          <>
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                margin: "16px 8px 8px 8px",
                paddingTop: "16px",
              }}
            />
            <div style={{ marginBottom: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                📋 Orders
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {sampleOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#111827",
                        lineHeight: "1.2",
                      }}
                    >
                      {order.name}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "12px",
                        backgroundColor: getStatusColor(order.status).bg,
                        color: getStatusColor(order.status).text,
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        marginLeft: "8px",
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
                    }}
                  >
                    {order.customer}
                  </div>
                  {order.comment && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        fontStyle: "italic",
                        lineHeight: "1.3",
                        marginBottom: "4px",
                      }}
                    >
                      {order.comment.length > 40
                        ? `${order.comment.substring(0, 40)}...`
                        : order.comment}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "10px",
                      color: "#6b7280",
                    }}
                  >
                    <span>Priority: {order.priority.toUpperCase()}</span>
                    {order.totalAmount && (
                      <span style={{ fontWeight: "600", color: "#111827" }}>
                        €{order.totalAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {collapsed && (
          <a href="/orders" style={navItemStyle}>
            <span>📋</span>
          </a>
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
