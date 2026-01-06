import { renderHook, act } from "@testing-library/react";
import { useRouteSegments } from "@/hooks/use-route-segments";
import RouteSegmentsProvider from "@/contexts/route-segments-provider";
import type { RouteSegmentData } from "@/contexts/route-segments-context";

describe("useRouteSegments", () => {
  it("should throw error when used outside RouteSegmentsProvider", () => {
    // Suppress console.error for this test as we expect an error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useRouteSegments());
    }).toThrow("useRouteSegments must be used within a RouteSegmentsProvider");

    consoleErrorSpy.mockRestore();
  });

  it("should return empty array initially", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteSegmentsProvider>{children}</RouteSegmentsProvider>
    );

    const { result } = renderHook(() => useRouteSegments(), { wrapper });

    expect(result.current.routeSegments).toEqual([]);
    expect(typeof result.current.setRouteSegments).toBe("function");
  });

  it("should update route segments when setRouteSegments is called", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteSegmentsProvider>{children}</RouteSegmentsProvider>
    );

    const { result } = renderHook(() => useRouteSegments(), { wrapper });

    const mockSegments: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 5000,
        duration: 600,
      },
      {
        id: "order-2-order-3",
        fromOrderId: "order-2",
        toOrderId: "order-3",
        distance: 3000,
        duration: 400,
      },
    ];

    // Act
    act(() => {
      result.current.setRouteSegments(mockSegments);
    });

    // Assert
    expect(result.current.routeSegments).toEqual(mockSegments);
    expect(result.current.routeSegments).toHaveLength(2);
  });

  it("should clear route segments when empty array is set", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteSegmentsProvider>{children}</RouteSegmentsProvider>
    );

    const { result } = renderHook(() => useRouteSegments(), { wrapper });

    const mockSegments: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 5000,
        duration: 600,
      },
    ];

    // First set some segments
    act(() => {
      result.current.setRouteSegments(mockSegments);
    });
    expect(result.current.routeSegments).toHaveLength(1);

    // Then clear them
    act(() => {
      result.current.setRouteSegments([]);
    });
    expect(result.current.routeSegments).toEqual([]);
  });

  it("should handle multiple updates to route segments", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RouteSegmentsProvider>{children}</RouteSegmentsProvider>
    );

    const { result } = renderHook(() => useRouteSegments(), { wrapper });

    const segments1: RouteSegmentData[] = [
      {
        id: "order-1-order-2",
        fromOrderId: "order-1",
        toOrderId: "order-2",
        distance: 5000,
        duration: 600,
      },
    ];

    const segments2: RouteSegmentData[] = [
      {
        id: "order-3-order-4",
        fromOrderId: "order-3",
        toOrderId: "order-4",
        distance: 7000,
        duration: 800,
      },
      {
        id: "order-4-order-5",
        fromOrderId: "order-4",
        toOrderId: "order-5",
        distance: 2000,
        duration: 300,
      },
    ];

    // First update
    act(() => {
      result.current.setRouteSegments(segments1);
    });
    expect(result.current.routeSegments).toEqual(segments1);

    // Second update (replaces first)
    act(() => {
      result.current.setRouteSegments(segments2);
    });
    expect(result.current.routeSegments).toEqual(segments2);
    expect(result.current.routeSegments).toHaveLength(2);
  });
});
