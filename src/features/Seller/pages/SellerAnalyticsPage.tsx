import {
  Briefcase,
  ChartBar,
  CheckCircle,
  Clock,
  Heart,
  ShoppingBagOpen,
  Star,
  TrendDown,
  TrendUp,
  Wallet,
  XCircle,
} from "@phosphor-icons/react"
import { useApiQuery } from "@/services/useApiQuery"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardAccent, getStatusTextColor } from "@/lib/colorStyles"

interface TopService {
  id: number
  title: string
  booking_count: number
  completed_bookings: number
  completed_earnings: number
  average_rating: number
  saved_count: number
  is_active: boolean
  status: string
}

interface AnalyticsData {
  earnings: {
    completed_total: number
    this_month: number
  }
  reviews: {
    total: number
    average_rating: number
    five_star: number
    four_star: number
    three_star: number
    two_star: number
    one_star: number
  }
  booking_status_counts: {
    total: number
    pending: number
    accepted: number
    in_progress: number
    completed: number
    rejected: number
    cancelled: number
  }
  performance: {
    completion_rate: number
    rejection_rate: number
    cancellation_rate: number
  }
  services: {
    total: number
    active: number
    inactive: number
    saved_by_buyers: number
    top_services: TopService[]
  }
}

const formatMmk = (value = 0) => `${Number(value).toLocaleString()} MMK`

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <Skeleton className="h-6 w-6 rounded-full" />
    <Skeleton className="mt-4 h-8 w-24" />
    <Skeleton className="mt-2 h-3 w-28" />
  </div>
)

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-8 text-center">
    <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <ChartBar size={24} weight="duotone" />
    </div>
    <p className="mt-3 text-sm font-medium text-foreground">No data yet</p>
    <p className="mt-1 text-xs text-muted-foreground">{text}</p>
  </div>
)

const SellerAnalyticsPage = () => {
  const { data, isLoading, isError } = useApiQuery<never, AnalyticsData>({
    endpoint: "/seller/analytics",
    queryKey: ["/seller/analytics"],
  })

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <ChartBar className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load analytics</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching your analytics data.</p>
          </div>
        </div>
      </div>
    )
  }

  const bookings = data?.booking_status_counts
  const reviews = data?.reviews
  const performance = data?.performance
  const services = data?.services
  const topServices = services?.top_services ?? []
  const reviewBreakdown = [
    { label: "5 star", value: reviews?.five_star ?? 0 },
    { label: "4 star", value: reviews?.four_star ?? 0 },
    { label: "3 star", value: reviews?.three_star ?? 0 },
    { label: "2 star", value: reviews?.two_star ?? 0 },
    { label: "1 star", value: reviews?.one_star ?? 0 },
  ]
  const maxReviewCount = Math.max(1, ...reviewBreakdown.map((item) => item.value))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your earnings, bookings, services, and review performance.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <StatCardSkeleton key={item} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Earnings</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatMmk(data?.earnings.completed_total)}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Wallet size={24} weight="duotone" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{formatMmk(data?.earnings.this_month)} this month</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bookings</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{bookings?.total ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <ShoppingBagOpen size={24} weight="duotone" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock size={13} weight="bold" />
                {bookings?.pending ?? 0} Pending
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={13} weight="fill" />
                {bookings?.completed ?? 0} Done
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg. Rating</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{(reviews?.average_rating ?? 0).toFixed(1)}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Star size={24} weight="duotone" />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{reviews?.total ?? 0} total reviews</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Services</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{services?.total ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Briefcase size={24} weight="duotone" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{services?.active ?? 0} Active</span>
              <span>{services?.inactive ?? 0} Inactive</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">Top Services</h2>
            <p className="text-sm text-muted-foreground mt-1">Ranked by booking and earning activity.</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="rounded-xl border border-border bg-background p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-3 h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : topServices.length === 0 ? (
            <EmptyState text="Service performance will appear here." />
          ) : (
            <div className="space-y-2">
              {topServices.map((service) => (
                <div key={service.id} className="rounded-xl border border-border bg-background p-4 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{service.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{service.booking_count} bookings</span>
                        <span>{service.completed_bookings} completed</span>
                        <span className="flex items-center gap-1">
                          <Heart size={13} weight="bold" />
                          {service.saved_count}
                        </span>
                        <span className={getStatusTextColor(service.status || (service.is_active ? "active" : "inactive"))}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-foreground">{formatMmk(service.completed_earnings)}</p>
                      <p className="mt-1 flex items-center justify-end gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Star size={12} weight="fill" />
                        {service.average_rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground">Performance</h2>
              <p className="text-sm text-muted-foreground mt-1">Booking outcome rates.</p>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Completion", value: performance?.completion_rate ?? 0, icon: TrendUp, color: "bg-emerald-500" },
                  { label: "Rejection", value: performance?.rejection_rate ?? 0, icon: TrendDown, color: "bg-rose-500" },
                  { label: "Cancellation", value: performance?.cancellation_rate ?? 0, icon: XCircle, color: "bg-amber-500" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <Icon size={16} weight="bold" />
                          {item.label}
                        </span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-foreground">Review Breakdown</h2>
              <p className="text-sm text-muted-foreground mt-1">Ratings from buyers.</p>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {reviewBreakdown.map((item) => (
                  <div key={item.label} className="grid grid-cols-[56px_1fr_24px] items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${(item.value / maxReviewCount) * 100}%` }} />
                    </div>
                    <span className="text-right font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Booking Status</h2>
          <p className="text-sm text-muted-foreground mt-1">Current distribution of all seller bookings.</p>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Pending", value: bookings?.pending ?? 0 },
              { label: "Accepted", value: bookings?.accepted ?? 0 },
              { label: "In Progress", value: bookings?.in_progress ?? 0 },
              { label: "Completed", value: bookings?.completed ?? 0 },
              { label: "Rejected", value: bookings?.rejected ?? 0 },
              { label: "Cancelled", value: bookings?.cancelled ?? 0 },
              { label: "Saved by Buyers", value: services?.saved_by_buyers ?? 0 },
              { label: "Total Bookings", value: bookings?.total ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-xl font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerAnalyticsPage
