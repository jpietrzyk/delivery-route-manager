import { useMemo, isValidElement, cloneElement } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Check, Square } from "lucide-react";

export interface FilterOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

export interface FiltersGroupProps {
  name: string;
  filters: Record<string, boolean>;
  options: FilterOption[];
  onChange?: (filters: Record<string, boolean>) => void;
  gridCols?: number;
}

export const FiltersGroup = ({
  name,
  filters,
  options,
  onChange,
  gridCols = 3,
}: FiltersGroupProps) => {
  // Remove local state, use filters prop directly

  const allSelected = useMemo(() => {
    return Object.values(filters).every(Boolean);
  }, [filters]);

  const handleFilterChange = (key: string) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    onChange?.(newFilters);
  };

  const handleSelectAll = () => {
    const nextState = !allSelected;
    const newFilters: Record<string, boolean> = {};
    options.forEach((option) => {
      newFilters[option.key] = nextState;
    });
    onChange?.(newFilters);
  };

  return (
    <div className="space-y-1 max-w-35">
      <div className="flex items-center gap-1 mb-1">
        <Toggle
          pressed={allSelected}
          onPressedChange={handleSelectAll}
          size="sm"
          aria-label={`Zaznacz wszystkie ${name}`}
          className={`border border-border/50 bg-background/50 hover:bg-accent/50 h-6 w-6 p-0 flex items-center justify-center ${
            allSelected && options[0]?.color
              ? `data-[state=on]:bg-[${options[0].color}] data-[state=on]:text-[${options[0].color}] data-[state=on]:border-[${options[0].color}]`
              : ""
          }`}
        >
          {allSelected ? (
            <Check className="h-3 w-3" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </Toggle>
        <span
          className="text-xs font-medium text-foreground/70"
          aria-label={name}
        >
          {name}
        </span>
      </div>
      <div className={`grid grid-cols-${gridCols} gap-2 lg:flex lg:flex-wrap`}>
        {options.map((option) => {
          const color = option.color;
          return (
            <Toggle
              key={option.key}
              pressed={filters[option.key] ?? false}
              onPressedChange={() => handleFilterChange(option.key)}
              size="sm"
              aria-label={`Filtruj po ${option.label}`}
              className={`border border-border/50 bg-background/50 hover:bg-accent/50 h-7 w-full flex-1 p-0 flex items-center justify-center ${
                color
                  ? `data-[state=on]:bg-[${color}] data-[state=on]:text-[${color}] data-[state=on]:border-[${color}]`
                  : "data-[state=on]:bg-accent/10"
              }`}
              title={option.label}
            >
              {isValidElement(option.icon)
                ? cloneElement(option.icon, {
                    className: "h-4 w-4",
                    style: filters[option.key] && color ? { color } : undefined,
                  } as React.HTMLAttributes<HTMLElement>)
                : option.icon}
            </Toggle>
          );
        })}
      </div>
    </div>
  );
};
