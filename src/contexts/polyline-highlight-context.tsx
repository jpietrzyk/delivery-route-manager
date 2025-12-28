import { createContext } from "react";

export type PolylineHighlightContextType = {
  highlightedPolylineOrderId: string | null;
  setHighlightedPolylineOrderId: (id: string | null) => void;
};

export const PolylineHighlightContext = createContext<
  PolylineHighlightContextType | undefined
>(undefined);
