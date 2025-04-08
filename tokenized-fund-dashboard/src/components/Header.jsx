import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

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
    ADMIN: 'bg-purple-100 text-purple-800 border border-purple-200',
    MANAGER: 'bg-blue-100 text-blue-800 border border-blue-200',
    INVESTOR: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  };
  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${roleStyles[role] || ''}`}>
      {role}
    </span>
  );
};

export default function Header() {
  const { isAuthenticated, user, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-[#00205B] via-primary-dark to-primary-light text-white shadow-xl h-16">
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-5">
        <Link 
          to="/" 
          className="flex items-center space-x-4 group transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
        >
          <div className="transform group-hover:scale-105 transition-transform">
            <FTLogo />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-semibold tracking-tight text-white">
              <span className="font-light">Franklin</span> <span className="text-[#B8860B] font-medium">Templeton</span>
            </h1>
            <p className="text-xs text-gray-200 hidden md:block tracking-wide group-hover:text-amber-200 transition-colors">TOKENIZED FUND SOLUTIONS</p>
          </div>
        </Link>

        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200/10 flex items-center justify-center text-white border border-secondary/30 shadow-lg">
                <span className="font-medium text-sm">{user?.name?.charAt(0) || '?'}</span>
              </div>

              <div className="flex flex-col items-end space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium leading-none">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                    {role || 'INVESTOR'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-gray-200 hover:text-yellow-300 transition-colors focus:outline-none focus-visible:text-yellow-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <a
              href="/login"
              className="text-sm bg-[#B8860B] text-primary font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-amber-500 hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}