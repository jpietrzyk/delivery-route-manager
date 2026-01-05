import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OrderFilters } from "@/components/delivery-route/order-filters";

describe("OrderFilters", () => {
  it("should render filters section with heading", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(screen.getByText("FILTRY")).toBeInTheDocument();
    expect(screen.getByText("Priorytet")).toBeInTheDocument();
  });

  it("should render all three priority filter toggles", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(screen.getByLabelText("Filter by Low priority")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Medium priority")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by High priority")
    ).toBeInTheDocument();
  });

  it("should have all filters enabled by default", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");
    const mediumToggle = screen.getByLabelText("Filter by Medium priority");
    const highToggle = screen.getByLabelText("Filter by High priority");

    expect(lowToggle).toHaveAttribute("data-state", "on");
    expect(mediumToggle).toHaveAttribute("data-state", "on");
    expect(highToggle).toHaveAttribute("data-state", "on");
  });

  it("should call onPriorityChange with correct state when low priority is toggled off", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");
    fireEvent.click(lowToggle);

    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: true,
      high: true,
    });
  });

  it("should call onPriorityChange with correct state when medium priority is toggled off", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const mediumToggle = screen.getByLabelText("Filter by Medium priority");
    fireEvent.click(mediumToggle);

    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: true,
      medium: false,
      high: true,
    });
  });

  it("should call onPriorityChange with correct state when high priority is toggled off", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const highToggle = screen.getByLabelText("Filter by High priority");
    fireEvent.click(highToggle);

    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: true,
      medium: true,
      high: false,
    });
  });

  it("should toggle low priority on and off correctly", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");

    // Toggle off
    fireEvent.click(lowToggle);
    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: true,
      high: true,
    });

    // Toggle back on
    fireEvent.click(lowToggle);
    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: true,
      medium: true,
      high: true,
    });
  });

  it("should handle multiple priority toggles independently", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");
    const highToggle = screen.getByLabelText("Filter by High priority");

    // Toggle off low priority
    fireEvent.click(lowToggle);
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: false,
      medium: true,
      high: true,
    });

    // Toggle off high priority
    fireEvent.click(highToggle);
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: false,
      medium: true,
      high: false,
    });

    // Toggle low priority back on
    fireEvent.click(lowToggle);
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: true,
      medium: true,
      high: false,
    });
  });

  it("should allow all priorities to be disabled at once", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");
    const mediumToggle = screen.getByLabelText("Filter by Medium priority");
    const highToggle = screen.getByLabelText("Filter by High priority");

    // Disable all priorities
    fireEvent.click(lowToggle);
    fireEvent.click(mediumToggle);
    fireEvent.click(highToggle);

    // Last call should have all priorities false
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: false,
      medium: false,
      high: false,
    });
  });

  it("should display priority icons correctly", () => {
    const { container } = render(<OrderFilters onPriorityChange={jest.fn()} />);

    // All three toggles should have SVG icons
    const svgIcons = container.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThanOrEqual(3); // At least one icon per toggle
  });

  it("should have correct styling classes", () => {
    const { container } = render(<OrderFilters onPriorityChange={jest.fn()} />);

    // Check for main container styling
    const mainContainer = container.querySelector(".border-b");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("border-border");
    expect(mainContainer).toHaveClass("bg-muted/50");
  });

  it("should display toggle labels correctly", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(screen.getByText("Niski")).toBeInTheDocument();
    expect(screen.getByText("Średni")).toBeInTheDocument();
    expect(screen.getByText("Wysoki")).toBeInTheDocument();
  });

  it("should maintain toggle states across multiple interactions", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");
    const mediumToggle = screen.getByLabelText("Filter by Medium priority");

    // Perform multiple interactions
    fireEvent.click(lowToggle); // Low: off
    fireEvent.click(mediumToggle); // Medium: off
    fireEvent.click(lowToggle); // Low: on
    fireEvent.click(mediumToggle); // Medium: on

    // Check the call count
    expect(mockOnPriorityChange).toHaveBeenCalledTimes(4);

    // Last call should have both low and medium back to true
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: true,
      medium: true,
      high: true,
    });
  });

  it("should call onPriorityChange on every toggle interaction", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");
    const mediumToggle = screen.getByLabelText("Filter by Medium priority");
    const highToggle = screen.getByLabelText("Filter by High priority");

    // Click each toggle once
    fireEvent.click(lowToggle);
    fireEvent.click(mediumToggle);
    fireEvent.click(highToggle);

    // Should be called three times
    expect(mockOnPriorityChange).toHaveBeenCalledTimes(3);
  });

  it("should reflect toggle state visually with data-state attribute", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");

    // Initially on
    expect(lowToggle).toHaveAttribute("data-state", "on");

    // Toggle off
    fireEvent.click(lowToggle);
    expect(lowToggle).toHaveAttribute("data-state", "off");

    // Toggle back on
    fireEvent.click(lowToggle);
    expect(lowToggle).toHaveAttribute("data-state", "on");
  });

  it("should handle rapid successive toggles correctly", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filter by Low priority");

    // Rapid clicks
    fireEvent.click(lowToggle);
    fireEvent.click(lowToggle);
    fireEvent.click(lowToggle);
    fireEvent.click(lowToggle);

    // Should be called four times
    expect(mockOnPriorityChange).toHaveBeenCalledTimes(4);

    // Final state should be same as initial (even number of toggles)
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: true,
      medium: true,
      high: true,
    });
  });
});

describe("OrderFilters - Status Filter", () => {
  it("should render all status filter toggles", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onStatusChange={jest.fn()} />
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Pending status")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by In Progress status")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Completed status")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter by Cancelled status")
    ).toBeInTheDocument();
  });

  it("should have all status filters enabled by default", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onStatusChange={jest.fn()} />
    );

    expect(screen.getByLabelText("Filter by Pending status")).toHaveAttribute(
      "data-state",
      "on"
    );
    expect(
      screen.getByLabelText("Filter by In Progress status")
    ).toHaveAttribute("data-state", "on");
    expect(screen.getByLabelText("Filter by Completed status")).toHaveAttribute(
      "data-state",
      "on"
    );
    expect(screen.getByLabelText("Filter by Cancelled status")).toHaveAttribute(
      "data-state",
      "on"
    );
  });

  it("should call onStatusChange when status filter is toggled", () => {
    const mockOnStatusChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onStatusChange={mockOnStatusChange}
      />
    );

    const pendingToggle = screen.getByLabelText("Filter by Pending status");
    fireEvent.click(pendingToggle);

    expect(mockOnStatusChange).toHaveBeenCalledWith({
      pending: false,
      "in-progress": true,
      completed: true,
      cancelled: true,
    });
  });
});

describe("OrderFilters - Amount Filter", () => {
  it("should render all amount filter toggles", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onAmountChange={jest.fn()} />
    );

    expect(screen.getByText(/amount|kwota/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Low amount/)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Filter by Medium amount/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by High amount/)).toBeInTheDocument();
  });

  it("should have all amount filters enabled by default", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onAmountChange={jest.fn()} />
    );

    expect(screen.getByLabelText(/Filter by Low amount/)).toHaveAttribute(
      "data-state",
      "on"
    );
    expect(screen.getByLabelText(/Filter by Medium amount/)).toHaveAttribute(
      "data-state",
      "on"
    );
    expect(screen.getByLabelText(/Filter by High amount/)).toHaveAttribute(
      "data-state",
      "on"
    );
  });

  it("should call onAmountChange when amount filter is toggled", () => {
    const mockOnAmountChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onAmountChange={mockOnAmountChange}
      />
    );

    const lowToggle = screen.getByLabelText(/Filter by Low amount/);
    fireEvent.click(lowToggle);

    expect(mockOnAmountChange).toHaveBeenCalledWith({
      low: false,
      medium: true,
      high: true,
    });
  });
});

describe("OrderFilters - Complexity Filter", () => {
  it("should render all complexity filter toggles", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onComplexityChange={jest.fn()}
      />
    );

    expect(screen.getByText("Złożoność")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Filter by Simple complexity/)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Filter by Moderate complexity/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Complex/)).toBeInTheDocument();
  });

  it("should have all complexity filters enabled by default", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onComplexityChange={jest.fn()}
      />
    );

    expect(
      screen.getByLabelText(/Filter by Simple complexity/)
    ).toHaveAttribute("data-state", "on");
    expect(
      screen.getByLabelText(/Filter by Moderate complexity/)
    ).toHaveAttribute("data-state", "on");
    expect(screen.getByLabelText(/Filter by Complex/)).toHaveAttribute(
      "data-state",
      "on"
    );
  });

  it("should call onComplexityChange when complexity filter is toggled", () => {
    const mockOnComplexityChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onComplexityChange={mockOnComplexityChange}
      />
    );

    const simpleToggle = screen.getByLabelText(/Filter by Simple complexity/);
    fireEvent.click(simpleToggle);

    expect(mockOnComplexityChange).toHaveBeenCalledWith({
      simple: false,
      moderate: true,
      complex: true,
    });
  });
});

describe("OrderFilters - UpdatedAt Filter", () => {
  it("should render all updatedAt filter toggles", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onUpdatedAtChange={jest.fn()}
      />
    );

    expect(screen.getByText("Data aktualizacji")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Filter by Recent updates/)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Filter by Moderate updates/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Old updates/)).toBeInTheDocument();
  });

  it("should have all updatedAt filters enabled by default", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onUpdatedAtChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/Filter by Recent updates/)).toHaveAttribute(
      "data-state",
      "on"
    );
    expect(screen.getByLabelText(/Filter by Moderate updates/)).toHaveAttribute(
      "data-state",
      "on"
    );
    expect(screen.getByLabelText(/Filter by Old updates/)).toHaveAttribute(
      "data-state",
      "on"
    );
  });

  it("should call onUpdatedAtChange when updatedAt filter is toggled", () => {
    const mockOnUpdatedAtChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onUpdatedAtChange={mockOnUpdatedAtChange}
      />
    );

    const recentToggle = screen.getByLabelText(/Filter by Recent updates/);
    fireEvent.click(recentToggle);

    expect(mockOnUpdatedAtChange).toHaveBeenCalledWith({
      recent: false,
      moderate: true,
      old: true,
    });
  });
});

describe("OrderFilters - All Filters Together", () => {
  it("should handle all filter types simultaneously", () => {
    const mockOnPriorityChange = jest.fn();
    const mockOnStatusChange = jest.fn();
    const mockOnAmountChange = jest.fn();
    const mockOnComplexityChange = jest.fn();
    const mockOnUpdatedAtChange = jest.fn();

    render(
      <OrderFilters
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAmountChange={mockOnAmountChange}
        onComplexityChange={mockOnComplexityChange}
        onUpdatedAtChange={mockOnUpdatedAtChange}
      />
    );

    // Click one filter from each category
    fireEvent.click(screen.getByLabelText("Filter by Low priority"));
    fireEvent.click(screen.getByLabelText("Filter by Pending status"));
    fireEvent.click(screen.getByLabelText(/Filter by Low amount/));
    fireEvent.click(screen.getByLabelText(/Filter by Simple complexity/));
    fireEvent.click(screen.getByLabelText(/Filter by Recent updates/));

    // All callbacks should be called once
    expect(mockOnPriorityChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnAmountChange).toHaveBeenCalledTimes(1);
    expect(mockOnComplexityChange).toHaveBeenCalledTimes(1);
    expect(mockOnUpdatedAtChange).toHaveBeenCalledTimes(1);
  });

  it("should render all 5 filter columns in the grid", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onStatusChange={jest.fn()}
        onAmountChange={jest.fn()}
        onComplexityChange={jest.fn()}
        onUpdatedAtChange={jest.fn()}
      />
    );

    expect(screen.getByText("Priorytet")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Kwota")).toBeInTheDocument();
    expect(screen.getByText("Złożoność")).toBeInTheDocument();
    expect(screen.getByText("Data aktualizacji")).toBeInTheDocument();
  });
});
