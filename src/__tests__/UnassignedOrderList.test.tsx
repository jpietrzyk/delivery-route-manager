import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UnassignedOrderList } from "@/components/delivery/unassigned-order-list";
import type { Order as BaseOrder } from "@/types/order";

// Extend Order type locally to allow product to be undefined for testing
type Order = Omit<BaseOrder, "product"> & { product?: BaseOrder["product"] };

describe("UnassignedOrderList", () => {
  const createMockOrder = (
    id: string = "order-1",
    productName: string = "Test Product"
  ): Order => ({
    id,
    product: { name: productName, price: 100, complexity: 1 },
    status: "pending" as const,
    priority: "medium" as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Test Customer",
    totalAmount: 100,
    location: { lat: 51.505, lng: -0.09 },
  });

  it("should render empty state when no unassigned orders are provided", () => {
    render(
      <UnassignedOrderList unassignedOrders={[]} onAddToDelivery={jest.fn()} />
    );

    // Should show "No unassigned orders available" message
    expect(
      screen.getByText("No unassigned orders available")
    ).toBeInTheDocument();
  });

  it("should render default title when no title is provided", () => {
    const order = createMockOrder();
    render(
      <UnassignedOrderList
        unassignedOrders={[order as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should show default title "Available Unassigned Orders"
    expect(screen.getByText("Available Unassigned Orders")).toBeInTheDocument();
  });

  it("should render custom title when provided", () => {
    const order = createMockOrder();
    render(
      <UnassignedOrderList
        unassignedOrders={[order as BaseOrder]}
        onAddToDelivery={jest.fn()}
        title="Custom Unassigned Orders"
      />
    );

    // Should show custom title
    expect(screen.getByText("Custom Unassigned Orders")).toBeInTheDocument();
  });

  it("should render single unassigned order correctly", () => {
    const order = createMockOrder("order-1", "Test Product");
    render(
      <UnassignedOrderList
        unassignedOrders={[order as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should render the order product name
    expect(screen.getByText("Test Product")).toBeInTheDocument();

    // Should render add button
    const addButton = screen.getByLabelText("Add order order-1 to delivery");
    expect(addButton).toBeInTheDocument();
  });

  it("should render multiple unassigned orders correctly", () => {
    const order1 = createMockOrder("order-1", "Product 1");
    const order2 = createMockOrder("order-2", "Product 2");

    render(
      <UnassignedOrderList
        unassignedOrders={[order1 as BaseOrder, order2 as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should render both orders
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();

    // Should have add buttons for both orders
    const addButtons = screen.getAllByRole("button", { name: /Add order/ });
    expect(addButtons).toHaveLength(2);
  });

  it("should call onAddToDelivery when order is clicked", () => {
    const order = createMockOrder("order-1", "Test Product");
    const mockAddToDelivery = jest.fn();

    render(
      <UnassignedOrderList
        unassignedOrders={[order as BaseOrder]}
        onAddToDelivery={mockAddToDelivery}
      />
    );

    // Click on the order item
    const orderItem = screen.getByText("Test Product").closest("li");
    if (orderItem) {
      fireEvent.click(orderItem);
      expect(mockAddToDelivery).toHaveBeenCalledWith("order-1");
    }
  });

  it("should call onAddToDelivery when add button is clicked", () => {
    const order = createMockOrder("order-1", "Test Product");
    const mockAddToDelivery = jest.fn();

    render(
      <UnassignedOrderList
        unassignedOrders={[order as BaseOrder]}
        onAddToDelivery={mockAddToDelivery}
      />
    );

    // Click on the add button
    const addButton = screen.getByLabelText("Add order order-1 to delivery");
    fireEvent.click(addButton);
    expect(mockAddToDelivery).toHaveBeenCalledWith("order-1");
  });

  it("should handle orders without product names", () => {
    const order: Order = {
      ...createMockOrder("order-1"),
      product: undefined, // Order without product
    };

    render(
      <UnassignedOrderList
        unassignedOrders={[order as unknown as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should show fallback text "Order order-1"
    expect(screen.getByText("Order order-1")).toBeInTheDocument();
  });

  it("should handle orders with different product names", () => {
    const order1 = createMockOrder("order-1", "Short Product");
    const order2 = createMockOrder(
      "order-2",
      "Very Long Product Name That Should Be Truncated"
    );

    render(
      <UnassignedOrderList
        unassignedOrders={[order1 as BaseOrder, order2 as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should render both product names
    expect(screen.getByText("Short Product")).toBeInTheDocument();
    expect(
      screen.getByText("Very Long Product Name That Should Be Truncated")
    ).toBeInTheDocument();
  });

  it("should prevent event propagation when add button is clicked", () => {
    const order = createMockOrder("order-1", "Test Product");
    const mockAddToDelivery = jest.fn();

    render(
      <UnassignedOrderList
        unassignedOrders={[order as unknown as BaseOrder]}
        onAddToDelivery={mockAddToDelivery}
      />
    );

    // Click on the add button should only call onAddToDelivery once
    const addButton = screen.getByLabelText("Add order order-1 to delivery");
    fireEvent.click(addButton);

    // Should be called exactly once (not twice due to event bubbling)
    expect(mockAddToDelivery).toHaveBeenCalledTimes(1);
  });

  it("should render orders with consistent styling", () => {
    const order = createMockOrder("order-1", "Test Product");

    const { container } = render(
      <UnassignedOrderList
        unassignedOrders={[order as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should have the expected styling classes
    const orderItem = container.querySelector("li");
    expect(orderItem).toHaveClass("rounded");
    expect(orderItem).toHaveClass("border");
    expect(orderItem).toHaveClass("bg-card");
    expect(orderItem).toHaveClass("shadow-sm");
    expect(orderItem).toHaveClass("hover:shadow-md");
    expect(orderItem).toHaveClass("cursor-pointer");
  });

  it("should handle large numbers of unassigned orders", () => {
    const manyOrders = Array.from({ length: 10 }, (_, i) =>
      createMockOrder(`order-${i + 1}`, `Product ${i + 1}`)
    );

    render(
      <UnassignedOrderList
        unassignedOrders={manyOrders as BaseOrder[]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should render all orders
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 10")).toBeInTheDocument();

    // Should have add buttons for all orders
    const addButtons = screen.getAllByRole("button", { name: /Add order/ });
    expect(addButtons).toHaveLength(10);
  });

  it("should maintain order sequence in the list", () => {
    const order1 = createMockOrder("order-1", "First Product");
    const order2 = createMockOrder("order-2", "Second Product");
    const order3 = createMockOrder("order-3", "Third Product");

    render(
      <UnassignedOrderList
        unassignedOrders={[
          order1 as BaseOrder,
          order2 as BaseOrder,
          order3 as BaseOrder,
        ]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Check that orders appear in the correct sequence
    const orderItems = screen.getAllByRole("listitem");
    expect(orderItems).toHaveLength(3);

    // First item should contain "First Product"
    expect(orderItems[0]).toHaveTextContent("First Product");
    // Second item should contain "Second Product"
    expect(orderItems[1]).toHaveTextContent("Second Product");
    // Third item should contain "Third Product"
    expect(orderItems[2]).toHaveTextContent("Third Product");
  });

  it("should show add button with correct icon", () => {
    const order = createMockOrder("order-1", "Test Product");

    render(
      <UnassignedOrderList
        unassignedOrders={[order as unknown as BaseOrder]}
        onAddToDelivery={jest.fn()}
      />
    );

    // Should have Plus icon in the add button
    const addButton = screen.getByLabelText("Add order order-1 to delivery");
    expect(addButton.querySelector("svg")).toBeInTheDocument();
  });

  it("should handle click events on different parts of order item", () => {
    const order = createMockOrder("order-1", "Test Product");
    const mockAddToDelivery = jest.fn();

    render(
      <UnassignedOrderList
        unassignedOrders={[order as unknown as BaseOrder]}
        onAddToDelivery={mockAddToDelivery}
      />
    );

    // Click on the product name area
    const productName = screen.getByText("Test Product");
    fireEvent.click(productName);
    expect(mockAddToDelivery).toHaveBeenCalledWith("order-1");

    // Reset mock
    mockAddToDelivery.mockClear();

    // Click on the icon area
    const icon = screen.getByTestId("product-icon");
    if (icon) {
      fireEvent.click(icon);
      expect(mockAddToDelivery).toHaveBeenCalledWith("order-1");
    }
  });
});
