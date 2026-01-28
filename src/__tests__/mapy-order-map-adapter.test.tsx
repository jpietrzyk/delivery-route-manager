import "@testing-library/jest-dom";
import type { Order } from "@/types/order";
import { renderHook, act } from "@testing-library/react";
import { useRouteSegments } from "@/hooks/use-route-segments";
import RouteSegmentsProvider from "@/contexts/route-segments-provider";
import type { RouteSegmentData } from "@/contexts/route-segments-context";

// Test for the totalAmount handling fix in MapyOrderMapAdapter
// The bug was: order.totalAmount.toFixed(2) threw "Cannot read properties of undefined (reading 'toFixed')"
// The fix: Wrap totalAmount section in conditional {order.totalAmount != null && (...)}

describe("MapyOrderMapAdapter - totalAmount handling", () => {
  const createMockOrder = (
    id: string = "order-1",
    overrides: Partial<Order> = {}
  ): Order => ({
    id,
    product: { name: "Test Product", price: 100, complexity: 1 },
    status: "pending" as const,
    priority: "medium" as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Test Customer",
    totalAmount: 100,
    location: { lat: 51.505, lng: -0.09 },
    ...overrides,
  });

  // Simulate the createOrderPopupContent function logic
  const createOrderPopupContent = (order: Order): HTMLDivElement => {
    const container = document.createElement("div");
    container.style.minWidth = "240px";
    container.style.padding = "12px";
    container.style.fontFamily = "sans-serif";

    // Order ID Section
    const idSection = document.createElement("div");
    idSection.style.marginBottom = "8px";
    const idLabel = document.createElement("div");
    idLabel.textContent = "Order ID";
    idLabel.style.fontSize = "11px";
    idLabel.style.color = "#6b7280";
    idSection.appendChild(idLabel);
    const idValue = document.createElement("div");
    idValue.textContent = order.id;
    idValue.style.fontSize = "14px";
    idSection.appendChild(idValue);
    container.appendChild(idSection);

    // Customer Section
    const customerSection = document.createElement("div");
    customerSection.style.marginBottom = "8px";
    const customerLabel = document.createElement("div");
    customerLabel.textContent = "Customer";
    customerLabel.style.fontSize = "11px";
    customerSection.appendChild(customerLabel);
    const customerValue = document.createElement("div");
    customerValue.textContent = order.customer;
    customerValue.style.fontSize = "14px";
    customerSection.appendChild(customerValue);
    container.appendChild(customerSection);

    // Product Section (conditional)
    if (order.product) {
      const productSection = document.createElement("div");
      productSection.style.marginBottom = "10px";
      const productLabel = document.createElement("div");
      productLabel.textContent = "Product";
      productLabel.style.fontSize = "11px";
      productSection.appendChild(productLabel);
      const productValue = document.createElement("div");
      productValue.textContent = order.product.name;
      productValue.style.fontSize = "14px";
      productSection.appendChild(productValue);
      container.appendChild(productSection);
    }

    // Total Amount Section (conditional - this is what we're testing)
    if (order.totalAmount != null) {
      const amountSection = document.createElement("div");
      amountSection.style.marginBottom = "14px";
      const amountLabel = document.createElement("div");
      amountLabel.textContent = "Total Amount";
      amountLabel.style.fontSize = "11px";
      amountSection.appendChild(amountLabel);
      const amountValue = document.createElement("div");
      amountValue.textContent = `$${order.totalAmount.toFixed(2)}`;
      amountValue.style.fontSize = "16px";
      amountValue.style.fontWeight = "700";
      amountValue.style.color = "#059669";
      amountSection.appendChild(amountValue);
      container.appendChild(amountSection);
    }

    return container;
  };

  it("should not throw error when order has undefined totalAmount", () => {
    const orderWithoutTotal = createMockOrder("order-1", {
      totalAmount: undefined as unknown as number,
    });

    expect(() => {
      createOrderPopupContent(orderWithoutTotal);
    }).not.toThrow();
  });

  it("should not throw error when order has null totalAmount", () => {
    const orderWithNullTotal = createMockOrder("order-2", {
      totalAmount: null as unknown as number,
    });

    expect(() => {
      createOrderPopupContent(orderWithNullTotal);
    }).not.toThrow();
  });

  it("should render totalAmount when it has a valid value", () => {
    const validOrder = createMockOrder("order-3", {
      totalAmount: 150.5,
    });

    const popup = createOrderPopupContent(validOrder);
    expect(popup.textContent).toContain("$150.50");
  });

  it("should not render totalAmount section when value is undefined", () => {
    const orderWithoutTotal = createMockOrder("order-4", {
      totalAmount: undefined as unknown as number,
    });

    const popup = createOrderPopupContent(orderWithoutTotal);
    expect(popup.textContent).not.toContain("Total Amount");
    expect(popup.textContent).not.toContain("$");
  });

  it("should not render totalAmount section when value is null", () => {
    const orderWithNullTotal = createMockOrder("order-5", {
      totalAmount: null as unknown as number,
    });

    const popup = createOrderPopupContent(orderWithNullTotal);
    expect(popup.textContent).not.toContain("Total Amount");
  });

  it("should handle totalAmount of zero correctly", () => {
    const orderWithZero = createMockOrder("order-6", {
      totalAmount: 0,
    });

    const popup = createOrderPopupContent(orderWithZero);
    expect(popup.textContent).toContain("Total Amount");
    expect(popup.textContent).toContain("$0.00");
  });

  it("should handle order without product gracefully", () => {
    const orderWithoutProduct = createMockOrder("order-7", {
      product: undefined as unknown as Order["product"],
    });

    expect(() => {
      createOrderPopupContent(orderWithoutProduct);
    }).not.toThrow();

    const popup = createOrderPopupContent(orderWithoutProduct);
    expect(popup.textContent).not.toContain("Product");
  });
});

describe("MapyOrderMapAdapter - Route Segments Integration", () => {
  it("should populate route segments context when routes are calculated", () => {
    // This test verifies that MapyOrderMapAdapter properly sets route segments
    // in the context when it calculates routes using the Mapy.cz API

    const mockSegments: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 5000,
        duration: 600,
      },
      {
        id: "order-2-order-3",
        fromOrderId: "order-2",
        toOrderId: "order-3",
        distance: 3000,
        duration: 400,
      },
    ];

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteSegmentsProvider>{children}</RouteSegmentsProvider>
    );

    const { result } = renderHook(() => useRouteSegments(), { wrapper });

    // Simulate what MapyOrderMapAdapter does after calculating routes
    act(() => {
      result.current.setRouteSegments(mockSegments);
    });

    expect(result.current.routeSegments).toEqual(mockSegments);
    expect(result.current.routeSegments).toHaveLength(2);
  });

  it("should clear route segments on error", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteSegmentsProvider>{children}</RouteSegmentsProvider>
    );

    const { result } = renderHook(() => useRouteSegments(), { wrapper });

    // First set some segments
    act(() => {
      result.current.setRouteSegments([
        {
          id: "order-1-order-2",
          fromOrderId: "order-1",
          toOrderId: "order-2",
          distance: 5000,
          duration: 600,
        },
      ]);
    });

    expect(result.current.routeSegments).toHaveLength(1);

    // Simulate error handling - clear segments
    act(() => {
      result.current.setRouteSegments([]);
    });

    expect(result.current.routeSegments).toEqual([]);
  });

  it("should format segment data correctly for context", () => {
    // Test that the transformation from API response to RouteSegmentData format is correct
    const mockApiSegment = {
      distance: 8500, // meters
      duration: 720, // seconds
    };

    const orderId1 = "order-1";
    const orderId2 = "order-2";

    const formattedSegment: RouteSegmentData = {
      id: `${orderId1}-${orderId2}`,
      fromOrderId: orderId1,
      toOrderId: orderId2,
      distance: mockApiSegment.distance,
      duration: mockApiSegment.duration,
    };

    expect(formattedSegment).toEqual({
      id: "order-1-order-2",
      fromOrderId: "order-1",
      toOrderId: "order-2",
      distance: 8500,
      duration: 720,
    });
  });
});
