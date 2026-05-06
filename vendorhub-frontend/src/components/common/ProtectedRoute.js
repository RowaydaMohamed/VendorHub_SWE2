import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'ROLE_ADMIN')    return <Navigate to="/admin"    replace />;
    if (user.role === 'ROLE_VENDOR')   return <Navigate to="/vendor"   replace />;
    if (user.role === 'ROLE_CUSTOMER') return <Navigate to="/shop"     replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}