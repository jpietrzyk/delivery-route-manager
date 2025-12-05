import React, { useState, useRef } from "react";
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
  // Use ref to store function without causing re-renders
  const highlightMarkerRef = useRef<((orderId: string | null) => void) | null>(
    null
  );

  return (
    <MarkerHighlightContext.Provider
      value={{
        highlightedOrderId,
        setHighlightedOrderId,
        highlightMarkerRef,
      }}
    >
      {children}
    </MarkerHighlightContext.Provider>
  );
};
