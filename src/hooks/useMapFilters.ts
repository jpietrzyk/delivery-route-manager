import { useContext } from "react";
import { MapFiltersContext, type MapFiltersContextType } from "../contexts/MapFiltersContextTypes";

export const useMapFilters = (): MapFiltersContextType => {
  const context = useContext(MapFiltersContext);
  if (!context) {
    throw new Error("useMapFilters must be used within a MapFiltersProvider");
  }
  return context;
};
