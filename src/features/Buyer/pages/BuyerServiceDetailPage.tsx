import { useEffect, useState, type FormEvent } from "react"
import { useParams, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { 
  ArrowLeft, 
  ChatCircleText, 
  Clock, 
  Star, 
  ShoppingBagOpen, 
  ShareNetwork,
  BookmarkSimple,
  SealCheck,
  UserCircle
} from "@phosphor-icons/react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { formatMmk } from "@/features/Buyer/data/buyerMockData"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { Skeleton } from "@/components/ui/skeleton"
import type { BuyerServiceDetailResponse } from "@/features/Buyer/types/serviceDetail"
import type { BuyerOrder } from "@/features/Buyer/types/order"
import { getSavedSellerIds, saveSellerId } from "@/features/Buyer/utils/savedSellers"
import { useAuthStore } from "@/stores/userStore"

interface ServiceBookingInfo {
  booking_id?: number | string
  service_id?: number | string
  status?: string
}

type BuyerServiceDetailWithBooking = BuyerServiceDetailResponse & {
  booking_id?: number | string
  booking_status?: string
  booking?: ServiceBookingInfo
}

interface BuyerServiceDetailQueryData {
  data?: BuyerServiceDetailWithBooking
  service?: BuyerServiceDetailWithBooking
  booking?: ServiceBookingInfo
  booking_id?: number | string
  status?: string
}

type BuyerServiceDetailData = BuyerServiceDetailWithBooking | BuyerServiceDetailQueryData

interface BuyerOrdersQueryData {
  data?: BuyerOrder[]
  orders?: BuyerOrder[]
}

type BuyerOrdersData = BuyerOrder[] | BuyerOrdersQueryData

interface BuyerReviewPayload {
  booking_id: string
  rating: string
  comment: string
}

interface BookServicePayload {
  service_id: number
  order_note?: string
}

interface SaveSellerPayload {
  seller_id: number
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const isServiceDetail = (value: unknown): value is BuyerServiceDetailWithBooking =>
  isObject(value) && "title" in value && "price" in value

const getBookingInfo = (value: unknown): ServiceBookingInfo | undefined => {
  if (!isObject(value)) return undefined

  const booking = value.booking
  if (isObject(booking) && "booking_id" in booking) {
    return booking
  }

  if ("booking_id" in value) {
    return {
      booking_id: value.booking_id as ServiceBookingInfo["booking_id"],
      service_id: value.service_id as ServiceBookingInfo["service_id"],
      status: (value.status ?? value.booking_status) as ServiceBookingInfo["status"],
    }
  }

  return undefined
}

const getOrdersList = (value: BuyerOrdersData | undefined): BuyerOrder[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  return value.orders ?? value.data ?? []
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isObject(error)) {
    const response = error.response
    if (isObject(response)) {
      const data = response.data
      if (isObject(data) && typeof data.message === "string") {
        return data.message
      }
    }

    if (typeof error.message === "string") {
      return error.message
    }
  }

  return fallback
}

const BuyerServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [rating, setRating] = useState("5")
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [orderNote, setOrderNote] = useState("")
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<ServiceBookingInfo | null>(null)
  const [savedSellerIds, setSavedSellerIds] = useState<string[]>(() => getSavedSellerIds(user?.id))
  const locationState = location.state as { bookingId?: number | string; booking_id?: number | string } | null
  const serviceQueryKey = [`/buyer/services/show/${id}`]
  const { data, isLoading, isError } = useApiQuery<never, BuyerServiceDetailData>({
    endpoint: `/buyer/services/show/${id}`,
    raw: true,
    queryKey: serviceQueryKey,
    enabled: !!id,
  })
  const { data: ordersData } = useApiQuery<never, BuyerOrdersData>({
    endpoint: "/buyer/my-orders",
    raw: true,
    queryKey: ["/buyer/my-orders"],
    enabled: !!id,
  })

  const reviewMutation = useApiMutation<BuyerReviewPayload, NoResponse>({
    onSuccess: (response) => {
      if (response.success === false || response.success === "false") {
        toast.error(response.message || "Failed to submit review")
        return
      }

      toast.success(response.message || "Review submitted successfully")
      setComment("")
      queryClient.invalidateQueries({ queryKey: serviceQueryKey })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Failed to submit review"))
    },
  })

  const dataRecord = isObject(data) ? data : undefined
  const service = isServiceDetail(data)
    ? data
    : isServiceDetail(dataRecord?.service)
      ? dataRecord.service
      : isServiceDetail(dataRecord?.data)
        ? dataRecord.data
        : undefined
  const sellerId = service?.seller?.id ?? service?.user_id
  const isSellerSaved = Boolean(service?.is_saved || (sellerId && savedSellerIds.includes(String(sellerId))))

  useEffect(() => {
    setSavedSellerIds(getSavedSellerIds(user?.id))
  }, [user?.id])

  const bookServiceMutation = useApiMutation<BookServicePayload, ServiceBookingInfo>({
    onSuccess: (response) => {
      const responseData = (response as { data?: ServiceBookingInfo }).data ?? response
      if (responseData && typeof responseData === "object" && "booking_id" in responseData) {
        setCreatedBooking(responseData)
      }
      toast.success(response.message || "Service booked successfully")
      setOrderNote("")
      setShowBookingModal(false)
      queryClient.invalidateQueries({ queryKey: serviceQueryKey })
      queryClient.invalidateQueries({ queryKey: ["/buyer/my-orders"] })
    },
    onError: () => {
      toast.error("Failed to book service")
    },
  })

  const saveSellerMutation = useApiMutation<SaveSellerPayload, NoResponse>({
    onSuccess: (response) => {
      if (sellerId) {
        setSavedSellerIds(saveSellerId(sellerId, user?.id))
      }
      toast.success(response.message || "Seller saved successfully")
      queryClient.invalidateQueries({ queryKey: serviceQueryKey })
      queryClient.invalidateQueries({ queryKey: ["/services"] })
      queryClient.invalidateQueries({ queryKey: ["/buyer/stats"] })
    },
    onError: () => {
      toast.error("Failed to save seller")
    },
  })

  const handleToggleSave = () => {
    if (!service || isSellerSaved) return

    if (!sellerId) {
      toast.error("Seller not found")
      return
    }

    saveSellerMutation.mutate({
      endpoint: "/buyer/save-seller",
      method: "POST",
      body: {
        seller_id: sellerId,
      },
    })
  }

  const responseBookingInfo =
    createdBooking ??
    getBookingInfo(service) ??
    getBookingInfo(dataRecord?.booking) ??
    getBookingInfo(dataRecord?.data) ??
    getBookingInfo(data)

  const existingOrder = getOrdersList(ordersData).find((order) => String(order.service_id) === String(id))

  const bookingId =
    createdBooking?.booking_id ??
    searchParams.get("booking_id") ??
    locationState?.bookingId ??
    locationState?.booking_id ??
    responseBookingInfo?.booking_id ??
    existingOrder?.id

  const bookingStatus =
    createdBooking?.status ??
    responseBookingInfo?.status ??
    existingOrder?.status

  const isAlreadyBooked = Boolean(bookingId)
  const bookingStatusLabel = bookingStatus ? bookingStatus.replace("-", " ") : "booked"

  const handleSubmitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedBookingId = bookingId ? String(bookingId).trim() : ""
    const trimmedComment = comment.trim()

    if (!normalizedBookingId) {
      toast.error("Booking not found for this review")
      return
    }

    if (!trimmedComment) {
      toast.error("Please write a review comment")
      return
    }

    reviewMutation.mutate({
      endpoint: "/buyer/reviews",
      method: "POST",
      body: {
        booking_id: normalizedBookingId,
        rating,
        comment: trimmedComment,
      },
    })
  }

  const handleBookService = () => {
    if (!service) return

    const trimmedOrderNote = orderNote.trim()

    bookServiceMutation.mutate({
      endpoint: "/buyer/book-service",
      method: "POST",
      body: {
        service_id: service.id,
        ...(trimmedOrderNote ? { order_note: trimmedOrderNote } : {}),
      },
    })
  }

  const handleMessageSeller = () => {
    if (!service) return

    const sellerId = service.seller?.id ?? service.user_id
    if (!sellerId) {
      toast.error("Seller not found")
      return
    }

    navigate("/buyer/messages", {
      state: {
        receiverId: sellerId,
        sellerName: service.seller?.name ?? `Seller #${sellerId}`,
        serviceTitle: service.title,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-10 w-32" />
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <Star size={32} className="text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Service not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">The service you're looking for doesn't exist or has been removed.</p>
          </div>
          <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
            <Link to="/buyer/services">Browse Services</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link to="/buyer/dashboard" className="text-muted-foreground hover:text-emerald-600">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/buyer/services" className="text-muted-foreground hover:text-emerald-600">Services</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{service.title}</span>
        </nav>

        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 rounded-xl">
          <Link to="/buyer/services">
            <ArrowLeft size={18} />
            Back to services
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Hero Image */}
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              {service.image_url ? (
                <>
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                        {service.category?.name ?? "Service"}
                      </span>
                      {isSellerSaved && (
                        <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-80 w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center">
                    <UserCircle size={64} className="mx-auto text-muted-foreground/50" weight="duotone" />
                    <p className="mt-2 text-sm text-muted-foreground">No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Service Info Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{service.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-600 dark:text-amber-300">
                      <Star size={16} weight="fill" />
                      {service.average_rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {service.total_reviews} {service.total_reviews === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <ShareNetwork size={18} weight="duotone" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl"
                    onClick={handleToggleSave}
                    disabled={saveSellerMutation.isPending || isSellerSaved}
                  >
                    <BookmarkSimple 
                      size={18} 
                      weight={isSellerSaved ? "fill" : "duotone"} 
                      className={isSellerSaved ? "text-emerald-600" : ""}
                    />
                  </Button>
                </div>
              </div>

              <p className="mt-4 leading-relaxed text-muted-foreground">{service.description}</p>

              {service.tags && service.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-400 hover:text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">Customer Reviews</h2>
              
              {/* Review Form */}
              <form className="mt-4 rounded-xl border border-border bg-background p-5" onSubmit={handleSubmitReview}>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-foreground">Your Rating</span>
                    <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Review rating">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const activeRating = hoverRating ?? Number(rating)
                        const isActive = value <= activeRating
                        return (
                          <button
                            key={value}
                            type="button"
                            className="rounded-lg p-1 text-amber-500 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            onClick={() => setRating(String(value))}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(null)}
                            aria-label={`${value} star${value > 1 ? "s" : ""}`}
                            aria-checked={Number(rating) === value}
                            role="radio"
                          >
                            <Star size={24} weight={isActive ? "fill" : "regular"} />
                          </button>
                        )
                      })}
                      <span className="ml-2 text-sm font-semibold text-foreground">{rating}.0</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-foreground">Your Review</span>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="mt-2 min-h-24 w-full rounded-lg border border-input bg-card px-4 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Share your experience with this service..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={reviewMutation.isPending} 
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Star size={16} weight="bold" />
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>

              {/* Existing Reviews */}
              {(service.reviews?.length ?? 0) === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                  <Star size={40} className="mx-auto text-muted-foreground/50" weight="duotone" />
                  <p className="mt-2 text-sm font-medium text-foreground">No reviews yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Be the first to review this service</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {(service.reviews ?? []).map((review) => (
                    <div key={review.id} className="rounded-xl border border-border bg-background p-5 transition-colors hover:border-emerald-200">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                            {review.buyer?.avatar_url ? (
                              <img src={review.buyer.avatar_url} alt={review.buyer.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <UserCircle size={18} className="text-emerald-600" weight="duotone" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {review.buyer?.name ?? review.buyer_name ?? `Buyer #${review.buyer_id}`}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                          <Star size={12} weight="fill" />
                          {review.rating}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Booking Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatMmk(Number(service.price))}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock size={14} weight="bold" />
                    {service.estimated_days}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleMessageSeller}>
                    <ChatCircleText size={17} weight="duotone" />
                    Message
                  </Button>
                  {isAlreadyBooked ? (
                    <Button type="button" className="flex-1 rounded-xl bg-muted text-muted-foreground hover:bg-muted" disabled>
                      <SealCheck size={17} weight="fill" />
                      Already Booked
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setShowBookingModal(true)}
                    >
                      <ShoppingBagOpen size={17} weight="bold" />
                      Book Now
                    </Button>
                  )}
                </div>

                {isAlreadyBooked && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
                    <div className="flex items-start gap-3">
                      <SealCheck size={18} weight="fill" className="mt-0.5 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-200">You already booked this service</p>
                        <p className="mt-1 text-xs capitalize text-emerald-700 dark:text-emerald-300">
                          Booking #{bookingId} · {bookingStatusLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <SealCheck size={14} weight="fill" className="text-emerald-600" />
                    Verified Seller
                  </span>
                  <span>{service.total_reviews} reviews</span>
                </div>
              </div>
            </div>

            {/* Seller Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">About the Seller</h3>
              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  {service.seller?.avatar_url ? (
                    <img src={service.seller.avatar_url} alt={service.seller.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <UserCircle size={24} weight="duotone" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{service.seller?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{service.seller?.email ?? ""}</p>
                  {service.seller?.bio && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">{service.seller.bio}</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={saveSellerMutation.isPending || isSellerSaved}
                onClick={handleToggleSave}
                className={`mt-4 w-full rounded-xl ${isSellerSaved ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300" : ""}`}
              >
                <BookmarkSimple size={16} weight={isSellerSaved ? "fill" : "duotone"} />
                {saveSellerMutation.isPending ? "Saving..." : isSellerSaved ? "Saved Seller" : "Save Seller"}
              </Button>
            </div>

            {/* Service Details */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Service Details</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{service.category?.name ?? "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">{service.estimated_days}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Star size={14} weight="fill" className="text-amber-500" />
                    {service.average_rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium text-foreground">{service.total_reviews}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold text-foreground">Book Service</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You're booking: <span className="font-semibold text-foreground">{service.title}</span>
            </p>
            
            <div className="mt-4 space-y-4">
              <div>
                <span className="text-sm font-medium text-foreground">Order Note (Optional)</span>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="mt-2 min-h-24 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Add any special requirements or notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setShowBookingModal(false)
                    setOrderNote("")
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleBookService}
                  disabled={bookServiceMutation.isPending}
                >
                  {bookServiceMutation.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerServiceDetailPage
