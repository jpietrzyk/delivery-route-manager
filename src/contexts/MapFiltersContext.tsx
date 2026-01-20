import {
  MapFiltersContext,
  defaultFilters,
  type MapFiltersState,
} from "./MapFiltersContextTypes";

import React, { useState, useMemo } from "react";

export const MapFiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<MapFiltersState>(defaultFilters);

  const value = useMemo(() => ({ filters, setFilters }), [filters]);

  return (
    <MapFiltersContext.Provider value={value}>
      {children}
    </MapFiltersContext.Provider>
  );
};
