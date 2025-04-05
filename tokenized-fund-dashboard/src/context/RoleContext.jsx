import React, { createContext, useState, useContext } from 'react';

// Create context with default value
export const RoleContext = createContext({
  role: 'INVESTOR',
  setRole: () => {},
});

// Provider component that wraps app and makes role data available
export function RoleProvider({ children }) {
  const [role, setRole] = useState('INVESTOR');

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

// Custom hook to simplify context use
export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
} 