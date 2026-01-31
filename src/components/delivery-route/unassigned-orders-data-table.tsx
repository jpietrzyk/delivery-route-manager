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
        id: "add",
        header: "",
        cell: (info) => (
          <button
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-primary text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            onClick={() => onAddOrder?.(info.row.original.id)}
            title="Add to delivery route"
          >
            Add
          </button>
        ),
        enableSorting: false,
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
    ],
    [onAddOrder],
  );

  // Use custom hook to wrap useReactTable with stable references
  // This avoids issues with React Compiler and TanStack Table's non-memoizable API
  const table = useStableReactTable(data, columns, sorting, setSorting);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table className="w-full text-sm text-gray-700">
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
                  isHighlighted ? "bg-accent/30 border-accent" : undefined
                }
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
