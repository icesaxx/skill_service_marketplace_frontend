import { useEffect } from "react"
import { X, Eye, Envelope, Phone, BuildingOffice, Briefcase, MapPin, CalendarBlank, Note } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useApiQuery } from "@/services/useApiQuery"

type User = {
  id: number
  name: string
  email: string
  role: string
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

type ViewUserModalProps = {
  userId: number | null
  open: boolean
  onClose: () => void
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
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

const DetailRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0">
    <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <div className="text-right text-sm text-foreground">{children}</div>
  </div>
)

const ViewUserModal = ({ userId, open, onClose }: ViewUserModalProps) => {
  const { data: user, isLoading } = useApiQuery<unknown, User>(
    {
      endpoint: userId ? `/admin/users/show/${userId}` : "",
      queryKey: ["user", userId],
      enabled: !!userId && open,
    },
  )

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col",
          "rounded-xl border border-border bg-card shadow-xl",
          "mx-4",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="size-5 text-primary" weight="bold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                User Details
              </h2>
              <p className="text-xs text-muted-foreground">
                #{userId} &middot; {isLoading ? "Loading..." : user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading user details...
                </p>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-5">
              {/* Avatar & Name */}
              <div className="flex flex-col items-center gap-3 py-2">
                {user.avatar ? (
                  <img
                    src={`${(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "").replace(/\/+$/, "")}/storage/${user.avatar.replace(/^\/+/, "")}`}
                    alt={user.name}
                    className="size-20 shrink-0 rounded-full object-cover ring-4 ring-border"
                  />
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-4 ring-border">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground">
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center justify-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize",
                    getRoleBadge(user.role),
                  )}
                >
                  {user.role}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize",
                    getStatusVariant(user.status),
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-1.5 rounded-full",
                      user.status.toLowerCase() === "active" && "bg-emerald-500",
                      user.status.toLowerCase() === "inactive" && "bg-amber-500",
                      user.status.toLowerCase() === "suspended" && "bg-rose-500",
                    )}
                  />
                  {user.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <DetailRow label="Email">
                  <span className="flex items-center gap-1.5">
                    <Envelope className="size-3.5 text-muted-foreground" weight="bold" />
                    {user.email}
                  </span>
                </DetailRow>

                <DetailRow label="Phone">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" weight="bold" />
                    {user.phone_number || "—"}
                  </span>
                </DetailRow>

                <DetailRow label="Company">
                  <span className="flex items-center gap-1.5">
                    <BuildingOffice className="size-3.5 text-muted-foreground" weight="bold" />
                    {user.company_name || "—"}
                  </span>
                </DetailRow>

                <DetailRow label="Position">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-muted-foreground" weight="bold" />
                    {user.position || "—"}
                  </span>
                </DetailRow>

                <DetailRow label="Address">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" weight="bold" />
                    {user.address || "—"}
                  </span>
                </DetailRow>

                <DetailRow label="Bio">
                  <span className="flex items-start gap-1.5">
                    <Note className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" weight="bold" />
                    <span className="text-right">{user.bio || "—"}</span>
                  </span>
                </DetailRow>

                <DetailRow label="Joined">
                  <span className="flex items-center gap-1.5">
                    <CalendarBlank className="size-3.5 text-muted-foreground" weight="bold" />
                    {formatDate(user.created_at)}
                  </span>
                </DetailRow>

                <DetailRow label="Last Updated">
                  <span className="flex items-center gap-1.5">
                    <CalendarBlank className="size-3.5 text-muted-foreground" weight="bold" />
                    {formatDate(user.updated_at)}
                  </span>
                </DetailRow>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Failed to load user details.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border px-6 py-3.5">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewUserModal