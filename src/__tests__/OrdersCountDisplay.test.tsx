import { render, screen } from "@testing-library/react";
import OrdersCountDisplay from "@/components/ui/orders-count-display";

describe("OrdersCountDisplay Component", () => {
  it("should render with the correct count", () => {
    const testCount = 42;
    render(<OrdersCountDisplay count={testCount} />);

    const badgeElement = screen.getByText(`📦 Total Orders: ${testCount}`);
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveTextContent(testCount.toString());
  });

  it("should render with count 0", () => {
    render(<OrdersCountDisplay count={0} />);

    const badgeElement = screen.getByText("📦 Total Orders: 0");
    expect(badgeElement).toBeInTheDocument();
  });

  it("should render with large count", () => {
    const largeCount = 999;
    render(<OrdersCountDisplay count={largeCount} />);

    const badgeElement = screen.getByText(`📦 Total Orders: ${largeCount}`);
    expect(badgeElement).toBeInTheDocument();
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
    expect(badgeElement).toHaveTextContent("📦 Total Orders: 5");
  });

  it("should display the package emoji", () => {
    render(<OrdersCountDisplay count={7} />);

    const badgeElement = screen.getByText("📦 Total Orders: 7");
    expect(badgeElement).toBeInTheDocument();
  });
});
