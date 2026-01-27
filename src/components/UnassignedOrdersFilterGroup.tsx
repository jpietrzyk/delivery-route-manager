interface FilterOption {
  label: string;
  value: string;
  checked: boolean;
  color?: string;
}

export interface UnassignedOrdersFilterGroupProps {
  groupTitle: string;
  filters: FilterOption[];
  onChange: (value: string, checked: boolean) => void;
  onCheckAll: () => void;
}

export const UnassignedOrdersFilterGroup = ({
  groupTitle,
  filters,
  onChange,
  onCheckAll,
}: UnassignedOrdersFilterGroupProps) => {
  const allSelected = filters.every((filter) => filter.checked);

  const handleFilterChange = (value: string) => {
    const filter = filters.find((f) => f.value === value);
    if (filter) {
      onChange(value, !filter.checked);
    }
  };

  const handleSelectAll = () => {
    onCheckAll();
  };

  return (
    <div className="space-y-1 max-w-35">
      <div className="flex items-center gap-1 mb-1">
        <button
          onClick={handleSelectAll}
          aria-label={`Zaznacz wszystkie ${groupTitle}`}
          className="border border-border/50 bg-background/50 hover:bg-accent/50 h-6 w-6 p-0 flex items-center justify-center"
        >
          {allSelected ? "✓" : "□"}
        </button>
        <span
          className="text-xs font-medium text-foreground/70"
          aria-label={groupTitle}
        >
          {groupTitle}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-wrap">
        {filters.map((filter) => (
          <label key={filter.value} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filter.checked}
              onChange={() => handleFilterChange(filter.value)}
              className={
                filter.color
                  ? `h-4 w-4 border-2 border-[${filter.color}] bg-[${filter.color}] text-[${filter.color}]`
                  : "h-4 w-4"
              }
            />
            <span>{filter.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default UnassignedOrdersFilterGroup;
