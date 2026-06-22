import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-background">
      {/* Header — full width, on top */}
      <AdminHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      {/* Sidebar — below header */}
      <AdminSidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className={`
          pt-20 px-6 pb-8
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;