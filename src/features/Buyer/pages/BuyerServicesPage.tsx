import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChatCircleText, Check, Clock, Funnel, MagnifyingGlass, ShoppingBagOpen, Star, Eye } from "@phosphor-icons/react"
import { formatMmk } from "@/features/Buyer/data/buyerMockData"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import type { BuyerServiceResponse } from "@/features/Buyer/types/service"
import type { BuyerOrder } from "@/features/Buyer/types/order"

interface BuyerServicesQueryData {
  services: BuyerServiceResponse[]
}

interface BuyerOrdersQueryData {
  data?: BuyerOrder[]
  orders?: BuyerOrder[]
}

type BuyerServicesData = BuyerServiceResponse[] | BuyerServicesQueryData
type BuyerOrdersData = BuyerOrder[] | BuyerOrdersQueryData

const BuyerServicesPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [bookingServiceId, setBookingServiceId] = useState<number | null>(null)
  const { data, isLoading, isError } = useApiQuery<never, BuyerServicesData>({
    endpoint: "/services",
    raw: true,
    queryKey: ["/services"],
  })

  const { data: ordersData } = useApiQuery<never, BuyerOrdersData>({
    endpoint: "/buyer/my-orders",
    raw: true,
    queryKey: ["/buyer/my-orders"],
  })

  const bookService = useApiMutation<{ service_id: number }, unknown>({
    onSuccess: () => {
      toast.success("Service booked successfully!")
      setBookingServiceId(null)
      queryClient.invalidateQueries({ queryKey: ["/services"] })
      queryClient.invalidateQueries({ queryKey: ["/buyer/my-orders"] })
    },
    onError: () => {
      toast.error("Failed to book service. Please try again.")
      setBookingServiceId(null)
    },
  })

  const servicesList = useMemo(() => {
    if (!data) return []
    return Array.isArray(data) ? data : data.services
  }, [data])

  const bookedServiceIds = useMemo(() => {
    if (!ordersData) return new Set<number>()
    const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders ?? ordersData.data ?? []
    return new Set(orders.map((order) => order.service_id))
  }, [ordersData])

  const categoryOptions = useMemo(() => {
    const categoryIds = Array.from(new Set(servicesList.map((service) => service.category_id)))
    return [
      { label: "All", value: "all" },
      ...categoryIds.map((categoryId) => ({
        label: `Category ${categoryId}`,
        value: String(categoryId),
      })),
    ]
  }, [servicesList])

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return servicesList.filter((service) => {
      const matchesCategory = category === "all" || String(service.category_id) === category
      const matchesQuery =
        !normalizedQuery ||
        [service.title, service.description, ...(service.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      return matchesCategory && matchesQuery
    })
  }, [category, query, servicesList])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Services</h1>
            <p className="mt-1 text-sm text-muted-foreground">Search trusted sellers and compare packages before booking.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3">
            <Funnel size={17} className="text-muted-foreground" />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 w-full bg-transparent text-sm outline-none"
            >
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2">
          <MagnifyingGlass size={19} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search by service, seller, or skill"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <Skeleton className="h-44 w-full" />
                <div className="space-y-4 p-5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-2 h-3 w-16" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
              </article>
            ))
          : isError
            ? (
                <div className="col-span-full rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm text-red-500">Failed to load services</p>
                </div>
              )
            : filteredServices.length === 0
              ? (
                  <div className="col-span-full rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">No services found.</p>
                  </div>
                )
              : filteredServices.map((service) => {
                  const isBooked = bookedServiceIds.has(service.id)
                  const isCurrentlyBooking = bookingServiceId === service.id && bookService.isPending
                  
                  return (
                <article key={service.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                  {service.image_url ? (
                    <img src={service.image_url} alt={service.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Service</p>
                        <h2 className="mt-1 line-clamp-2 text-base font-bold text-foreground">{service.title}</h2>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                        <Star size={14} weight="fill" />
                        {service.average_rating}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(service.tags ?? []).map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">{formatMmk(Number(service.price))}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={13} weight="bold" />
                          {service.estimated_days}
                        </p>
                      </div>
                       <div className="flex gap-2">
                         <Button asChild type="button" variant="outline" size="icon-lg" className="rounded-xl" aria-label={`View service`}>
                           <Link to={`/buyer/services/${service.id}`}>
                             <Eye size={18} weight="duotone" />
                           </Link>
                         </Button>
                         <Button
                           type="button"
                           variant="outline"
                           size="icon-lg"
                           className="rounded-xl"
                           aria-label={`Message seller`}
                           onClick={() => {
                             navigate("/buyer/messages", {
                               state: {
                                 receiverId: service.user_id,
                                 sellerName: `Seller #${service.user_id}`,
                                 serviceTitle: service.title,
                               },
                             })
                           }}
                         >
                           <ChatCircleText size={18} weight="duotone" />
                         </Button>
                         <Button
                           type="button"
                           className={`rounded-xl ${
                             isBooked
                               ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                               : "bg-emerald-600 hover:bg-emerald-700"
                           }`}
                           onClick={() => {
                             if (!isBooked) {
                               setBookingServiceId(service.id)
                               bookService.mutate({
                                 endpoint: "/buyer/book-service",
                                 method: "POST",
                                 body: { service_id: service.id },
                               })
                             }
                           }}
                           disabled={isBooked || isCurrentlyBooking}
                         >
                           {isCurrentlyBooking ? (
                             <>
                               <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                               Booking...
                             </>
                           ) : isBooked ? (
                             <>
                               <Check size={17} weight="bold" />
                               Booked
                             </>
                           ) : (
                             <>
                               <ShoppingBagOpen size={17} weight="bold" />
                               Book
                             </>
                           )}
                         </Button>
                       </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {service.total_reviews} reviews
                    </p>
                  </div>
                </article>
                  )
                })}
      </section>
    </div>
  )
}

export default BuyerServicesPage
