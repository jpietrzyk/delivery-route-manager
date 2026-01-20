import React, { createContext, useContext, useState, useMemo } from "react";

export type MapFiltersState = {
  status: string[];
  // Add other filter fields as needed
};

const defaultFilters: MapFiltersState = {
  status: [],
};

interface MapFiltersContextType {
  filters: MapFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<MapFiltersState>>;
}

const MapFiltersContext = createContext<MapFiltersContextType | undefined>(
  undefined,
);

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

export const useMapFilters = (): MapFiltersContextType => {
  const context = useContext(MapFiltersContext);
  if (!context) {
    throw new Error("useMapFilters must be used within a MapFiltersProvider");
  }
  return context;
};
