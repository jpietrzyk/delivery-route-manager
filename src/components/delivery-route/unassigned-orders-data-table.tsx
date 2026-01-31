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
        cell: (info) => info.getValue(),
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
        cell: (info) => info.getValue(),
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
    <div className="w-full overflow-x-auto rounded-xl border border-border/60 bg-background/80 shadow-lg backdrop-blur-sm p-2">
      <Table className="w-full text-sm text-foreground bg-background/80">
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
                  className={
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : undefined
                  }
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
                  <TableCell key={cell.id}>
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
