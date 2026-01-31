import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { Order } from "@/types/order";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";

// Custom hook to wrap useReactTable with stable references
// This prevents React Compiler from attempting to memoize TanStack Table's non-memoizable API
function useStableReactTable<TData>(
  data: TData[],
  columns: ColumnDef<TData, unknown>[],
  sorting: SortingState,
  onSortingChange: OnChangeFn<SortingState>,
) {
  // eslint-disable-next-line react-hooks/incompatible-library
  return useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });
}

interface UnassignedOrdersDataTableProps {
  data: Order[];
  onAddOrder?: (orderId: string) => void;
}

export function UnassignedOrdersDataTable({
  data,
  onAddOrder,
}: UnassignedOrdersDataTableProps) {
  const { highlightedOrderId, setHighlightedOrderId } = useMarkerHighlight();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Order, unknown>[]>(
    () => [
      {
        accessorKey: "customer.name",
        header: "Customer",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "priority",
        header: () => <span>Priority</span>,
        cell: (info) => {
          const priority = info.getValue() as number;
          let label = priority;
          let badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
          if (priority >= 3) {
            label = "High";
            badgeColor = "bg-red-50 text-red-700 border-red-200";
          } else if (priority === 2) {
            label = "Medium";
            badgeColor = "bg-yellow-50 text-yellow-800 border-yellow-200";
          } else {
            label = "Low";
            badgeColor = "bg-green-50 text-green-700 border-green-200";
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
        sortingFn: (rowA, rowB, columnId) => {
          const a = (rowA.getValue(columnId) || "").toString().toLowerCase();
          const b = (rowB.getValue(columnId) || "").toString().toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "status",
        header: () => <span>Status</span>,
        cell: (info) => {
          const status = info.getValue() as Order["status"];
          let badgeColor = "bg-gray-100 text-gray-700 border-gray-300";
          if (status === "pending")
            badgeColor = "bg-yellow-50 text-yellow-800 border-yellow-200";
          if (status === "in-progress")
            badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
          if (status === "completed")
            badgeColor = "bg-green-50 text-green-800 border-green-200";
          if (status === "cancelled")
            badgeColor = "bg-red-50 text-red-800 border-red-200";
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}
            >
              {status}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (rowA, rowB, columnId) => {
          const a = (rowA.getValue(columnId) || "").toString().toLowerCase();
          const b = (rowB.getValue(columnId) || "").toString().toLowerCase();
          return a.localeCompare(b);
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Amount",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: (info) => {
          const loc = info.getValue() as Order["location"];
          return loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "?";
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue() as string).toLocaleDateString()
            : "?",
      },
      // Add button column LAST
      {
        id: "add",
        header: "",
        cell: (info) => (
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

  // Use custom hook to wrap useReactTable with stable references
  // This avoids issues with React Compiler and TanStack Table's non-memoizable API
  const table = useStableReactTable(data, columns, sorting, setSorting);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border/40 bg-background/95 shadow-sm p-2">
      <Table className="w-full text-sm text-foreground bg-background/95">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
