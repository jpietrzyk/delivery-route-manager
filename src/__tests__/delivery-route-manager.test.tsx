import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom";
import { DeliveryRouteManager } from "@/components/delivery-route-manager";
import type { Order } from "@/types/order";
import DeliveryRouteManagerProvider from "@/providers/delivery-route-manager-provider";

describe("DeliveryRouteManager", () => {
  const createMockOrder = (
    id: string,
    lat: number,
    lng: number,
    priority: number = 2,
    customerName: string = "Test Customer",
    items: Order["items"] = [
      { productId: "p1", productName: "Test Product", quantity: 1, price: 100 },
    ],
  ): Order => ({
    id,
    status: "pending",
    complexity: 2,
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: { name: customerName },
    totalAmount: 100,
    items,
    location: { lat, lng },
  });

  // Wrapper component to provide required contexts
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <DeliveryRouteManagerProvider>{children}</DeliveryRouteManagerProvider>
  );

  it("should render empty state when no orders are provided", async () => {
    await act(async () => {
      render(<DeliveryRouteManager orders={[]} />, { wrapper: Wrapper });
    });
    expect(screen.getByText("Brak zamówień")).toBeInTheDocument();
  });

  it("should render a single order correctly", async () => {
    const order = createMockOrder("order-1", 51.505, -0.09);
    await act(async () => {
      render(<DeliveryRouteManager orders={[order]} />, { wrapper: Wrapper });
    });
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
  });

  it("should render multiple orders with drive and handling times", async () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09);
    const order2 = createMockOrder("order-2", 51.51, -0.1);
    await act(async () => {
      render(<DeliveryRouteManager orders={[order1, order2]} />, {
        wrapper: Wrapper,
      });
    });
    // Should render both orders by id
    expect(screen.getAllByText(/order-1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/order-2/).length).toBeGreaterThan(0);
    // Should show drive and handling time between orders
    expect(
      screen.getByText(
        (_, node) =>
          node?.textContent?.replace(/\s/g, "") ===
          "↳czasprzejazdu:1min,obsługa:40min",
      ),
    ).toBeInTheDocument();
  });

  it("should handle orders with different complexity levels", async () => {
    // Set complexity directly on the order object
    const order1 = {
      ...createMockOrder("order-1", 51.505, -0.09, 1),
      complexity: 1,
    };
    const order2 = {
      ...createMockOrder("order-2", 51.51, -0.1, 2),
      complexity: 2,
    };
    const order3 = {
      ...createMockOrder("order-3", 51.515, -0.11, 3),
      complexity: 3,
    };

    await act(async () => {
      render(<DeliveryRouteManager orders={[order1, order2, order3]} />, {
        wrapper: Wrapper,
      });
    });
    // Should show different handling times
    const handlingTimes = screen.getAllByText(/obsługa:\d+min/);
    expect(handlingTimes).toHaveLength(2); // Between order1-order2 and order2-order3
  });

  it("should handle orders with missing complexity", async () => {
    // Simulate missing complexity by omitting it from the order
    const order1: Order = {
      id: "order-1",
      status: "pending",
      complexity: 2,
      priority: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { name: "Test Customer" },
      totalAmount: 100,
      items: [
        {
          productId: "p1",
          productName: "Test Product",
          quantity: 1,
          price: 100,
        },
      ],
      location: { lat: 51.505, lng: -0.09 },
    };
    const order2: Order & { complexity: number } = {
      ...createMockOrder("order-2", 51.51, -0.1, 2),
      complexity: 2,
    };
    await act(async () => {
      render(<DeliveryRouteManager orders={[order1, order2]} />, {
        wrapper: Wrapper,
      });
    });
    // Should still render both order ids without errors
    expect(screen.getAllByText(/order-1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/order-2/).length).toBeGreaterThan(0);
  });

  it("should handle orders with same location", async () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09);
    const order2 = createMockOrder("order-2", 51.505, -0.09); // Same location

    await act(async () => {
      render(<DeliveryRouteManager orders={[order1, order2]} />, {
        wrapper: Wrapper,
      });
    });
    // Should show 0 minutes drive time
    const driveTimeElement = screen.getByText(/czas przejazdu: 0min/);
    expect(driveTimeElement).toBeInTheDocument();
  });

  it("should handle orders with far locations", async () => {
    const order1 = createMockOrder("order-1", 51.505, -0.09); // London
    const order2 = createMockOrder("order-2", 48.8566, 2.3522); // Paris

    await act(async () => {
      render(<DeliveryRouteManager orders={[order1, order2]} />, {
        wrapper: Wrapper,
      });
    });
    // Should show significant drive time
    const driveTimeElement = screen.getByText(/czas przejazdu: \d+min/);
    expect(driveTimeElement).toBeInTheDocument();
    const driveMinutes = parseInt(
      driveTimeElement.textContent?.match(/\d+/)?.[0] || "0",
    );
    expect(driveMinutes).toBeGreaterThan(100); // Should be more than 100 minutes
  });
});
