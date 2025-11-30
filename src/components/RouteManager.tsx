// src/components/RouteManager.tsx
import React, { useEffect } from "react";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import DraggableOrderList from "./DraggableOrderList";

const RouteManager: React.FC = () => {
  const {
    routeOrders,
    availableOrders,
    isLoadingOrders,
    initializeRouteWithAllOrders,
    clearRoute,
    addOrderToRoute,
    isCalculatingRoute,
    setIsCalculatingRoute,
  } = useOrderRoute();

  useEffect(() => {
    // Initialize the route with all orders when component mounts and orders are loaded
    if (
      !isLoadingOrders &&
      routeOrders.length === 0 &&
      availableOrders.length > 0
    ) {
      initializeRouteWithAllOrders();
    }
  }, [
    routeOrders.length,
    initializeRouteWithAllOrders,
    isLoadingOrders,
    availableOrders.length,
  ]);

  const handleRecalculateRoute = () => {
    setIsCalculatingRoute(true);
    // The route will automatically recalculate due to the routeOrders dependency
    // This is just for showing the loading state
    setTimeout(() => setIsCalculatingRoute(false), 1000);
  };

  const handleAddAllOrders = () => {
    initializeRouteWithAllOrders();
  };

  const handleClearRoute = () => {
    clearRoute();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
      }}
    >
      {/* Route Statistics */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
              }}
            >
              Route Manager
            </h3>
            {isCalculatingRoute && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#3b82f6",
                }}
              >
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{ marginRight: "8px" }}
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Calculating...
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#3b82f6",
                }}
              >
                {routeOrders.length}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Orders in Route
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#10b981",
                }}
              >
                {Math.max(0, routeOrders.length - 1)}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Route Segments
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#8b5cf6",
                }}
              >
                {isLoadingOrders
                  ? "..."
                  : Math.max(0, availableOrders.length - routeOrders.length)}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Available Orders
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={handleAddAllOrders}
              disabled={isLoadingOrders}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: "500",
                color: isLoadingOrders ? "#9ca3af" : "white",
                backgroundColor: isLoadingOrders ? "#e5e7eb" : "#3b82f6",
                border: "1px solid transparent",
                borderRadius: "6px",
                cursor: isLoadingOrders ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isLoadingOrders) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoadingOrders) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              {isLoadingOrders ? "Loading..." : "Add All Orders"}
            </button>
            <button
              onClick={handleRecalculateRoute}
              disabled={isCalculatingRoute || routeOrders.length < 2}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: "500",
                color: "white",
                backgroundColor: routeOrders.length < 2 ? "#9ca3af" : "#10b981",
                border: "1px solid transparent",
                borderRadius: "6px",
                cursor: routeOrders.length < 2 ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (routeOrders.length >= 2) {
                  e.currentTarget.style.backgroundColor = "#059669";
                }
              }}
              onMouseLeave={(e) => {
                if (routeOrders.length >= 2) {
                  e.currentTarget.style.backgroundColor = "#10b981";
                }
              }}
            >
              Recalculate Route
            </button>
            <button
              onClick={handleClearRoute}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#dc2626",
                backgroundColor: "white",
                border: "1px solid #fca5a5",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Clear Route
            </button>
          </div>
        </div>
      </div>

      {/* Draggable Order List */}
      <DraggableOrderList />

      {/* Available Orders (for adding to route) */}
      {!isLoadingOrders && availableOrders.length > routeOrders.length && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 4px 0",
              }}
            >
              Available Orders
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Click to add orders to the route
            </p>
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {availableOrders
              .filter(
                (order) =>
                  !routeOrders.some((routeOrder) => routeOrder.id === order.id)
              )
              .map((order) => (
                <div
                  key={order.id}
                  onClick={() => addOrderToRoute(order)}
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f3f4f6",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#111827",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {order.name}
                      </h4>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginBottom: "4px",
                        }}
                      >
                        {order.customer}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#9ca3af",
                        }}
                      >
                        {order.location.lat.toFixed(3)},{" "}
                        {order.location.lng.toFixed(3)}
                      </div>
                    </div>
                    <div style={{ color: "#d1d5db" }}>
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManager;
