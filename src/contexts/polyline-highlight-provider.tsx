import React, { useState } from "react";
import { PolylineHighlightContext } from "./polyline-highlight-context";

export default function PolylineHighlightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [highlightedPolylineOrderId, setHighlightedPolylineOrderId] = useState<
    string | null
  >(null);

  return (
    <PolylineHighlightContext.Provider
      value={{ highlightedPolylineOrderId, setHighlightedPolylineOrderId }}
    >
      {children}
    </PolylineHighlightContext.Provider>
  );
}
