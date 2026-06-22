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
import { MagnifyingGlass, CaretUp, CaretDown, CaretLeft, CaretRight, PencilSimple, Trash, CheckCircle, Circle, Prohibit, Eye } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import EditUserModal from "@/features/Admin/components/EditUserModal"
import ViewUserModal from "@/features/Admin/components/ViewUserModal"

type User = {
  id: number
  name: string
  email: string
  role: "buyer" | "seller" | "admin"
  status: string
  phone_number: string | null
  company_name: string | null
  position: string | null
  address: string | null
  avatar: string | null
  cover_photo: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

type UpdateUserPayload = {
  user_id: number
  name: string
  role: string
  status: string
}

type DeleteUserPayload = {
  user_id: number
}

const columnHelper = createColumnHelper<User>()

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    case "inactive":
      return "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    case "suspended":
      return "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 border-rose-200 dark:border-rose-800"
    default:
      return "bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  }
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400 border-violet-200 dark:border-violet-800"
    case "seller":
      return "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border-blue-200 dark:border-blue-800"
    case "buyer":
      return "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800"
    default:
      return "bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const UserListPage = () => {
  const queryClient = useQueryClient()

  const { data: Users, isLoading } = useApiQuery<unknown, User[]>({
    endpoint: "/admin/users",
    queryKey: ["users"],
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewUserId, setViewUserId] = useState<number | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)

  const deleteUser = useApiMutation<DeleteUserPayload, NoResponse>({
    onSuccess: () => {
      toast.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: () => {
      toast.error("Failed to delete user")
    },
  })

  const updateUser = useApiMutation<UpdateUserPayload, NoResponse>({
    onSuccess: () => {
      toast.success("User updated successfully")
      setEditModalOpen(false)
      setEditUser(null)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: () => {
      toast.error("Failed to update user")
    },
  })

  const users: User[] = useMemo(() => {
    if (!Users) return []
    return Array.isArray(Users) ? Users : []
  }, [Users])

  const handleView = (user: User) => {
    setViewUserId(user.id)
    setViewModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditUser(user)
    setEditModalOpen(true)
  }

  const handleSaveEdit = (user_id: number, name: string, role: string, status: string) => {
    updateUser.mutate({
      endpoint: "/admin/users/update",
      method: "PUT",
      body: { user_id, name, role, status },
    })
  }

  const handleDelete = (user: User) => {
    deleteUser.mutate({
      endpoint: "/admin/users/delete",
      method: "POST",
      body: { user_id: user.id },
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
        header: "User",
        cell: (info) => {
          const user = info.row.original
          const baseURL = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "")
          const avatarUrl = user.avatar
            ? `${baseURL.replace(/\/+$/, "")}/storage/${user.avatar.replace(/^\/+/, "")}`
            : null
          return (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="size-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
              getRoleBadge(info.getValue()),
            )}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue().toLowerCase()
          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                  getStatusVariant(status),
                )}
              >
                {status === "active" && <CheckCircle className="size-3.5" weight="fill" />}
                {status === "inactive" && <Circle className="size-3.5" weight="fill" />}
                {status === "suspended" && <Prohibit className="size-3.5" weight="bold" />}
                {status}
              </span>
            </div>
          )
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Joined",
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
          const user = info.row.original
          const isDeleting = deleteUser.isPending
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleView(user)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="View user"
              >
                <Eye className="size-4" weight="bold" />
              </button>
              <button
                onClick={() => handleEdit(user)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Edit user"
              >
                <PencilSimple className="size-4" weight="bold" />
              </button>
              <button
                onClick={() => handleDelete(user)}
                disabled={isDeleting}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                title="Delete user"
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
    [deleteUser.isPending],
  )

  const table = useReactTable({
    data: users,
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
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage all registered users on the platform.
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
            placeholder="Search users by name or email..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} user
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
                        No users found
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
      {/* Edit User Modal */}
      <EditUserModal
        user={editUser}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditUser(null)
        }}
        onSave={handleSaveEdit}
        isSaving={updateUser.isPending}
      />

      {/* View User Modal */}
      <ViewUserModal
        userId={viewUserId}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setViewUserId(null)
        }}
      />
    </div>
  )
}

export default UserListPage
