import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTableFilterDropdown } from "@/components/delivery-route/data-table-filter-dropdown";
import { pl } from "@/lib/translations";

const options = [
  { value: "a", label: "Opcja A" },
  { value: "b", label: "Opcja B" },
];

function DropdownWrapper() {
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <DataTableFilterDropdown
      title="Status"
      options={options}
      selectedValues={selected}
      onSelectionChange={setSelected}
    />
  );
}

describe("DataTableFilterDropdown", () => {
  it("toggles select all and updates count badge", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper />);

    const trigger = screen.getByRole("button", { name: /Status/i });
    await user.click(trigger);

    await user.click(
      screen.getByText((content) => content.includes(pl.selectAll)),
    );
    expect(within(trigger).getByText("2")).toBeInTheDocument();

    // Re-open dropdown to verify "deselect all" option is now available
    await user.click(trigger);
    expect(
      screen.getByText((content) => content.includes(pl.deselectAll)),
    ).toBeInTheDocument();

    await user.click(
      screen.getByText((content) => content.includes(pl.deselectAll)),
    );
    expect(within(trigger).queryByText("2")).not.toBeInTheDocument();
  });

  it("toggles a single option", async () => {
    const user = userEvent.setup();
    render(<DropdownWrapper />);

    const trigger = screen.getByRole("button", { name: /Status/i });
    await user.click(trigger);

    await user.click(screen.getByText("Opcja A"));
    expect(within(trigger).getByText("1")).toBeInTheDocument();
  });
});
