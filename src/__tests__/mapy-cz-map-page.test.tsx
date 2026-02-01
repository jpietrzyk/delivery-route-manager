import React from "react";
import { render } from "@testing-library/react";
import MapyCzMapPage from "@/pages/mapy-cz-map-page";

jest.mock("@/hooks/use-delivery-route", () => ({
  useDeliveryRoute: () => ({}),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ deliveryId: "DEL-001" }),
}));

interface MapyMapViewProps {
  [key: string]: unknown;
}

const mapySpy = jest.fn(() => <div data-testid="mapy" />);

jest.mock("@/components/maps/abstraction/mapy-map-view", () => ({
  __esModule: true,
  default: (props: MapyMapViewProps) => {
    mapySpy(props);
    return <div data-testid="mapy" />;
  },
}));

interface Order {
  id: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  customer: { name: string };
  totalAmount: number;
  location: { lat: number; lng: number };
  complexity: number;
}

jest.mock("@/components/delivery-route-map-layout", () => ({
  __esModule: true,
  default: ({
    renderMap,
  }: {
    renderMap: (
      orders: Order[],
      unassignedOrders: Order[],
      onOrderAddedToDelivery: () => void,
      onRefreshRequested: () => void,
    ) => React.ReactNode;
  }) => {
    const orders: Order[] = [
      {
        id: "order-1",
        status: "pending",
        priority: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: { name: "Customer" },
        totalAmount: 500,
        location: { lat: 52.52, lng: 13.405 },
        complexity: 1,
      },
    ];
    const unassignedOrders: Order[] = [
      {
        id: "order-2",
        status: "pending",
        priority: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: { name: "Customer" },
        totalAmount: 700,
        location: { lat: 52.52, lng: 13.405 },
        complexity: 2,
      },
    ];
    return (
      <div data-testid="layout">
        {renderMap(orders, unassignedOrders, jest.fn(), jest.fn())}
      </div>
    );
  },
}));

describe("MapyCzMapPage", () => {
  it("passes unassigned orders as filtered list", () => {
    render(<MapyCzMapPage />);

    expect(mapySpy).toHaveBeenCalled();
    const props =
      mapySpy.mock.calls.length > 0 && mapySpy.mock.calls[0]?.length > 0
        ? mapySpy.mock.calls[0][0]
        : undefined;
    expect(props).toBeDefined();
    expect(props && props.filteredUnassignedOrders).toBe(
      props && props.unassignedOrders,
    );
    expect(typeof (props && props.onOrderAddedToDelivery)).toBe("function");
    expect(typeof (props && props.onRefreshRequested)).toBe("function");
  });
});
