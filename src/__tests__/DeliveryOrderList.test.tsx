import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveryOrderList } from "@/components/delivery-route/delivery-order-list";
import type { Order } from "@/types/order";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";
import { RouteSegmentsContext } from "@/contexts/route-segments-context";
import type { RouteSegmentData } from "@/contexts/route-segments-context";

describe("DeliveryOrderList", () => {
  const createMockOrder = (
    id: string = "order-1",
    customer: string = "Test Customer"
  ): Order => ({
    id,
    product: { name: "Test Product", price: 100, complexity: 1 },
    status: "pending" as const,
    priority: "medium" as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer,
    totalAmount: 100,
    location: { lat: 51.505, lng: -0.09 },
  });

  // Wrapper component to provide required contexts
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DeliveryRouteManagerProvider>{children}</DeliveryRouteManagerProvider>
  );

  it("should render empty state when no orders are provided", () => {
    render(<DeliveryOrderList orders={[]} />, { wrapper: Wrapper });

    // Should show "Brak przypisanych zamówień" message
    expect(screen.getByText("Brak przypisanych zamówień")).toBeInTheDocument();
  });

  it("should render default title when no title is provided", () => {
    const order = createMockOrder();
    render(<DeliveryOrderList orders={[order]} />, { wrapper: Wrapper });

    // Should show default title "Zamówienia"
    expect(screen.getByText("Zamówienia")).toBeInTheDocument();
  });

  it("should render custom title when provided", () => {
    const order = createMockOrder();
    render(<DeliveryOrderList orders={[order]} title="Custom Title" />, {
      wrapper: Wrapper,
    });

    // Should show custom title
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render single order correctly", () => {
    const order = createMockOrder("order-1", "Customer 1");
    render(<DeliveryOrderList orders={[order]} />, { wrapper: Wrapper });

    // Should render the order (customer name is in tooltip, not main UI)
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
  });

  it("should render multiple orders correctly", () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");

    render(<DeliveryOrderList orders={[order1, order2]} />, {
      wrapper: Wrapper,
    });

    // Should render both orders (customer names are in tooltips, not main UI)
    expect(screen.getAllByText("Test Product")).toHaveLength(2);
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText(/order-2/)).toBeInTheDocument();
  });

  it("should render route segments between orders when routeManager is not provided", () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");

    render(<DeliveryOrderList orders={[order1, order2]} />, {
      wrapper: Wrapper,
    });

    // Should render route segment between orders
    // The segment should be present with route data calculated from the order locations
    const routeSegments = screen.getAllByTestId("connection-icon");
    expect(routeSegments).toHaveLength(1); // One segment between the two orders
  });

  it("should handle orders with different statuses", () => {
    const order1: Order = {
      ...createMockOrder("order-1", "Customer 1"),
      status: "pending" as const,
    };

    const order2: Order = {
      ...createMockOrder("order-2", "Customer 2"),
      status: "in-progress" as const,
    };

    const order3: Order = {
      ...createMockOrder("order-3", "Customer 3"),
      status: "completed" as const,
    };

    render(<DeliveryOrderList orders={[order1, order2, order3]} />, {
      wrapper: Wrapper,
    });

    // Should render all orders (statuses and customer names are in tooltips, not main UI)
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText(/order-2/)).toBeInTheDocument();
    expect(screen.getByText(/order-3/)).toBeInTheDocument();
  });

  it("should handle orders with different priorities", () => {
    const order1: Order = {
      ...createMockOrder("order-1", "Customer 1"),
      priority: "high" as const,
    };

    const order2: Order = {
      ...createMockOrder("order-2", "Customer 2"),
      priority: "medium" as const,
    };

    const order3: Order = {
      ...createMockOrder("order-3", "Customer 3"),
      priority: "low" as const,
    };

    render(<DeliveryOrderList orders={[order1, order2, order3]} />, {
      wrapper: Wrapper,
    });

    // Should render all orders (priorities are shown in main UI, customer names are in tooltips)
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText(/order-2/)).toBeInTheDocument();
    expect(screen.getByText(/order-3/)).toBeInTheDocument();
    expect(screen.getByText(/high/)).toBeInTheDocument();
    expect(screen.getByText(/medium/)).toBeInTheDocument();
    expect(screen.getByText(/low/)).toBeInTheDocument();
  });

  it("should use route segments from context when available", () => {
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

    render(<DeliveryOrderList orders={[order1, order2]} />, {
      wrapper: WrapperWithRouteSegments,
    });

    // Should render route segment with actual data from context
    const routeSegments = screen.getAllByTestId("connection-icon");
    expect(routeSegments).toHaveLength(1);

    // The segment should display the distance from context (8.5 km)
    expect(screen.getByText(/8\.5/)).toBeInTheDocument();
  });

  it("should fall back to geometric calculations when route segments not available", () => {
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

    render(<DeliveryOrderList orders={[order1, order2]} />, {
      wrapper: WrapperWithEmptySegments,
    });

    // Should render route segment with geometric fallback calculation
    const routeSegments = screen.getAllByTestId("connection-icon");
    expect(routeSegments).toHaveLength(1);
    // The segment should display some distance (geometric calculation)
    // Just verify it renders without errors
  });
});
