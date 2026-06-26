import { useMemo, useState } from "react"
import { Star, UserCircle } from "@phosphor-icons/react"
import { useQuery } from "@tanstack/react-query"
import api from "@/provider/axios"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const SELLER_ID = 13

interface ReviewUser {
  id?: number | string
  name?: string
  email?: string
  avatar_url?: string | null
}

interface ReviewService {
  id?: number | string
  title?: string
}

interface SellerReview {
  id?: number | string
  booking_id?: number | string
  buyer_id?: number | string
  seller_id?: number | string
  rating?: number | string
  comment?: string
  buyer?: ReviewUser
  user?: ReviewUser
  service?: ReviewService
  service_title?: string
  created_at?: string
  updated_at?: string
}

interface SellerReviewsResponse {
  data?: SellerReview[] | { reviews?: SellerReview[] }
  reviews?: SellerReview[]
}

const getReviewsList = (value: SellerReview[] | SellerReviewsResponse | undefined) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (Array.isArray(value.reviews)) return value.reviews
  if (Array.isArray(value.data)) return value.data
  return value.data?.reviews ?? []
}

const formatDate = (value?: string) => {
  if (!value) return "Unknown date"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const normalizeRating = (rating: SellerReview["rating"]) => {
  const value = Number(rating ?? 0)
  return Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0
}

const BuyerReviewsPage = () => {
  const [ratingFilter, setRatingFilter] = useState("all")

  const { data, isLoading, isError } = useQuery<SellerReview[] | SellerReviewsResponse, Error>({
    queryKey: ["/seller/reviews", SELLER_ID],
    queryFn: async () => {
      const response = await api.post<SellerReview[] | SellerReviewsResponse>("/seller/reviews", {
        seller_id: SELLER_ID,
      })

      return response.data
    },
  })

  const reviews = useMemo(() => getReviewsList(data), [data])

  const stats = useMemo(() => {
    const total = reviews.length
    const average = total
      ? reviews.reduce((sum, review) => sum + normalizeRating(review.rating), 0) / total
      : 0
    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => Math.round(normalizeRating(review.rating)) === rating).length,
    }))

    return { total, average, distribution }
  }, [reviews])

  const filteredReviews = useMemo(() => {
    if (ratingFilter === "all") return reviews
    return reviews.filter((review) => Math.round(normalizeRating(review.rating)) === Number(ratingFilter))
  }, [ratingFilter, reviews])

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="mt-3 h-4 w-32" />
              <Skeleton className="mt-5 h-16 w-full" />
            </div>
          ))}
        </section>
        <aside className="space-y-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </aside>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">Read buyer feedback for this seller.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-red-500">Failed to load seller reviews.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">Buyer feedback and ratings for seller #{SELLER_ID}.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "5", "4", "3", "2", "1"].map((rating) => (
            <Button
              key={rating}
              type="button"
              variant={ratingFilter === rating ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setRatingFilter(rating)}
            >
              {rating === "all" ? "All Reviews" : `${rating} Star`}
            </Button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Star size={44} className="mx-auto text-muted-foreground/50" weight="duotone" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No reviews found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {ratingFilter === "all" ? "This seller does not have reviews yet." : `No ${ratingFilter}-star reviews yet.`}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const rating = normalizeRating(review.rating)
            const reviewer = review.buyer ?? review.user
            const reviewerName = reviewer?.name ?? `Buyer #${review.buyer_id ?? "Unknown"}`
            const serviceTitle = review.service?.title ?? review.service_title ?? "Service"

            return (
              <article key={review.id ?? `${review.buyer_id}-${review.created_at}`} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-emerald-200">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      {reviewer?.avatar_url ? (
                        <img src={reviewer.avatar_url} alt={reviewerName} className="size-11 rounded-full object-cover" />
                      ) : (
                        <UserCircle size={24} className="text-emerald-600" weight="duotone" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-bold text-foreground">{reviewerName}</h2>
                      <p className="truncate text-sm text-muted-foreground">{serviceTitle} · {formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-600 dark:text-amber-300">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={15} weight={index < Math.round(rating) ? "fill" : "regular"} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.comment || "No written comment."}</p>
              </article>
            )
          })
        )}
      </section>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-4xl font-bold text-foreground">{stats.average.toFixed(1)}</span>
            <span className="pb-1 text-sm text-muted-foreground">out of 5</span>
          </div>
          <div className="mt-3 flex gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={18} weight={index < Math.round(stats.average) ? "fill" : "regular"} />
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{stats.total} total reviews</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">Rating Breakdown</h2>
          <div className="mt-5 space-y-3">
            {stats.distribution.map((item) => {
              const percent = stats.total ? (item.count / stats.total) * 100 : 0

              return (
                <div key={item.rating} className="grid grid-cols-[52px_1fr_28px] items-center gap-3">
                  <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                    {item.rating}
                    <Star size={13} weight="fill" className="text-amber-500" />
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-right text-sm text-muted-foreground">{item.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default BuyerReviewsPage
