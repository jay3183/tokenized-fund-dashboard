import { createContext, useState, useContext, useEffect } from 'react';

export const RoleContext = createContext();

export function RoleProvider({ children }) {
  // Get initial role from localStorage or default to 'INVESTOR'
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'INVESTOR');
  
  // Save role to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('role', role);
  }, [role]);
  
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext); 