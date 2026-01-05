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
      <div className="flex gap-4">
        <div className="flex items-center">
          <h3
            className="text-sm font-semibold text-foreground/70 tracking-wider whitespace-nowrap"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            FILTERS
          </h3>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/70">Priority</p>
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                pressed={priorities.low}
                onPressedChange={() => handlePriorityChange("low")}
                size="sm"
                aria-label="Filter by Low priority"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-300 data-[state=on]:*:[svg]:stroke-green-700 justify-start h-8 font-normal"
              >
                <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                Low
              </Toggle>

              <Toggle
                pressed={priorities.medium}
                onPressedChange={() => handlePriorityChange("medium")}
                size="sm"
                aria-label="Filter by Medium priority"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-yellow-50 data-[state=on]:text-yellow-700 data-[state=on]:border-yellow-300 data-[state=on]:*:[svg]:stroke-yellow-700 justify-start h-8 font-normal"
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                Medium
              </Toggle>

              <Toggle
                pressed={priorities.high}
                onPressedChange={() => handlePriorityChange("high")}
                size="sm"
                aria-label="Filter by High priority"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300 data-[state=on]:*:[svg]:stroke-red-700 justify-start h-8 font-normal col-span-2"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
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
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-blue-50 data-[state=on]:text-blue-700 data-[state=on]:border-blue-300 data-[state=on]:*:[svg]:stroke-blue-700 justify-start h-8 font-normal"
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Pending
              </Toggle>

              <Toggle
                pressed={statuses["in-progress"]}
                onPressedChange={() => handleStatusChange("in-progress")}
                size="sm"
                aria-label="Filter by In Progress status"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-purple-50 data-[state=on]:text-purple-700 data-[state=on]:border-purple-300 data-[state=on]:*:[svg]:stroke-purple-700 justify-start h-8 font-normal"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                In Progress
              </Toggle>

              <Toggle
                pressed={statuses.completed}
                onPressedChange={() => handleStatusChange("completed")}
                size="sm"
                aria-label="Filter by Completed status"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 data-[state=on]:border-emerald-300 data-[state=on]:*:[svg]:stroke-emerald-700 justify-start h-8 font-normal"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Completed
              </Toggle>

              <Toggle
                pressed={statuses.cancelled}
                onPressedChange={() => handleStatusChange("cancelled")}
                size="sm"
                aria-label="Filter by Cancelled status"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-gray-50 data-[state=on]:text-gray-700 data-[state=on]:border-gray-300 data-[state=on]:*:[svg]:stroke-gray-700 justify-start h-8 font-normal"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
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
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-cyan-50 data-[state=on]:text-cyan-700 data-[state=on]:border-cyan-300 data-[state=on]:*:[svg]:stroke-cyan-700 justify-start h-8 font-normal"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                0-10K
              </Toggle>

              <Toggle
                pressed={amounts.medium}
                onPressedChange={() => handleAmountChange("medium")}
                size="sm"
                aria-label="Filter by Medium amount (10,001 - 100,000)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-orange-50 data-[state=on]:text-orange-700 data-[state=on]:border-orange-300 data-[state=on]:*:[svg]:stroke-orange-700 justify-start h-8 font-normal"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                10K-100K
              </Toggle>

              <Toggle
                pressed={amounts.high}
                onPressedChange={() => handleAmountChange("high")}
                size="sm"
                aria-label="Filter by High amount (above 100,000)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-rose-50 data-[state=on]:text-rose-700 data-[state=on]:border-rose-300 data-[state=on]:*:[svg]:stroke-rose-700 justify-start h-8 font-normal col-span-2"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
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
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-sky-50 data-[state=on]:text-sky-700 data-[state=on]:border-sky-300 data-[state=on]:*:[svg]:stroke-sky-700 justify-start h-8 font-normal"
              >
                <Wrench className="h-3.5 w-3.5 mr-1.5" />
                Simple
              </Toggle>

              <Toggle
                pressed={complexities.moderate}
                onPressedChange={() => handleComplexityChange("moderate")}
                size="sm"
                aria-label="Filter by Moderate complexity (Level 2)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-amber-50 data-[state=on]:text-amber-700 data-[state=on]:border-amber-300 data-[state=on]:*:[svg]:stroke-amber-700 justify-start h-8 font-normal"
              >
                <Wrench className="h-3.5 w-3.5 mr-1.5" />
                Moderate
              </Toggle>

              <Toggle
                pressed={complexities.complex}
                onPressedChange={() => handleComplexityChange("complex")}
                size="sm"
                aria-label="Filter by Complex (Level 3)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300 data-[state=on]:*:[svg]:stroke-red-700 justify-start h-8 font-normal col-span-2"
              >
                <Wrench className="h-3.5 w-3.5 mr-1.5" />
                Complex
              </Toggle>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/70">
              Last Updated
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                pressed={updatedAt.recent}
                onPressedChange={() => handleUpdatedAtChange("recent")}
                size="sm"
                aria-label="Filter by Recent updates (less than 1 week)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-300 data-[state=on]:*:[svg]:stroke-green-700 justify-start h-8 font-normal"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                &lt; 1 Week
              </Toggle>

              <Toggle
                pressed={updatedAt.moderate}
                onPressedChange={() => handleUpdatedAtChange("moderate")}
                size="sm"
                aria-label="Filter by Moderate updates (1 week - 1 month)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-yellow-50 data-[state=on]:text-yellow-700 data-[state=on]:border-yellow-300 data-[state=on]:*:[svg]:stroke-yellow-700 justify-start h-8 font-normal"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />1 Week - 1 Month
              </Toggle>

              <Toggle
                pressed={updatedAt.old}
                onPressedChange={() => handleUpdatedAtChange("old")}
                size="sm"
                aria-label="Filter by Old updates (more than 1 month)"
                className="border border-border/50 bg-background/50 hover:bg-accent/50 data-[state=on]:bg-gray-50 data-[state=on]:text-gray-700 data-[state=on]:border-gray-300 data-[state=on]:*:[svg]:stroke-gray-700 justify-start h-8 font-normal col-span-2"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                &gt; 1 Month
              </Toggle>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
