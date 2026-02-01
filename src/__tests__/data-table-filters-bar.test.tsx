import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTableFiltersBar } from "@/components/delivery-route/data-table-filters-bar";
import { pl } from "@/lib/translations";

const filters = [
  {
    id: "status",
    title: pl.filterStatus,
    options: [
      { value: "pending", label: pl.statusPending },
      { value: "completed", label: pl.statusCompleted },
    ],
  },
  {
    id: "priority",
    title: pl.filterPriority,
    options: [
      { value: "low", label: pl.priorityLow },
      { value: "high", label: pl.priorityHigh },
    ],
  },
];

describe("DataTableFiltersBar", () => {
  it("renders filter dropdowns", () => {
    render(
      <DataTableFiltersBar
        filters={filters}
        selectedFilters={{}}
        onFilterChange={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: pl.filterStatus }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: pl.filterPriority }),
    ).toBeInTheDocument();
  });

  it("calls onFilterChange when selecting all", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(
      <DataTableFiltersBar
        filters={filters}
        selectedFilters={{}}
        onFilterChange={onFilterChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: pl.filterStatus }));
    await user.click(screen.getByText(pl.selectAll));

    expect(onFilterChange).toHaveBeenCalledWith("status", [
      "pending",
      "completed",
    ]);
  });
});
