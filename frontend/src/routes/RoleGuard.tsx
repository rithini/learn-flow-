import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { UserRole } from '../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
    // If user doesn't have the required role, redirect to their home portal
    if (user.role === 'TRAINER') {
      return <Navigate to="/trainer/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};
