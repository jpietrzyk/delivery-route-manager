import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarkerHighlightProvider from "@/contexts/marker-highlight-provider";
import { UnassignedOrdersDataTable } from "@/components/delivery-route/unassigned-orders-data-table";
import type { Order } from "@/types/order";
import { pl } from "@/lib/translations";

const createOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-1",
  status: "pending",
  priority: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  customer: { name: "Customer" },
  totalAmount: 500,
  location: { lat: 52.52, lng: 13.405 },
  complexity: 1,
  ...overrides,
});

const renderWithProvider = (ui: React.ReactNode) =>
  render(<MarkerHighlightProvider>{ui}</MarkerHighlightProvider>);

describe("UnassignedOrdersDataTable", () => {
  it("calls onAddOrder when add button is clicked", async () => {
    const user = userEvent.setup();
    const onAddOrder = jest.fn();
    const data = [
      createOrder({ id: "order-1" }),
      createOrder({ id: "order-2", status: "completed" }),
    ];

    renderWithProvider(
      <UnassignedOrdersDataTable data={data} onAddOrder={onAddOrder} />,
    );

    const addButtons = screen.getAllByRole("button", { name: pl.tableAdd });
    await user.click(addButtons[0]);

    expect(onAddOrder).toHaveBeenCalledWith("order-1");
  });

  it("filters rows and emits filtered data", async () => {
    const user = userEvent.setup();
    const onFilteredDataChange = jest.fn();
    const data = [
      createOrder({ id: "order-1", status: "pending" }),
      createOrder({ id: "order-2", status: "completed", totalAmount: 900 }),
      createOrder({ id: "order-3", status: "cancelled", totalAmount: 1400 }),
    ];

    renderWithProvider(
      <UnassignedOrdersDataTable
        data={data}
        onFilteredDataChange={onFilteredDataChange}
      />,
    );

    await waitFor(() => expect(onFilteredDataChange).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: pl.filterStatus }));
    const menuItem = await screen.findByRole("menuitem", {
      name: pl.statusPending,
    });
    await user.click(menuItem);

    await waitFor(() => {
      const lastCall =
        onFilteredDataChange.mock.calls[
          onFilteredDataChange.mock.calls.length - 1
        ]?.[0] || [];
      expect(lastCall).toHaveLength(1);
      expect(lastCall[0].id).toBe("order-1");
    });
  });
});
