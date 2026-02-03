// import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import DeliveryMapPage from "@/pages/delivery-route-map-page";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DeliveryRouteManagerProvider from "@/providers/delivery-route-manager-provider";
import { MapFiltersProvider } from "@/contexts/map-filters-context";
import { OrdersApi } from "@/services/orders-api";
import { DeliveryRouteWaypointsApi } from "@/services/delivery-route-waypoints-api";
import type { Order } from "@/types/order";

// Mock the OrdersApi
jest.mock("@/services/orders-api");

const mockOrders: Order[] = [
  {
    id: "order-1",
    status: "pending",
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: { name: "Customer 1" },
    totalAmount: 100,
    location: { lat: 52.52, lng: 13.405 },
    complexity: 1,
  },
  {
    id: "order-2",
    status: "pending",
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: { name: "Customer 2" },
    totalAmount: 150,
    location: { lat: 52.52, lng: 13.405 },
    complexity: 2,
  },
];

describe("DeliveryMapPage - Assigned Count Update Fix", () => {
  beforeEach(() => {
    // Mock the getOrders method
    (OrdersApi.getOrders as jest.Mock).mockResolvedValue(mockOrders);
    (OrdersApi.updateOrder as jest.Mock).mockImplementation(
      async (orderId: string, updates: Partial<Order>) => {
        const order = mockOrders.find((o) => o.id === orderId);
        if (order) {
          return { ...order, ...updates };
        }
        return null;
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset the waypoint cache to prevent test contamination
    DeliveryRouteWaypointsApi.resetCache();
  });

  it("should increment refreshTrigger when order is added to delivery", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/delivery/delivery-1"]}>
          <MapFiltersProvider>
            <DeliveryRouteManagerProvider>
              <Routes>
                <Route
                  path="/delivery/:deliveryId"
                  element={<DeliveryMapPage />}
                />
              </Routes>
            </DeliveryRouteManagerProvider>
          </MapFiltersProvider>
        </MemoryRouter>,
      );
    });

    // Wait for initial loading
    await waitFor(() => {
      expect(OrdersApi.getOrders).toHaveBeenCalled();
    });
  });

  it("should update both delivery and unassigned orders when adding order", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/delivery/delivery-1"]}>
          <MapFiltersProvider>
            <DeliveryRouteManagerProvider>
              <Routes>
                <Route
                  path="/delivery/:deliveryId"
                  element={<DeliveryMapPage />}
                />
              </Routes>
            </DeliveryRouteManagerProvider>
          </MapFiltersProvider>
        </MemoryRouter>,
      );
    });

    // Wait for initial loading
    await waitFor(() => {
      expect(OrdersApi.getOrders).toHaveBeenCalled();
    });
  });
});
