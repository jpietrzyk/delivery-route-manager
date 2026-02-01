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

const hereSpy = jest.fn(() => <div data-testid="here" />);

jest.mock("@/components/maps/abstraction/here-map-view", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    hereSpy(props);
    return <div data-testid="here" />;
  },
}));

jest.mock("@/components/delivery-route-map-layout", () => ({
  __esModule: true,
  default: ({ renderMap }: { renderMap: Function }) => {
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
    const props = hereSpy.mock.calls[0][0];
    expect(props).toBeDefined();
    expect(props!.filteredUnassignedOrders).toBe(props!.unassignedOrders);
    expect(typeof props!.onOrderAddedToDelivery).toBe("function");
    expect(typeof props!.onRefreshRequested).toBe("function");
  });
});
