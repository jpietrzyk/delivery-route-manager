import { useContext } from "react";
import { DeliveryContext } from "@/contexts/delivery-context";

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error("useDelivery must be used within a DeliveryProvider");
  }
  return context;
};
