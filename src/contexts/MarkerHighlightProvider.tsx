import React, { useState } from "react";
import type { ReactNode } from "react";
import { MarkerHighlightContext } from "./MarkerHighlightContext";

interface MarkerHighlightProviderProps {
  children: ReactNode;
}

export const MarkerHighlightProvider: React.FC<
  MarkerHighlightProviderProps
> = ({ children }) => {
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null
  );

  return (
    <MarkerHighlightContext.Provider
      value={{
        highlightedOrderId,
        setHighlightedOrderId,
      }}
    >
      {children}
    </MarkerHighlightContext.Provider>
  );
};
