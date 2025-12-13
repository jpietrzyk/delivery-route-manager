import { createContext } from "react";

export type MarkerHighlightContextType = {
  highlightedOrderId: string | null;
  setHighlightedOrderId: (id: string | null) => void;
};

export const MarkerHighlightContext = createContext<
  MarkerHighlightContextType | undefined
>(undefined);
