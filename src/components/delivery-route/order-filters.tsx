export interface OrderFiltersProps {
  priorityFilters?: PriorityFilterState;
  statusFilters?: StatusFilterState;
  amountFilters?: AmountFilterState;
  complexityFilters?: ComplexityFilterState;
  onPriorityChange?: (filters: PriorityFilterState) => void;
  onStatusChange?: (filters: StatusFilterState) => void;
  onAmountChange?: (filters: AmountFilterState) => void;
  onComplexityChange?: (filters: ComplexityFilterState) => void;
}
import {
  ChevronDown,
  AlertCircle,
  Zap,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";

import { FiltersGroup } from "./filters-group";

export type PriorityFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
  [key: string]: boolean;
};

export type StatusFilterState = {
  pending: boolean;
  "in-progress": boolean;
  completed: boolean;
  cancelled: boolean;
  [key: string]: boolean;
};

export type ComplexityFilterState = {
  simple: boolean;
  moderate: boolean;
  complex: boolean;
  [key: string]: boolean;
};

export type AmountFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
  [key: string]: boolean;
};

export const OrderFilters = ({
  priorityFilters,
  statusFilters,
  amountFilters,
  complexityFilters,
  onPriorityChange,
  onStatusChange,
  onAmountChange,
  onComplexityChange,
}: OrderFiltersProps) => {
  return (
    <div className="w-full px-4 py-3 border-b border-border bg-muted/50">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            <FiltersGroup
              name="Priorytet"
              filters={
                priorityFilters ?? {
                  low: true,
                  medium: true,
                  high: true,
                }
              }
              options={[
                {
                  key: "low",
                  label: "Niski priorytet",
                  icon: <ChevronDown />,
                  color: "text-[#fd5c63]",
                },
                {
                  key: "medium",
                  label: "Średni priorytet",
                  icon: <AlertCircle />,
                  color: "text-[#BD3039]",
                },
                {
                  key: "high",
                  label: "Wysoki priorytet",
                  icon: <Zap />,
                  color: "text-[#C6011F]",
                },
              ]}
              onChange={
                onPriorityChange as (filters: Record<string, boolean>) => void
              }
            />
            <FiltersGroup
              name="Status"
              filters={
                statusFilters ?? {
                  pending: true,
                  "in-progress": true,
                  completed: true,
                  cancelled: true,
                }
              }
              options={[
                {
                  key: "pending",
                  label: "Oczekujące",
                  icon: <Play />,
                  color: "text-[#F0E68C]",
                },
                {
                  key: "in-progress",
                  label: "W trakcie",
                  icon: <Clock />,
                  color: "text-[#FFA500]",
                },
                {
                  key: "completed",
                  label: "Zakończone",
                  icon: <CheckCircle />,
                  color: "text-[#4CAF50]",
                },
                {
                  key: "cancelled",
                  label: "Anulowane",
                  icon: <XCircle />,
                  color: "text-[#444C38]",
                },
              ]}
              gridCols={4}
              onChange={
                onStatusChange as (filters: Record<string, boolean>) => void
              }
            />
            <FiltersGroup
              name="Kwota"
              filters={
                amountFilters ?? {
                  low: true,
                  medium: true,
                  high: true,
                }
              }
              options={[
                {
                  key: "low",
                  label: "Niska kwota",
                  icon: <ChevronDown />,
                  color: "text-[#eec0c8]",
                },
                {
                  key: "medium",
                  label: "Średnia kwota",
                  icon: <AlertCircle />,
                  color: "text-[#F9629F]",
                },
                {
                  key: "high",
                  label: "Wysoka kwota",
                  icon: <Zap />,
                  color: "text-[#FF00FF]",
                },
              ]}
              onChange={
                onAmountChange as (filters: Record<string, boolean>) => void
              }
            />
            <FiltersGroup
              name="Złożoność"
              filters={
                complexityFilters ?? {
                  simple: true,
                  moderate: true,
                  complex: true,
                }
              }
              options={[
                {
                  key: "simple",
                  label: "Prosta złożoność",
                  icon: <Wrench />,
                  color: "text-[#F0E68C]",
                },
                {
                  key: "moderate",
                  label: "Średnia złożoność",
                  icon: <Wrench />,
                  color: "text-[#FFA500]",
                },
                {
                  key: "complex",
                  label: "Złożona złożoność",
                  icon: <Wrench />,
                  color: "text-[#4CAF50]",
                },
              ]}
              onChange={
                onComplexityChange as (filters: Record<string, boolean>) => void
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
