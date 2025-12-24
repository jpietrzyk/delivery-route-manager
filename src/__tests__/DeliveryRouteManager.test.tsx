import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveryRouteManager } from "@/components/delivery-route-manager";
import type { Order, Product } from "@/types/order";

describe("DeliveryRouteManager", () => {
  const createMockOrder = (
    id: string,
    lat: number,
    lng: number,
    complexity: 1 | 2 | 3 = 1,
    customer: string = "Test Customer"
  ): Order => ({
    id,
    product: { name: "Test Product", price: 100, complexity },
    status: "pending" as const,
    priority: "medium" as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer,
    totalAmount: 100,
    location: { lat, lng },
  });

  it("should render empty state when no orders are provided", () => {
    render(<DeliveryRouteManager orders={[]} />);
    expect(screen.getByText("Brak zamówień")).toBeInTheDocument();
  });

  it("should render a single order correctly", () => {
    const order = createMockOrder("order-1", 51.505, -0.09);
    render(<DeliveryRouteManager orders={[order]} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
  });

  it("should render multiple orders with drive and handling times", () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09, 1);
    const order2 = createMockOrder("order-2", 51.51, -0.1, 2);

    render(<DeliveryRouteManager orders={[order1, order2]} />);

    // Should render both orders
    expect(screen.getAllByText("Test Product")).toHaveLength(2);

    // Should show drive and handling time between orders
    expect(screen.getByText(/czas przejazdu:/)).toBeInTheDocument();
    expect(screen.getByText(/obsługa:/)).toBeInTheDocument();
  });

  it("should handle orders with different complexity levels", () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09, 1); // 20 minutes handling
    const order2 = createMockOrder("order-2", 51.51, -0.1, 2); // 40 minutes handling
    const order3 = createMockOrder("order-3", 51.515, -0.11, 3); // 60 minutes handling

    render(<DeliveryRouteManager orders={[order1, order2, order3]} />);

    // Should show different handling times
    const handlingTimes = screen.getAllByText(/obsługa:\d+min/);
    expect(handlingTimes).toHaveLength(2); // Between order1-order2 and order2-order3
  });

  it("should handle orders with missing product complexity", () => {
    const orderWithComplexity: Order = {
      id: "order-1",
      product: { name: "Test Product", price: 100, complexity: 2 },
      status: "pending",
      priority: "medium",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: "Test Customer",
      totalAmount: 100,
      location: { lat: 51.505, lng: -0.09 },
    };

    const orderWithoutComplexity: Order = {
      id: "order-2",
      product: { name: "Test Product", price: 100, complexity: 1 },
      status: "pending",
      priority: "medium",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: "Test Customer",
      totalAmount: 100,
      location: { lat: 51.51, lng: -0.1 },
    };

    // Create a new product object without complexity
    const productWithoutComplexity = { name: "Test Product", price: 100 };
    const modifiedOrder = {
      ...orderWithoutComplexity,
      product: productWithoutComplexity as unknown as Product,
    };

    render(
      <DeliveryRouteManager orders={[orderWithComplexity, modifiedOrder]} />
    );

    // Should still render without errors
    expect(screen.getAllByText("Test Product")).toHaveLength(2);
  });

  it("should handle orders with same location", () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09);
    const order2 = createMockOrder("order-2", 51.505, -0.09); // Same location

    render(<DeliveryRouteManager orders={[order1, order2]} />);

    // Should show 0 minutes drive time
    const driveTimeElement = screen.getByText(/czas przejazdu: 0min/);
    expect(driveTimeElement).toBeInTheDocument();
  });

  it("should handle orders with far locations", () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09); // London
    const order2 = createMockOrder("order-2", 48.8566, 2.3522); // Paris

    render(<DeliveryRouteManager orders={[order1, order2]} />);

    // Should show significant drive time
    const driveTimeElement = screen.getByText(/czas przejazdu: \d+min/);
    expect(driveTimeElement).toBeInTheDocument();
    const driveMinutes = parseInt(
      driveTimeElement.textContent?.match(/\d+/)?.[0] || "0"
    );
    expect(driveMinutes).toBeGreaterThan(100); // Should be more than 100 minutes
  });
});
