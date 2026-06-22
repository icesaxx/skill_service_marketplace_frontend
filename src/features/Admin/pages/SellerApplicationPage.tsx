import { useMemo, useState } from "react"
import { useApiQuery } from "@/services/useApiQuery"
import { useApiMutation } from "@/services/useApiMutation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    MagnifyingGlass,
    Eye,
    BuildingOffice,
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    CircleNotch,
    SealCheck,
    Prohibit,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import ViewSellerRequestModal from "@/features/Admin/components/ViewSellerRequestModal"

type SellerRequest = {
    user_id: number
    name: string
    email: string
    role: string
    is_approved: boolean
    approval_status: string
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

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

const SellerApplicationPage = () => {
    const queryClient = useQueryClient()
    const { data: Requests, isLoading } = useApiQuery({
        endpoint: "/admin/seller-requests",
        queryKey: ["seller-request"],
    })

    const [searchQuery, setSearchQuery] = useState("")
    const [viewUserId, setViewUserId] = useState<number | null>(null)
    const [viewModalOpen, setViewModalOpen] = useState(false)

    const approveMutation = useApiMutation({
        onSuccess: () => {
            toast.success("Seller approved successfully")
            queryClient.invalidateQueries({ queryKey: ["seller-request"] })
            setViewModalOpen(false)
            setViewUserId(null)
        },
        onError: () => {
            toast.error("Failed to approve seller")
        },
    })

    const rejectMutation = useApiMutation({
        onSuccess: () => {
            toast.success("Seller rejected successfully")
            queryClient.invalidateQueries({ queryKey: ["seller-request"] })
            setViewModalOpen(false)
            setViewUserId(null)
        },
        onError: () => {
            toast.error("Failed to reject seller")
        },
    })

    const handleApprove = (userId: number) => {
        approveMutation.mutate({
            endpoint: "/admin/approve-seller",
            method: "PUT",
            body: { user_id: userId },
        })
    }

    const handleReject = (userId: number) => {
        rejectMutation.mutate({
            endpoint: "/admin/reject-seller",
            method: "PUT",
            body: { user_id: userId },
        })
    }

    const requests: SellerRequest[] = useMemo(() => {
        if (!Requests) return []
        return Array.isArray(Requests) ? Requests : []
    }, [Requests])

    const filteredRequests = useMemo(() => {
        if (!searchQuery.trim()) return requests
        const query = searchQuery.toLowerCase()
        return requests.filter(
            (r) =>
                r.name.toLowerCase().includes(query) ||
                r.email.toLowerCase().includes(query) ||
                r.company_name?.toLowerCase().includes(query),
        )
    }, [requests, searchQuery])

    const handleView = (req: SellerRequest) => {
        setViewUserId(req.user_id)
        setViewModalOpen(true)
    }

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading applications...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    Seller Applications
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Review and manage seller registration requests.
                </p>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                    <MagnifyingGlass
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
                        weight="bold"
                    />
                    <input
                        placeholder="Search by name, email or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredRequests.length} application{filteredRequests.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Applicant</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Company</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Position</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Approval</th>
                                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req, index) => (
                                    <tr
                                        key={req.user_id}
                                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {req.avatar_url ? (
                                                    <img
                                                        src={req.avatar_url}
                                                        alt={req.name}
                                                        className="size-9 shrink-0 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                        {req.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {req.name}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                        {req.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                <BuildingOffice className="size-3.5 text-gray-400" weight="bold" />
                                                {req.company_name || "—"}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                <Briefcase className="size-3.5 text-gray-400" weight="bold" />
                                                {req.position || "—"}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                                                    getStatusVariant(req.status),
                                                )}
                                            >
                                                {req.status.toLowerCase() === "active" && <CheckCircle className="size-3" weight="fill" />}
                                                {req.status.toLowerCase() === "pending" && <Clock className="size-3" weight="bold" />}
                                                {req.status.toLowerCase() === "rejected" && <XCircle className="size-3" weight="fill" />}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                                                    req.approval_status.toLowerCase() === "approved"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                                        : req.approval_status.toLowerCase() === "rejected"
                                                            ? "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border-amber-200 dark:border-amber-800",
                                                )}
                                            >
                                                {req.approval_status.toLowerCase() === "approved" && <CheckCircle className="size-3" weight="fill" />}
                                                {req.approval_status.toLowerCase() === "rejected" && <XCircle className="size-3" weight="fill" />}
                                                {req.approval_status.toLowerCase() === "pending" && <Clock className="size-3" weight="bold" />}
                                                {req.approval_status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                                {req.role}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(req)}
                                                    className="inline-flex size-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
                                                    title="View application"
                                                >
                                                    <Eye className="size-4" weight="bold" />
                                                </button>
                                                {!req.is_approved && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req.user_id)}
                                                            disabled={approveMutation.isPending}
                                                            className="inline-flex size-8 items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                            title="Approve"
                                                        >
                                                            {approveMutation.isPending ? (
                                                                <CircleNotch className="size-4 animate-spin" weight="bold" />
                                                            ) : (
                                                                <SealCheck className="size-4" weight="bold" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.user_id)}
                                                            disabled={rejectMutation.isPending}
                                                            className="inline-flex size-8 items-center justify-center rounded-lg text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            {rejectMutation.isPending ? (
                                                                <CircleNotch className="size-4 animate-spin" weight="bold" />
                                                            ) : (
                                                                <Prohibit className="size-4" weight="bold" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <BuildingOffice className="size-10 text-gray-300 dark:text-gray-600" weight="thin" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {searchQuery ? "No applications match your search" : "No applications yet"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {searchQuery ? "Try adjusting your search query." : "New seller requests will appear here."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <ViewSellerRequestModal
                userId={viewUserId}
                open={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false)
                    setViewUserId(null)
                }}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={approveMutation.isPending}
                isRejecting={rejectMutation.isPending}
            />
        </div>
    )
}

export default SellerApplicationPage