import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from "@tanstack/react-table"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import {
  MagnifyingGlass,
  CaretUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  Trash,
  Star,
  Clock,
  Wallet,
  Eye,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import ViewServiceModal from "@/features/Admin/components/ViewServiceModal"

type Category = {
  id: number
  name: string
}

type Service = {
  id: number
  title: string
  description: string
  price: string
  estimated_days: string
  image: string | null
  average_rating: number
  total_reviews: number
  category: Category
  created_at: string
  updated_at: string
}

const columnHelper = createColumnHelper<Service>()

const formatPrice = (price: string) => {
  const num = Number.parseFloat(price)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const ServicesPage = () => {
  const queryClient = useQueryClient()

  const { data: Services, isLoading } = useApiQuery<unknown, Service[]>({
    endpoint: "/admin/services",
    queryKey: ["services"],
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [viewServiceId, setViewServiceId] = useState<number | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const deleteService = useApiMutation<{ service_id: number }, NoResponse>({
    onSuccess: () => {
      toast.success("Service deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["services"] })
    },
    onError: () => {
      toast.error("Failed to delete service")
    },
  })

  const services: Service[] = useMemo(() => {
    if (!Services) return []
    return Array.isArray(Services) ? Services : []
  }, [Services])

  const handleView = (service: Service) => {
    setViewServiceId(service.id)
    setViewModalOpen(true)
  }

  const handleDelete = (service: Service) => {
    deleteService.mutate({
      endpoint: "/admin/services/delete",
      method: "POST",
      body: { service_id: service.id },
    })
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "rowNumber",
        header: "#",
        cell: (info) => (
          <span className="text-muted-foreground text-xs font-medium">
            {info.table.getState().pagination.pageIndex * info.table.getState().pagination.pageSize + info.row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Service",
        cell: (info) => {
          const service = info.row.original
          const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")
          const imageUrl = service.image
            ? `${baseURL.replace(/\/+$/, "")}/storage/${service.image.replace(/^\/+/, "")}`
            : null
          return (
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="size-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg text-primary">
                  {service.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 max-w-[280px]">
                <p className="truncate text-sm font-medium text-foreground">
                  {service.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-600 dark:border-blue-800 dark:bg-blue-400/10 dark:text-blue-400">
            {info.getValue().name}
          </span>
        ),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Wallet className="size-3.5 text-muted-foreground" weight="bold" />
            {formatPrice(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("estimated_days", {
        header: "Duration",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-3.5" weight="bold" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.display({
        id: "rating",
        header: "Rating",
        cell: (info) => {
          const service = info.row.original
          return (
            <div className="flex items-center gap-1.5">
              <Star
                className={cn(
                  "size-3.5",
                  service.average_rating > 0
                    ? "text-amber-400"
                    : "text-muted-foreground",
                )}
                weight={service.average_rating > 0 ? "fill" : "regular"}
              />
              <span className="text-sm font-medium text-foreground">
                {service.average_rating > 0
                  ? service.average_rating.toFixed(1)
                  : "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({service.total_reviews})
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const service = info.row.original
          const isDeleting = deleteService.isPending
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleView(service)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="View service"
              >
                <Eye className="size-4" weight="bold" />
              </button>
              <button
                onClick={() => handleDelete(service)}
                disabled={isDeleting}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Delete service"
              >
                {isDeleting ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                ) : (
                  <Trash className="size-4" weight="bold" />
                )}
              </button>
            </div>
          )
        },
      }),
    ],
    [deleteService.isPending],
  )

  const table = useReactTable({
    data: services,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Services
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage all services listed on the platform.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            weight="bold"
          />
          <input
            placeholder="Search services by title or category..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} service
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-1.5",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none hover:text-foreground",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: (
                              <CaretUp
                                className="size-3.5 text-primary"
                                weight="bold"
                              />
                            ),
                            desc: (
                              <CaretDown
                                className="size-3.5 text-primary"
                                weight="bold"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="whitespace-nowrap px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        No services found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search query.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length > 0 ? (
              <>
                Showing{" "}
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                {" – "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{" "}
                of {table.getFilteredRowModel().rows.length}
              </>
            ) : (
              "0 results"
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CaretLeft className="size-4" weight="bold" />
            </button>
            {Array.from({ length: Math.max(table.getPageCount(), 1) }, (_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  i === table.getState().pagination.pageIndex
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CaretRight className="size-4" weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* View Service Modal */}
      <ViewServiceModal
        serviceId={viewServiceId}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setViewServiceId(null)
        }}
      />
    </div>
  )
}

export default ServicesPage
