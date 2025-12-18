import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveryOrderList } from "@/components/delivery/delivery-order-list";
import type { Order } from "@/types/order";

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

  it("should render empty state when no orders are provided", () => {
    render(<DeliveryOrderList orders={[]} />);

    // Should show "No orders assigned" message
    expect(screen.getByText("No orders assigned")).toBeInTheDocument();
  });

  it("should render default title when no title is provided", () => {
    const order = createMockOrder();
    render(<DeliveryOrderList orders={[order]} />);

    // Should show default title "Zamówienia"
    expect(screen.getByText("Zamówienia")).toBeInTheDocument();
  });

  it("should render custom title when provided", () => {
    const order = createMockOrder();
    render(<DeliveryOrderList orders={[order]} title="Custom Title" />);

    // Should show custom title
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("should render single order correctly", () => {
    const order = createMockOrder("order-1", "Customer 1");
    render(<DeliveryOrderList orders={[order]} />);

    // Should render the order
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
  });

  it("should render multiple orders correctly", () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");

    render(<DeliveryOrderList orders={[order1, order2]} />);

    // Should render both orders
    expect(screen.getAllByText("Test Product")).toHaveLength(2);
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
    expect(screen.getByText("Customer 2")).toBeInTheDocument();
  });

  it("should render route segments between orders when routeManager is not provided", () => {
    const order1 = createMockOrder("order-1", "Customer 1");
    const order2 = createMockOrder("order-2", "Customer 2");

    render(<DeliveryOrderList orders={[order1, order2]} />);

    // Should render route segment between orders
    expect(screen.getByText("Route Segment:")).toBeInTheDocument();
    expect(screen.getByText("order-1-order-2")).toBeInTheDocument();
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

    render(<DeliveryOrderList orders={[order1, order2, order3]} />);

    // Should render all orders with their respective statuses
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("in-progress")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
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

    render(<DeliveryOrderList orders={[order1, order2, order3]} />);

    // Should render all orders (priorities are not visually displayed in this component)
    expect(screen.getByText("Customer 1")).toBeInTheDocument();
    expect(screen.getByText("Customer 2")).toBeInTheDocument();
    expect(screen.getByText("Customer 3")).toBeInTheDocument();
  });
});
