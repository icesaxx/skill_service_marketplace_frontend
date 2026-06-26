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
import BuyerLayout from "@/layouts/BuyerLayout"
import BuyerDashboardPage from "@/features/Buyer/pages/BuyerDashboardPage"
import BuyerServicesPage from "@/features/Buyer/pages/BuyerServicesPage"
import BuyerServiceDetailPage from "@/features/Buyer/pages/BuyerServiceDetailPage"
import BuyerOrdersPage from "@/features/Buyer/pages/BuyerOrdersPage"
import BuyerMessagesPage from "@/features/Buyer/pages/BuyerMessagesPage"
// import BuyerReviewsPage from "@/features/Buyer/pages/BuyerReviewsPage"
import BecomeSellerPage from "@/features/Buyer/pages/BecomeSellerPage"
import BuyerProfilePage from "@/features/Buyer/pages/BuyerProfilePage"
import SellerLayout from "@/layouts/SellerLayout"
import SellerDashboardPage from "@/features/Seller/pages/SellerDashboardPage"
import SellerServicesPage from "@/features/Seller/pages/SellerServicesPage"
import SellerOrdersPage from "@/features/Seller/pages/SellerOrdersPage"
import SellerMessagesPage from "@/features/Seller/pages/SellerMessagesPage"
import SellerEarningsPage from "@/features/Seller/pages/SellerEarningsPage"
import SellerAnalyticsPage from "@/features/Seller/pages/SellerAnalyticsPage"
import SellerProfilePage from "@/features/Seller/pages/SellerProfilePage"
import SellerServiceDetailPage from "@/features/Seller/pages/SellerServiceDetailPage"
import SellerServiceEditPage from "@/features/Seller/pages/SellerServiceEditPage"

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
        <BuyerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/buyer/dashboard" replace /> },
      { path: 'dashboard', element: <BuyerDashboardPage /> },
      { path: 'services', element: <BuyerServicesPage /> },
      { path: 'services/:id', element: <BuyerServiceDetailPage /> },
      { path: 'orders', element: <BuyerOrdersPage /> },
      { path: 'messages', element: <BuyerMessagesPage /> },
      // { path: 'reviews', element: <BuyerReviewsPage /> },
      { path: 'become-seller', element: <BecomeSellerPage /> },
      { path: 'profile', element: <BuyerProfilePage /> },
    ],
  },
  {
    path: '/seller',
    element: (
      <ProtectedRoute allowedRoles={['seller']}>
        <SellerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/seller/dashboard" replace /> },
      { path: 'dashboard', element: <SellerDashboardPage /> },
      { path: 'services', element: <SellerServicesPage /> },
      { path: 'services/:id', element: <SellerServiceDetailPage /> },
      { path: 'services/:id/edit', element: <SellerServiceEditPage /> },
      { path: 'orders', element: <SellerOrdersPage /> },
      { path: 'messages', element: <SellerMessagesPage /> },
      { path: 'earnings', element: <SellerEarningsPage /> },
      { path: 'analytics', element: <SellerAnalyticsPage /> },
      { path: 'profile', element: <SellerProfilePage /> },
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
