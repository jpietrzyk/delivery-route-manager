import React, { useState } from "react";
import { MarkerHighlightContext } from "./MarkerHighlightContext";

export default function MarkerHighlightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null
  );
  return (
    <MarkerHighlightContext.Provider
      value={{ highlightedOrderId, setHighlightedOrderId }}
    >
      {children}
    </MarkerHighlightContext.Provider>
  );
}
