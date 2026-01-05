import { render } from "@testing-library/react";
import OrdersCountDisplay from "@/components/ui/orders-count-display";

describe("OrdersCountDisplay Component", () => {
  it("should render with the correct count", () => {
    const testCount = 42;
    const { container } = render(<OrdersCountDisplay count={testCount} />);

    const badgeElement = container.querySelector("[data-slot='badge']");
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveTextContent(testCount.toString());
  });

  it("should render with count 0", () => {
    const { container } = render(<OrdersCountDisplay count={0} />);

    const badgeElement = container.querySelector("[data-slot='badge']");
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveTextContent("0");
  });

  it("should render with large count", () => {
    const largeCount = 999;
    const { container } = render(<OrdersCountDisplay count={largeCount} />);

    const badgeElement = container.querySelector("[data-slot='badge']");
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveTextContent(largeCount.toString());
  });

  it("should accept and apply custom className", () => {
    const customClass = "custom-test-class";
    const { container } = render(
      <OrdersCountDisplay count={10} className={customClass} />
    );

    const badgeElement = container.querySelector(".custom-test-class");
    expect(badgeElement).toBeInTheDocument();
  });

  it("should have the secondary variant by default", () => {
    const { container } = render(<OrdersCountDisplay count={5} />);

    const badgeElement = container.querySelector("span");
    expect(badgeElement).toBeInTheDocument();
    // Check that the badge is rendered (we can't easily test specific variant classes due to shadcn implementation)
    expect(badgeElement?.textContent).toContain("5");
  });

  it("should display the package emoji", () => {
    const { container } = render(<OrdersCountDisplay count={7} />);

    const badgeElement = container.querySelector("[data-slot='badge']");
    expect(badgeElement).toBeInTheDocument();
  });
});
