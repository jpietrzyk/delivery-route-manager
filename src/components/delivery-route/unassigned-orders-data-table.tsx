import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import type { Order } from "@/types/order";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { DataTableFiltersBar } from "./data-table-filters-bar";
import type { FiltersBarConfig } from "./data-table-filters-bar";

// Removed custom hook for useReactTable due to React Compiler incompatibility.

interface UnassignedOrdersDataTableProps {
  data: Order[];
  onAddOrder?: (orderId: string) => void;
  onFilteredDataChange?: (filteredData: Order[]) => void;
  columnFilters?: Array<{ id: string; value: unknown }>;
  onColumnFiltersChange?: (
    filters: Array<{ id: string; value: unknown }>,
  ) => void;
}

// Custom filter functions
const createArrayIncludesFilter =
  (_key: keyof Order) =>
  (
    row: { getValue: (columnId: string) => unknown },
    columnId: string,
    filterValue: unknown,
  ) => {
    if (!Array.isArray(filterValue) || filterValue.length === 0) {
      return true;
    }
    const value = String(row.getValue(columnId));
    return filterValue.includes(value);
  };

export function UnassignedOrdersDataTable({
  data,
  onAddOrder,
  onFilteredDataChange,
  columnFilters: propColumnFilters,
  onColumnFiltersChange,
}: UnassignedOrdersDataTableProps) {
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    propColumnFilters || [],
  );

  const columns = React.useMemo<ColumnDef<Order, unknown>[]>(
    (): ColumnDef<Order, unknown>[] => [
      {
        accessorKey: "status",
        header: "Status",
        filterFn: createArrayIncludesFilter("status"),
        cell: (info: { getValue: () => unknown }) => {
          const status = info.getValue() as string;
          let badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
          if (status === "pending")
            badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
          if (status === "in-progress")
            badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
          if (status === "completed")
            badgeColor = "bg-green-50 text-green-700 border-green-200";
          if (status === "cancelled")
            badgeColor = "bg-red-50 text-red-700 border-red-200";
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}
            >
              {status}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (
          rowA: { getValue: (col: string) => unknown },
          rowB: { getValue: (col: string) => unknown },
          columnId: string,
        ) => {
          const a = (rowA.getValue(columnId) || "").toString().toLowerCase();
          const b = (rowB.getValue(columnId) || "").toString().toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        filterFn: (
          row: { getValue: (columnId: string) => unknown },
          columnId: string,
          filterValue: unknown,
        ) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) {
            return true;
          }
          const value = Number(row.getValue(columnId));

          // Map numeric priority to string labels for filtering
          for (const filterVal of filterValue) {
            if (filterVal === "none" && (value === 0 || !value)) return true;
            if (filterVal === "low" && value === 1) return true;
            if (filterVal === "medium" && value === 2) return true;
            if (filterVal === "moderate" && value === 3) return true;
            if (filterVal === "high" && value === 4) return true;
          }
          return false;
        },
        cell: (info: { getValue: () => unknown }) => {
          const priorityNum = Number(info.getValue());
          let priority = "none";
          let badgeColor = "bg-gray-100 text-gray-700 border-gray-300";

          if (priorityNum === 0 || !priorityNum) {
            priority = "none";
            badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
          } else if (priorityNum === 1) {
            priority = "low";
            badgeColor = "bg-green-50 text-green-700 border-green-200";
          } else if (priorityNum === 2) {
            priority = "medium";
            badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
          } else if (priorityNum === 3) {
            priority = "moderate";
            badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
          } else if (priorityNum === 4) {
            priority = "high";
            badgeColor = "bg-red-50 text-red-700 border-red-200";
          }

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}
            >
              {priority}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (
          rowA: { getValue: (col: string) => unknown },
          rowB: { getValue: (col: string) => unknown },
          columnId: string,
        ) => {
          const a = Number(rowA.getValue(columnId) || 0);
          const b = Number(rowB.getValue(columnId) || 0);
          return a - b;
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Amount",
        filterFn: (
          row: { getValue: (columnId: string) => unknown },
          columnId: string,
          filterValue: unknown,
        ) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) {
            return true;
          }
          const amount = Number(row.getValue(columnId) || 0);

          // Map amount ranges to filter values
          for (const filterVal of filterValue) {
            if (filterVal === "low" && amount <= 600) return true;
            if (filterVal === "medium" && amount > 600 && amount <= 1300)
              return true;
            if (filterVal === "high" && amount > 1300) return true;
          }
          return false;
        },
        cell: (info: { getValue: () => unknown }) => info.getValue(),
        enableSorting: true,
        sortingFn: (
          rowA: { getValue: (col: string) => unknown },
          rowB: { getValue: (col: string) => unknown },
          columnId: string,
        ) => {
          const a = Number(rowA.getValue(columnId) || 0);
          const b = Number(rowB.getValue(columnId) || 0);
          return a - b;
        },
      },
      {
        accessorKey: "complexity",
        header: () => <span>Complexity</span>,
        filterFn: (
          row: { getValue: (columnId: string) => unknown },
          columnId: string,
          filterValue: unknown,
        ) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) {
            return true;
          }
          const value = Number(row.getValue(columnId));

          // Handle filtering for complexity groups
          for (const filterVal of filterValue) {
            if (filterVal === "1" && value === 1) return true;
            if (filterVal === "2" && value === 2) return true;
            if (filterVal === "3" && value >= 3) return true;
          }
          return false;
        },
        cell: (info: { getValue: () => unknown }) => {
          const complexity = info.getValue() as number;
          let badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
          let label = "Unknown";

          if (complexity >= 3) {
            badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
            label = "Complex";
          } else if (complexity === 2) {
            badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
            label = "Moderate";
          } else if (complexity === 1) {
            badgeColor = "bg-green-50 text-green-700 border-green-200";
            label = "Simple";
          }

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}
            >
              {label}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (
          rowA: { getValue: (col: string) => unknown },
          rowB: { getValue: (col: string) => unknown },
          columnId: string,
        ) => {
          const a = Number(rowA.getValue(columnId) || 0);
          const b = Number(rowB.getValue(columnId) || 0);
          return a - b;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info: { getValue: () => unknown }) =>
          info.getValue()
            ? new Date(info.getValue() as string).toLocaleDateString()
            : "?",
        enableSorting: true,
        sortingFn: (
          rowA: { getValue: (col: string) => unknown },
          rowB: { getValue: (col: string) => unknown },
          columnId: string,
        ) => {
          const a = new Date(rowA.getValue(columnId) as string).getTime() || 0;
          const b = new Date(rowB.getValue(columnId) as string).getTime() || 0;
          return a - b;
        },
      },
      {
        id: "add",
        header: "",
        cell: (info: { row: { original: Order } }) => (
          <button
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-primary/30 text-primary bg-primary/5 hover:bg-primary/12 hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-0"
            onClick={() => onAddOrder?.(info.row.original.id)}
            title="Add to delivery route"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add
          </button>
        ),
        enableSorting: false,
      },
    ],
    [onAddOrder],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "auto",
    debugTable: false,
  });

  // Notify parent when filtered data changes
  React.useEffect(() => {
    if (onFilteredDataChange) {
      const filteredRows = table.getFilteredRowModel().rows;
      const filteredData = filteredRows.map((row) => row.original);
      onFilteredDataChange(filteredData);
    }
  }, [table, onFilteredDataChange, columnFilters]);

  // Sync filter changes with parent
  React.useEffect(() => {
    if (onColumnFiltersChange) {
      onColumnFiltersChange(columnFilters);
    }
  }, [columnFilters, onColumnFiltersChange]);

  // Update local filters when props change
  React.useEffect(() => {
    if (
      propColumnFilters &&
      JSON.stringify(propColumnFilters) !== JSON.stringify(columnFilters)
    ) {
      setColumnFilters(propColumnFilters);
    }
  }, [propColumnFilters]);

  const filterConfig: FiltersBarConfig[] = [
    {
      id: "status",
      title: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      id: "priority",
      title: "Priority",
      options: [
        { value: "none", label: "None" },
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "moderate", label: "Moderate" },
        { value: "high", label: "High" },
      ],
    },
    {
      id: "totalAmount",
      title: "Amount",
      options: [
        { value: "low", label: "Low (≤ 600)" },
        { value: "medium", label: "Medium (601-1300)" },
        { value: "high", label: "High (> 1300)" },
      ],
    },
    {
      id: "complexity",
      title: "Complexity",
      options: [
        { value: "1", label: "Simple" },
        { value: "2", label: "Moderate" },
        { value: "3", label: "Complex" },
      ],
    },
  ];

  const selectedFilters = React.useMemo(() => {
    const filters: Record<string, string[]> = {};
    columnFilters.forEach((filter) => {
      if (Array.isArray(filter.value)) {
        filters[filter.id] = filter.value.map((v) => String(v));
      }
    });
    return filters;
  }, [columnFilters]);

  const handleFilterChange = (filterId: string, values: string[]) => {
    setColumnFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== filterId);
      if (values.length > 0) {
        return [...filtered, { id: filterId, value: values }];
      }
      return filtered;
    });
  };

  return (
    <div className="w-full rounded-xl border border-border/40 bg-background/95 shadow-sm overflow-hidden">
      <DataTableFiltersBar
        filters={filterConfig}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
      />
      <div className="p-2">
        <Table className="w-full text-sm text-foreground">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={`bg-primary/3 border-b border-primary/15 px-4 py-2.5 text-xs font-semibold text-foreground/60 uppercase tracking-wide ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:text-foreground/80 hover:bg-primary/5 transition-colors"
                        : ""
                    }`}
                    style={{
                      borderTop:
                        "1px solid var(--primary-color, rgba(59, 130, 246, 0.1))",
                      borderLeft:
                        "1px solid var(--primary-color, rgba(59, 130, 246, 0.1))",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() === "asc" && " ▲"}
                    {header.column.getIsSorted() === "desc" && " ▼"}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
        <div className="h-[400px] overflow-auto">
          <Table className="w-full text-sm text-foreground">
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const orderId = row.original.id;
                const isHighlighted = highlightedOrderId === orderId;
                return (
                  <TableRow
                    key={row.id}
                    className={
                      isHighlighted
                        ? "bg-primary/15 border-l-4 border-l-primary shadow-md"
                        : "border-l-4 border-l-transparent hover:bg-primary/8 hover:border-l-primary/40 transition-all duration-200"
                    }
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHighlightedOrderId(orderId)}
                    onMouseLeave={() => setHighlightedOrderId(null)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="align-middle px-3 py-2 border-b border-border/30"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
