import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Brand colors
const primary = '#00205B'; // Franklin blue
const accent = '#B8860B';  // Gold

const FTLogo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="6" fill={primary} />
    <path d="M6 10H30V14H6V10Z" fill={accent} />
    <path d="M6 16H24V20H6V16Z" fill={accent} />
    <path d="M6 22H28V26H6V22Z" fill={accent} />
  </svg>
);

const RoleBadge = ({ role }) => {
  const roleStyles = {
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
    MANAGER: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
    INVESTOR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
  };
  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${roleStyles[role] || ''}`}>
      {role}
    </span>
  );
};

export default function Header({ toggleDarkMode, adminView, toggleAdminView, managerView, toggleManagerView }) {
  const { isAuthenticated, user, role, logout } = useAuth();

  return (
    <div className="relative">
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-primary via-primary-dark to-primary-light text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FTLogo />
            <div>
              <h1 className="text-lg md:text-2xl font-semibold tracking-tight">
                <span className="font-light">Franklin</span> <span className="text-[#B8860B]">Templeton</span>
              </h1>
              <p className="text-xs text-gray-200 hidden md:block tracking-wide">TOKENIZED FUND SOLUTIONS</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {toggleManagerView && isAuthenticated && (role === 'MANAGER' || role === 'ADMIN') && (
              <button
                onClick={toggleManagerView}
                className={`p-2 rounded-full ${managerView ? 'bg-blue-600 text-white' : 'hover:bg-blue-700/20'} transition`}
                title="Manager View"
              >
                <span className="sr-only">Toggle Manager View</span>
                📊
              </button>
            )}

            {toggleAdminView && isAuthenticated && role === 'ADMIN' && (
              <button
                onClick={toggleAdminView}
                className={`p-2 rounded-full ${adminView ? 'bg-purple-600 text-white' : 'hover:bg-purple-700/20'} transition`}
                title="Admin Panel"
              >
                <span className="sr-only">Toggle Admin Panel</span>
                🛠️
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/20 transition"
              title="Toggle Dark Mode"
            >
              🌗
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200/10 dark:bg-gray-800/50 flex items-center justify-center text-white border border-secondary/30 shadow-md">
                  <span className="font-medium text-sm">{user?.name?.charAt(0) || '?'}</span>
                </div>

                <div className="flex flex-col items-end space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium leading-none">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      {role || 'INVESTOR'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-200 hover:text-yellow-300 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <a
                href="/login"
                className="text-sm bg-[#B8860B] text-primary font-semibold px-4 py-2 rounded-lg shadow hover:bg-white transition"
              >
                Sign in
              </a>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}