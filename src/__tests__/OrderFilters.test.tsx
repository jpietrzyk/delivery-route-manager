import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OrderFilters } from "@/components/delivery-route/order-filters";
import type { PriorityFilterState } from "@/components/delivery-route/order-filters";

describe("OrderFilters", () => {
  it("should render filters section with heading", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Priority")).toBeInTheDocument();
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

    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
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
