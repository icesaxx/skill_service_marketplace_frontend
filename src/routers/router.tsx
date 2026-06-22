import { createBrowserRouter, Navigate } from "react-router-dom"

import AuthPage from "@/features/Auth/pages/AuthPage"
import NotFound from "@/pages/NotFound"
import ProtectedRoute from "./ProtectedRoute"
import AdminLayout from "@/layouts/AdminLayout"
import DashboardPage from "@/features/Admin/pages/DashboardPage"
import UserListPage from "@/features/Admin/pages/UserListPage"
import ServicesPage from "@/features/Admin/pages/ServicesPage"
import CategoriesPage from "@/features/Admin/pages/CategoriesPage"
import AdminProfilePage from "@/features/Admin/pages/AdminProfilePage"
import SellerApplicationPage from "@/features/Admin/pages/SellerApplicationPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'services', element: <ServicesPage />},
      { path: 'profile', element: <AdminProfilePage />},
      { path: 'seller-application', element: <SellerApplicationPage />}
    ],
  },
  {
    path: '/buyer',
    element: (
      <ProtectedRoute allowedRoles={['buyer']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <div>Buyer Dashboard</div> },
    ],
  },
  {
    path: '/seller',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <div>Seller Dashboard</div> },
    ],
  },
  {
    path: '/unauthorized',
    element: <div>Unauthorized</div>,
  },
  {
    path: '*',
    element: <NotFound />,
  }
])

export default router
