import { useMemo, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Bell,
  Briefcase,
  List,
  MagnifyingGlass,
  Moon,
  Sun,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import SellerNotificationPanel from "@/components/seller/SellerNotificationPanel"

type SellerHeaderProps = {
  onOpenSidebar: () => void
}

const pageTitles: Record<string, string> = {
  "/seller/dashboard": "Seller Dashboard",
  "/seller/services": "My Services",
  "/seller/orders": "Orders",
  "/seller/earnings": "Earnings",
  "/seller/analytics": "Analytics",
  "/seller/profile": "Profile",
}

const SellerHeader = ({ onOpenSidebar }: SellerHeaderProps) => {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"))
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationTriggerRef = useRef<HTMLButtonElement>(null)

  const title = useMemo(() => pageTitles[location.pathname] || "Seller", [location.pathname])

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
          aria-label="Open seller navigation"
        >
          <List size={21} weight="bold" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="hidden text-xs text-muted-foreground sm:block">Manage your services, orders, and earnings.</p>
        </div>

        <div className="hidden h-10 w-[min(380px,34vw)] items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 md:flex">
          <MagnifyingGlass size={17} className="text-muted-foreground" />
          <input
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search orders, services..."
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
                ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            onClick={() => setNotificationsOpen((current) => !current)}
            aria-label="Open seller notifications"
          >
            <Bell size={19} weight="duotone" />
          </button>
          <SellerNotificationPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            triggerRef={notificationTriggerRef}
          />
        </div>
        <Button asChild size="lg" className="hidden rounded-xl bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 sm:inline-flex">
          <Link to="/seller/services">
            <Briefcase size={17} weight="bold" />
            Add Service
          </Link>
        </Button>
      </div>
    </header>
  )
}

export default SellerHeader
