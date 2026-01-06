import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor, screen } from "@testing-library/react";
import DeliverySidebar from "@/components/delivery-route-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";
import { DeliveryRoutesApi } from "@/services/deliveryRoutesApi";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import RouteSegmentsProvider from "@/contexts/route-segments-provider";
import { RouteSegmentsContext } from "@/contexts/route-segments-context";
import type { RouteSegmentData } from "@/contexts/route-segments-context";

// Mock the OrdersApi
jest.mock("@/services/ordersApi");
// Mock the DeliveryRoutesApi
jest.mock("@/services/deliveryRoutesApi");

const mockOrders: Order[] = [
  {
    id: "order-1",
    product: { name: "Product 1", price: 100, complexity: 1 },
    status: "pending",
    priority: "medium",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Customer 1",
    totalAmount: 100,
    location: { lat: 52.52, lng: 13.405 },
  },
  {
    id: "order-2",
    product: { name: "Product 2", price: 150, complexity: 2 },
    status: "pending",
    priority: "medium",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Customer 2",
    totalAmount: 150,
    location: { lat: 52.52, lng: 13.405 },
  },
];

describe("DeliverySidebar - Assigned Count Update", () => {
  let getDeliveriesMock: jest.Mock;
  let getOrdersMock: jest.Mock;

  const Wrapper = ({
    initialDeliveryOrders,
    onAddOrderToDelivery,
  }: {
    initialDeliveryOrders: Order[];
    onAddOrderToDelivery?: (orderId: string) => Promise<void>;
  }) => {
    const [deliveryOrders, setDeliveryOrders] = useState<Order[]>(
      initialDeliveryOrders
    );

    return (
      <MemoryRouter>
        <SidebarProvider>
          <DeliveryRouteManagerProvider>
            <DeliverySidebar
              deliveryOrders={deliveryOrders}
              onDeliveryOrdersUpdated={setDeliveryOrders}
              onAddOrderToDelivery={onAddOrderToDelivery}
            />
          </DeliveryRouteManagerProvider>
        </SidebarProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Mock the getOrders method - initially order-2 has no deliveryId
    getOrdersMock = (OrdersApi.getOrders as jest.Mock).mockResolvedValue([
      ...mockOrders,
    ]);

    // Mock getDeliveries to return a delivery with one assigned order initially
    getDeliveriesMock = (
      DeliveryRoutesApi.getDeliveries as jest.Mock
    ).mockResolvedValue([
      {
        id: "delivery-1",
        name: "Test Delivery",
        status: "scheduled",
        createdAt: new Date(),
        updatedAt: new Date(),
        orders: [{ orderId: "order-1", sequence: 0, status: "pending" }],
      },
    ]);

    // Mock addOrderToDelivery to return updated delivery
    (DeliveryRoutesApi.addOrderToDelivery as jest.Mock).mockImplementation(
      (_deliveryId, orderId) => {
        // Update the mock to return delivery with 2 orders
        getDeliveriesMock.mockResolvedValue([
          {
            id: "delivery-1",
            name: "Test Delivery",
            status: "scheduled",
            createdAt: new Date(),
            updatedAt: new Date(),
            orders: [
              { orderId: "order-1", sequence: 0, status: "pending" },
              { orderId, sequence: 1, status: "pending" },
            ],
          },
        ]);

        // Also update the OrdersApi mock to return the order with deliveryId set
        getOrdersMock.mockResolvedValue([
          {
            ...mockOrders[0],
            deliveryId: "delivery-1",
          },
          {
            ...mockOrders[1],
            deliveryId: "delivery-1",
          },
        ]);

        return {
          id: "delivery-1",
          name: "Test Delivery",
          status: "scheduled",
          createdAt: new Date(),
          updatedAt: new Date(),
          orders: [
            { orderId: "order-1", sequence: 0, status: "pending" },
            { orderId, sequence: 1, status: "pending" },
          ],
        };
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show correct initial assigned count", async () => {
    const { container } = render(
      <Wrapper initialDeliveryOrders={[mockOrders[0]]} />
    );

    // Look for the delivery orders count display with the specific class
    const countElement = container.querySelector(
      ".text-sm.font-medium.text-foreground"
    );
    expect(countElement).toBeInTheDocument();
    expect(countElement).toHaveTextContent("1");
  });

  it("should render delivery orders list", async () => {
    const { container } = render(
      <Wrapper initialDeliveryOrders={[mockOrders[0]]} />
    );

    // Check that the sidebar element is rendered
    await waitFor(() => {
      const sidebar = container.querySelector('[data-sidebar="sidebar"]');
      expect(sidebar).toBeTruthy();
    });
  });

  it("should calculate total distance and time using route segments when available", async () => {
    const mockRouteSegments: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 5000, // 5 km in meters
        duration: 600, // 10 minutes in seconds
      },
    ];

    const WrapperWithRouteSegments = ({
      children,
      segments,
    }: {
      children: React.ReactNode;
      segments: RouteSegmentData[];
    }) => {
      const [routeSegments, setRouteSegments] =
        useState<RouteSegmentData[]>(segments);

      return (
        <MemoryRouter>
          <SidebarProvider>
            <DeliveryRouteManagerProvider>
              <RouteSegmentsContext.Provider
                value={{ routeSegments, setRouteSegments }}
              >
                {children}
              </RouteSegmentsContext.Provider>
            </DeliveryRouteManagerProvider>
          </SidebarProvider>
        </MemoryRouter>
      );
    };

    render(
      <WrapperWithRouteSegments segments={mockRouteSegments}>
        <DeliverySidebar
          deliveryOrders={mockOrders}
          onDeliveryOrdersUpdated={() => {}}
        />
      </WrapperWithRouteSegments>
    );

    // Wait for calculations to complete
    await waitFor(
      () => {
        // Should show 5.00 km
        expect(screen.getByText(/5\.00\s?km/i)).toBeInTheDocument();
        // Should show 10 minutes (rounded)
        expect(screen.getByText(/10m/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("should round minutes to integer values", async () => {
    const mockRouteSegments: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 5000,
        duration: 638, // 10.633333... minutes, should round to 11
      },
    ];

    const WrapperWithRouteSegments = ({
      children,
      segments,
    }: {
      children: React.ReactNode;
      segments: RouteSegmentData[];
    }) => {
      const [routeSegments, setRouteSegments] =
        useState<RouteSegmentData[]>(segments);

      return (
        <MemoryRouter>
          <SidebarProvider>
            <DeliveryRouteManagerProvider>
              <RouteSegmentsContext.Provider
                value={{ routeSegments, setRouteSegments }}
              >
                {children}
              </RouteSegmentsContext.Provider>
            </DeliveryRouteManagerProvider>
          </SidebarProvider>
        </MemoryRouter>
      );
    };

    render(
      <WrapperWithRouteSegments segments={mockRouteSegments}>
        <DeliverySidebar
          deliveryOrders={mockOrders}
          onDeliveryOrdersUpdated={() => {}}
        />
      </WrapperWithRouteSegments>
    );

    // Wait for calculations to complete
    await waitFor(
      () => {
        // Should show rounded integer 11, not 10.633333...
        const minuteElements = screen.queryAllByText(/11/);
        expect(minuteElements.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });
});
