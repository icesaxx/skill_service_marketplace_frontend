import { useMemo, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Bell,
  List,
  MagnifyingGlass,
  Moon,
  ShoppingBagOpen,
  Sun,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import BuyerNotificationPanel, {
  getBuyerNotifications,
  type BuyerNotificationsResponse,
} from "@/components/buyer/BuyerNotificationPanel"
import { useApiQuery } from "@/services/useApiQuery"

type BuyerHeaderProps = {
  onOpenSidebar: () => void
}

const pageTitles: Record<string, string> = {
  "/buyer/dashboard": "Buyer Home",
  "/buyer/services": "Find Services",
  "/buyer/orders": "My Orders",
  "/buyer/messages": "Messages",
  "/buyer/reviews": "Reviews",
  "/buyer/become-seller": "Seller Request",
  "/buyer/profile": "Profile",
}

const BuyerHeader = ({ onOpenSidebar }: BuyerHeaderProps) => {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"))
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationTriggerRef = useRef<HTMLButtonElement>(null)
  const { data: notificationsData } = useApiQuery<unknown, BuyerNotificationsResponse>({
    endpoint: "/notifications",
    queryKey: ["notifications"],
    raw: true,
  })
  const unreadCount = getBuyerNotifications(notificationsData).filter((notification) => !notification.read_at).length

  const title = useMemo(() => pageTitles[location.pathname] || "Buyer", [location.pathname])

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    setDarkMode((current) => !current)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:pl-[308px] lg:pr-8">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="rounded-xl lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open buyer navigation"
        >
          <List size={21} weight="bold" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">Discover, book, and manage services in one place.</p>
        </div>

        <div className="hidden h-10 w-[min(380px,34vw)] items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 md:flex">
          <MagnifyingGlass size={17} className="text-muted-foreground" />
          <input
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search services or sellers"
          />
        </div>

        <Button type="button" variant="ghost" size="icon-lg" className="rounded-xl" onClick={toggleDarkMode}>
          {darkMode ? <Sun size={19} weight="duotone" /> : <Moon size={19} weight="duotone" />}
        </Button>
        <div className="relative">
          <button
            ref={notificationTriggerRef}
            type="button"
            className={`relative flex size-10 items-center justify-center rounded-xl transition-colors ${
              notificationsOpen
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            onClick={() => setNotificationsOpen((current) => !current)}
            aria-label="Open buyer notifications"
          >
            <Bell size={19} weight="duotone" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex min-h-2 min-w-2 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-background">
                {unreadCount > 9 ? "9+" : unreadCount > 1 ? unreadCount : ""}
              </span>
            )}
          </button>
          <BuyerNotificationPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            triggerRef={notificationTriggerRef}
          />
        </div>
        <Button asChild size="lg" className="hidden rounded-xl bg-emerald-600 hover:bg-emerald-700 sm:inline-flex">
          <Link to="/buyer/services">
            <ShoppingBagOpen size={17} weight="bold" />
            Book Service
          </Link>
        </Button>
      </div>
    </header>
  )
}

export default BuyerHeader
