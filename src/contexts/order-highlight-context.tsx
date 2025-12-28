import { createContext } from "react";

export type OrderHighlightContextType = {
  currentOrderId: string | null;
  previousOrderId: string | null;
  setCurrentOrderId: (id: string | null) => void;
  setPreviousOrderId: (id: string | null) => void;
};

export const OrderHighlightContext = createContext<
  OrderHighlightContextType | undefined
>(undefined);
