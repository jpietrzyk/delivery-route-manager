import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveryOrderItem } from "@/components/delivery-route/delivery-order-item";
import type { Order } from "@/types/order";
import DeliveryRouteManagerProvider from "@/providers/delivery-route-manager-provider";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

describe("DeliveryOrderItem", () => {
  const createMockOrder = (
    id: string = "order-1",
    priority: number = 2,
    customerName: string = "Test Customer",
    items: Order["items"] = [
      { productId: "p1", productName: "Test Product", quantity: 1, price: 100 },
    ],
    complexity: number = 1,
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
    complexity,
  });

  // Wrapper component to provide required contexts
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    );
    return (
      <DeliveryRouteManagerProvider>
        <DndContext sensors={sensors}>{children}</DndContext>
      </DeliveryRouteManagerProvider>
    );
  };

  it("should render basic order information", () => {
    const order = createMockOrder();
    render(<DeliveryOrderItem id={order.id} order={order} />, {
      wrapper: Wrapper,
    });
    // Should render customer name and order id
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
    expect(screen.getByText(/order-1/)).toBeInTheDocument();
    // Should not render status, assembly time, or times (removed for compactness)
    expect(screen.queryByText("pending")).not.toBeInTheDocument();
    expect(screen.queryByText("30 minutes")).not.toBeInTheDocument();
    expect(screen.queryByText(/08:00.*09:00/)).not.toBeInTheDocument();
  });

  it("should render different assembly times based on complexity", () => {
    // Test complexity level 1 (30 minutes)
    const order1 = createMockOrder("order-1", 1);

    const { rerender } = render(
      <DeliveryOrderItem id={order1.id} order={order1} />,
      { wrapper: Wrapper },
    );

    // Assembly time is no longer shown in compact view
    expect(screen.queryByText("30 minutes")).not.toBeInTheDocument();

    // Test complexity level 2 (60 minutes)
    const order2 = createMockOrder("order-2", 2);
    rerender(<DeliveryOrderItem id={order2.id} order={order2} />);
    expect(screen.queryByText("60 minutes")).not.toBeInTheDocument();

    // Test complexity level 3 (90 minutes)
    const order3 = createMockOrder("order-3", 3);
    rerender(<DeliveryOrderItem id={order3.id} order={order3} />);
    expect(screen.queryByText("90 minutes")).not.toBeInTheDocument();
  });

  it("should not show location icon or times in compact view", () => {
    const order = createMockOrder();

    render(<DeliveryOrderItem id={order.id} order={order} />, {
      wrapper: Wrapper,
    });

    // Should not show location icon or times (removed for compactness)
    expect(screen.queryByTestId("location-icon")).not.toBeInTheDocument();
    expect(screen.queryByText(/\d{2}:\d{2}/)).not.toBeInTheDocument();
  });

  it("should apply highlighted styling when isHighlighted is true", () => {
    const order = createMockOrder();

    const { container } = render(
      <DeliveryOrderItem id={order.id} order={order} isHighlighted={true} />,
      { wrapper: Wrapper },
    );

    // Should have ring class when highlighted
    const listItem = container.querySelector("li");
    expect(listItem).toBeTruthy();
    expect(listItem?.className).toContain("ring-1");
    expect(listItem?.className).toContain("ring-green-400");
    expect(listItem?.className).toContain("bg-green-50/50");
  });

  it("should call onMouseEnter and onMouseLeave callbacks", () => {
    const order = createMockOrder();
    const mockMouseEnter = jest.fn();
    const mockMouseLeave = jest.fn();

    const { container } = render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        onMouseEnter={mockMouseEnter}
        onMouseLeave={mockMouseLeave}
      />,
      { wrapper: Wrapper },
    );

    const listItem = container.querySelector("li");
    if (listItem) {
      fireEvent.mouseEnter(listItem);
      expect(mockMouseEnter).toHaveBeenCalled();

      fireEvent.mouseLeave(listItem);
      expect(mockMouseLeave).toHaveBeenCalled();
    }
  });

  it("should call onRemove callback when remove button is clicked", () => {
    const order = createMockOrder();
    const mockRemove = jest.fn();

    render(
      <DeliveryOrderItem id={order.id} order={order} onRemove={mockRemove} />,
      { wrapper: Wrapper },
    );

    // Find and click the remove button
    const removeButton = screen.getByLabelText(`Usuń zamówienie ${order.id}`);
    fireEvent.click(removeButton);

    expect(mockRemove).toHaveBeenCalledWith(order.id);
  });

  it("should not show remove button when onRemove is not provided", () => {
    const order = createMockOrder();

    render(<DeliveryOrderItem id={order.id} order={order} />, {
      wrapper: Wrapper,
    });

    // Should not find remove button
    expect(
      screen.queryByLabelText(`Usuń zamówienie ${order.id}`),
    ).not.toBeInTheDocument();
  });

  // Removed product, active, and string customer fields from Order type tests as per new Order type
});
