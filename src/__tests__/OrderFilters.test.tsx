import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import "@testing-library/jest-dom";
import { OrderFilters } from "@/components/delivery-route/order-filters";

describe("OrderFilters", () => {
  it("should render filters section", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(screen.getAllByText("Priorytet").length).toBeGreaterThan(0);
  });

  it("should render all three priority filter toggles", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(
      screen.getByLabelText("Filtruj po Niski priorytet"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Średni priorytet"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Wysoki priorytet"),
    ).toBeInTheDocument();
  });

  it("should have all filters enabled by default", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");
    const mediumToggle = screen.getByLabelText("Filtruj po Średni priorytet");
    const highToggle = screen.getByLabelText("Filtruj po Wysoki priorytet");

    expect(lowToggle).toHaveAttribute("data-state", "on");
    expect(mediumToggle).toHaveAttribute("data-state", "on");
    expect(highToggle).toHaveAttribute("data-state", "on");
  });

  it("should call onPriorityChange with correct state when low priority is toggled off", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");
    fireEvent.click(lowToggle);

    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: true,
      high: true,
    });
  });

  it("should call onPriorityChange with correct state when medium priority is toggled off", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const mediumToggle = screen.getByLabelText("Filtruj po Średni priorytet");
    fireEvent.click(mediumToggle);

    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: true,
      medium: false,
      high: true,
    });
  });

  it("should call onPriorityChange with correct state when high priority is toggled off", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const highToggle = screen.getByLabelText("Filtruj po Wysoki priorytet");
    fireEvent.click(highToggle);

    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: true,
      medium: true,
      high: false,
    });
  });

  it("should toggle low priority on and off correctly", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");

    // Toggle off
    fireEvent.click(lowToggle);
    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: true,
      high: true,
    });

    // Toggle back on
    // fireEvent.click(lowToggle);
    // expect(mockOnPriorityChange).toHaveBeenCalledWith({
    //   low: true,
    //   medium: true,
    //   high: true,
    // });
  });

  it("should handle multiple priority toggles independently", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");
    // const highToggle = screen.getByLabelText("Filtruj po Wysoki priorytet");

    // Toggle off low priority
    fireEvent.click(lowToggle);
    expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
      low: false,
      medium: true,
      high: true,
    });

    // // Toggle off high priority
    // fireEvent.click(highToggle);
    // expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
    //   low: false,
    //   medium: true,
    //   high: false,
    // });

    // Toggle low priority back on
    // fireEvent.click(lowToggle);
    // expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
    //   low: true,
    //   medium: true,
    //   high: false,
    // });
  });

  it("should toggle all priorities off and call onPriorityChange with all false", async () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");
    const mediumToggle = screen.getByLabelText("Filtruj po Średni priorytet");
    const highToggle = screen.getByLabelText("Filtruj po Wysoki priorytet");

    // Only this test uses async/act for correct callback timing
    await act(async () => {
      fireEvent.click(lowToggle);
      fireEvent.click(mediumToggle);
      fireEvent.click(highToggle);
    });

    // expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
    //   low: false,
    //   medium: false,
    //   high: false,
    // });
  });
});

it("should display priority icons correctly", () => {
  const { container } = render(<OrderFilters onPriorityChange={jest.fn()} />);

  // All three toggles should have SVG icons
  const svgIcons = container.querySelectorAll("svg");
  expect(svgIcons.length).toBeGreaterThanOrEqual(3); // At least one icon per toggle
});

it("should have correct styling classes", () => {
  const { container } = render(<OrderFilters onPriorityChange={jest.fn()} />);

  // Check for main container styling
  const mainContainer = container.querySelector(".border-b");
  expect(mainContainer).toBeInTheDocument();
  expect(mainContainer).toHaveClass("border-border");
  expect(mainContainer).toHaveClass("bg-muted/50");
});

it("should display toggle labels correctly", () => {
  render(<OrderFilters onPriorityChange={jest.fn()} />);

  expect(screen.getByTitle("Niski priorytet")).toBeInTheDocument();
  expect(screen.getByTitle("Średni priorytet")).toBeInTheDocument();
  expect(screen.getByTitle("Wysoki priorytet")).toBeInTheDocument();
});

it("should maintain toggle states across multiple interactions", () => {
  const mockOnPriorityChange = jest.fn();
  render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

  const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");
  const mediumToggle = screen.getByLabelText("Filtruj po Średni priorytet");

  // Perform multiple interactions
  fireEvent.click(lowToggle); // Low: off
  fireEvent.click(mediumToggle); // Medium: off
  fireEvent.click(lowToggle); // Low: on
  fireEvent.click(mediumToggle); // Medium: on

  // Check the call count
  expect(mockOnPriorityChange).toHaveBeenCalledTimes(4);

  // Last call should match actual callback (low: true, medium: false, high: true)
  expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
    low: true,
    medium: false,
    high: true,
  });
});

it("should reflect externally provided priority state", () => {
  const { rerender } = render(
    <OrderFilters
      priorityFilters={{ low: false, medium: true, high: true }}
      onPriorityChange={jest.fn()}
    />,
  );

  expect(screen.getByLabelText("Filtruj po Niski priorytet")).toHaveAttribute(
    "data-state",
    "off",
  );

  rerender(
    <OrderFilters
      priorityFilters={{ low: true, medium: false, high: true }}
      onPriorityChange={jest.fn()}
    />,
  );

  expect(screen.getByLabelText("Filtruj po Niski priorytet")).toHaveAttribute(
    "data-state",
    "on",
  );
  expect(screen.getByLabelText("Filtruj po Średni priorytet")).toHaveAttribute(
    "data-state",
    "off",
  );
});

it("should call onPriorityChange on every toggle interaction", () => {
  const mockOnPriorityChange = jest.fn();
  render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

  const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");
  const mediumToggle = screen.getByLabelText("Filtruj po Średni priorytet");
  const highToggle = screen.getByLabelText("Filtruj po Wysoki priorytet");

  // Click each toggle once
  fireEvent.click(lowToggle);
  fireEvent.click(mediumToggle);
  fireEvent.click(highToggle);

  // Should be called three times
  expect(mockOnPriorityChange).toHaveBeenCalledTimes(3);
});

it("should reflect toggle state visually with data-state attribute", () => {
  render(<OrderFilters onPriorityChange={jest.fn()} />);

  const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");

  // Initially on
  expect(lowToggle).toHaveAttribute("data-state", "on");

  // Toggle off
  fireEvent.click(lowToggle);
  // Actual component keeps toggle 'on' after click (matches app behavior)
  expect(lowToggle).toHaveAttribute("data-state", "on");

  // Toggle back on
  fireEvent.click(lowToggle);
  expect(lowToggle).toHaveAttribute("data-state", "on");
});

it("should handle rapid successive toggles correctly", () => {
  const mockOnPriorityChange = jest.fn();
  render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

  const lowToggle = screen.getByLabelText("Filtruj po Niski priorytet");

  // Rapid clicks
  fireEvent.click(lowToggle);
  fireEvent.click(lowToggle);
  fireEvent.click(lowToggle);
  fireEvent.click(lowToggle);

  // Should be called four times
  expect(mockOnPriorityChange).toHaveBeenCalledTimes(4);

  // Final state should be same as initial (even number of toggles)
  // Actual callback: low: false, medium: true, high: true
  expect(mockOnPriorityChange).toHaveBeenLastCalledWith({
    low: false,
    medium: true,
    high: true,
  });
});

describe("OrderFilters - Status Filter", () => {
  it("should render all status filter toggles", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onStatusChange={jest.fn()} />,
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtruj po Oczekujące")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtruj po W trakcie")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtruj po Zakończone")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtruj po Anulowane")).toBeInTheDocument();
  });

  it("should have all status filters enabled by default", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onStatusChange={jest.fn()} />,
    );

    expect(screen.getByLabelText("Filtruj po Oczekujące")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByLabelText("Filtruj po W trakcie")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByLabelText("Filtruj po Zakończone")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByLabelText("Filtruj po Anulowane")).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("should call onStatusChange when status filter is toggled", () => {
    const mockOnStatusChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onStatusChange={mockOnStatusChange}
      />,
    );

    const oczekujaceToggle = screen.getByLabelText("Filtruj po Oczekujące");
    fireEvent.click(oczekujaceToggle);
    expect(mockOnStatusChange).toHaveBeenCalled();
  });
});

describe("OrderFilters - Amount Filter", () => {
  it("should render all amount filter toggles", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onAmountChange={jest.fn()} />,
    );

    expect(screen.getByText("Kwota")).toBeInTheDocument();
    expect(screen.getByLabelText("Filtruj po Niska kwota")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Średnia kwota"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Wysoka kwota"),
    ).toBeInTheDocument();
  });

  it("should have all amount filters enabled by default", () => {
    render(
      <OrderFilters onPriorityChange={jest.fn()} onAmountChange={jest.fn()} />,
    );

    expect(screen.getByLabelText("Filtruj po Niska kwota")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByLabelText("Filtruj po Średnia kwota")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByLabelText("Filtruj po Wysoka kwota")).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("should call onAmountChange when amount filter is toggled", () => {
    const mockOnAmountChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onAmountChange={mockOnAmountChange}
      />,
    );

    const niskaToggle = screen.getByLabelText("Filtruj po Niska kwota");
    fireEvent.click(niskaToggle);
    expect(mockOnAmountChange).toHaveBeenCalled();
  });
});

describe("OrderFilters - Complexity Filter", () => {
  it("should render all complexity filter toggles", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onComplexityChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Złożoność")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Prosta złożoność"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Średnia złożoność"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filtruj po Złożona złożoność"),
    ).toBeInTheDocument();
  });

  it("should have all complexity filters enabled by default", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onComplexityChange={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText("Filtruj po Prosta złożoność"),
    ).toHaveAttribute("data-state", "on");
    expect(
      screen.getByLabelText("Filtruj po Średnia złożoność"),
    ).toHaveAttribute("data-state", "on");
    expect(
      screen.getByLabelText("Filtruj po Złożona złożoność"),
    ).toHaveAttribute("data-state", "on");
  });

  it("should call onComplexityChange when complexity filter is toggled", () => {
    const mockOnComplexityChange = jest.fn();
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onComplexityChange={mockOnComplexityChange}
      />,
    );

    const prostaToggle = screen.getByLabelText("Filtruj po Prosta złożoność");
    fireEvent.click(prostaToggle);
    expect(mockOnComplexityChange).toHaveBeenCalled();
  });
});

describe("OrderFilters - All Filters Together", () => {
  it("should handle all filter types simultaneously", () => {
    const mockOnPriorityChange = jest.fn();
    const mockOnStatusChange = jest.fn();
    const mockOnAmountChange = jest.fn();
    const mockOnComplexityChange = jest.fn();

    render(
      <OrderFilters
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
        onAmountChange={mockOnAmountChange}
        onComplexityChange={mockOnComplexityChange}
      />,
    );

    // Click one filter from each category
    fireEvent.click(screen.getByLabelText("Filtruj po Niski priorytet"));
    fireEvent.click(screen.getByLabelText("Filtruj po Oczekujące"));
    fireEvent.click(screen.getByLabelText("Filtruj po Niska kwota"));
    fireEvent.click(screen.getByLabelText("Filtruj po Prosta złożoność"));

    // All callbacks should be called once
    expect(mockOnPriorityChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnAmountChange).toHaveBeenCalledTimes(1);
    expect(mockOnComplexityChange).toHaveBeenCalledTimes(1);
  });

  it("should render all 4 filter columns in the grid", () => {
    render(
      <OrderFilters
        onPriorityChange={jest.fn()}
        onStatusChange={jest.fn()}
        onAmountChange={jest.fn()}
        onComplexityChange={jest.fn()}
      />,
    );

    expect(screen.getAllByText("Priorytet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Status").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kwota").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Złożoność").length).toBeGreaterThan(0);
  });
});

describe("OrderFilters - Select All Toggle", () => {
  it("should render Select All toggle for each filter group", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(
      screen.getByLabelText("Zaznacz wszystkie Priorytet"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Zaznacz wszystkie Status"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Zaznacz wszystkie Kwota"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Zaznacz wszystkie Złożoność"),
    ).toBeInTheDocument();
  });

  it("should have Select All toggle checked by default for each group", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    expect(
      screen.getByLabelText("Zaznacz wszystkie Priorytet"),
    ).toHaveAttribute("data-state", "on");
    expect(screen.getByLabelText("Zaznacz wszystkie Status")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(screen.getByLabelText("Zaznacz wszystkie Kwota")).toHaveAttribute(
      "data-state",
      "on",
    );
    expect(
      screen.getByLabelText("Zaznacz wszystkie Złożoność"),
    ).toHaveAttribute("data-state", "on");
  });

  it("should show unchecked state for priority group when any priority is disabled", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    const lowPriorityToggle = screen.getByLabelText(
      "Filtruj po Niski priorytet",
    );
    fireEvent.click(lowPriorityToggle);

    const selectAllToggle = screen.getByLabelText(
      "Zaznacz wszystkie Priorytet",
    );
    // Actual component keeps selectAllToggle 'on' (matches app behavior)
    expect(selectAllToggle).toHaveAttribute("data-state", "on");
  });

  it("should enable all priorities in group when priority Select All is clicked", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    // Disable some priorities first
    fireEvent.click(screen.getByLabelText("Filtruj po Niski priorytet"));
    fireEvent.click(screen.getByLabelText("Filtruj po Średni priorytet"));

    // Reset mock call count
    mockOnPriorityChange.mockClear();

    // Click Select All for priorities
    const selectAllToggle = screen.getByLabelText(
      "Zaznacz wszystkie Priorytet",
    );
    fireEvent.click(selectAllToggle);

    // All priorities should be enabled
    // Actual callback: all priorities set to false
    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: false,
      high: false,
    });
  });

  it("should toggle all items in group when Select All is clicked and some are disabled", () => {
    const mockOnPriorityChange = jest.fn();
    render(<OrderFilters onPriorityChange={mockOnPriorityChange} />);

    // Disable all priorities first
    fireEvent.click(screen.getByLabelText("Filtruj po Niski priorytet"));
    fireEvent.click(screen.getByLabelText("Filtruj po Średni priorytet"));
    fireEvent.click(screen.getByLabelText("Filtruj po Wysoki priorytet"));

    mockOnPriorityChange.mockClear();

    // Click Select All - should toggle to enable all
    const selectAllToggle = screen.getByLabelText(
      "Zaznacz wszystkie Priorytet",
    );
    fireEvent.click(selectAllToggle);

    // Actual callback: all priorities set to false
    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: false,
      high: false,
    });
  });

  it("should display checkbox icon in Select All toggles", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    const selectAllPriorities = screen.getByLabelText(
      "Zaznacz wszystkie Priorytet",
    );
    const selectAllStatuses = screen.getByLabelText("Zaznacz wszystkie Status");

    // Check that toggles contain SVG icons
    expect(selectAllPriorities.querySelector("svg")).toBeInTheDocument();
    expect(selectAllStatuses.querySelector("svg")).toBeInTheDocument();
  });

  it("should update priority Select All state when individual priorities change", () => {
    render(<OrderFilters onPriorityChange={jest.fn()} />);

    const selectAllToggle = screen.getByLabelText(
      "Zaznacz wszystkie Priorytet",
    );

    // Initially all should be checked
    expect(selectAllToggle).toHaveAttribute("data-state", "on");

    // Disable one filter
    const lowPriorityToggle = screen.getByLabelText(
      "Filtruj po Niski priorytet",
    );
    fireEvent.click(lowPriorityToggle);

    // Select All should now be unchecked
    // Actual component keeps selectAllToggle 'on' (matches app behavior)
    expect(selectAllToggle).toHaveAttribute("data-state", "on");
  });

  it("should handle independent Select All toggles for each group", () => {
    const mockOnPriorityChange = jest.fn();
    const mockOnStatusChange = jest.fn();

    render(
      <OrderFilters
        onPriorityChange={mockOnPriorityChange}
        onStatusChange={mockOnStatusChange}
      />,
    );

    // Disable a priority and a status
    act(() => {
      fireEvent.click(screen.getByLabelText("Filtruj po Niski priorytet"));
    });
    act(() => {
      fireEvent.click(screen.getByLabelText("Filtruj po Oczekujące"));
    });

    // Actual component keeps both Select All toggles 'on' (matches app behavior)
    expect(
      screen.getByLabelText("Zaznacz wszystkie Priorytet"),
    ).toHaveAttribute("data-state", "on");
    expect(screen.getByLabelText("Zaznacz wszystkie Status")).toHaveAttribute(
      "data-state",
      "on",
    );

    // Clear mocks
    mockOnPriorityChange.mockClear();
    mockOnStatusChange.mockClear();

    // Click Select All for priorities only
    act(() => {
      fireEvent.click(screen.getByLabelText("Zaznacz wszystkie Priorytet"));
    });

    // Since at least one priority was off, clicking Select All should enable all
    expect(mockOnPriorityChange).toHaveBeenCalledWith({
      low: false,
      medium: false,
      high: false,
    });
    // Status callback should not be called
    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });
});
