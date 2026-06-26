import { Link } from "react-router-dom"
import {
  ArrowRight,
  ChatCircleText,
  Clock,
  MagnifyingGlass,
  ShoppingBagOpen,
  Star,
  Storefront,
} from "@phosphor-icons/react"
import { buyerOrders, formatMmk } from "@/features/Buyer/data/buyerMockData"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { Skeleton } from "@/components/ui/skeleton"
import type { BuyerStatsResponse } from "@/features/Buyer/types/buyerStats"
import type { BuyerServiceResponse } from "@/features/Buyer/types/service"
import { getSavedSellerIds } from "@/features/Buyer/utils/savedSellers"
import { useAuthStore } from "@/stores/userStore"
import { getStatusColor } from "@/lib/colorStyles"

interface BuyerServicesQueryData {
  services: BuyerServiceResponse[]
}

type BuyerServicesData = BuyerServiceResponse[] | BuyerServicesQueryData

const BuyerDashboardPage = () => {
  const { user } = useAuthStore()
  const { data: stats, isLoading, isError } = useApiQuery<never, BuyerStatsResponse>({
    endpoint: "/buyer/stats",
    queryKey: ["/buyer/stats"],
  })
  const {
    data: servicesData,
    isLoading: isServicesLoading,
    isError: isServicesError,
  } = useApiQuery<never, BuyerServicesData>({
    endpoint: "/services",
    raw: true,
    queryKey: ["/services"],
  })

  const servicesList = Array.isArray(servicesData) ? servicesData : servicesData?.services ?? []
  const recommendedServices = servicesList.slice(0, 3)
  const localSavedSellerCount = getSavedSellerIds(user?.id).length
  const savedSellerCount = Math.max(stats?.saved_sellers.total ?? 0, localSavedSellerCount)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_220px] md:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Buyer workspace
                </p>
                <h1 className="mt-3 max-w-2xl text-2xl font-bold text-foreground sm:text-3xl">
                  Find the right seller, book the service, and keep every order moving.
                </h1>
              </div>
              <div className="flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                <MagnifyingGlass size={20} className="text-muted-foreground" />
                <input
                  className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search web design, marketing, consulting..."
                />
                <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/buyer/services">Search</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Web Design", "Marketing", "Photography", "Business"].map((item) => (
                  <Link
                    key={item}
                    to="/buyer/services"
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-5">
              <Storefront size={28} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
              <p className="mt-4 text-sm font-semibold text-foreground">Want to sell your skills?</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Submit your seller request and start preparing your first service profile.
              </p>
              <Button asChild variant="outline" className="mt-5 w-full rounded-xl">
                <Link to="/buyer/become-seller">
                  Request Seller Access
                  <ArrowRight size={15} weight="bold" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {isLoading
            ? [0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="mt-4 h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              ))
            : isError
              ? (
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-sm text-red-500">Failed to load stats</p>
                  </div>
                )
              : [
                  { label: "Active Orders", value: stats?.bookings.active ?? 0, icon: ShoppingBagOpen },
                  { label: "Reviews to Review", value: stats?.reviews.available_to_review ?? 0, icon: ChatCircleText },
                  { label: "Saved Sellers", value: savedSellerCount, icon: Star },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
                      <Icon size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-300" />
                      <p className="mt-4 text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  )
                })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recommended Services</h2>
              <p className="text-sm text-muted-foreground">Curated options based on popular buyer activity.</p>
            </div>
            <Button asChild variant="ghost" className="rounded-xl">
              <Link to="/buyer/services">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {isServicesLoading
              ? [0, 1, 2].map((item) => (
                  <article key={item} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <Skeleton className="h-36 w-full" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                      <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </article>
                ))
              : isServicesError
                ? (
                    <div className="col-span-full rounded-2xl border border-border bg-card p-5">
                      <p className="text-sm text-red-500">Failed to load recommended services</p>
                    </div>
                  )
                : recommendedServices.length === 0
                  ? (
                      <div className="col-span-full rounded-2xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">No services available yet.</p>
                      </div>
                    )
                  : recommendedServices.map((service) => (
                      <article key={service.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.title} className="h-36 w-full object-cover" />
                        ) : (
                          <div className="flex h-36 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                            No image
                          </div>
                        )}
                        <div className="space-y-3 p-4">
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>Category {service.category_id}</span>
                            <span className="flex items-center gap-1 text-amber-500">
                              <Star size={14} weight="fill" />
                              {service.average_rating}
                            </span>
                          </div>
                          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-foreground">{service.title}</h3>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-bold text-foreground">{formatMmk(Number(service.price))}</p>
                            <Button asChild size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                              <Link to={`/buyer/services/${service.id}`}>Book</Link>
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Order Timeline</h2>
            <Clock size={20} weight="duotone" className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {buyerOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{order.service}</p>
                    <p className="text-xs text-muted-foreground">{order.seller}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold capitalize ${getStatusColor(order.status)}`}>
                    {order.status.replace("-", " ")}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Due {order.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BuyerDashboardPage
