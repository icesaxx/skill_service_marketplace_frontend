import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ChatCircleText,
  Eye,
  EyeSlash,
  PencilSimple,
  Star,
  Tag,
  Trash,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getStatusColor, getStatusTextColor } from "@/lib/colorStyles"

interface ServiceReview {
  id: number
  booking_id: number
  buyer: {
    id: number
    name: string
    email: string
  }
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

interface ServiceDetail {
  id: number
  user_id: number
  category_id: number
  category: {
    id: number
    name: string
  }
  title: string
  description: string
  price: string
  estimated_days: string
  tags: string[]
  image: string
  image_url: string
  is_active: boolean
  status: string
  average_rating: number
  total_reviews: number
  saved_count: number
  bookings: {
    total: number
    pending: number
    accepted: number
    in_progress: number
    completed: number
    rejected: number
    cancelled: number
  }
  reviews: ServiceReview[]
  created_at: string
  updated_at: string
}

const SellerServiceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useApiQuery<never, ServiceDetail>({
    endpoint: `/seller/services/show/${id}`,
    queryKey: [`/seller/services/show/${id}`],
  })

  const { data: categoriesData } = useApiQuery<never, { id: number; name: string }[]>({
    endpoint: "/categories",
    queryKey: ["/categories"],
  })

  const categories = categoriesData ?? []

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || `Category ${categoryId}`
  }

  const toggleActiveMutation = useApiMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/seller/services/show/${id}`] })
      queryClient.invalidateQueries({ queryKey: ["/seller/services"] })
    },
  })

  const deleteMutation = useApiMutation({
    onSuccess: () => {
      // Navigate back to services list
      window.location.href = "/seller/services"
    },
  })

  const handleToggle = () => {
    if (data) {
      toggleActiveMutation.mutate({
        endpoint: "/seller/services/change-status",
        method: "POST",
        body: {
          service_id: data.id,
          is_active: !data.is_active,
        },
      })
    }
  }

  const handleDelete = () => {
    if (data) {
      deleteMutation.mutate({
        endpoint: `/seller/services/delete`,
        method: "POST",
        body: { service_id: data.id },
      })
    }
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <Briefcase className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load service</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching service details.</p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/seller/services">
              <ArrowLeft size={17} weight="bold" />
              Back to Services
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Service not found</p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/seller/services">Back to Services</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link to="/seller/services">
              <ArrowLeft size={20} weight="bold" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Service Details</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your service information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={handleToggle}
            disabled={toggleActiveMutation.isPending}
          >
            {data.is_active ? <EyeSlash size={17} weight="bold" /> : <Eye size={17} weight="bold" />}
            {data.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to={`/seller/services/${data.id}/edit`}>
              <PencilSimple size={17} weight="bold" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash size={17} weight="bold" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Image & Basic Info */}
        <div className="space-y-6">
          {/* Service Image */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {data.image_url ? (
              <img src={data.image_url} alt={data.title} className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-muted text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Service Info Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Service Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Title</p>
                <p className="text-sm font-semibold text-foreground">{data.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
                <p className="text-sm font-semibold text-foreground">{getCategoryName(data.category_id)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Price</p>
                  <p className="text-sm font-bold text-foreground">${Number(data.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Estimated Days</p>
                  <p className="text-sm font-semibold text-foreground">{data.estimated_days}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(data.status || (data.is_active ? "active" : "inactive"))}`}>
                  {data.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{data.description}</p>
              </div>
              {data.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300"
                      >
                        <Tag size={12} weight="bold" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Reviews */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{data.bookings.total}</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar size={24} weight="duotone" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-amber-600 dark:text-amber-400">{data.bookings.pending} pending</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Avg. Rating</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{data.average_rating.toFixed(1)}</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star size={24} weight="duotone" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Star size={12} weight="fill" className="text-amber-500" />
                <span>{data.total_reviews} reviews</span>
              </div>
            </div>
          </div>

          {/* Bookings Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Booking Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className={`text-sm font-semibold ${getStatusTextColor("completed")}`}>{data.bookings.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className={`text-sm font-semibold ${getStatusTextColor("in_progress")}`}>{data.bookings.in_progress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className={`text-sm font-semibold ${getStatusTextColor("pending")}`}>{data.bookings.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accepted</span>
                <span className={`text-sm font-semibold ${getStatusTextColor("accepted")}`}>{data.bookings.accepted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <span className={`text-sm font-semibold ${getStatusTextColor("rejected")}`}>{data.bookings.rejected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <span className={`text-sm font-semibold ${getStatusTextColor("cancelled")}`}>{data.bookings.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Reviews</h3>
              <span className="text-xs text-muted-foreground">{data.reviews.length} reviews</span>
            </div>
            {data.reviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
                  <ChatCircleText size={24} weight="duotone" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{review.buyer.name}</p>
                        <p className="text-xs text-muted-foreground">{review.buyer.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} weight="fill" className="text-amber-500" />
                        <span className="text-sm font-semibold text-foreground">{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
                <Trash className="w-8 h-8 text-red-500" weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete Service?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Are you sure you want to delete "{data.title}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="outline" className="rounded-xl" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button
                  className="rounded-xl bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Service"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerServiceDetailPage
