import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../RoleContext';

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth; 