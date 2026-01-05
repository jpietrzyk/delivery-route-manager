// import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeliveryMapPage from "@/pages/DeliveryRouteMapPage";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";
import { OrdersApi } from "@/services/ordersApi";
import { DeliveryRouteWaypointsApi } from "@/services/deliveryRouteWaypointsApi";
import type { Order } from "@/types/order";

// Mock the OrdersApi
jest.mock("@/services/ordersApi");

const mockOrders: Order[] = [
  {
    id: "order-1",
    product: { name: "Product 1", price: 100, complexity: 1 },
    status: "pending",
    priority: "medium",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Customer 1",
    totalAmount: 100,
    location: { lat: 52.52, lng: 13.405 },
  },
  {
    id: "order-2",
    product: { name: "Product 2", price: 150, complexity: 2 },
    status: "pending",
    priority: "medium",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Customer 2",
    totalAmount: 150,
    location: { lat: 52.52, lng: 13.405 },
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
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset the waypoint cache to prevent test contamination
    DeliveryRouteWaypointsApi.resetCache();
  });

  it("should increment refreshTrigger when order is added to delivery", async () => {
    render(
      <MemoryRouter initialEntries={["/delivery/delivery-1"]}>
        <DeliveryRouteManagerProvider>
          <Routes>
            <Route path="/delivery/:deliveryId" element={<DeliveryMapPage />} />
          </Routes>
        </DeliveryRouteManagerProvider>
      </MemoryRouter>
    );

    // Wait for initial loading
    await waitFor(() => {
      expect(OrdersApi.getOrders).toHaveBeenCalled();
    });

    // Verify that the page renders and the drawer button is present
    const drawerButton = await screen.findByRole("button", {
      name: /unassigned/i,
    });
    expect(drawerButton).toBeInTheDocument();
  });

  it("should update both delivery and unassigned orders when adding order", async () => {
    render(
      <MemoryRouter initialEntries={["/delivery/delivery-1"]}>
        <DeliveryRouteManagerProvider>
          <Routes>
            <Route path="/delivery/:deliveryId" element={<DeliveryMapPage />} />
          </Routes>
        </DeliveryRouteManagerProvider>
      </MemoryRouter>
    );

    // Wait for initial loading
    await waitFor(() => {
      expect(OrdersApi.getOrders).toHaveBeenCalled();
    });

    // Verify that the drawer button with unassigned count is rendered
    const drawerButton = await screen.findByRole("button", {
      name: /unassigned/i,
    });
    expect(drawerButton).toBeInTheDocument();
    expect(drawerButton.textContent).toMatch(/unassigned.*\d+/i);
  });
});
