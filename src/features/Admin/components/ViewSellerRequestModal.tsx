import { useEffect } from "react"
import { X, Eye, Envelope, Phone, BuildingOffice, Briefcase, MapPin, Clock, Note, User, CheckCircle, XCircle, CircleNotch } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useApiQuery } from "@/services/useApiQuery"

type SellerRequest = {
    user_id: number
    name: string
    email: string
    role: string
    is_approved: boolean
    phone_number: string
    company_name: string
    position: string
    address: string
    bio: string
    avatar: string | null
    avatar_url: string | null
    cover_photo: string | null
    cover_photo_url: string | null
    status: string
    requested_at: string
}

type ViewSellerRequestModalProps = {
    userId: number | null
    open: boolean
    onClose: () => void
    onApprove: (userId: number) => void
    onReject: (userId: number) => void
    isApproving: boolean
    isRejecting: boolean
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case "active":
            return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
        case "pending":
            return "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border-amber-200 dark:border-amber-800"
        case "rejected":
            return "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 border-rose-200 dark:border-rose-800"
        default:
            return "bg-gray-500/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    }
}

const DetailRow = ({
    icon,
    label,
    children,
}: {
    icon?: React.ReactNode
    label: string
    children: React.ReactNode
}) => (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700/50 pb-3 last:border-0">
        <span className="flex items-center gap-1.5 shrink-0 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
            {label}
        </span>
        <div className="text-right text-sm text-gray-900 dark:text-gray-100 max-w-[60%]">
            {children}
        </div>
    </div>
)

const ViewSellerRequestModal = ({ userId, open, onClose, onApprove, onReject, isApproving, isRejecting }: ViewSellerRequestModalProps) => {
    const { data: request, isLoading } = useApiQuery<unknown, SellerRequest>(
        {
            endpoint: userId ? `/admin/seller-requests/show/${userId}` : "",
            queryKey: ["seller-request", userId],
            enabled: !!userId && open,
        },
    )

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (open) {
            document.addEventListener("keydown", handleEsc)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleEsc)
            document.body.style.overflow = ""
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col",
                    "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl",
                    "mx-4",
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 pb-4 pt-5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Eye className="size-5 text-amber-600 dark:text-amber-400" weight="bold" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Seller Application
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                #{userId} &middot; {isLoading ? "Loading..." : request?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="size-5" weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-5">
                    {isLoading ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="size-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Loading application details...
                                </p>
                            </div>
                        </div>
                    ) : request ? (
                        <div className="space-y-5">
                            {/* Avatar & Name */}
                            <div className="flex flex-col items-center gap-3 py-2">
                                {request.avatar_url ? (
                                    <img
                                        src={request.avatar_url}
                                        alt={request.name}
                                        className="size-20 shrink-0 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700"
                                    />
                                ) : (
                                    <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-2xl font-bold text-amber-600 dark:text-amber-400 ring-4 ring-gray-200 dark:ring-gray-700">
                                        {request.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </div>
                                )}
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        {request.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {request.email}
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-center">
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize",
                                        getStatusVariant(request.status),
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-block size-1.5 rounded-full",
                                            request.status.toLowerCase() === "active" && "bg-emerald-500",
                                            request.status.toLowerCase() === "pending" && "bg-amber-500",
                                            request.status.toLowerCase() === "rejected" && "bg-rose-500",
                                        )}
                                    />
                                    {request.status}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/30 p-4">
                                <DetailRow icon={<Envelope className="size-3.5" weight="bold" />} label="Email">
                                    {request.email}
                                </DetailRow>

                                <DetailRow icon={<Phone className="size-3.5" weight="bold" />} label="Phone">
                                    {request.phone_number || "—"}
                                </DetailRow>

                                <DetailRow icon={<BuildingOffice className="size-3.5" weight="bold" />} label="Company">
                                    {request.company_name || "—"}
                                </DetailRow>

                                <DetailRow icon={<Briefcase className="size-3.5" weight="bold" />} label="Position">
                                    {request.position || "—"}
                                </DetailRow>

                                <DetailRow icon={<MapPin className="size-3.5" weight="bold" />} label="Address">
                                    {request.address || "—"}
                                </DetailRow>

                                <DetailRow icon={<Note className="size-3.5" weight="bold" />} label="Bio">
                                    <span className="text-right">{request.bio || "—"}</span>
                                </DetailRow>

                                <DetailRow icon={<Clock className="size-3.5" weight="bold" />} label="Requested At">
                                    {formatDate(request.requested_at)}
                                </DetailRow>

                                <DetailRow icon={<User className="size-3.5" weight="bold" />} label="User ID">
                                    #{request.user_id}
                                </DetailRow>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-48 items-center justify-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Failed to load application details.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-3.5">
                    <button
                        onClick={() => userId && onReject(userId)}
                        disabled={isRejecting}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRejecting ? (
                            <CircleNotch className="size-4 animate-spin" weight="bold" />
                        ) : (
                            <XCircle className="size-4" weight="bold" />
                        )}
                        {isRejecting ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                        onClick={() => userId && onApprove(userId)}
                        disabled={isApproving}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-600 dark:bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isApproving ? (
                            <CircleNotch className="size-4 animate-spin" weight="bold" />
                        ) : (
                            <CheckCircle className="size-4" weight="bold" />
                        )}
                        {isApproving ? "Approving..." : "Approve"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewSellerRequestModal
