import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnassignedOrdersFilterGroup } from "../components/UnassignedOrdersFilterGroup";
import {
  UnassignedOrdersFilters,
  FilterGroupConfig,
} from "../components/UnassignedOrdersFilters";

describe("UnassignedOrdersFilterGroup", () => {
  it("renders group title and filter options", () => {
    render(
      <UnassignedOrdersFilterGroup
        groupTitle="Priorytet"
        filters={[
          { label: "Wysoki", value: "high", checked: false },
          { label: "Średni", value: "medium", checked: true },
        ]}
        onChange={() => {}}
        onCheckAll={() => {}}
      />,
    );
    expect(screen.getByText("Priorytet")).toBeInTheDocument();
    expect(screen.getByText("Wysoki")).toBeInTheDocument();
    expect(screen.getByText("Średni")).toBeInTheDocument();
  });

  it("calls onChange when a filter is toggled", () => {
    const onChange = jest.fn();
    render(
      <UnassignedOrdersFilterGroup
        groupTitle="Priorytet"
        filters={[{ label: "Wysoki", value: "high", checked: false }]}
        onChange={onChange}
        onCheckAll={() => {}}
      />,
    );
    fireEvent.click(screen.getByLabelText("Wysoki"));
    expect(onChange).toHaveBeenCalledWith("high", true);
  });
});

describe("UnassignedOrdersFilters", () => {
  it("renders filter groups and options", () => {
    const groups: FilterGroupConfig[] = [
      {
        key: "priorityFilters" as any,
        title: "Priorytet",
        labels: { high: "Wysoki", medium: "Średni" },
        colors: { high: "#C6011F", medium: "#BD3039" },
      },
    ];
    // Mock useMapFilters
    jest.mock("@/hooks/useMapFilters", () => ({
      useMapFilters: () => ({
        filters: { priorityFilters: { high: false, medium: true } },
        setFilters: jest.fn(),
      }),
    }));
    render(<UnassignedOrdersFilters groups={groups} />);
    expect(screen.getByText("Priorytet")).toBeInTheDocument();
    expect(screen.getByText("Wysoki")).toBeInTheDocument();
    expect(screen.getByText("Średni")).toBeInTheDocument();
  });
});
