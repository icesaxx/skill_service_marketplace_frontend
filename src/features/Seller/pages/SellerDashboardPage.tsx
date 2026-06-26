import { Link } from "react-router-dom"
import {
  ArrowRight,
  Briefcase,
  ClipboardText,
  Clock,
  Star,
  Wallet,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardAccent } from "@/lib/colorStyles"

interface SellerStats {
  services: {
    total: number
  }
  bookings: {
    total: number
    pending: number
    accepted: number
    in_progress: number
    completed: number
    rejected: number
    cancelled: number
  }
  reviews: {
    total: number
    average_rating: number
  }
  earnings: {
    completed_total: number
  }
}

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <Skeleton className="h-6 w-6 rounded-full" />
    <Skeleton className="mt-4 h-8 w-16" />
    <Skeleton className="mt-2 h-3 w-24" />
  </div>
)

const SellerDashboardPage = () => {
  const { data, isLoading, isError } = useApiQuery<never, SellerStats>({
    endpoint: "seller/dashboard",
    queryKey: ["/seller/dashboard"],
  })

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <Briefcase className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load dashboard</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching your stats.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-sky-500/5 to-background p-6 md:p-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
              Seller workspace
            </p>
            <h1 className="mt-3 max-w-2xl text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back! Manage your services and grow your business.
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track your orders, manage services, and monitor your earnings all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-500">
              <Link to="/seller/services">
                <Briefcase size={17} weight="bold" />
                Manage Services
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/seller/orders">
                <ClipboardText size={17} weight="bold" />
                View Orders
                <ArrowRight size={15} weight="bold" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Services Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Services</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{data?.services.total ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Briefcase size={24} weight="duotone" />
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{data?.bookings.total ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <ClipboardText size={24} weight="duotone" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock size={13} weight="bold" />
                {data?.bookings.pending ?? 0} Pending
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Star size={13} weight="fill" />
                {data?.bookings.completed ?? 0} Done
              </span>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Earnings</p>
                <p className="mt-2 text-2xl font-bold text-foreground">${data?.earnings.completed_total ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Wallet size={24} weight="duotone" />
              </div>
            </div>
          </div>

          {/* Reviews Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Avg. Rating</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{data?.reviews.average_rating ?? 0}</p>
              </div>
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong}`}>
                <Star size={24} weight="duotone" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{data?.reviews.total ?? 0} reviews</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Orders */}
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">Common tasks to manage your business.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/seller/services"
              className={`group rounded-2xl border border-border bg-card p-5 transition-all ${dashboardAccent.seller.borderHover}`}
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong} group-hover:scale-110 transition-transform`}>
                <Briefcase size={24} weight="duotone" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">Add New Service</h3>
              <p className="mt-1 text-xs text-muted-foreground">Create and publish a new service offering.</p>
            </Link>
            <Link
              to="/seller/orders"
              className={`group rounded-2xl border border-border bg-card p-5 transition-all ${dashboardAccent.seller.borderHover}`}
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong} group-hover:scale-110 transition-transform`}>
                <ClipboardText size={24} weight="duotone" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">View Orders</h3>
              <p className="mt-1 text-xs text-muted-foreground">Check and manage incoming orders.</p>
            </Link>
            <Link
              to="/seller/earnings"
              className={`group rounded-2xl border border-border bg-card p-5 transition-all ${dashboardAccent.seller.borderHover}`}
            >
              <div className={`flex size-12 items-center justify-center rounded-xl ${dashboardAccent.seller.softBg} ${dashboardAccent.seller.textStrong} group-hover:scale-110 transition-transform`}>
                <Wallet size={24} weight="duotone" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">Earnings</h3>
              <p className="mt-1 text-xs text-muted-foreground">Track your revenue and payouts.</p>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
            <ClipboardText size={20} weight="duotone" className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">No recent orders</p>
                  <p className="text-xs text-muted-foreground">Orders will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SellerDashboardPage
