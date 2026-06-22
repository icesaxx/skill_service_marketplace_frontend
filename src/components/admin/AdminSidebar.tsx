import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  Users,
  Briefcase,
  ChartBar,
  Gear,
  ShieldCheck,
  Scroll,
  CaretUp,
  SignOut,
  User,
  CircleNotch,
  UserCheckIcon,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/userStore';
import { useApiMutation } from '@/services/useApiMutation';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <House size={22} weight="duotone" /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={22} weight="duotone" /> },
  { label: 'Services', path: '/admin/services', icon: <Briefcase size={22} weight="duotone" /> },
  { label: 'Categories', path: '/admin/categories', icon: <Scroll size={22} weight="duotone" /> },
  { label: 'Seller Application', path: '/admin/seller-application', icon: <UserCheckIcon size={22} weight="duotone" /> },
];

const buyerNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/buyer/dashboard', icon: <House size={22} weight="duotone" /> },
  { label: 'Browse Services', path: '/buyer/services', icon: <Briefcase size={22} weight="duotone" /> },
  { label: 'My Orders', path: '/buyer/orders', icon: <Scroll size={22} weight="duotone" /> },
  { label: 'Settings', path: '/buyer/settings', icon: <Gear size={22} weight="duotone" /> },
];

const sellerNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/seller/dashboard', icon: <House size={22} weight="duotone" /> },
  { label: 'My Services', path: '/seller/services', icon: <Briefcase size={22} weight="duotone" /> },
  { label: 'Orders', path: '/seller/orders', icon: <Scroll size={22} weight="duotone" /> },
  { label: 'Analytics', path: '/seller/analytics', icon: <ChartBar size={22} weight="duotone" /> },
  { label: 'Settings', path: '/seller/settings', icon: <Gear size={22} weight="duotone" /> },
];

interface AdminSidebarProps {
  collapsed: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: clearUser } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const logoutMutation = useApiMutation({
    mutationFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)ssm_token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    },
    onSuccess: () => {
      handleLogoutCleanup();
    },
    onError: () => {
      // Even if API fails, still clear local state and redirect
      handleLogoutCleanup();
    },
  });

  const handleLogoutCleanup = () => {
    // Remove token cookie
    document.cookie = 'ssm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Clear user from zustand store
    clearUser();
    // Navigate to auth page
    navigate('/auth', { replace: true });
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logoutMutation.mutate({ endpoint: '/admin/logout', method: 'POST' });
  };

  // Determine which nav items to show based on current path
  const getNavItems = (): NavItem[] => {
    if (location.pathname.startsWith('/seller')) return sellerNavItems;
    if (location.pathname.startsWith('/buyer')) return buyerNavItems;
    return adminNavItems;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = getNavItems();

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen
        flex flex-col
        border-r border-border
        bg-sidebar text-sidebar-foreground
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Brand / Logo Area */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-border shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shrink-0">
          <ShieldCheck size={20} weight="bold" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden transition-opacity duration-200">
            <h1 className="text-sm font-bold tracking-tight truncate">SSM</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className={`mb-3 ${collapsed ? 'hidden' : ''}`}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3">
            Navigation
          </span>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-sm font-medium
              transition-all duration-200 ease-out
              ${collapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-muted-foreground hover:bg-primary/5 hover:text-sidebar-foreground'
              }
            `}
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            {!collapsed && (
              <span className="truncate transition-opacity duration-200">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section at Bottom */}
      <div className="relative shrink-0 border-t border-border px-3 py-3" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
            hover:bg-primary/5 transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate capitalize">
                  {user?.typ || user?.role || 'Member'}
                </p>
              </div>
              <CaretUp
                className={`size-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${userMenuOpen ? '' : 'rotate-180'}`}
                weight="bold"
              />
            </>
          )}
        </button>

        {/* Dropdown — appears as overlay above the profile section */}
        <div
          className={`
            absolute bottom-full left-0 right-0 mb-2 mx-2
            rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden
            transition-all duration-200 ease-out
            ${userMenuOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
            }
          `}
        >
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                {user?.typ || user?.role || 'Member'}
              </p>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/admin/profile');
                }}
                className="
                  flex items-center gap-2.5 w-full px-3 py-2 rounded-lg
                  text-sm text-foreground
                  hover:bg-accent hover:text-accent-foreground
                  transition-colors duration-150
                "
              >
                <User size={16} weight="bold" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="
                  flex items-center gap-2.5 w-full px-3 py-2 rounded-lg
                  text-sm text-rose-600 dark:text-rose-400
                  hover:bg-rose-500/10
                  transition-colors duration-150
                  disabled:opacity-50
                "
              >
                {logoutMutation.isPending ? (
                  <CircleNotch size={16} weight="bold" className="animate-spin" />
                ) : (
                  <SignOut size={16} weight="bold" />
                )}
                <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
