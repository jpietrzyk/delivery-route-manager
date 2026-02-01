import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { pl } from "@/lib/translations";

export type FilterOption = {
  value: string;
  label: string;
  color?: string;
};

interface DataTableFilterDropdownProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

export function DataTableFilterDropdown({
  title,
  options,
  selectedValues,
  onSelectionChange,
}: DataTableFilterDropdownProps) {
  const allSelected = selectedValues.length === options.length;
  const someSelected = selectedValues.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options.map((opt) => opt.value));
    }
  };

  const handleOptionToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 px-3 border-border/40 bg-background/50 text-foreground hover:bg-background/80 hover:border-border/60 transition-colors ${
            someSelected
              ? "bg-primary/5 border-primary/30 text-primary hover:bg-primary/10"
              : ""
          }`}
        >
          <span className="text-xs font-medium">{title}</span>
          {someSelected && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-1.5 text-xs font-semibold">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 z-[1260]">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          className="font-semibold text-xs"
        >
          {allSelected ? pl.deselectAll : pl.selectAll}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleOptionToggle(option.value)}
            className="flex gap-2 text-xs"
          >
            {option.color && (
              <div
                className="h-3 w-3 rounded-full border border-border/40"
                style={{ backgroundColor: option.color }}
              />
            )}
            <span>{option.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
