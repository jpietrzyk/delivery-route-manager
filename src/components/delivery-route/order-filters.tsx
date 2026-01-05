import React, { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { ChevronDown, AlertCircle, Zap } from "lucide-react";

export type PriorityFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
};

interface OrderFiltersProps {
  onPriorityChange: (filters: PriorityFilterState) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  onPriorityChange,
}) => {
  const [priorities, setPriorities] = useState<PriorityFilterState>({
    low: true,
    medium: true,
    high: true,
  });

  const handlePriorityChange = (priority: keyof PriorityFilterState) => {
    const newFilters = { ...priorities, [priority]: !priorities[priority] };
    setPriorities(newFilters);
    onPriorityChange(newFilters);
  };

  return (
    <div className="w-full px-6 py-4 border-b border-border bg-muted/50">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Priority</p>
          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={priorities.low}
              onPressedChange={() => handlePriorityChange("low")}
              variant="outline"
              size="sm"
              aria-label="Filter by Low priority"
              className="data-[state=on]:text-green-600 data-[state=on]:*:[svg]:stroke-green-600"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Low
            </Toggle>

            <Toggle
              pressed={priorities.medium}
              onPressedChange={() => handlePriorityChange("medium")}
              variant="outline"
              size="sm"
              aria-label="Filter by Medium priority"
              className="data-[state=on]:text-yellow-600 data-[state=on]:*:[svg]:stroke-yellow-600"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Medium
            </Toggle>

            <Toggle
              pressed={priorities.high}
              onPressedChange={() => handlePriorityChange("high")}
              variant="outline"
              size="sm"
              aria-label="Filter by High priority"
              className="data-[state=on]:text-red-600 data-[state=on]:*:[svg]:stroke-red-600"
            >
              <Zap className="h-4 w-4 mr-1" />
              High
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  );
};
