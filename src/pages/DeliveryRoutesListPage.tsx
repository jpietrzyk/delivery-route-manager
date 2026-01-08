import { useEffect, useState } from "react";
import { DeliveryRoutesApi } from "@/services/deliveryRoutesApi";
import type { DeliveryRoute } from "@/types/delivery-route";
import { Link } from "react-router-dom";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { pl } from "@/lib/translations";
import { Info, MapPin, ExternalLink, Map } from "lucide-react";

export default function DeliveryRoutesListPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<DeliveryRoute | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);

        const allDeliveries = await DeliveryRoutesApi.getDeliveries();

        setDeliveries(allDeliveries);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
        setError(pl.loadDeliveriesError);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
            {pl.plannedDeliveries}
          </h3>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">{pl.loadingDeliveries}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
            {pl.plannedDeliveries}
          </h3>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {pl.plannedDeliveries}
            </h3>
            <Link
              to="/delivery_routes"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 text-gray-700 rounded transition-colors"
            >
              <Map className="h-3.5 w-3.5" />
              {pl.viewAllOnMap}
            </Link>
          </div>

          {deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {pl.noDeliveriesFound}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {pl.createDeliveryPrompt}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {delivery.name || `${pl.delivery} ${delivery.id}`}
                      </h3>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <DrawerTrigger asChild>
                          <button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 text-purple-700 rounded transition-colors"
                          >
                            <Info className="h-3.5 w-3.5" />
                            {pl.details}
                          </button>
                        </DrawerTrigger>
                        <Link
                          to={`/delivery_routes/${delivery.id}/leaflet`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300 text-green-700 rounded transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {pl.viewWithLeaflet}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <Link
                          to={`/delivery_routes/${delivery.id}/mapy`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-700 rounded transition-colors"
                        >
                          <Map className="h-3.5 w-3.5" />
                          {pl.viewWithMapy}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DrawerContent side="right" className="bg-background/95 backdrop-blur-sm">
        <DrawerHeader className="border-b border-border/50 bg-purple-50/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 border border-purple-200">
              <Info className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <DrawerTitle className="text-purple-900">
                {pl.deliveryDetails}
              </DrawerTitle>
              <DrawerDescription className="text-purple-700/70">
                {pl.deliveryInfo}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        {selectedDelivery && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  {pl.deliveryIdLabel}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDelivery.id}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  {pl.nameLabel}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDelivery.name ||
                    `${pl.delivery} ${selectedDelivery.id}`}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  {pl.status}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedDelivery.status}
                </p>
              </div>
              {selectedDelivery.notes && (
                <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                    {pl.notes}
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedDelivery.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
