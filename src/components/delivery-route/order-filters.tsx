import { FiltersGroup } from "./filters-group";
import { mapConfig } from "@/config/map.config";
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  AlertCircle,
  Zap,
  Wrench,
} from "lucide-react";
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

export type PriorityFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
  [key: string]: boolean;
};

export type StatusFilterState = {
  pending: boolean;
  inprogress: boolean;
  completed: boolean;
  cancelled: boolean;
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
  // ...existing code...
  const priorityOptions = [
    {
      key: "low",
      label: "Niski priorytet",
      icon: <ChevronDown />,
      color: mapConfig.markerColors.priority.low,
    },
    {
      key: "medium",
      label: "Średni priorytet",
      icon: <AlertCircle />,
      color: mapConfig.markerColors.priority.medium,
    },
    {
      key: "high",
      label: "Wysoki priorytet",
      icon: <Zap />,
      color: mapConfig.markerColors.priority.high,
    },
  ];
  const statusOptions = [
    {
      key: "pending",
      label: "Oczekujące",
      icon: <Play />,
      color: mapConfig.markerColors.status.pending,
    },
    {
      key: "inprogress",
      label: "W trakcie",
      icon: <Clock />,
      color: mapConfig.markerColors.status.inprogress,
    },
    {
      key: "completed",
      label: "Zakończone",
      icon: <CheckCircle />,
      color: mapConfig.markerColors.status.completed,
    },
    {
      key: "cancelled",
      label: "Anulowane",
      icon: <XCircle />,
      color: mapConfig.markerColors.status.cancelled,
    },
  ];

  const amountOptions = [
    {
      key: "low",
      label: "Niska kwota",
      icon: <ChevronDown />,
      color: mapConfig.markerColors.amount.low,
    },
    {
      key: "medium",
      label: "Średnia kwota",
      icon: <AlertCircle />,
      color: mapConfig.markerColors.amount.medium,
    },
    {
      key: "high",
      label: "Wysoka kwota",
      icon: <Zap />,
      color: mapConfig.markerColors.amount.high,
    },
  ];

  const complexityOptions = [
    {
      key: "simple",
      label: "Prosta złożoność",
      icon: <Wrench />,
      color: mapConfig.markerColors.complexity.low,
    },
    {
      key: "moderate",
      label: "Średnia złożoność",
      icon: <Wrench />,
      color: mapConfig.markerColors.complexity.medium,
    },
    {
      key: "complex",
      label: "Złożona złożoność",
      icon: <Wrench />,
      color: mapConfig.markerColors.complexity.high,
    },
  ];
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
              options={priorityOptions}
              gridCols={3}
              onChange={
                onPriorityChange as (filters: Record<string, boolean>) => void
              }
            />
            <FiltersGroup
              name="Status"
              filters={
                statusFilters ?? {
                  pending: true,
                  inprogress: true,
                  completed: true,
                  cancelled: true,
                }
              }
              options={statusOptions}
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
              options={amountOptions}
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
              options={complexityOptions}
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
