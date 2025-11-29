import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface StyledSidebarProps {
  className?: string;
}

const StyledSidebar: React.FC<StyledSidebarProps> = ({ className = "" }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Inline styles to ensure visibility
  const sidebarStyle = {
    width: collapsed ? "64px" : "256px",
    height: "100vh",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    transition: "width 0.3s ease-in-out",
    display: "flex",
    flexDirection: "column" as const,
    position: "fixed" as const,
    left: 0,
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
