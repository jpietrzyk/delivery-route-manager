import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DeliveriesListPage from "@/pages/DeliveriesListPage";
import type { DeliveryRoute } from "@/types/delivery-route";

jest.mock("@/services/deliveryRoutesApi", () => ({
  DeliveryRoutesApi: {
    getDeliveries: jest.fn(),
  },
}));

const { DeliveryRoutesApi } = jest.requireMock("@/services/deliveryRoutesApi");

const mockDeliveries: DeliveryRoute[] = [
  {
    id: "DEL-001",
    name: "Route One",
    status: "scheduled",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  },
  {
    id: "DEL-002",
    name: "Route Two",
    status: "draft",
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-04T00:00:00Z"),
  },
];

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<DeliveriesListPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("DeliveriesListPage", () => {
  beforeEach(() => {
    (DeliveryRoutesApi.getDeliveries as jest.Mock).mockResolvedValue(
      mockDeliveries
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows provider-specific map links for each delivery", async () => {
    renderPage();

    await waitFor(() => {
      expect(DeliveryRoutesApi.getDeliveries).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      screen.getAllByRole("link", {
        name: /zobacz w leaflet/i,
      });
    });

    const leafletLinks = screen.getAllByRole("link", {
      name: /zobacz w leaflet/i,
    });
    const mapyLinks = screen.getAllByRole("link", {
      name: /zobacz w mapy\.cz/i,
    });

    expect(leafletLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/delivery_routes/DEL-001/leaflet",
      "/delivery_routes/DEL-002/leaflet",
    ]);
    expect(mapyLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/delivery_routes/DEL-001/mapy",
      "/delivery_routes/DEL-002/mapy",
    ]);

    expect(
      screen.getByRole("link", { name: /zobacz wszystkie na mapie/i })
    ).toHaveAttribute("href", "/delivery_routes");
  });
});
