import { useState } from "react"
import {
  Check,
  ClipboardText,
  Clock,
  Eye,
  List,
  Star,
  Table,
  Truck,
  X,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useApiQuery } from "@/services/useApiQuery"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiMutation } from "@/services/useApiMutation"
import { useQueryClient } from "@tanstack/react-query"
import { getStatusColor } from "@/lib/colorStyles"

interface Buyer {
  id: number
  name: string
  email: string
  phone_number?: string | null
  avatar?: string | null
  avatar_url?: string | null
}

interface Service {
  id: number
  category_id: number
  title: string
  description: string
  price: string
  estimated_days: string
  tags: string[]
  image: string | null
  image_url: string | null
}

interface Review {
  id: number
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

interface SellerOrder {
  id: number
  service_id: number
  buyer_id: number
  seller_id: number
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "rejected" | "accepted"
  payment_method: string | null
  payment_status: string | null
  payment_proof: string | null
  payment_proof_url: string | null
  buyer_accepted_at: string | null
  paid_at: string | null
  due_date: string
  order_note: string | null
  buyer: Buyer
  service: Service
  review: Review | null
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    color: getStatusColor("pending"),
    icon: <Clock size={14} weight="bold" />,
  },
  confirmed: {
    label: "Confirmed",
    color: getStatusColor("confirmed"),
    icon: <Check size={14} weight="bold" />,
  },
  in_progress: {
    label: "In Progress",
    color: getStatusColor("in_progress"),
    icon: <Truck size={14} weight="bold" />,
  },
  completed: {
    label: "Completed",
    color: getStatusColor("completed"),
    icon: <Check size={14} weight="bold" />,
  },
  cancelled: {
    label: "Cancelled",
    color: getStatusColor("cancelled"),
    icon: <X size={14} weight="bold" />,
  },
  rejected: {
    label: "Rejected",
    color: getStatusColor("rejected"),
    icon: <X size={14} weight="bold" />,
  },
  accepted: {
    label: "Accepted",
    color: getStatusColor("accepted"),
    icon: <Check size={14} weight="bold" />,
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  unpaid: {
    label: "Unpaid",
    color: getStatusColor("unpaid"),
  },
  paid: {
    label: "Paid",
    color: getStatusColor("paid"),
  },
  pending: {
    label: "Pending",
    color: getStatusColor("pending"),
  },
  failed: {
    label: "Failed",
    color: getStatusColor("failed"),
  },
  refunded: {
    label: "Refunded",
    color: getStatusColor("refunded"),
  },
}

const orderStatusActions = ["accepted", "in_progress", "completed", "rejected", "cancelled"] as const

const getPaymentStatus = (status: string | null | undefined) => {
  return paymentStatusConfig[status ?? ""] ?? {
    label: status || "Unknown",
    color: getStatusColor(status),
  }
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const SellerOrdersPage = () => {
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null)
  const [viewMode, setViewMode] = useState<"card" | "table">("card")

  const { data, isLoading, isError } = useApiQuery<never, SellerOrder[]>({
    endpoint: "/seller/bookings",
    queryKey: ["/seller/bookings"],
  })

  const updateStatusMutation = useApiMutation({
    onSuccess: () => {
      setSelectedOrder(null)
      queryClient.invalidateQueries({ queryKey: ["/seller/bookings"] })
    },
  })

  const orders = data ?? []

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      endpoint: `/seller/bookings/change-status`,
      method: "POST",
      body: {
        booking_id: orderId,
        status: newStatus,
      },
    })
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20">
            <ClipboardText className="w-8 h-8 text-red-500" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load orders</h3>
            <p className="text-sm text-muted-foreground mt-1">Something went wrong while fetching your orders.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your service orders.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            className="rounded-xl"
            onClick={() => setViewMode("card")}
          >
            <List size={18} weight="bold" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            className="rounded-xl"
            onClick={() => setViewMode("table")}
          >
            <Table size={18} weight="bold" />
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <ClipboardText size={32} weight="duotone" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No bookings yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Bookings from buyers will appear here once they order your services.
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending
            const paymentStatus = getPaymentStatus(order.payment_status)
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{order.service.title}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Buyer: {order.buyer.name}</span>
                      <span>•</span>
                      <span>Booking #{order.id}</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="text-sm font-bold text-foreground">${Number(order.service.price).toLocaleString()}</p>
                      {order.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(order.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${paymentStatus.color}`}>
                        {paymentStatus.label}
                      </span>
                      {order.payment_method && <span className="text-xs text-muted-foreground">{order.payment_method}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye size={18} weight="bold" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Booking ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  const paymentStatus = getPaymentStatus(order.payment_status)
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">#{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {order.service.image_url && (
                            <img
                              src={order.service.image_url}
                              alt={order.service.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{order.service.title}</p>
                            <p className="text-xs text-muted-foreground">{order.service.estimated_days}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.buyer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.buyer.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-foreground">${Number(order.service.price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${paymentStatus.color}`}>
                            {paymentStatus.label}
                          </span>
                          <p className="text-xs text-muted-foreground">{order.payment_method || "No method"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(order.due_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye size={18} weight="bold" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Booking #{selectedOrder.id}</h2>
                <p className="text-sm text-muted-foreground">{selectedOrder.service.title}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Service Info */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex gap-4">
                  {selectedOrder.service.image_url ? (
                    <img
                      src={selectedOrder.service.image_url}
                      alt={selectedOrder.service.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
                      <ClipboardText size={24} className="text-muted-foreground" weight="duotone" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{selectedOrder.service.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{selectedOrder.service.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="text-sm font-bold text-foreground">${Number(selectedOrder.service.price).toLocaleString()}</p>
                      <span className="text-xs text-muted-foreground">{selectedOrder.service.estimated_days}</span>
                    </div>
                    {selectedOrder.service.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedOrder.service.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buyer & Booking Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">Buyer</p>
                  <div className="mt-3 flex items-center gap-3">
                    {selectedOrder.buyer.avatar_url ? (
                      <img src={selectedOrder.buyer.avatar_url} alt={selectedOrder.buyer.name} className="size-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {selectedOrder.buyer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{selectedOrder.buyer.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{selectedOrder.buyer.email}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Phone: <span className="text-foreground">{selectedOrder.buyer.phone_number || "N/A"}</span>
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">Booking Info</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Booking ID</p>
                      <p className="font-semibold text-foreground">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Service ID</p>
                      <p className="font-semibold text-foreground">#{selectedOrder.service_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-foreground">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="text-foreground">{formatDate(selectedOrder.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">Order Note</p>
                  <p className="mt-1 text-sm text-foreground">{selectedOrder.order_note || "No note provided"}</p>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig[selectedOrder.status]?.color || statusConfig.pending.color}`}>
                      {statusConfig[selectedOrder.status]?.icon}
                      {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(selectedOrder.due_date)}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Payment Status</p>
                    <div className="mt-2">
                      {(() => {
                        const paymentStatus = getPaymentStatus(selectedOrder.payment_status)

                        return (
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${paymentStatus.color}`}>
                            {paymentStatus.label}
                          </span>
                        )
                      })()}
                    </div>
                    <p className="mt-2 text-sm text-foreground">{selectedOrder.payment_method || "No payment method"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Payment Dates</p>
                    <div className="mt-1 space-y-1 text-sm text-foreground">
                      <p>
                        Accepted:{" "}
                        <span className="text-muted-foreground">
                          {selectedOrder.buyer_accepted_at ? formatDateTime(selectedOrder.buyer_accepted_at) : "Not accepted yet"}
                        </span>
                      </p>
                      <p>
                        Paid:{" "}
                        <span className="text-muted-foreground">
                          {selectedOrder.paid_at ? formatDateTime(selectedOrder.paid_at) : "Not paid yet"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">Payment Proof</p>
                  {selectedOrder.payment_proof_url ? (
                    <a
                      href={selectedOrder.payment_proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block overflow-hidden rounded-xl border border-border bg-card transition-opacity hover:opacity-90"
                    >
                      <img
                        src={selectedOrder.payment_proof_url}
                        alt={`Payment proof for booking #${selectedOrder.id}`}
                        className="max-h-64 w-full object-contain"
                      />
                    </a>
                  ) : (
                    <div className="mt-2 flex h-24 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                      <p className="text-sm text-muted-foreground">No payment proof uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review */}
              {selectedOrder.review && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} weight="fill" className="text-amber-500" />
                    <span className="text-sm font-semibold text-foreground">{selectedOrder.review.rating}/5</span>
                  </div>
                  {selectedOrder.review.comment && (
                    <p className="text-sm text-foreground">{selectedOrder.review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(selectedOrder.review.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Update Status */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {orderStatusActions.map((key) => {
                    const config = statusConfig[key]
                    return (
                    <button
                      key={key}
                      onClick={() => handleStatusUpdate(selectedOrder.id, key)}
                      disabled={selectedOrder.status === key || updateStatusMutation.isPending}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        selectedOrder.status === key
                          ? "bg-primary/10 text-primary cursor-default"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      } disabled:opacity-50`}
                    >
                      {config.icon}
                      {config.label}
                    </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SellerOrdersPage
