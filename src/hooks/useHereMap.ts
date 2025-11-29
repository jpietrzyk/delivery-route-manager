// src/hooks/useHereMap.ts
import { useContext } from "react";
import { HereMapContext } from "@/contexts/HereMapContext";
import type { HereMapContextType } from "@/contexts/HereMapContext";

// Custom hook that lets any component access the HERE map and style
export const useHereMap = (): HereMapContextType => {
  const context = useContext(HereMapContext);
  if (context === undefined) {
    throw new Error("useHereMap must be used within a HereMapProvider");
  }
  return context;
};
