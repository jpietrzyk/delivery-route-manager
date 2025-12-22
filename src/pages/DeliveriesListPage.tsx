import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";
import { Link } from "react-router-dom";
import { DeliveryOrderList } from "@/components/delivery/delivery-order-list";

export default function DeliveriesListPage() {
  const [deliveries, setDeliveries] = useState<
    { id: string; orders: Order[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const orders = await OrdersApi.getOrders();

        // Group orders by deliveryId
        const deliveriesMap = new Map<string, Order[]>();
        orders.forEach((order) => {
          if (order.deliveryId) {
            if (!deliveriesMap.has(order.deliveryId)) {
              deliveriesMap.set(order.deliveryId, []);
            }
            deliveriesMap.get(order.deliveryId)?.push(order);
          }
        });

        // Convert to array format
        const deliveriesArray = Array.from(deliveriesMap.entries()).map(
          ([id, orders]) => ({
            id,
            orders,
          })
        );

        setDeliveries(deliveriesArray);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
        setError("Failed to load deliveries. Please try again later.");
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Planned Deliveries
          </h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">Loading deliveries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Planned Deliveries
          </h1>
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Planned Deliveries
          </h1>
          <Link
            to="/deliveries"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            View All on Map
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
              No deliveries found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new delivery.
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
                    <h2 className="text-lg font-semibold text-gray-800">
                      Delivery {delivery.id}
                    </h2>
                    <Link
                      to={`/deliveries/${delivery.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      View on Map
                      <svg
                        className="ml-1 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <DeliveryOrderList
                    orders={delivery.orders}
                    title={`Orders (${delivery.orders.length})`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
