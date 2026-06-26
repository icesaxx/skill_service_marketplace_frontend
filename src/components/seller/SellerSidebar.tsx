import { NavLink, useNavigate } from "react-router-dom"
import {
  Briefcase,
  ChartBar,
  ChatCircleText,
  ClipboardText,
  SignOut,
  Storefront,
  User,
  Wallet,
} from "@phosphor-icons/react"
import { useAuthStore } from "@/stores/userStore"
import { cn } from "@/lib/utils"
import { useApiQuery } from "@/services/useApiQuery"

const sellerNavItems = [
  { label: "Dashboard", path: "/seller/dashboard", icon: Storefront },
  { label: "My Services", path: "/seller/services", icon: Briefcase },
  { label: "Orders", path: "/seller/orders", icon: ClipboardText },
  { label: "Messages", path: "/seller/messages", icon: ChatCircleText },
  { label: "Earnings", path: "/seller/earnings", icon: Wallet },
  { label: "Analytics", path: "/seller/analytics", icon: ChartBar },
  { label: "Profile", path: "/seller/profile", icon: User },
]

type SellerSidebarProps = {
  open: boolean
  onClose: () => void
}

interface SellerProfile {
  name?: string
  email?: string
  role?: string
  address?: string | null
  avatar_url?: string | null
}

type SellerProfileData = SellerProfile | {
  data?: SellerProfile
  user?: SellerProfile
  profile?: SellerProfile
}

const getProfileFromResponse = (data: SellerProfileData | undefined) => {
  if (!data) return undefined
  if ("name" in data || "email" in data) return data
  const wrappedData = data as { data?: SellerProfile; user?: SellerProfile; profile?: SellerProfile }
  return wrappedData.data ?? wrappedData.user ?? wrappedData.profile
}

const SellerSidebar = ({ open, onClose }: SellerSidebarProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data } = useApiQuery<never, SellerProfileData>({
    endpoint: "/profile",
    raw: true,
    queryKey: ["/profile"],
  })
  const profile = getProfileFromResponse(data)
  const displayName = profile?.name || user?.name || "Seller"
  const displayEmail = profile?.email || user?.email || "seller@example.com"
  const displayRole = profile?.role || user?.role || "seller"

  const handleLogout = () => {
    document.cookie = "ssm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    logout()
    navigate("/auth", { replace: true })
  }

  return (
    <>
      <button
        aria-label="Close seller navigation"
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[284px] flex-col border-r border-border bg-background transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            <Storefront size={22} weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">SSM Seller</p>
            <p className="truncate text-xs text-muted-foreground">Manage your services</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {sellerNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <Icon size={20} weight="duotone" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 rounded-xl bg-muted/60 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-700 dark:text-cyan-300">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
              <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold capitalize text-cyan-700 dark:text-cyan-300">
                {displayRole}
              </span>
              <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <User size={13} weight="bold" />
                <span className="truncate">Seller Account</span>
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <SignOut size={17} weight="bold" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default SellerSidebar
