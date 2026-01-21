import React, { useEffect, useMemo, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { pl } from "@/lib/translations";
import {
  ChevronDown,
  AlertCircle,
  Zap,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Wrench,
  Calendar,
  Check,
  Square,
} from "lucide-react";

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

export type UpdatedAtFilterState = {
  recent: boolean; // Less than 1 week
  moderate: boolean; // 1 week - 1 month
  old: boolean; // More than 1 month
  [key: string]: boolean;
};

interface OrderFiltersProps {
  priorityFilters?: PriorityFilterState;
  statusFilters?: StatusFilterState;
  amountFilters?: AmountFilterState;
  complexityFilters?: ComplexityFilterState;
  updatedAtFilters?: UpdatedAtFilterState;
  onPriorityChange: (filters: PriorityFilterState) => void;
  onStatusChange?: (filters: StatusFilterState) => void;
  onAmountChange?: (filters: AmountFilterState) => void;
  onComplexityChange?: (filters: ComplexityFilterState) => void;
  onUpdatedAtChange?: (filters: UpdatedAtFilterState) => void;
}

const PRIORITY_DEFAULT: PriorityFilterState = {
  low: true,
  medium: true,
  high: true,
};

const STATUS_DEFAULT: StatusFilterState = {
  pending: true,
  "in-progress": true,
  completed: true,
  cancelled: true,
};

const COMPLEXITY_DEFAULT: ComplexityFilterState = {
  simple: true,
  moderate: true,
  complex: true,
};

const AMOUNT_DEFAULT: AmountFilterState = {
  low: true,
  medium: true,
  high: true,
};

const UPDATED_AT_DEFAULT: UpdatedAtFilterState = {
  recent: true,
  moderate: true,
  old: true,
};

const clonePriorityDefaults = (): PriorityFilterState => ({
  ...PRIORITY_DEFAULT,
});
const cloneStatusDefaults = (): StatusFilterState => ({ ...STATUS_DEFAULT });
const cloneComplexityDefaults = (): ComplexityFilterState => ({
  ...COMPLEXITY_DEFAULT,
});
const cloneUpdatedAtDefaults = (): UpdatedAtFilterState => ({
  ...UPDATED_AT_DEFAULT,
});

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  priorityFilters,
  statusFilters,
  amountFilters,
  complexityFilters,
  updatedAtFilters,
  onPriorityChange,
  onStatusChange,
  onAmountChange,
  onComplexityChange,
  onUpdatedAtChange,
}) => {
  const [priorities, setPriorities] = useState<PriorityFilterState>(
    priorityFilters ?? clonePriorityDefaults(),
  );

  const [statuses, setStatuses] = useState<StatusFilterState>(
    statusFilters ?? cloneStatusDefaults(),
  );

  const [complexities, setComplexities] = useState<ComplexityFilterState>(
    complexityFilters ?? cloneComplexityDefaults(),
  );

  const [amounts, setAmounts] = useState<AmountFilterState>(
    amountFilters ?? AMOUNT_DEFAULT,
  );

  const [updatedAt, setUpdatedAt] = useState<UpdatedAtFilterState>(
    updatedAtFilters ?? cloneUpdatedAtDefaults(),
  );

  useEffect(() => {
    if (priorityFilters) {
      // eslint-disable-next-line
      setPriorities(priorityFilters);
    }
  }, [priorityFilters]);

  useEffect(() => {
    if (statusFilters) {
      // eslint-disable-next-line
      setStatuses(statusFilters);
    }
  }, [statusFilters]);

  useEffect(() => {
    if (amountFilters) {
      // eslint-disable-next-line
      setAmounts(amountFilters);
    }
  }, [amountFilters]);

  useEffect(() => {
    if (complexityFilters) {
      // eslint-disable-next-line
      setComplexities(complexityFilters);
    }
  }, [complexityFilters]);

  useEffect(() => {
    if (updatedAtFilters) {
      // eslint-disable-next-line
      setUpdatedAt(updatedAtFilters);
    }
  }, [updatedAtFilters]);

  // Compute if all filters in each group are selected
  const allPrioritiesSelected = useMemo(() => {
    return Object.values(priorities).every(Boolean);
  }, [priorities]);

  const allStatusesSelected = useMemo(() => {
    return Object.values(statuses).every(Boolean);
  }, [statuses]);

  const allComplexitiesSelected = useMemo(() => {
    return Object.values(complexities).every(Boolean);
  }, [complexities]);

  const allAmountsSelected = useMemo(() => {
    return Object.values(amounts).every(Boolean);
  }, [amounts]);

  const allUpdatedAtSelected = useMemo(() => {
    return Object.values(updatedAt).every(Boolean);
  }, [updatedAt]);

  const handlePriorityChange = (priority: keyof PriorityFilterState) => {
    const newFilters = { ...priorities, [priority]: !priorities[priority] };
    setPriorities(newFilters);
    onPriorityChange(newFilters);
  };

  const handleStatusChange = (status: keyof StatusFilterState) => {
    const newFilters = { ...statuses, [status]: !statuses[status] };
    setStatuses(newFilters);
    onStatusChange?.(newFilters);
  };

  const handleComplexityChange = (complexity: keyof ComplexityFilterState) => {
    const newFilters = {
      ...complexities,
      [complexity]: !complexities[complexity],
    };
    setComplexities(newFilters);
    onComplexityChange?.(newFilters);
  };

  const handleAmountChange = (amount: keyof AmountFilterState) => {
    const newFilters = { ...amounts, [amount]: !amounts[amount] };
    setAmounts(newFilters);
    onAmountChange?.(newFilters);
  };

  const handleUpdatedAtChange = (period: keyof UpdatedAtFilterState) => {
    const newFilters = { ...updatedAt, [period]: !updatedAt[period] };
    setUpdatedAt(newFilters);
    onUpdatedAtChange?.(newFilters);
  };

  const handleSelectAllPriorities = () => {
    const nextState = !allPrioritiesSelected;
    const newFilters: PriorityFilterState = {
      low: nextState,
      medium: nextState,
      high: nextState,
    };
    setPriorities(newFilters);
    onPriorityChange(newFilters);
  };

  const handleSelectAllStatuses = () => {
    const nextState = !allStatusesSelected;
    const newFilters: StatusFilterState = {
      pending: nextState,
      "in-progress": nextState,
      completed: nextState,
      cancelled: nextState,
    };
    setStatuses(newFilters);
    onStatusChange?.(newFilters);
  };

  const handleSelectAllComplexities = () => {
    const nextState = !allComplexitiesSelected;
    const newFilters: ComplexityFilterState = {
      simple: nextState,
      moderate: nextState,
      complex: nextState,
    };
    setComplexities(newFilters);
    onComplexityChange?.(newFilters);
  };

  const handleSelectAllAmounts = () => {
    const nextState = !allAmountsSelected;
    const newFilters: AmountFilterState = {
      low: nextState,
      medium: nextState,
      high: nextState,
    };
    setAmounts(newFilters);
    onAmountChange?.(newFilters);
  };

  const handleSelectAllUpdatedAt = () => {
    const nextState = !allUpdatedAtSelected;
    const newFilters: UpdatedAtFilterState = {
      recent: nextState,
      moderate: nextState,
      old: nextState,
    };
    setUpdatedAt(newFilters);
    onUpdatedAtChange?.(newFilters);
  };

  return (
    <div className="w-full px-6 py-4 border-b border-border bg-muted/50">
      <div className="flex gap-4">
        <div className="flex items-center">
          <h3
            className="text-sm font-semibold text-foreground/70 tracking-wider whitespace-nowrap"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {pl.filters.toUpperCase()}
          </h3>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* PRIORITY GROUP */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <Toggle
                  pressed={allPrioritiesSelected}
                  onPressedChange={handleSelectAllPriorities}
                  size="sm"
                  aria-label="Select all priorities"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-300 h-6 w-6 p-0"
                >
                  {allPrioritiesSelected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </Toggle>
                <span className="text-xs font-medium text-foreground/70">
                  {pl.priority}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Toggle
                  pressed={priorities.low}
                  onPressedChange={() => handlePriorityChange("low")}
                  size="sm"
                  aria-label="Filter by Low priority"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.priorityLow}
                >
                  <ChevronDown className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={priorities.medium}
                  onPressedChange={() => handlePriorityChange("medium")}
                  size="sm"
                  aria-label="Filter by Medium priority"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-yellow-50 data-[state=on]:text-yellow-700 data-[state=on]:border-yellow-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.priorityMedium}
                >
                  <AlertCircle className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={priorities.high}
                  onPressedChange={() => handlePriorityChange("high")}
                  size="sm"
                  aria-label="Filter by High priority"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.priorityHigh}
                >
                  <Zap className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            {/* STATUS GROUP */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <Toggle
                  pressed={allStatusesSelected}
                  onPressedChange={handleSelectAllStatuses}
                  size="sm"
                  aria-label="Select all statuses"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 data-[state=on]:border-blue-300 h-6 w-6 p-0"
                >
                  {allStatusesSelected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </Toggle>
                <span className="text-xs font-medium text-foreground/70">
                  {pl.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Toggle
                  pressed={statuses.pending}
                  onPressedChange={() => handleStatusChange("pending")}
                  size="sm"
                  aria-label="Filter by Pending status"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 data-[state=on]:border-blue-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.statusPending}
                >
                  <Clock className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={statuses["in-progress"]}
                  onPressedChange={() => handleStatusChange("in-progress")}
                  size="sm"
                  aria-label="Filter by In Progress status"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-purple-50 data-[state=on]:text-purple-700 data-[state=on]:border-purple-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.statusInProgress}
                >
                  <Play className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={statuses.completed}
                  onPressedChange={() => handleStatusChange("completed")}
                  size="sm"
                  aria-label="Filter by Completed status"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.statusCompleted}
                >
                  <CheckCircle className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={statuses.cancelled}
                  onPressedChange={() => handleStatusChange("cancelled")}
                  size="sm"
                  aria-label="Filter by Cancelled status"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-gray-50 data-[state=on]:text-gray-700 data-[state=on]:border-gray-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.statusCancelled}
                >
                  <XCircle className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            {/* AMOUNT GROUP */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <Toggle
                  pressed={allAmountsSelected}
                  onPressedChange={handleSelectAllAmounts}
                  size="sm"
                  aria-label="Select all amounts"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-700 data-[state=on]:border-indigo-300 h-6 w-6 p-0"
                >
                  {allAmountsSelected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </Toggle>
                <span className="text-xs font-medium text-foreground/70">
                  {pl.amount}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Toggle
                  pressed={amounts.low}
                  onPressedChange={() => handleAmountChange("low")}
                  size="sm"
                  aria-label="Filter by Low amount"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-indigo-50 data-[state=on]:text-indigo-700 data-[state=on]:border-indigo-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.amountLow}
                >
                  <ChevronDown className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={amounts.medium}
                  onPressedChange={() => handleAmountChange("medium")}
                  size="sm"
                  aria-label="Filter by Medium amount"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-purple-50 data-[state=on]:text-purple-700 data-[state=on]:border-purple-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.amountMedium}
                >
                  <AlertCircle className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={amounts.high}
                  onPressedChange={() => handleAmountChange("high")}
                  size="sm"
                  aria-label="Filter by High amount"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-pink-50 data-[state=on]:text-pink-700 data-[state=on]:border-pink-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.amountHigh}
                >
                  <Zap className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            {/* COMPLEXITY GROUP */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <Toggle
                  pressed={allComplexitiesSelected}
                  onPressedChange={handleSelectAllComplexities}
                  size="sm"
                  aria-label="Select all complexities"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-sky-50 data-[state=on]:text-sky-700 data-[state=on]:border-sky-300 h-6 w-6 p-0"
                >
                  {allComplexitiesSelected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </Toggle>
                <span className="text-xs font-medium text-foreground/70">
                  {pl.complexity}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Toggle
                  pressed={complexities.simple}
                  onPressedChange={() => handleComplexityChange("simple")}
                  size="sm"
                  aria-label="Filter by Simple complexity (Level 1)"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-sky-50 data-[state=on]:text-sky-700 data-[state=on]:border-sky-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.complexitySimple}
                >
                  <Wrench className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={complexities.moderate}
                  onPressedChange={() => handleComplexityChange("moderate")}
                  size="sm"
                  aria-label="Filter by Moderate complexity (Level 2)"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-amber-50 data-[state=on]:text-amber-700 data-[state=on]:border-amber-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.complexityModerate}
                >
                  <Wrench className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={complexities.complex}
                  onPressedChange={() => handleComplexityChange("complex")}
                  size="sm"
                  aria-label="Filter by Complex (Level 3)"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.complexityComplex}
                >
                  <Wrench className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            {/* UPDATED AT GROUP */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 mb-1">
                <Toggle
                  pressed={allUpdatedAtSelected}
                  onPressedChange={handleSelectAllUpdatedAt}
                  size="sm"
                  aria-label="Select all updated periods"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-300 h-6 w-6 p-0"
                >
                  {allUpdatedAtSelected ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                </Toggle>
                <span className="text-xs font-medium text-foreground/70">
                  {pl.updatedAt}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Toggle
                  pressed={updatedAt.recent}
                  onPressedChange={() => handleUpdatedAtChange("recent")}
                  size="sm"
                  aria-label="Filter by Recent updates (less than 1 week)"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.updatedRecent}
                >
                  <Calendar className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={updatedAt.moderate}
                  onPressedChange={() => handleUpdatedAtChange("moderate")}
                  size="sm"
                  aria-label="Filter by Moderate updates (1 week - 1 month)"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-yellow-50 data-[state=on]:text-yellow-700 data-[state=on]:border-yellow-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.updatedModerate}
                >
                  <Calendar className="h-4 w-4" />
                </Toggle>

                <Toggle
                  pressed={updatedAt.old}
                  onPressedChange={() => handleUpdatedAtChange("old")}
                  size="sm"
                  aria-label="Filter by Old updates (more than 1 month)"
                  className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-gray-50 data-[state=on]:text-gray-700 data-[state=on]:border-gray-300 h-7 w-full flex-1 p-0 flex items-center justify-center"
                  title={pl.updatedOld}
                >
                  <Calendar className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
