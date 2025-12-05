import { createContext } from "react";

export interface MarkerHighlightContextType {
  highlightedOrderId: string | null;
  setHighlightedOrderId: (orderId: string | null) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

export const MarkerHighlightContext = createContext<
  MarkerHighlightContextType | undefined
>(undefined);
