import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/userStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isLoggedIn = !!Cookies.get("ssm_token");
  const userRole = (user?.typ ?? user?.role ?? "").toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  const isAllowUser = normalizedAllowedRoles.includes(userRole)
  return isAllowUser ? (
    <>{children}</>
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export default ProtectedRoute;
