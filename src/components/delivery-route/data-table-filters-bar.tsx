import {
  DataTableFilterDropdown,
  type FilterOption,
} from "./data-table-filter-dropdown";

export interface FiltersBarConfig {
  id: string;
  title: string;
  options: FilterOption[];
}

interface DataTableFiltersBarProps {
  filters: FiltersBarConfig[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
}

export function DataTableFiltersBar({
  filters,
  selectedFilters,
  onFilterChange,
}: DataTableFiltersBarProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 py-3 px-2">
      {filters.map((filter) => (
        <DataTableFilterDropdown
          key={filter.id}
          title={filter.title}
          options={filter.options}
          selectedValues={selectedFilters[filter.id] || []}
          onSelectionChange={(values) => onFilterChange(filter.id, values)}
        />
      ))}
    </div>
  );
}
