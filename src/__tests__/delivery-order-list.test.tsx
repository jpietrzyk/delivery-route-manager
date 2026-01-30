import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { DeliveryOrderList } from "@/components/delivery-route/delivery-order-list";
import type { Order } from "@/types/order";
import DeliveryRouteManagerProvider from "@/providers/delivery-route-manager-provider";
import { RouteSegmentsContext } from "@/contexts/route-segments-context";
import type { RouteSegmentData } from "@/contexts/route-segments-context";

describe("DeliveryOrderList", () => {
  const createMockOrder = (
    id: string = "order-1",
    customerName: string = "Test Customer",
    priority: number = 2,
    items: Order["items"] = [
      { productId: "p1", productName: "Test Product", quantity: 1, price: 100 },
    ],
  ): Order => ({
    id,
    status: "pending",
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: { name: customerName },
    totalAmount: 100,
    items,
    location: { lat: 51.505, lng: -0.09 },
    complexity: 1,
  });

  // Wrapper component to provide required contexts
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DeliveryRouteManagerProvider>{children}</DeliveryRouteManagerProvider>
  );

  it("should render empty state when no orders are provided", async () => {
    await act(async () => {
      render(<DeliveryOrderList orders={[]} />, { wrapper: Wrapper });
    });
    // Should show "Brak przypisanych zamówień" message
    expect(screen.getByText("Brak przypisanych zamówień")).toBeInTheDocument();
  });

  it("should render default title when no title is provided", async () => {
    const order = createMockOrder();
    await act(async () => {
      render(<DeliveryOrderList orders={[order]} />, { wrapper: Wrapper });
    });
    // Should show default title "Zamówienia"
    expect(screen.getByText("Zamówienia")).toBeInTheDocument();
  });

  it("should render custom title when provided", async () => {
    const order = createMockOrder();
    await act(async () => {
      render(<DeliveryOrderList orders={[order]} title="Custom Title" />, {
        wrapper: Wrapper,
      });
    });
    // Should show custom title
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render single order correctly", async () => {
    const order = createMockOrder("order-1", "Customer 1");
    await act(async () => {
      render(<DeliveryOrderList orders={[order]} />, { wrapper: Wrapper });
    });
    // Should render the order (order id, customer name, and priority)
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
    // Priority is shown as part of 'order-1 | 2'
    expect(screen.getByText("order-1 | 2")).toBeInTheDocument();
  });

  it("should render multiple orders correctly", async () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");
    await act(async () => {
      render(<DeliveryOrderList orders={[order1, order2]} />, {
        wrapper: Wrapper,
      });
    });
    // Should render both orders (order ids and customer names)
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText(/order-2/)).toBeInTheDocument();
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
    expect(screen.getByText("Customer 2")).toBeInTheDocument();
  });

  it("should render route segments between orders when routeManager is not provided", async () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");
    await act(async () => {
      render(<DeliveryOrderList orders={[order1, order2]} />, {
        wrapper: Wrapper,
      });
    });
    // Should render route segment between orders
    // The segment should be present with route data calculated from the order locations
    const routeSegments = screen.getAllByTestId("connection-icon");
    expect(routeSegments).toHaveLength(1); // One segment between the two orders
  });

  it("should handle orders with different statuses", async () => {
    const order1: Order = {
      ...createMockOrder("order-1", "Customer 1"),
      status: "pending",
    };
    const order2: Order = {
      ...createMockOrder("order-2", "Customer 2"),
      status: "in-progress",
    };
    const order3: Order = {
      ...createMockOrder("order-3", "Customer 3"),
      status: "completed",
    };
    await act(async () => {
      render(<DeliveryOrderList orders={[order1, order2, order3]} />, {
        wrapper: Wrapper,
      });
    });
    // Should render all orders (order ids)
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText(/order-2/)).toBeInTheDocument();
    expect(screen.getByText(/order-3/)).toBeInTheDocument();
  });

  it("should handle orders with different priorities", async () => {
    const order1: Order = { ...createMockOrder("order-1", "Customer 1", 3) };
    const order2: Order = { ...createMockOrder("order-2", "Customer 2", 2) };
    const order3: Order = { ...createMockOrder("order-3", "Customer 3", 1) };
    await act(async () => {
      render(<DeliveryOrderList orders={[order1, order2, order3]} />, {
        wrapper: Wrapper,
      });
    });
    // Should render all orders (order ids, customer names, and priorities)
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText(/order-2/)).toBeInTheDocument();
    expect(screen.getByText(/order-3/)).toBeInTheDocument();
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
    expect(screen.getByText("Customer 2")).toBeInTheDocument();
    expect(screen.getByText("Customer 3")).toBeInTheDocument();
    // Check that priorities 3, 2, 1 are present (may appear in multiple places)
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });

  it("should use route segments from context when available", async () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");

    const mockRouteSegments: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 8500, // 8.5 km in meters
        duration: 720, // 12 minutes in seconds
      },
    ];

    const WrapperWithRouteSegments = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <DeliveryRouteManagerProvider>
        <RouteSegmentsContext.Provider
          value={{
            routeSegments: mockRouteSegments,
            setRouteSegments: () => {},
          }}
        >
          {children}
        </RouteSegmentsContext.Provider>
      </DeliveryRouteManagerProvider>
    );

    await act(async () => {
      render(<DeliveryOrderList orders={[order1, order2]} />, {
        wrapper: WrapperWithRouteSegments,
      });
    });
    // Should render route segment with actual data from context
    const routeSegments = screen.getAllByTestId("connection-icon");
    expect(routeSegments).toHaveLength(1);
    // The segment should display the distance from context (8.5 km)
    expect(screen.getByText(/8\.5/)).toBeInTheDocument();
  });

  it("should fall back to geometric calculations when route segments not available", async () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");

    // Empty route segments
    const WrapperWithEmptySegments = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <DeliveryRouteManagerProvider>
        <RouteSegmentsContext.Provider
          value={{
            routeSegments: [],
            setRouteSegments: () => {},
          }}
        >
          {children}
        </RouteSegmentsContext.Provider>
      </DeliveryRouteManagerProvider>
    );

    await act(async () => {
      render(<DeliveryOrderList orders={[order1, order2]} />, {
        wrapper: WrapperWithEmptySegments,
      });
    });
    // Should render route segment with geometric fallback calculation
    const routeSegments = screen.getAllByTestId("connection-icon");
    expect(routeSegments).toHaveLength(1);
    // The segment should display some distance (geometric calculation)
    // Just verify it renders without errors
  });
});
