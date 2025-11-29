import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface MarkerHighlightContextType {
  highlightedOrderId: string | null;
  setHighlightedOrderId: (orderId: string | null) => void;
}

const MarkerHighlightContext = createContext<
  MarkerHighlightContextType | undefined
>(undefined);

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

export const useMarkerHighlight = () => {
  const context = useContext(MarkerHighlightContext);
  if (context === undefined) {
    throw new Error(
      "useMarkerHighlight must be used within a MarkerHighlightProvider"
    );
  }
  return context;
};
