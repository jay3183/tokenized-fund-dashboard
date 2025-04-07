import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * A wrapper component that redirects to login if not authenticated
 * or if the user doesn't have the required role
 */
const PrivateRoute = ({ 
  children, 
  allowedRoles = [] // Empty array means any authenticated user can access
}) => {
  const { user, isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  console.log('[PrivateRoute] Checking auth:', {
    isAuthenticated,
    role,
    allowedRoles,
    loading,
    currentPath: location.pathname
  });

  // Show loading state while auth state is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[PrivateRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles specified and user doesn't have required role, redirect to appropriate page
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log(`[PrivateRoute] User role ${role} not in allowed roles:`, allowedRoles);
    
    // Redirect to appropriate dashboard based on role
    if (role === 'INVESTOR') {
      return <Navigate to="/investor" replace />;
    } else if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'MANAGER') {
      return <Navigate to="/manager" replace />;
    } else {
      // Unknown role, send to home
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed, render the protected component
  return children;
};

export default PrivateRoute; 