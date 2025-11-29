// src/contexts/HereMapContext.tsx
import { createContext } from "react";

// Type for the context value
export interface HereMapContextType {
  styleRef: React.MutableRefObject<unknown>;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
}

// Create context with undefined as default value
export const HereMapContext = createContext<HereMapContextType | undefined>(
  undefined
);
