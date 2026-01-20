import type {
  PriorityFilterState,
  StatusFilterState,
  AmountFilterState,
  ComplexityFilterState,
  UpdatedAtFilterState,
} from "@/components/delivery-route/order-filters";

import React, { createContext } from "react";

export type MapFiltersState = {
  priorityFilters: PriorityFilterState;
  statusFilters: StatusFilterState;
  amountFilters: AmountFilterState;
  complexityFilters: ComplexityFilterState;
  updatedAtFilters: UpdatedAtFilterState;
};

export const defaultFilters: MapFiltersState = {
  priorityFilters: { low: true, medium: true, high: true },
  statusFilters: {
    pending: true,
    "in-progress": true,
    completed: true,
    cancelled: true,
  },
  amountFilters: { low: true, medium: true, high: true },
  complexityFilters: { simple: true, moderate: true, complex: true },
  updatedAtFilters: { recent: true, moderate: true, old: true },
};

export interface MapFiltersContextType {
  filters: MapFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<MapFiltersState>>;
}

export const MapFiltersContext = createContext<MapFiltersContextType | undefined>(
  undefined,
);
