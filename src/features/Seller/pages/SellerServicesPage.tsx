import { Link } from "react-router-dom"
import {
  Briefcase,
  DotsThreeVertical,
  Eye,
  EyeSlash,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"
import { getStatusTextColor } from "@/lib/colorStyles"

interface SellerService {
  id: number
  user_id: number
  category_id: number
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
  booking_count: number
  created_at: string
  updated_at: string
}

const SellerServicesPage = () => {
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useApiQuery<never, SellerService[]>({
    endpoint: "/seller/services",
    queryKey: ["/seller/services"],
  })

  const { data: categoriesData } = useApiQuery<never, { id: number; name: string }[]>({
    endpoint: "/categories",
    queryKey: ["/categories"],
  })

  const categories = categoriesData ?? []
  const services = data ?? []

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || `Category ${categoryId}`
  }

  const toggleActiveMutation = useApiMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/seller/services"] })
      setMenuOpenId(null)
    },
  })

  const deleteMutation = useApiMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/seller/services"] })
      setMenuOpenId(null)
    },
  })

  const handleToggle = (service: SellerService) => {
    toggleActiveMutation.mutate({
      endpoint: "/seller/services/change-status",
      method: "POST",
      body: {
        service_id: service.id,
        is_active: !service.is_active,
      },
    })
  }

  const handleDelete = (serviceId: number) => {
    deleteMutation.mutate({
      endpoint: `/seller/services/delete`,
      method: "POST",
      body: { service_id: serviceId },
    })
    setShowDeleteModal(null)
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <Briefcase className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load services</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching your services.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your service offerings.</p>
        </div>
        <Button asChild className="rounded-xl bg-cyan-600 hover:bg-cyan-700">
          <Link to="/seller/services/add">
            <Plus size={17} weight="bold" />
            Add Service
          </Link>
        </Button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <Skeleton className="h-36 w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Briefcase size={32} weight="duotone" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No services yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Start by creating your first service to attract buyers and grow your business.
          </p>
          <Button asChild className="mt-6 rounded-xl bg-cyan-600 hover:bg-cyan-700">
            <Link to="/seller/services/add">
              <Plus size={17} weight="bold" />
              Create Your First Service
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-md">
              <Link to={`/seller/services/${service.id}`} className="block">
                {service.image_url ? (
                  <img src={service.image_url} alt={service.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{getCategoryName(service.category_id)}</span>
                  <span className={`flex items-center gap-1 ${getStatusTextColor(service.status || (service.is_active ? "active" : "inactive"))}`}>
                    {service.status}
                  </span>
                </div>
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-foreground">{service.title}</h3>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-foreground">${Number(service.price).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
              <div className="border-t border-border p-3">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMenuOpenId(menuOpenId === service.id ? null : service.id)
                    }}
                    className="flex w-full h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    <DotsThreeVertical size={18} weight="bold" />
                    Actions
                  </button>
                  {menuOpenId === service.id && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl border border-border bg-card shadow-lg">
                      <div className="p-1">
                        <Link
                          to={`/seller/services/${service.id}`}
                          onClick={() => setMenuOpenId(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted"
                        >
                          <Eye size={16} weight="bold" />
                          View Details
                        </Link>
                        <Link
                          to={`/seller/services/${service.id}/edit`}
                          onClick={() => setMenuOpenId(null)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted"
                        >
                          <PencilSimple size={16} weight="bold" />
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            handleToggle(service)
                            setMenuOpenId(null)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted"
                        >
                          {service.is_active ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                          {service.is_active ? "Deactivate" : "Activate"}
                        </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(service.id)
                      setMenuOpenId(null)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash size={16} weight="bold" />
                    Delete
                  </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      
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
                  Are you sure you want to delete this service? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="rounded-xl" 
                  onClick={() => setShowDeleteModal(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-xl bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(showDeleteModal)}
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

export default SellerServicesPage
