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
  PencilSimple,
  Trash,
  Plus,
  Tag,
  CalendarBlank,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import CategoryModal from "@/features/Admin/components/CategoryModal"

type Category = {
  id: number
  name: string
  slug: string
  image: string | null
  created_at: string
  updated_at: string
}

const columnHelper = createColumnHelper<Category>()

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const CategoriesPage = () => {
  const queryClient = useQueryClient()

  const { data: Categories, isLoading } = useApiQuery<unknown, Category[]>({
    endpoint: "/categories",
    queryKey: ["categories"],
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const createCategory = useApiMutation<{ name: string }, NoResponse>({
    onSuccess: () => {
      toast.success("Category created successfully")
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: () => {
      toast.error("Failed to create category")
    },
  })

  const updateCategory = useApiMutation<
    { category_id: number; name: string },
    NoResponse
  >({
    onSuccess: () => {
      toast.success("Category updated successfully")
      setModalOpen(false)
      setSelectedCategory(null)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: () => {
      toast.error("Failed to update category")
    },
  })

  const deleteCategory = useApiMutation<{ category_id: number }, NoResponse>({
    onSuccess: () => {
      toast.success("Category deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: () => {
      toast.error("Failed to delete category")
    },
  })

  const categories: Category[] = useMemo(() => {
    if (!Categories) return []
    return Array.isArray(Categories) ? Categories : []
  }, [Categories])

  const handleCreate = () => {
    setModalMode("create")
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setModalMode("edit")
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const handleSave = (categoryId?: number, name?: string) => {
    const trimmedName = name?.trim()
    if (!trimmedName) return

    if (modalMode === "create") {
      createCategory.mutate({
        endpoint: "/admin/categories/create",
        method: "POST",
        body: { name: trimmedName },
      })
    } else if (categoryId) {
      updateCategory.mutate({
        endpoint: "/admin/categories/update",
        method: "POST",
        body: { category_id: categoryId, name: trimmedName },
      })
    }
  }

  const handleDelete = (category: Category) => {
    deleteCategory.mutate({
      endpoint: "/admin/categories/delete",
      method: "POST",
      body: { category_id: category.id },
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
      columnHelper.accessor("name", {
        header: "Category Name",
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="size-4 text-primary" weight="bold" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("slug", {
        header: "Slug",
        cell: (info) => (
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarBlank className="size-3.5" weight="bold" />
            {formatDate(info.getValue())}
          </div>
        ),
      }),
      columnHelper.accessor("updated_at", {
        header: "Last Updated",
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
          const category = info.row.original
          const isDeleting = deleteCategory.isPending
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(category)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Edit category"
              >
                <PencilSimple className="size-4" weight="bold" />
              </button>
              <button
                onClick={() => handleDelete(category)}
                disabled={isDeleting}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Delete category"
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
    [deleteCategory.isPending],
  )

  const table = useReactTable({
    data: categories,
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
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Categories
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage service categories for the platform.
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
            placeholder="Search categories..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" weight="bold" />
          Create Category
        </button>
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
                        No categories found
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

      {/* Category Modal */}
      <CategoryModal
        category={selectedCategory}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedCategory(null)
        }}
        onSave={handleSave}
        isSaving={
          modalMode === "create"
            ? createCategory.isPending
            : updateCategory.isPending
        }
        mode={modalMode}
      />
    </div>
  )
}

export default CategoriesPage