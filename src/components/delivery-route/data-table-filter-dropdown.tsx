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
          className={`h-8 gap-1.5 px-2.5 ${
            someSelected ? "border-primary/40 bg-primary/5 text-primary" : ""
          }`}
        >
          <span>{title}</span>
          {someSelected && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/30 px-1.5 text-xs font-semibold">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 z-[1260]">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          className="font-semibold"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleOptionToggle(option.value)}
            className="flex gap-2"
          >
            {option.color && (
              <div
                className="h-3 w-3 rounded-full border border-border"
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
