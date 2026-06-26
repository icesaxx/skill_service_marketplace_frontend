import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  MagnifyingGlass,
  SidebarSimple,
  Moon,
  Sun,
} from '@phosphor-icons/react';
import NotificationPanel from '@/features/Admin/components/NotificationPanel';
import { useApiQuery } from '@/services/useApiQuery';

interface NotificationItem {
  id: string;
  read_at?: string | null;
}

type NotificationsResponse =
  | NotificationItem[]
  | {
      notification?: NotificationItem[];
      data?: NotificationItem[];
    };

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifTriggerRef = useRef<HTMLButtonElement>(null);
  const { data: notificationsData } = useApiQuery<unknown, NotificationsResponse>({
    endpoint: '/notifications',
    queryKey: ['notifications'],
    raw: true,
  });
  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : notificationsData?.notification ?? notificationsData?.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode((prev) => !prev);
  };

  // Derive page title from path
  const getPageTitle = (): string => {
    const segments = location.pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Dashboard';
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const getBreadcrumb = (): string[] => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center border-b border-border bg-background/80 backdrop-blur-xl">
      {/* Toggle area — sits over the sidebar width, perfectly aligned */}
      <div
        className={`
          shrink-0 h-full flex items-center justify-center
          border-r border-border
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        <button
          onClick={onToggleSidebar}
          className="
            flex items-center justify-center
            w-9 h-9 rounded-lg
            text-muted-foreground hover:text-primary
            hover:bg-primary/10
            transition-all duration-200
          "
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <SidebarSimple size={20} weight="duotone" />
        </button>
      </div>

      {/* Content area — right of sidebar */}
      <div className="flex-1 flex items-center justify-between px-6 h-full min-w-0">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Desktop Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            {getBreadcrumb().map((segment, idx, arr) => (
              <React.Fragment key={idx}>
                <span
                  className={
                    idx === arr.length - 1
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  }
                >
                  {segment}
                </span>
                {idx < arr.length - 1 && (
                  <span className="text-muted-foreground/40">/</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Title */}
          <h2 className="sm:hidden text-sm font-semibold truncate">{getPageTitle()}</h2>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <div
            className={`
              hidden md:flex items-center gap-2
              px-3 h-9 rounded-lg
              border transition-all duration-200
              ${searchFocused
                ? 'border-primary/50 bg-background shadow-sm shadow-primary/5 w-64'
                : 'border-border bg-accent/40 w-52'
              }
            `}
          >
            <MagnifyingGlass size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="
                bg-transparent text-sm w-full
                placeholder:text-muted-foreground/60
                focus:outline-none
              "
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground bg-background border border-border">
              ⌘K
            </kbd>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="
              flex items-center justify-center
              w-9 h-9 rounded-lg
              text-muted-foreground hover:text-foreground
              hover:bg-accent
              transition-all duration-200
            "
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} weight="duotone" /> : <Moon size={18} weight="duotone" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              ref={notifTriggerRef}
              onClick={() => setNotifOpen((prev) => !prev)}
              className={`
                relative flex items-center justify-center
                w-9 h-9 rounded-lg
                transition-all duration-200
                ${notifOpen
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
              `}
              title="Notifications"
            >
              <Bell size={18} weight="duotone" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
            </button>
            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              triggerRef={notifTriggerRef}
            />
          </div>

        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
