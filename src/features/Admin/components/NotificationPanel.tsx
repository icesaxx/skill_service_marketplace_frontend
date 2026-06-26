import { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useApiQuery } from "@/services/useApiQuery"
import api from "@/provider/axios"
import {
    Bell,
    X,
    CircleNotch,
    CheckCircle,
    SealCheck,
} from "@phosphor-icons/react"

interface NotificationItem {
    id: string
    message: string
    time: string
    read_at?: string | null
}

type NotificationsResponse =
    | NotificationItem[]
    | {
        notification?: NotificationItem[]
        data?: NotificationItem[]
    }

interface NotificationPanelProps {
    open: boolean
    onClose: () => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const NotificationPanel = ({ open, onClose, triggerRef }: NotificationPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data, isLoading, isError } = useApiQuery<unknown, NotificationsResponse>({
        endpoint: "/notifications",
        queryKey: ["notifications"],
        enabled: open,
        raw: true,
    })

    const notifications = Array.isArray(data) ? data : data?.notification ?? data?.data ?? []
    const unreadCount = notifications.filter((notification) => !notification.read_at).length

    const markNotificationsAsRead = async () => {
        await api.post("/notifications/mark-as-read")
        queryClient.setQueryData<NotificationsResponse>(["notifications"], (current) => {
            const readAt = new Date().toISOString()
            if (Array.isArray(current)) {
                return current.map((notification) => ({ ...notification, read_at: readAt }))
            }
            if (!current) return current
            return {
                ...current,
                notification: current.notification?.map((notification) => ({ ...notification, read_at: readAt })),
                data: current.data?.map((notification) => ({ ...notification, read_at: readAt })),
            }
        })
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }

    const handleNotificationClick = async () => {
        try {
            await markNotificationsAsRead()
        } finally {
            onClose()
            navigate("/admin/seller-application")
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                onClose()
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [open, onClose, triggerRef])

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (open) {
            document.addEventListener("keydown", handleKeyDown)
        }
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [open, onClose])

    if (!open) return null

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                className="fixed inset-0 bg-black/20 z-40 md:hidden"
                onClick={onClose}
            />

            <div
                ref={panelRef}
                className="
                    fixed md:absolute top-16 md:top-full right-0 md:right-0 md:mt-2
                    w-full md:w-96
                    max-h-[80vh] md:max-h-[70vh]
                    bg-white dark:bg-gray-900
                    border-t md:border border-gray-200 dark:border-gray-700
                    md:rounded-2xl
                    shadow-2xl
                    z-50
                    flex flex-col
                    overflow-hidden
                    md:mr-4
                "
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" weight="duotone" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Notifications
                        </h2>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        <X className="w-4 h-4" weight="bold" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <CircleNotch className="w-6 h-6 text-gray-400 animate-spin" weight="bold" />
                        </div>
                    )}

                    {isError && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <Bell className="w-10 h-10 text-red-300 dark:text-red-400/50 mb-3" weight="thin" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Failed to load
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Could not fetch notifications. Please try again.
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <CheckCircle className="w-10 h-10 text-emerald-300 dark:text-emerald-400/50 mb-3" weight="thin" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                All caught up
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                You have no new notifications at this time.
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && notifications.length > 0 && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {notifications.map((notif) => {
                                const isUnread = !notif.read_at

                                return (
                                    <button
                                        type="button"
                                        key={notif.id}
                                        onClick={handleNotificationClick}
                                        className={`
                                            flex w-full items-start gap-3 px-5 py-4 text-left
                                            hover:bg-gray-50 dark:hover:bg-gray-800/30
                                            transition-colors duration-150
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                                            ${isUnread ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}
                                        `}
                                    >
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5
                                            ${isUnread
                                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                            }
                                        `}>
                                            {isUnread ? (
                                                <SealCheck className="w-4 h-4" weight="fill" />
                                            ) : (
                                                <Bell className="w-4 h-4" weight="duotone" />
                                            )}
                                        </div>
                                      <div className="flex-1 min-w-0">
                                            <p className={`
                                                text-sm leading-relaxed
                                                ${isUnread
                                                    ? 'font-semibold text-gray-900 dark:text-gray-100'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                }
                                            `}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                                {notif.time}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && !isError && notifications.length > 0 && (
                    <div className="shrink-0 border-t border-gray-100 dark:border-gray-700/50 px-5 py-3">
                        <button
                            type="button"
                            onClick={handleNotificationClick}
                            className="w-full text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150 text-center"
                        >
                            View all notifications
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default NotificationPanel
