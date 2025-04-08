import React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize auth state from localStorage
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return { isAuthenticated: false, user: null, role: 'GUEST' };
        }
        return {
          isAuthenticated: true,
          user: {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          },
          role: decoded.role,
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        return { isAuthenticated: false, user: null, role: 'GUEST' };
      }
    }
    return { isAuthenticated: false, user: null, role: 'GUEST' };
  });

  // Login function
  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('role', user.role);
    setAuthState({
      isAuthenticated: true,
      user,
      role: user.role,
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: 'GUEST',
    });
  };

  // Check if token is still valid on page refresh/load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      } catch (error) {
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        logout,
        setRole: (role) => setAuthState(prev => ({ ...prev, role })),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// For backward compatibility
export const RoleContext = AuthContext;
export const RoleProvider = AuthProvider;
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export const useRole = () => {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useRole must be used within an AuthProvider');
  }
  return { role: auth.role, setRole: auth.setRole };
}; 