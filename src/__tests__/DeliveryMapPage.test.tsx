// import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeliveryMapPage from "@/pages/DeliveryMapPage";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";
import { OrdersApi } from "@/services/ordersApi";
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
    deliveryId: "delivery-1",
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

    // Save initial call count
    const initialCallCount = (OrdersApi.getOrders as jest.Mock).mock.calls
      .length;

    // Find the unassigned order and click the add button
    const addButton = await screen.findByLabelText(
      `Add order ${mockOrders[1].id} to delivery`
    );
    fireEvent.click(addButton);

    // Wait for the update to complete
    await waitFor(() => {
      expect(OrdersApi.updateOrder).toHaveBeenCalledWith(mockOrders[1].id, {
        deliveryId: "delivery-1",
      });
    });

    // The key test: verify that getOrders was called again after the update
    // This indicates that the refreshTrigger was incremented
    const finalCallCount = (OrdersApi.getOrders as jest.Mock).mock.calls.length;
    expect(finalCallCount).toBeGreaterThan(initialCallCount);
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

    // Save initial call count
    const initialCallCount = (OrdersApi.getOrders as jest.Mock).mock.calls
      .length;

    // Initially, we should have 1 delivery order and 1 unassigned order
    // (based on our mock data)

    // Find the unassigned order and click the add button
    const addButton = await screen.findByLabelText(
      `Add order ${mockOrders[1].id} to delivery`
    );
    fireEvent.click(addButton);

    // Wait for the update to complete
    await waitFor(() => {
      expect(OrdersApi.updateOrder).toHaveBeenCalled();
    });

    // After adding, getOrders should be called again to refresh the data
    const finalCallCount = (OrdersApi.getOrders as jest.Mock).mock.calls.length;
    expect(finalCallCount).toBeGreaterThan(initialCallCount);
  });
});
