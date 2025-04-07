import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'chart-pie' },
    { name: 'Funds', path: '/admin/funds', icon: 'currency-dollar' },
    { name: 'Investors', path: '/admin/investors', icon: 'users' },
    { name: 'Settings', path: '/admin/settings', icon: 'cog' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen transition-transform -translate-x-full lg:translate-x-0 bg-white shadow overflow-y-auto">
      {/* Header / Logo Area */}
      <div className="flex items-center px-4 py-3 mb-6 border-b border-gray-200">
        <img src="/logo.svg" className="h-8 mr-2" alt="Logo" />
        <div className="text-lg font-bold text-blue-900 leading-tight">Franklin <span className="text-yellow-600">Templeton</span></div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 group"
              >
                <div className="w-6 h-6 flex items-center justify-center mr-3 text-gray-500 group-hover:text-blue-600">
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {item.icon === 'chart-pie' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    )}
                    {item.icon === 'currency-dollar' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {item.icon === 'users' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    )}
                    {item.icon === 'cog' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    )}
                  </svg>
                </div>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-800 font-medium">Demo Admin</p>
            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-medium">
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 