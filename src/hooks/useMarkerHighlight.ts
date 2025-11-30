import { useContext } from "react";
import { MarkerHighlightContext } from "@/contexts/MarkerHighlightContext";

export const useMarkerHighlight = () => {
  const context = useContext(MarkerHighlightContext);
  if (context === undefined) {
    throw new Error(
      "useMarkerHighlight must be used within a MarkerHighlightProvider"
    );
  }
  return context;
};
