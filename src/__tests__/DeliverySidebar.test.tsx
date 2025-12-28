import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeliverySidebar from "@/components/delivery-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import MarkerHighlightProvider from "@/contexts/marker-highlight-provider";
import DeliveryProvider from "@/contexts/delivery-provider";
import { DeliveriesApi } from "@/services/deliveriesApi";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";

// Mock the OrdersApi
jest.mock("@/services/ordersApi");
// Mock the DeliveriesApi
jest.mock("@/services/deliveriesApi");

const mockOrders: Order[] = [
  {
    id: "order-1",
    product: { name: "Product 1", price: 100, complexity: 1 },
    status: "pending",
    priority: "medium",
    active: true,
    deliveryId: "delivery-1",
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

  beforeEach(() => {
    // Mock the getOrders method - initially order-2 has no deliveryId
    getOrdersMock = (OrdersApi.getOrders as jest.Mock).mockResolvedValue([
      ...mockOrders,
    ]);

    // Mock getDeliveries to return a delivery with one assigned order initially
    getDeliveriesMock = (
      DeliveriesApi.getDeliveries as jest.Mock
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
    (DeliveriesApi.addOrderToDelivery as jest.Mock).mockImplementation(
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

  it("should update assigned count when order is added to delivery", async () => {
    // Mock the updateOrder method
    (OrdersApi.updateOrder as jest.Mock).mockResolvedValue({
      ...mockOrders[1],
      deliveryId: "delivery-1",
    });

    render(
      <SidebarProvider>
        <MarkerHighlightProvider>
          <DeliveryProvider>
            <DeliverySidebar
              unassignedOrders={[mockOrders[1]]}
              onAddOrderToDelivery={async (orderId: string) => {
                await OrdersApi.updateOrder(orderId, {
                  deliveryId: "delivery-1",
                });
                // Force refresh of deliveries by calling getDeliveries again
                await DeliveriesApi.getDeliveries();
                return;
              }}
            />
          </DeliveryProvider>
        </MarkerHighlightProvider>
      </SidebarProvider>
    );

    // Wait for initial loading
    await waitFor(() => {
      expect(
        screen.queryByText("Loading delivery orders...")
      ).not.toBeInTheDocument();
    });

    // Find the unassigned order and click the add button
    const addButton = screen.getByLabelText(
      new RegExp(`Add order ${mockOrders[1].id} to delivery`, "i")
    );
    fireEvent.click(addButton);

    // Wait for the update to complete
    await waitFor(() => {
      // The assigned count should be updated to 2 (from 1)
      // Use a more flexible matcher that can find the text even if broken by elements
      const countElement = screen.getByText((content) => {
        return (
          content.includes("orders assigned to this delivery") &&
          content.includes("2")
        );
      });
      expect(countElement).toBeInTheDocument();
    });
  });

  it("should show correct initial assigned count", async () => {
    render(
      <SidebarProvider>
        <MarkerHighlightProvider>
          <DeliveryProvider>
            <DeliverySidebar unassignedOrders={[mockOrders[1]]} />
          </DeliveryProvider>
        </MarkerHighlightProvider>
      </SidebarProvider>
    );

    // Wait for the assigned count to be updated
    await waitFor(() => {
      const countElement = screen.getByText((content) => {
        return (
          content.includes("orders assigned to this delivery") &&
          content.includes("1")
        );
      });
      expect(countElement).toBeInTheDocument();
    });
  });
});
