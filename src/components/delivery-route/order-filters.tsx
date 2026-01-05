import React, { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import {
  ChevronDown,
  AlertCircle,
  Zap,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  DollarSign,
  Wrench,
  Calendar,
} from "lucide-react";

export type PriorityFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
};

export type StatusFilterState = {
  pending: boolean;
  "in-progress": boolean;
  completed: boolean;
  cancelled: boolean;
};

export type AmountFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
};

export type ComplexityFilterState = {
  simple: boolean;
  moderate: boolean;
  complex: boolean;
};

export type UpdatedAtFilterState = {
  recent: boolean; // Less than 1 week
  moderate: boolean; // 1 week - 1 month
  old: boolean; // More than 1 month
};

interface OrderFiltersProps {
  onPriorityChange: (filters: PriorityFilterState) => void;
  onStatusChange?: (filters: StatusFilterState) => void;
  onAmountChange?: (filters: AmountFilterState) => void;
  onComplexityChange?: (filters: ComplexityFilterState) => void;
  onUpdatedAtChange?: (filters: UpdatedAtFilterState) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  onPriorityChange,
  onStatusChange,
  onAmountChange,
  onComplexityChange,
  onUpdatedAtChange,
}) => {
  const [priorities, setPriorities] = useState<PriorityFilterState>({
    low: true,
    medium: true,
    high: true,
  });

  const [statuses, setStatuses] = useState<StatusFilterState>({
    pending: true,
    "in-progress": true,
    completed: true,
    cancelled: true,
  });

  const [amounts, setAmounts] = useState<AmountFilterState>({
    low: true,
    medium: true,
    high: true,
  });

  const [complexities, setComplexities] = useState<ComplexityFilterState>({
    simple: true,
    moderate: true,
    complex: true,
  });

  const [updatedAt, setUpdatedAt] = useState<UpdatedAtFilterState>({
    recent: true,
    moderate: true,
    old: true,
  });

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

  const handleAmountChange = (amount: keyof AmountFilterState) => {
    const newFilters = { ...amounts, [amount]: !amounts[amount] };
    setAmounts(newFilters);
    onAmountChange?.(newFilters);
  };

  const handleComplexityChange = (complexity: keyof ComplexityFilterState) => {
    const newFilters = {
      ...complexities,
      [complexity]: !complexities[complexity],
    };
    setComplexities(newFilters);
    onComplexityChange?.(newFilters);
  };

  const handleUpdatedAtChange = (period: keyof UpdatedAtFilterState) => {
    const newFilters = { ...updatedAt, [period]: !updatedAt[period] };
    setUpdatedAt(newFilters);
    onUpdatedAtChange?.(newFilters);
  };

  return (
    <div className="w-full px-6 py-4 border-b border-border bg-muted/50">
      <h3 className="text-sm font-semibold text-foreground mb-4">Filters</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Priority</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={priorities.low}
              onPressedChange={() => handlePriorityChange("low")}
              size="sm"
              aria-label="Filter by Low priority"
              className="data-[state=on]:text-green-600 data-[state=on]:*:[svg]:stroke-green-600 justify-start"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Low
            </Toggle>

            <Toggle
              pressed={priorities.medium}
              onPressedChange={() => handlePriorityChange("medium")}
              size="sm"
              aria-label="Filter by Medium priority"
              className="data-[state=on]:text-yellow-600 data-[state=on]:*:[svg]:stroke-yellow-600 justify-start"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Medium
            </Toggle>

            <Toggle
              pressed={priorities.high}
              onPressedChange={() => handlePriorityChange("high")}
              size="sm"
              aria-label="Filter by High priority"
              className="data-[state=on]:text-red-600 data-[state=on]:*:[svg]:stroke-red-600 justify-start col-span-2"
            >
              <Zap className="h-4 w-4 mr-1" />
              High
            </Toggle>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Status</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={statuses.pending}
              onPressedChange={() => handleStatusChange("pending")}
              size="sm"
              aria-label="Filter by Pending status"
              className="data-[state=on]:text-blue-600 data-[state=on]:*:[svg]:stroke-blue-600 justify-start"
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending
            </Toggle>

            <Toggle
              pressed={statuses["in-progress"]}
              onPressedChange={() => handleStatusChange("in-progress")}
              size="sm"
              aria-label="Filter by In Progress status"
              className="data-[state=on]:text-purple-600 data-[state=on]:*:[svg]:stroke-purple-600 justify-start"
            >
              <Play className="h-4 w-4 mr-1" />
              In Progress
            </Toggle>

            <Toggle
              pressed={statuses.completed}
              onPressedChange={() => handleStatusChange("completed")}
              size="sm"
              aria-label="Filter by Completed status"
              className="data-[state=on]:text-emerald-600 data-[state=on]:*:[svg]:stroke-emerald-600 justify-start"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Toggle>

            <Toggle
              pressed={statuses.cancelled}
              onPressedChange={() => handleStatusChange("cancelled")}
              size="sm"
              aria-label="Filter by Cancelled status"
              className="data-[state=on]:text-gray-600 data-[state=on]:*:[svg]:stroke-gray-600 justify-start"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelled
            </Toggle>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Amount</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={amounts.low}
              onPressedChange={() => handleAmountChange("low")}
              size="sm"
              aria-label="Filter by Low amount (0 - 10,000)"
              className="data-[state=on]:text-cyan-600 data-[state=on]:*:[svg]:stroke-cyan-600 justify-start"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              0-10K
            </Toggle>

            <Toggle
              pressed={amounts.medium}
              onPressedChange={() => handleAmountChange("medium")}
              size="sm"
              aria-label="Filter by Medium amount (10,001 - 100,000)"
              className="data-[state=on]:text-orange-600 data-[state=on]:*:[svg]:stroke-orange-600 justify-start"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              10K-100K
            </Toggle>

            <Toggle
              pressed={amounts.high}
              onPressedChange={() => handleAmountChange("high")}
              size="sm"
              aria-label="Filter by High amount (above 100,000)"
              className="data-[state=on]:text-rose-600 data-[state=on]:*:[svg]:stroke-rose-600 justify-start col-span-2"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              100K+
            </Toggle>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Complexity</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={complexities.simple}
              onPressedChange={() => handleComplexityChange("simple")}
              size="sm"
              aria-label="Filter by Simple complexity (Level 1)"
              className="data-[state=on]:text-sky-600 data-[state=on]:*:[svg]:stroke-sky-600 justify-start"
            >
              <Wrench className="h-4 w-4 mr-1" />
              Simple
            </Toggle>

            <Toggle
              pressed={complexities.moderate}
              onPressedChange={() => handleComplexityChange("moderate")}
              size="sm"
              aria-label="Filter by Moderate complexity (Level 2)"
              className="data-[state=on]:text-amber-600 data-[state=on]:*:[svg]:stroke-amber-600 justify-start"
            >
              <Wrench className="h-4 w-4 mr-1" />
              Moderate
            </Toggle>

            <Toggle
              pressed={complexities.complex}
              onPressedChange={() => handleComplexityChange("complex")}
              size="sm"
              aria-label="Filter by Complex (Level 3)"
              className="data-[state=on]:text-red-700 data-[state=on]:*:[svg]:stroke-red-700 justify-start col-span-2"
            >
              <Wrench className="h-4 w-4 mr-1" />
              Complex
            </Toggle>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Last Updated</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle
              pressed={updatedAt.recent}
              onPressedChange={() => handleUpdatedAtChange("recent")}
              size="sm"
              aria-label="Filter by Recent updates (less than 1 week)"
              className="data-[state=on]:text-green-600 data-[state=on]:*:[svg]:stroke-green-600 justify-start"
            >
              <Calendar className="h-4 w-4 mr-1" />
              &lt; 1 Week
            </Toggle>

            <Toggle
              pressed={updatedAt.moderate}
              onPressedChange={() => handleUpdatedAtChange("moderate")}
              size="sm"
              aria-label="Filter by Moderate updates (1 week - 1 month)"
              className="data-[state=on]:text-yellow-600 data-[state=on]:*:[svg]:stroke-yellow-600 justify-start"
            >
              <Calendar className="h-4 w-4 mr-1" />1 Week - 1 Month
            </Toggle>

            <Toggle
              pressed={updatedAt.old}
              onPressedChange={() => handleUpdatedAtChange("old")}
              size="sm"
              aria-label="Filter by Old updates (more than 1 month)"
              className="data-[state=on]:text-gray-600 data-[state=on]:*:[svg]:stroke-gray-600 justify-start col-span-2"
            >
              <Calendar className="h-4 w-4 mr-1" />
              &gt; 1 Month
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  );
};
