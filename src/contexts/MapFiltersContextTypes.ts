import type {
  PriorityFilterState,
  StatusFilterState,
  AmountFilterState,
  ComplexityFilterState,
} from "@/components/delivery-route/order-filters";

import React, { createContext } from "react";

export type MapFiltersState = {
  priorityFilters: PriorityFilterState;
  statusFilters: StatusFilterState;
  amountFilters: AmountFilterState;
  complexityFilters: ComplexityFilterState;
};

export const defaultFilters: MapFiltersState = {
  priorityFilters: { low: false, medium: false, high: false },
  statusFilters: {
    pending: false,
    "in-progress": false,
    completed: false,
    cancelled: false,
  },
  amountFilters: { low: false, medium: false, high: false },
  complexityFilters: { simple: false, moderate: false, complex: false },
};

export interface MapFiltersContextType {
  filters: MapFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<MapFiltersState>>;
}

export const MapFiltersContext = createContext<MapFiltersContextType | undefined>(
  undefined,
);
