import {
  Calendar,
  CheckCircle,
  ClipboardText,
  TrendUp,
  Wallet,
} from "@phosphor-icons/react"
import { useApiQuery } from "@/services/useApiQuery"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardAccent, getStatusTextColor } from "@/lib/colorStyles"

interface EarningsData {
  summary: {
    total_earnings: number
    this_month_earnings: number
    completed_orders: number
    average_order_value: number
  }
  by_service: {
    service_id: number
    title: string
    completed_orders: number
    total_earnings: number
  }[]
  orders: {
    booking_id: number
    amount: number
    status: "completed" | string
    completed_at: string
    buyer: {
      id: number
      name: string
      email: string
    }
    service: {
      id: number
      title: string
      price: string
    }
  }[]
}

const formatMmk = (value = 0) => `${Number(value).toLocaleString()} MMK`

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <Skeleton className="h-6 w-6 rounded-full" />
    <Skeleton className="mt-4 h-8 w-24" />
    <Skeleton className="mt-2 h-3 w-28" />
  </div>
)

const SellerEarningsPage = () => {
  const { data, isLoading, isError } = useApiQuery<never, EarningsData>({
    endpoint: "/seller/earnings",
    queryKey: ["/seller/earnings"],
  })

  const byService = data?.by_service ?? []
  const orders = data?.orders ?? []

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <Wallet className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load earnings</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching your earnings data.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">Track completed order revenue and service earnings.</p>
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
                <p className="mt-2 text-2xl font-bold text-foreground">{formatMmk(data?.summary.total_earnings)}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Wallet size={24} weight="duotone" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">This Month</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatMmk(data?.summary.this_month_earnings)}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Calendar size={24} weight="duotone" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed Orders</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{data?.summary.completed_orders ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <CheckCircle size={24} weight="duotone" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Average Order</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{formatMmk(data?.summary.average_order_value)}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <TrendUp size={24} weight="duotone" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">By Service</h2>
            <p className="text-sm text-muted-foreground mt-1">Completed earnings grouped by service.</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : byService.length === 0 ? (
            <div className="rounded-xl border border-border bg-background p-8 text-center">
              <p className="text-sm font-medium text-foreground">No service earnings yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Completed orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {byService.map((service) => (
                <div key={service.service_id} className="rounded-xl border border-border bg-background p-4">
                  <p className="truncate text-sm font-semibold text-foreground">{service.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{service.completed_orders} completed</span>
                    <span className="font-bold text-foreground">{formatMmk(service.total_earnings)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">Completed Orders</h2>
            <p className="text-sm text-muted-foreground mt-1">Recent completed booking payments.</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ClipboardText size={24} weight="duotone" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">No completed orders yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Completed order earnings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.booking_id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{order.service.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Booking #{order.booking_id} by {order.buyer.name} • {new Date(order.completed_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{order.buyer.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatMmk(order.amount)}</p>
                    <p className={`mt-1 text-xs capitalize ${getStatusTextColor(order.status)}`}>{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerEarningsPage
