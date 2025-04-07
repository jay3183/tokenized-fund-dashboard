// 🛠️ AuthContext.jsx (simplified to fix errors)
import { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from 'jwt-decode';

// Create context
export const AuthContext = createContext();

function parseDemoToken(token) {
  if (token.startsWith('demo_token_')) {
    const parts = token.split('_');
    if (parts.length >= 4) {
      const id = parts[2];
      const role = parts[3];
      return {
        id,
        name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
        email: `${role.toLowerCase()}@example.com`,
        role,
      };
    }
  }
  return null;
}

// Provider component that wraps app and makes auth data available
export function AuthProvider({ children }) {
  // Unified state - single source of truth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const defaultUser = { id: null, name: '', role: 'GUEST' };
  const [user, setUser] = useState(defaultUser);
  const [role, setRole] = useState('GUEST');
  const [loading, setLoading] = useState(true); // Start with loading true

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    console.log('[AuthContext] Initializing auth state');
    const token = localStorage.getItem('token');
    
    if (token) {
      console.log('[AuthContext] Found token in localStorage:', token.substring(0, 15) + '...');
      // Try demo token parse first
      const demoUser = parseDemoToken(token);
      if (demoUser) {
        console.log('[AuthContext] Parsed demo token:', demoUser);
        setUser(demoUser);
        setRole(demoUser.role);
        setIsAuthenticated(true);
      } else {
        // Fallback to JWT
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            console.log('[AuthContext] JWT token expired');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser({ id: null, name: '', role: 'GUEST' });
            setRole('GUEST');
          } else {
            console.log('[AuthContext] JWT token valid');
            const userData = {
              id: decoded.id || localStorage.getItem('userId'),
              name: decoded.name,
              email: decoded.email,
              role: decoded.role || localStorage.getItem('role'),
            };
            
            setUser(userData);
            setRole(userData.role);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('[AuthContext] Error decoding token:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser({ id: null, name: '', role: 'GUEST' });
          setRole('GUEST');
        }
      }
    } else {
      console.log('[AuthContext] No token found');
      setIsAuthenticated(false);
      setUser({ id: null, name: '', role: 'GUEST' });
      setRole('GUEST');
    }
    
    // Always set loading to false when done initializing
    setLoading(false);
  }, []);

  const login = async (token, userData) => {
    console.log('[AuthContext] Login:', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('role', userData.role);
    
    setUser(userData);
    setRole(userData.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('[AuthContext] Logout');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    
    setIsAuthenticated(false);
    setUser({ id: null, name: '', role: 'GUEST' });
    setRole('GUEST');
  };

  // Expose a consistent API with unified naming
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated, // Only one auth state variable
        user,
        role,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 