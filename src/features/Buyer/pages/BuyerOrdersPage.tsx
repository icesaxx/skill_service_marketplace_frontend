import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChatCircleText, Check, CircleNotch, Clock, Eye, ImageSquare, UploadSimple, X } from "@phosphor-icons/react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { formatMmk } from "@/features/Buyer/data/buyerMockData"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { BuyerOrder } from "@/features/Buyer/types/order"
import { getStatusColor } from "@/lib/colorStyles"

const statusStyle = {
  pending: getStatusColor("pending"),
  "in-progress": getStatusColor("in-progress"),
  delivered: getStatusColor("delivered"),
  completed: getStatusColor("completed"),
  revision: getStatusColor("revision"),
  cancelled: getStatusColor("cancelled"),
}

const paymentStatusStyle: Record<string, string> = {
  unpaid: getStatusColor("unpaid"),
  paid: getStatusColor("paid"),
  pending: getStatusColor("pending"),
  failed: getStatusColor("failed"),
  refunded: getStatusColor("refunded"),
}

interface BuyerOrdersQueryData {
  data?: BuyerOrder[]
  orders?: BuyerOrder[]
}

type BuyerOrdersData = BuyerOrder[] | BuyerOrdersQueryData

type BuyerOrderDetailData =
  | BuyerOrder
  | {
      data?: BuyerOrder
      booking?: BuyerOrder
      order?: BuyerOrder
    }

interface PaymentMethodOption {
  key: string
  name: string
}

interface PaymentMethods {
  mobile_wallets: PaymentMethodOption[]
  banking: PaymentMethodOption[]
}

type PaymentMethodsResponse =
  | PaymentMethods
  | {
      data?: PaymentMethods
    }

const PAGE_SIZE = 8

const getPaymentMethods = (data: PaymentMethodsResponse | undefined): PaymentMethods => {
  const methods = data && "mobile_wallets" in data ? data : data?.data

  return {
    mobile_wallets: methods?.mobile_wallets ?? [],
    banking: methods?.banking ?? [],
  }
}

const getOrderDetail = (data: BuyerOrderDetailData | undefined) => {
  if (!data) return undefined
  if ("service" in data && "seller" in data) return data
  return data.data ?? data.booking ?? data.order
}

const fileSizeLabel = (file: File) => {
  if (file.size < 1024 * 1024) return `${Math.max(file.size / 1024, 1).toFixed(1)} KB`
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`
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

const BuyerOrdersPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [acceptingOrder, setAcceptingOrder] = useState<BuyerOrder | null>(null)
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const paymentProofInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading, isError } = useApiQuery<never, BuyerOrdersData>({
    endpoint: "/buyer/my-orders",
    raw: true,
    queryKey: ["/buyer/my-orders"],
  })
  const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useApiQuery<never, PaymentMethodsResponse>({
    endpoint: "/payment-methods",
    queryKey: ["/payment-methods"],
    enabled: Boolean(acceptingOrder),
    raw: true,
  })
  const { data: orderDetailData, isLoading: isLoadingOrderDetail, isError: isOrderDetailError } = useApiQuery<never, BuyerOrderDetailData>({
    endpoint: `/buyer/bookings/show/${viewingOrderId ?? ""}`,
    queryKey: ["/buyer/bookings/show", viewingOrderId],
    enabled: viewingOrderId !== null,
    raw: true,
  })

  const paymentMethods = getPaymentMethods(paymentMethodsData)
  const orderDetail = getOrderDetail(orderDetailData)

  const acceptCompletionMutation = useApiMutation<FormData>({
    onSuccess: (response) => {
      toast.success(response.message || "Booking completion accepted successfully")
      closeAcceptModal()
      queryClient.invalidateQueries({ queryKey: ["/buyer/my-orders"] })
    },
  })

  const orders = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return data.orders ?? data.data ?? []
  }, [data])

  const filteredOrders = useMemo(() => {
    return filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter)
  }, [filter, orders])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredOrders, page])
  const startItem = filteredOrders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, filteredOrders.length)

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  useEffect(() => {
    return () => {
      if (paymentProofPreview?.startsWith("blob:")) URL.revokeObjectURL(paymentProofPreview)
    }
  }, [paymentProofPreview])

  useEffect(() => {
    if (!acceptingOrder || paymentMethod) return

    const currentMethod = acceptingOrder.payment_method?.toLowerCase()
    const matchedMethod = [...paymentMethods.mobile_wallets, ...paymentMethods.banking].find((method) => {
      return method.key.toLowerCase() === currentMethod || method.name.toLowerCase() === currentMethod
    })

    if (matchedMethod) setPaymentMethod(matchedMethod.key)
  }, [acceptingOrder, paymentMethod, paymentMethods.mobile_wallets, paymentMethods.banking])

  const openAcceptModal = (order: BuyerOrder) => {
    setAcceptingOrder(order)
    setPaymentMethod("")
    setPaymentProof(null)
    if (paymentProofPreview?.startsWith("blob:")) URL.revokeObjectURL(paymentProofPreview)
    setPaymentProofPreview(null)
    if (paymentProofInputRef.current) paymentProofInputRef.current.value = ""
  }

  const closeAcceptModal = () => {
    setAcceptingOrder(null)
    setPaymentMethod("")
    setPaymentProof(null)
    if (paymentProofPreview?.startsWith("blob:")) URL.revokeObjectURL(paymentProofPreview)
    setPaymentProofPreview(null)
    if (paymentProofInputRef.current) paymentProofInputRef.current.value = ""
  }

  const closeViewModal = () => {
    setViewingOrderId(null)
  }

  const handlePaymentProofSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file for payment proof.")
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Payment proof image must be 5 MB or smaller.")
      event.target.value = ""
      return
    }

    if (paymentProofPreview?.startsWith("blob:")) URL.revokeObjectURL(paymentProofPreview)
    setPaymentProof(file)
    setPaymentProofPreview(URL.createObjectURL(file))
  }

  const handleAcceptCompletion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!acceptingOrder) return

    if (!paymentMethod) {
      toast.error("Please choose a payment method.")
      return
    }

    if (!paymentProof) {
      toast.error("Please upload payment proof.")
      return
    }

    const formData = new FormData()
    formData.append("booking_id", String(acceptingOrder.id))
    formData.append("payment_method", paymentMethod)
    formData.append("payment_proof", paymentProof)

    acceptCompletionMutation.mutate({
      endpoint: "/buyer/bookings/accept-completion",
      method: "POST",
      body: formData,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24" />
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-28" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-20" />
                  <Skeleton className="h-12 w-28" />
                  <Skeleton className="h-12 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track active bookings, delivered work, revisions, and completed services.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-red-500">Failed to load orders</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track active bookings, delivered work, revisions, and completed services.</p>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "in-progress", "delivered", "completed", "revision", "cancelled"].map((status) => (
          <Button
            key={status}
            variant="outline"
            size="sm"
            onClick={() => setFilter(status)}
            className={`rounded-xl capitalize ${
              filter === status
                ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white"
                : "hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            {status === "all" ? "All Orders" : status.replace("-", " ")}
          </Button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Clock size={48} className="mx-auto text-muted-foreground/50" weight="duotone" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No orders found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "all" 
              ? "You haven't booked any services yet." 
              : `No ${filter.replace("-", " ")} orders found.`}
          </p>
          <Button asChild className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700">
            <Link to="/buyer/services">Browse Services</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedOrders.map((order) => {
                  const paymentStatus = order.payment_status?.toLowerCase()
                  const canAcceptCompletion = paymentStatus === "unpaid" && order.status === "completed"

                  return (
                    <tr key={order.id} className="group transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-semibold text-muted-foreground">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="truncate text-sm font-semibold text-foreground">{order.service?.title ?? "Untitled service"}</p>
                          {order.order_note && (
                            <p className="mt-1 truncate text-xs text-muted-foreground">Note: {order.order_note}</p>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-medium text-foreground">{order.seller?.name ?? "Unknown seller"}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-foreground">{order.due_date}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm font-semibold text-foreground">{formatMmk(Number(order.service?.price ?? 0))}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyle[order.status] ?? getStatusColor(order.status)}`}>
                          {order.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${paymentStatusStyle[paymentStatus ?? ""] ?? getStatusColor(paymentStatus)}`}>
                            {order.payment_status ?? "Unknown"}
                          </span>
                          <p className="text-xs text-muted-foreground">{order.payment_method ?? "No method"}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canAcceptCompletion && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              className="rounded-lg text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                              onClick={() => openAcceptModal(order)}
                              aria-label={`Accept booking #${order.id}`}
                              title="Accept completion"
                            >
                              <Check size={16} weight="bold" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => setViewingOrderId(order.id)}
                            aria-label={`View booking #${order.id}`}
                            title="View details"
                          >
                            <Eye size={16} weight="duotone" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              navigate("/buyer/messages", {
                                state: {
                                  receiverId: order.seller_id,
                                  sellerName: order.seller?.name,
                                  serviceTitle: order.service?.title,
                                },
                              })
                            }}
                          >
                            <ChatCircleText size={16} weight="duotone" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startItem}-{endItem} of {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page === 1}
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              >
                Previous
              </Button>
              <span className="min-w-16 text-center text-sm font-medium text-foreground">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page === totalPages}
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {acceptingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Accept Booking Completion</h2>
                <p className="text-sm text-muted-foreground">Confirm payment details before accepting the completed work.</p>
              </div>
              <button
                type="button"
                onClick={closeAcceptModal}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleAcceptCompletion} className="space-y-5 px-6 py-5">
              <div>
                <label htmlFor="booking_id" className="text-xs font-medium text-muted-foreground">
                  Booking ID
                </label>
                <input
                  id="booking_id"
                  value={acceptingOrder.id}
                  readOnly
                  className="mt-2 h-10 w-full rounded-xl border border-input bg-muted/50 px-3 text-sm font-semibold text-foreground outline-none"
                />
              </div>

              <div>
                <label htmlFor="payment_method" className="text-xs font-medium text-muted-foreground">
                  Payment Method
                </label>
                <select
                  id="payment_method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  disabled={isLoadingPaymentMethods}
                  className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{isLoadingPaymentMethods ? "Loading payment methods..." : "Select payment method"}</option>
                  {paymentMethods.mobile_wallets.length > 0 && (
                    <optgroup label="Mobile Wallets">
                      {paymentMethods.mobile_wallets.map((method) => (
                        <option key={method.key} value={method.key}>
                          {method.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {paymentMethods.banking.length > 0 && (
                    <optgroup label="Banking">
                      {paymentMethods.banking.map((method) => (
                        <option key={method.key} value={method.key}>
                          {method.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">Payment Proof</p>
                <button
                  type="button"
                  onClick={() => paymentProofInputRef.current?.click()}
                  className="mt-2 flex min-h-48 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-500/5"
                >
                  {paymentProofPreview ? (
                    <img src={paymentProofPreview} alt="Payment proof preview" className="h-full max-h-64 w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center px-5 py-8">
                      <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ImageSquare size={24} weight="duotone" />
                      </div>
                      <span className="mt-3 text-sm font-semibold text-foreground">Upload payment proof</span>
                      <span className="mt-1 text-xs text-muted-foreground">PNG, JPG, or WEBP up to 5 MB</span>
                    </div>
                  )}
                </button>
                <input
                  ref={paymentProofInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePaymentProofSelect}
                />
                {paymentProof ? (
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    {paymentProof.name} - {fileSizeLabel(paymentProof)}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                <Button type="button" variant="outline" className="rounded-xl" onClick={closeAcceptModal}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={acceptCompletionMutation.isPending}>
                  {acceptCompletionMutation.isPending ? (
                    <CircleNotch size={16} weight="bold" className="animate-spin" />
                  ) : (
                    <UploadSimple size={16} weight="bold" />
                  )}
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Booking #{viewingOrderId}</h2>
                <p className="text-sm text-muted-foreground">Order details and payment information</p>
              </div>
              <button
                type="button"
                onClick={closeViewModal}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {isLoadingOrderDetail ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-48 w-full" />
              </div>
            ) : isOrderDetailError || !orderDetail ? (
              <div className="rounded-xl border border-border bg-background p-6 text-center">
                <p className="text-sm text-red-500">Failed to load booking details.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex gap-4">
                    {orderDetail.service.image_url ? (
                      <img
                        src={orderDetail.service.image_url}
                        alt={orderDetail.service.title}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
                        <ImageSquare size={24} className="text-muted-foreground" weight="duotone" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{orderDetail.service.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{orderDetail.service.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <p className="text-sm font-bold text-foreground">{formatMmk(Number(orderDetail.service.price))}</p>
                        <span className="text-xs text-muted-foreground">{orderDetail.service.estimated_days}</span>
                      </div>
                      {(orderDetail.service.tags ?? []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(orderDetail.service.tags ?? []).map((tag) => (
                            <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">Seller</p>
                    <div className="mt-3 flex items-center gap-3">
                      {orderDetail.seller.avatar_url ? (
                        <img src={orderDetail.seller.avatar_url} alt={orderDetail.seller.name} className="size-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {orderDetail.seller.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{orderDetail.seller.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{orderDetail.seller.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>Phone: <span className="text-foreground">{orderDetail.seller.phone_number || "N/A"}</span></p>
                      <p>Company: <span className="text-foreground">{orderDetail.seller.company_name || "N/A"}</span></p>
                      <p>Position: <span className="text-foreground">{orderDetail.seller.position || "N/A"}</span></p>
                      <p>Address: <span className="text-foreground">{orderDetail.seller.address || "N/A"}</span></p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">Booking Info</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Booking ID</p>
                        <p className="font-semibold text-foreground">#{orderDetail.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Service ID</p>
                        <p className="font-semibold text-foreground">#{orderDetail.service_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-foreground">{formatDate(orderDetail.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Updated</p>
                        <p className="text-foreground">{formatDate(orderDetail.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-medium text-muted-foreground">Order Note</p>
                  <p className="mt-1 text-sm text-foreground">{orderDetail.order_note || "No note provided"}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">Order Status</p>
                    <div className="mt-2">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyle[orderDetail.status] ?? getStatusColor(orderDetail.status)}`}>
                        {orderDetail.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(orderDetail.due_date)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Payment Status</p>
                      <div className="mt-2">
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${paymentStatusStyle[orderDetail.payment_status?.toLowerCase() ?? ""] ?? getStatusColor(orderDetail.payment_status)}`}>
                          {orderDetail.payment_status ?? "Unknown"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground">{orderDetail.payment_method || "No payment method"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Payment Dates</p>
                      <div className="mt-1 space-y-1 text-sm text-foreground">
                        <p>
                          Accepted: <span className="text-muted-foreground">{orderDetail.buyer_accepted_at ? formatDateTime(orderDetail.buyer_accepted_at) : "Not accepted yet"}</span>
                        </p>
                        <p>
                          Paid: <span className="text-muted-foreground">{orderDetail.paid_at ? formatDateTime(orderDetail.paid_at) : "Not paid yet"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground">Payment Proof</p>
                    {orderDetail.payment_proof_url ? (
                      <a
                        href={orderDetail.payment_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block overflow-hidden rounded-xl border border-border bg-card transition-opacity hover:opacity-90"
                      >
                        <img
                          src={orderDetail.payment_proof_url}
                          alt={`Payment proof for booking #${orderDetail.id}`}
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerOrdersPage
