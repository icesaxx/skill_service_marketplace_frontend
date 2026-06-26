import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, CheckCircle, CircleNotch, Briefcase, X } from "@phosphor-icons/react"

import { useApiQuery } from "@/services/useApiQuery"

export interface SellerNotificationItem {
  id: string
  message?: string
  time?: string
  created_at?: string
  read_at?: string | null
  data?: {
    message?: string
    title?: string
    body?: string
  }
}

export type SellerNotificationsResponse =
  | SellerNotificationItem[]
  | {
      notification?: SellerNotificationItem[]
      data?: SellerNotificationItem[]
    }

type SellerNotificationPanelProps = {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export const getSellerNotifications = (data?: SellerNotificationsResponse) => {
  return Array.isArray(data) ? data : data?.notification ?? data?.data ?? []
}

const formatNotificationTime = (notification: SellerNotificationItem) => {
  if (notification.time) return notification.time
  if (!notification.created_at) return "Just now"

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(notification.created_at))
}

const getNotificationMessage = (notification: SellerNotificationItem) => {
  return notification.message ?? notification.data?.message ?? notification.data?.title ?? notification.data?.body ?? "You have a new notification."
}

const SellerNotificationPanel = ({ open, onClose, triggerRef }: SellerNotificationPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { data, isLoading, isError } = useApiQuery<unknown, SellerNotificationsResponse>({
    endpoint: "/notifications",
    queryKey: ["notifications"],
    enabled: open,
    raw: true,
  })
  const notifications = getSellerNotifications(data)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (open) document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onClose, triggerRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    if (open) document.addEventListener("keydown", handleKeyDown)

    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close seller notifications"
        className="fixed inset-0 z-40 bg-black/20 md:hidden"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed right-0 top-16 z-50 flex max-h-[80vh] w-full flex-col overflow-hidden border-t border-border bg-background shadow-2xl md:absolute md:right-0 md:top-full md:mt-2 md:max-h-[70vh] md:w-96 md:rounded-2xl md:border"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
              <Bell size={19} weight="duotone" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">{notifications.length} unread update{notifications.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close notifications"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <CircleNotch size={24} weight="bold" className="animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Bell size={40} weight="thin" className="mb-3 text-rose-400/70" />
              <p className="text-sm font-semibold text-foreground">Failed to load</p>
              <p className="mt-1 text-xs text-muted-foreground">Could not fetch seller notifications.</p>
            </div>
          )}

          {!isLoading && !isError && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <CheckCircle size={42} weight="thin" className="mb-3 text-cyan-400/80" />
              <p className="text-sm font-semibold text-foreground">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">You have no new seller notifications.</p>
            </div>
          )}

          {!isLoading && !isError && notifications.length > 0 && (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    navigate("/seller/messages")
                    onClose()
                  }}
                  className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    <Briefcase size={18} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-6 text-foreground">{getNotificationMessage(notification)}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span className="size-1 rounded-full bg-cyan-500" />
                      {formatNotificationTime(notification)}
                    </p>
                  </div>
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-cyan-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SellerNotificationPanel