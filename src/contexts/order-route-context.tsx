import { createContext } from "react";
import type { OrderRouteContextType } from "@/types/order-route";

export const OrderRouteContext = createContext<
  OrderRouteContextType | undefined
>(undefined);
