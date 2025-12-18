import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DeliveryRouteSegment } from "@/components/delivery/delivery-route-segment";
import type { RouteSegment, RouteData } from "@/types/map-provider";
import type { Order } from "@/types/order";

describe("DeliveryRouteSegment", () => {
  const createMockOrder = (id: string = "order-1"): Order => ({
    id,
    product: { name: "Test Product", price: 100, complexity: 1 },
    status: "pending" as const,
    priority: "medium" as const,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Test Customer",
    totalAmount: 100,
    location: { lat: 51.505, lng: -0.09 },
  });

  const createMockRouteSegment = (
    fromOrderId: string = "order-1",
    toOrderId: string = "order-2",
    routeData?: RouteData
  ): RouteSegment => ({
    id: `${fromOrderId}-${toOrderId}`,
    fromOrder: createMockOrder(fromOrderId),
    toOrder: createMockOrder(toOrderId),
    routeData,
    status: routeData ? "calculated" : "idle",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockRouteData = (
    distance: number = 5000,
    duration: number = 900
  ): RouteData => ({
    polyline: "encoded_polyline_string",
    distance,
    duration,
    bounds: {
      minLat: 51.5,
      minLng: -0.1,
      maxLat: 51.6,
      maxLng: 0.0,
    },
    status: "calculated",
    calculatedAt: new Date(),
  });

  it("should render segment ID and basic structure", () => {
    const segment = createMockRouteSegment();

    render(<DeliveryRouteSegment segment={segment} />);

    // Should render segment ID
    expect(screen.getByText("Route Segment:")).toBeInTheDocument();
    expect(screen.getByText("order-1-order-2")).toBeInTheDocument();

    // Should render connection icon
    expect(screen.getByTestId("connection-icon")).toBeInTheDocument();

    // Should render refresh button
    const refreshButton = screen.getByLabelText("Refresh route");
    expect(refreshButton).toBeInTheDocument();
  });

  it("should display route data when available", () => {
    const routeData = createMockRouteData(5000, 900); // 5km, 15 minutes
    const segment = createMockRouteSegment("order-1", "order-2", routeData);

    render(<DeliveryRouteSegment segment={segment} />);

    // Should display formatted distance (5.00 km)
    expect(screen.getByText("5.00 km")).toBeInTheDocument();

    // Should display formatted duration (15 m)
    expect(screen.getByText("15 m")).toBeInTheDocument();
  });

  it("should display 'Nie dostępna' when route data is missing", () => {
    const segment = createMockRouteSegment();

    render(<DeliveryRouteSegment segment={segment} />);

    // Should display "Nie dostępna" for both distance and duration
    const notAvailableElements = screen.getAllByText("Nie dostępna");
    expect(notAvailableElements).toHaveLength(2); // One for distance, one for duration
  });

  it("should format long durations correctly (hours and minutes)", () => {
    // 2 hours 30 minutes = 9000 seconds
    const routeData = createMockRouteData(100000, 9000);
    const segment = createMockRouteSegment("order-1", "order-2", routeData);

    render(<DeliveryRouteSegment segment={segment} />);

    // Should display "2 h 30 m"
    expect(screen.getByText("2 h 30 m")).toBeInTheDocument();
  });

  it("should format short durations correctly (minutes only)", () => {
    // 15 minutes = 900 seconds
    const routeData = createMockRouteData(5000, 900);
    const segment = createMockRouteSegment("order-1", "order-2", routeData);

    render(<DeliveryRouteSegment segment={segment} />);

    // Should display "15 m"
    expect(screen.getByText("15 m")).toBeInTheDocument();
  });

  it("should call onRecalculate when refresh button is clicked", () => {
    const segment = createMockRouteSegment();
    const mockRecalculate = jest.fn();

    render(
      <DeliveryRouteSegment segment={segment} onRecalculate={mockRecalculate} />
    );

    const refreshButton = screen.getByLabelText("Refresh route");
    fireEvent.click(refreshButton);

    expect(mockRecalculate).toHaveBeenCalled();
  });

  it("should disable refresh button when isCalculating is true", () => {
    const segment = createMockRouteSegment();

    render(<DeliveryRouteSegment segment={segment} isCalculating={true} />);

    const refreshButton = screen.getByLabelText("Recalculating...");
    expect(refreshButton).toBeDisabled();
  });

  it("should call onHover when mouse enters the segment", () => {
    const segment = createMockRouteSegment();
    const mockHover = jest.fn();

    const { container } = render(
      <DeliveryRouteSegment segment={segment} onHover={mockHover} />
    );

    const segmentElement = container.querySelector(".delivery-route-segment");
    if (segmentElement) {
      fireEvent.mouseEnter(segmentElement);
      expect(mockHover).toHaveBeenCalled();
    }
  });

  it("should handle segments with very long distances", () => {
    // 500 km distance
    const routeData = createMockRouteData(500000, 4500); // 500km, 75 minutes
    const segment = createMockRouteSegment("order-1", "order-2", routeData);

    render(<DeliveryRouteSegment segment={segment} />);

    // Should display formatted distance
    expect(screen.getByText("500.00 km")).toBeInTheDocument();

    // Should display formatted duration
    expect(screen.getByText("1 h 15 m")).toBeInTheDocument();
  });

  it("should handle segments with very short distances", () => {
    // 100 meters distance, 1 minute duration
    const routeData = createMockRouteData(100, 60);
    const segment = createMockRouteSegment("order-1", "order-2", routeData);

    render(<DeliveryRouteSegment segment={segment} />);

    // Should display formatted distance
    expect(screen.getByText("0.10 km")).toBeInTheDocument();

    // Should display formatted duration
    expect(screen.getByText("1 m")).toBeInTheDocument();
  });

  it("should handle different segment IDs", () => {
    const segment1 = createMockRouteSegment("order-A", "order-B");
    const segment2 = createMockRouteSegment("order-X", "order-Y");

    const { rerender } = render(<DeliveryRouteSegment segment={segment1} />);

    expect(screen.getByText("order-A-order-B")).toBeInTheDocument();

    rerender(<DeliveryRouteSegment segment={segment2} />);

    expect(screen.getByText("order-X-order-Y")).toBeInTheDocument();
  });
});
