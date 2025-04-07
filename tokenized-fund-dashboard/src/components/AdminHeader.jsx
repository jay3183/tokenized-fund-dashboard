import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminHeader = ({ user, onLogout, toggleDarkMode, darkMode }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  return (
    <header className="bg-gradient-to-r from-primary to-primary-dark shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-1">
                <svg 
                  className="h-8 w-8 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" 
                    fill="currentColor"
                  />
                </svg>
                <div>
                  <h1 className="text-white font-bold text-xl tracking-tight">Admin Portal</h1>
                  <div className="text-blue-100 text-xs tracking-wider">FRANKLIN TEMPLETON</div>
                </div>
              </div>
            </div>

            <nav className="hidden md:ml-10 md:flex items-baseline space-x-4">
              <Link to="/admin/dashboard" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/admin/funds" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Funds
              </Link>
              <Link to="/admin/users" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Users
              </Link>
              <Link to="/admin/audit" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Audit Log
              </Link>
              <Link to="/admin/settings" className="text-blue-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Settings
              </Link>
            </nav>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:pr-0">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-blue-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="relative ml-4">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-blue-100 hover:text-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-primary font-medium">{user?.name?.charAt(0) || 'A'}</span>
                </div>
              </button>

              {showDropdown && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                    <div className="font-medium">{user?.name || 'Admin User'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@example.com'}</div>
                  </div>
                  <Link 
                    to="/admin/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 