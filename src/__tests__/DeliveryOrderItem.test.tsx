import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveryOrderItem } from "@/components/delivery/delivery-order-item";
import type { Order } from "@/types/order";

describe("DeliveryOrderItem", () => {
  const createMockOrder = (
    id: string = "order-1",
    complexity: 1 | 2 | 3 = 1,
    customer: string = "Test Customer",
    productName: string = "Test Product"
  ): Order => ({
    id,
    product: { name: productName, price: 100, complexity },
    status: "pending" as const,
    priority: "medium" as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer,
    totalAmount: 100,
    location: { lat: 51.505, lng: -0.09 },
  });

  const createArrivalDepartureTimes = () => {
    const arrivalTime = new Date();
    arrivalTime.setHours(8, 0, 0, 0); // 8:00 AM
    const departureTime = new Date();
    departureTime.setHours(9, 0, 0, 0); // 9:00 AM
    return { arrivalTime, departureTime };
  };

  it("should render basic order information", () => {
    const order = createMockOrder();
    const { arrivalTime, departureTime } = createArrivalDepartureTimes();

    render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );

    // Should render product name and customer
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Test Customer")).toBeInTheDocument();

    // Should render status
    expect(screen.getByText("pending")).toBeInTheDocument();

    // Should render assembly time
    expect(screen.getByText("30 minutes")).toBeInTheDocument();

    // Should render arrival and departure times
    expect(screen.getByText("08:00 AM - 09:00 AM")).toBeInTheDocument();
  });

  it("should render different assembly times based on complexity", () => {
    // Test complexity level 1 (30 minutes)
    const order1 = createMockOrder("order-1", 1);
    const { arrivalTime, departureTime } = createArrivalDepartureTimes();

    const { rerender } = render(
      <DeliveryOrderItem
        id={order1.id}
        order={order1}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );

    expect(screen.getByText("30 minutes")).toBeInTheDocument();

    // Test complexity level 2 (60 minutes)
    const order2 = createMockOrder("order-2", 2);
    rerender(
      <DeliveryOrderItem
        id={order2.id}
        order={order2}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );
    expect(screen.getByText("60 minutes")).toBeInTheDocument();

    // Test complexity level 3 (90 minutes)
    const order3 = createMockOrder("order-3", 3);
    rerender(
      <DeliveryOrderItem
        id={order3.id}
        order={order3}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );
    expect(screen.getByText("90 minutes")).toBeInTheDocument();
  });

  it("should show location icon when no times are provided", () => {
    const order = createMockOrder();

    render(<DeliveryOrderItem id={order.id} order={order} />);

    // Should show location icon instead of times
    const locationIcon = screen.getByTestId("location-icon");
    expect(locationIcon).toBeInTheDocument();

    // Should not show time range
    expect(screen.queryByText(/\d{2}:\d{2}/)).not.toBeInTheDocument();
  });

  it("should apply highlighted styling when isHighlighted is true", () => {
    const order = createMockOrder();
    const { arrivalTime, departureTime } = createArrivalDepartureTimes();

    const { container } = render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
        isHighlighted={true}
      />
    );

    // Should have ring class when highlighted
    const listItem = container.querySelector("li");
    expect(listItem?.className).toContain("ring-2");
  });

  it("should call onMouseEnter and onMouseLeave callbacks", () => {
    const order = createMockOrder();
    const { arrivalTime, departureTime } = createArrivalDepartureTimes();
    const mockMouseEnter = jest.fn();
    const mockMouseLeave = jest.fn();

    const { container } = render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
        onMouseEnter={mockMouseEnter}
        onMouseLeave={mockMouseLeave}
      />
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
    const { arrivalTime, departureTime } = createArrivalDepartureTimes();
    const mockRemove = jest.fn();

    render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
        onRemove={mockRemove}
      />
    );

    // Find and click the remove button
    const removeButton = screen.getByLabelText(`Remove order ${order.id}`);
    fireEvent.click(removeButton);

    expect(mockRemove).toHaveBeenCalledWith(order.id);
  });

  it("should not show remove button when onRemove is not provided", () => {
    const order = createMockOrder();
    const { arrivalTime, departureTime } = createArrivalDepartureTimes();

    render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );

    // Should not find remove button
    expect(
      screen.queryByLabelText(`Remove order ${order.id}`)
    ).not.toBeInTheDocument();
  });

  it("should handle orders with missing product information", () => {
    const order: Order = {
      id: "order-1",
      product: { name: "Test Product", price: 100, complexity: 1 },
      status: "pending" as const,
      priority: "medium" as const,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: "Test Customer",
      totalAmount: 100,
      location: { lat: 51.505, lng: -0.09 },
    };

    // Remove product name to test fallback
    const orderWithoutProductName = {
      ...order,
      product: { name: "", price: 100, complexity: 1 as const },
    };

    const { arrivalTime, departureTime } = createArrivalDepartureTimes();

    render(
      <DeliveryOrderItem
        id={orderWithoutProductName.id}
        order={orderWithoutProductName}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );

    // Should still render without crashing
    expect(screen.getByText("Test Customer")).toBeInTheDocument();
  });

  it("should handle orders with different statuses", () => {
    const order: Order = {
      id: "order-1",
      product: { name: "Test Product", price: 100, complexity: 1 },
      status: "pending" as const,
      priority: "medium" as const,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: "Test Customer",
      totalAmount: 100,
      location: { lat: 51.505, lng: -0.09 },
    };

    const { arrivalTime, departureTime } = createArrivalDepartureTimes();

    const { rerender } = render(
      <DeliveryOrderItem
        id={order.id}
        order={order}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );

    // Test pending status
    expect(screen.getByText("pending")).toBeInTheDocument();

    // Test in-progress status
    const orderInProgress = { ...order, status: "in-progress" as const };
    rerender(
      <DeliveryOrderItem
        id={orderInProgress.id}
        order={orderInProgress}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );
    expect(screen.getByText("in-progress")).toBeInTheDocument();

    // Test completed status
    const orderCompleted = { ...order, status: "completed" as const };
    rerender(
      <DeliveryOrderItem
        id={orderCompleted.id}
        order={orderCompleted}
        arrivalTime={arrivalTime}
        departureTime={departureTime}
      />
    );
    expect(screen.getByText("completed")).toBeInTheDocument();
  });
});
