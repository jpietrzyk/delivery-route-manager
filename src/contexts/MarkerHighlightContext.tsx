import { createContext, type MutableRefObject } from "react";

export interface MarkerHighlightContextType {
  highlightedOrderId: string | null;
  setHighlightedOrderId: (orderId: string | null) => void;
  // Use ref instead of state to avoid re-renders
  highlightMarkerRef: MutableRefObject<
    ((orderId: string | null) => void) | null
  >;
}

export const MarkerHighlightContext = createContext<
  MarkerHighlightContextType | undefined
>(undefined);
