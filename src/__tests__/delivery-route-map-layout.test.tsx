import React from "react";
import { render, waitFor } from "@testing-library/react";
import DeliveryRouteMapLayout from "@/components/delivery-route-map-layout";

interface UnassignedOrdersDataTableProps {
  data: unknown[];
  onFilteredDataChange?: (filteredData: unknown[]) => void;
}

jest.mock("@/components/delivery-route/unassigned-orders-data-table", () => {
  return {
    UnassignedOrdersDataTable: ({
      data,
      onFilteredDataChange,
    }: UnassignedOrdersDataTableProps) => {
      React.useEffect(() => {
        if (onFilteredDataChange) {
          onFilteredDataChange(data.slice(0, 1));
        }
      }, [data, onFilteredDataChange]);
      return <div data-testid="datatable" />;
    },
  };
});

interface ChildrenProps {
  children: React.ReactNode;
}

jest.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: ChildrenProps) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">Toggle</button>,
}));

jest.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children }: ChildrenProps) => <div>{children}</div>,
  DrawerContent: ({ children }: ChildrenProps) => <div>{children}</div>,
  DrawerTitle: ({ children }: ChildrenProps) => <div>{children}</div>,
  DrawerTrigger: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

jest.mock("@/components/delivery-route-sidebar", () => () => (
  <div data-testid="sidebar" />
));

jest.mock("@/components/map-controls", () => ({
  MapControls: () => <div data-testid="map-controls" />,
}));

jest.mock("@/hooks/use-delivery-route", () => {
  const createOrder = (id: string) => ({
    id,
    status: "pending",
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customer: { name: "Customer" },
    totalAmount: 500,
    location: { lat: 52.52, lng: 13.405 },
    complexity: 1,
  });
  return {
    useDeliveryRoute: () => ({
      addOrderToDelivery: jest.fn(),
      unassignedOrders: [createOrder("order-1"), createOrder("order-2")],
      deliveryOrders: [createOrder("delivery-1")],
      deliveries: [{ id: "DEL-001", name: "Delivery" }],
      currentDelivery: { id: "DEL-001", name: "Delivery" },
      setCurrentDelivery: jest.fn(),
      refreshUnassignedOrders: jest.fn(),
      refreshDeliveryOrders: jest.fn(),
    }),
  };
});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ deliveryId: "DEL-001" }),
  useNavigate: () => jest.fn(),
}));

describe("DeliveryRouteMapLayout", () => {
  it("passes filtered unassigned orders to renderMap", async () => {
    const renderMap = jest.fn(() => <div data-testid="map" />);

    render(<DeliveryRouteMapLayout renderMap={renderMap} />);

    await waitFor(() => expect(renderMap).toHaveBeenCalled());

    const firstCall = renderMap.mock.calls[0] as unknown[];
    const lastCall = renderMap.mock.calls[
      renderMap.mock.calls.length - 1
    ] as unknown[];

    expect((firstCall[1] as unknown[]).length).toBe(2);
    expect((lastCall[1] as unknown[]).length).toBe(1);
  });
});
