import React, { useState } from "react";
import { OrderHighlightContext } from "./order-highlight-context";

export default function OrderHighlightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [previousOrderId, setPreviousOrderId] = useState<string | null>(null);

  return (
    <OrderHighlightContext.Provider
      value={{
        currentOrderId,
        previousOrderId,
        setCurrentOrderId,
        setPreviousOrderId,
      }}
    >
      {children}
    </OrderHighlightContext.Provider>
  );
}
