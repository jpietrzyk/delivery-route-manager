import { UnassignedOrdersFilterGroup } from "./UnassignedOrdersFilterGroup";

export interface FilterGroupConfig {
  key: string;
  title: string;
  labels: Record<string, string>;
  colors?: Record<string, string>;
}

export interface UnassignedOrdersFiltersProps {
  groups: FilterGroupConfig[];
}

export const UnassignedOrdersFilters = ({
  groups,
}: UnassignedOrdersFiltersProps) => {
  return (
    <div className="w-full px-4 py-3 border-b border-border bg-muted/50">
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {groups.map((group) => (
              <UnassignedOrdersFilterGroup
                key={group.key}
                groupTitle={group.title}
                filters={Object.entries(group.labels).map(([value, label]) => ({
                  label,
                  value,
                  checked: false,
                }))}
                onChange={(value, checked) => {
                  console.log(`Filter changed: ${value} = ${checked}`);
                }}
                onCheckAll={() => {
                  console.log("Check all clicked");
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
