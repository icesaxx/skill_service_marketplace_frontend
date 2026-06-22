import { useEffect } from "react"
import { X, Star, Clock, Wallet, Tag, CalendarBlank, Eye } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useApiQuery } from "@/services/useApiQuery"

type Service = {
  no: number
  id: number
  title: string
  description: string
  price: string
  estimated_days: string
  image: string | null
  average_rating: number
  total_reviews: number
  category: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

type ViewServiceModalProps = {
  serviceId: number | null
  open: boolean
  onClose: () => void
}

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
    month: "long",
    day: "numeric",
  })
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

const ViewServiceModal = ({ serviceId, open, onClose }: ViewServiceModalProps) => {
  const { data: service, isLoading } = useApiQuery<unknown, Service>(
    {
      endpoint: serviceId ? `/admin/services/show/${serviceId}` : "",
      queryKey: ["service", serviceId],
      enabled: !!serviceId && open,
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
                Service Details
              </h2>
              <p className="text-xs text-muted-foreground">
                #{serviceId} &middot; {isLoading ? "Loading..." : service?.title}
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
                  Loading service...
                </p>
              </div>
            </div>
          ) : service ? (
            <div className="space-y-5">
              {/* Image */}
              {service.image ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={`${(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "").replace(/\/+$/, "")}/storage/${service.image.replace(/^\/+/, "")}`}
                    alt={service.title}
                    className="h-56 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                      {service.title.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs">No image available</p>
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {service.description || "No description provided."}
                </p>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <DetailRow label="Category">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:border-blue-800 dark:bg-blue-400/10 dark:text-blue-400">
                    <Tag className="size-3" weight="bold" />
                    {service.category.name}
                  </span>
                </DetailRow>

                <DetailRow label="Price">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Wallet
                      className="size-3.5 text-muted-foreground"
                      weight="bold"
                    />
                    {formatPrice(service.price)}
                  </span>
                </DetailRow>

                <DetailRow label="Duration">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" weight="bold" />
                    {service.estimated_days}
                  </span>
                </DetailRow>

                <DetailRow label="Rating">
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
                    <span className="font-medium text-foreground">
                      {service.average_rating > 0
                        ? service.average_rating.toFixed(1)
                        : "No ratings yet"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({service.total_reviews} review
                      {service.total_reviews !== 1 ? "s" : ""})
                    </span>
                  </div>
                </DetailRow>

                <DetailRow label="Created">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarBlank className="size-3.5" weight="bold" />
                    {formatDate(service.created_at)}
                  </span>
                </DetailRow>

                <DetailRow label="Last Updated">
                  <span className="text-muted-foreground">
                    {formatDate(service.updated_at)}
                  </span>
                </DetailRow>
              </div>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Failed to load service details.
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

export default ViewServiceModal