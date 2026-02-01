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
}: UnassignedOrdersDataTableProps) {
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
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
        filterFn: createArrayIncludesFilter("priority"),
        cell: (info: { getValue: () => unknown }) => {
          const priority = info.getValue() as string;
          let badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
          if (priority === "high")
            badgeColor = "bg-red-50 text-red-700 border-red-200";
          if (priority === "medium")
            badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
          if (priority === "low")
            badgeColor = "bg-green-50 text-green-700 border-green-200";
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
          const a = (rowA.getValue(columnId) || "").toString().toLowerCase();
          const b = (rowB.getValue(columnId) || "").toString().toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Amount",
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
          if (complexity >= 3)
            badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
          if (complexity === 2)
            badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
          if (complexity === 1)
            badgeColor = "bg-green-50 text-green-700 border-green-200";
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}
            >
              {complexity}
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
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border border-primary/60 text-primary bg-primary/5 hover:bg-primary/20 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            onClick={() => onAddOrder?.(info.row.original.id)}
            title="Add to delivery route"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
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
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
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
                    className={`bg-background/80 border-b border-border/40 rounded-t-lg px-4 py-2 text-base font-semibold text-foreground/80 shadow-sm ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }`}
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      borderLeft: "1px solid var(--border-color)",
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
                        ? "bg-primary/10 border-primary/60 text-primary shadow-sm"
                        : "hover:bg-accent/20 transition-colors"
                    }
                    style={{ cursor: "pointer", borderRadius: 8 }}
                    onMouseEnter={() => setHighlightedOrderId(orderId)}
                    onMouseLeave={() => setHighlightedOrderId(null)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="align-middle px-3 py-2 border-b border-border/30 bg-background/95"
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
