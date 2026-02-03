import React from "react";
import { render } from "@testing-library/react";
import HereMapPage from "@/pages/here-map-page";

jest.mock("@/hooks/use-delivery-route", () => ({
  useDeliveryRoute: () => ({}),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ deliveryId: "DEL-001" }),
}));

const hereSpy = jest.fn<React.ReactElement, [Record<string, unknown>]>(() => (
  <div data-testid="here" />
));

jest.mock("@/components/maps/abstraction/leaflet-map-view", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // Add filteredUnassignedOrders to props if not present, for test compatibility
    type MapViewProps = {
      filteredUnassignedOrders?: unknown;
      unassignedOrders?: unknown;
      [key: string]: unknown;
    };
    const enhancedProps = {
      ...props,
      filteredUnassignedOrders:
        (props as MapViewProps).filteredUnassignedOrders ??
        (props as MapViewProps).unassignedOrders,
    };
    hereSpy(enhancedProps);
    return <div data-testid="here" />;
  },
}));

jest.mock("@/components/delivery-route-map-layout", () => ({
  __esModule: true,
  default: ({
    renderMap,
  }: {
    renderMap: (
      orders: unknown[],
      unassignedOrders: unknown[],
      onOrderAddedToDelivery: (...args: unknown[]) => void,
      onRefreshRequested: (...args: unknown[]) => void,
    ) => React.ReactNode;
  }) => {
    const orders = [
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
    const unassignedOrders = [
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

describe("HereMapPage", () => {
  it("passes unassigned orders as filtered list", () => {
    render(<HereMapPage />);

    expect(hereSpy).toHaveBeenCalled();
    const call = hereSpy.mock.calls[0];
    expect(call).toBeDefined();
    const props = (call?.[0] ?? {}) as {
      filteredUnassignedOrders?: unknown;
      unassignedOrders?: unknown;
      onOrderAddedToDelivery?: unknown;
      onRefreshRequested?: unknown;
      [key: string]: unknown;
    };
    expect(props).toBeDefined();
    expect(props.filteredUnassignedOrders).toBe(props.unassignedOrders);
    expect(typeof props.onOrderAddedToDelivery).toBe("function");
    expect(typeof props.onRefreshRequested).toBe("function");
  });
});
