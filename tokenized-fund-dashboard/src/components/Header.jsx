import React, { useContext } from 'react';
import { RoleContext } from '../RoleContext';

// SVG Franklin Templeton logo
const FTLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="4" fill="#00205B" />
    <path d="M6 10H34V14H6V10Z" fill="#FFF" />
    <path d="M6 17H24V21H6V17Z" fill="#FFF" />
    <path d="M6 24H28V28H6V24Z" fill="#FFF" />
  </svg>
);

// Icon components
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect width="12" height="8" x="6" y="14"/>
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const RoleDropdown = () => {
  const { role, setRole } = useContext(RoleContext);
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIsOpen(false);
    localStorage.setItem('role', newRole);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        {role} <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => handleRoleChange('INVESTOR')}
          >
            INVESTOR
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => handleRoleChange('ADMIN')}
          >
            ADMIN
          </button>
        </div>
      )}
    </div>
  );
};

const PrintButton = () => {
  return (
    <button
      onClick={() => window.print()}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
      aria-label="Print report"
    >
      <PrintIcon />
    </button>
  );
};

const DarkModeToggle = ({ onToggleTheme }) => {
  return (
    <button
      onClick={onToggleTheme}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      <SunIcon />
    </button>
  );
};

export default function Header({ onToggleTheme }) {
  const { role, setRole } = useContext(RoleContext);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FTLogo />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Franklin Templeton Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2">
          <RoleDropdown />
          <PrintButton />
          <DarkModeToggle onToggleTheme={onToggleTheme} />
        </div>
      </div>
    </header>
  );
} 