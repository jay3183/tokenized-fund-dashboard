import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Simple icon component
const Icon = ({ icon }) => (
  <span className="w-5 h-5 flex items-center justify-center text-yellow-300">
    {icon}
  </span>
);

export default function AdminSidebar() {
  const { pathname } = useLocation();
  
  const links = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Funds Management', path: '/admin/funds', icon: '💰' },
    { label: 'User Management', path: '/admin/users', icon: '👥' },
    { label: 'Audit Log', path: '/admin/audit', icon: '📝' },
    { label: 'NAV Controls', path: '/admin/nav', icon: '📈' },
    { label: 'Yield Controls', path: '/admin/yield', icon: '📉' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
  ];

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-blue-950 to-blue-900 text-white shadow-xl rounded-r-2xl flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8 tracking-wide">Franklin <span className="text-yellow-400">Templeton</span></h2>
      </div>
      
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-2">
          {links.map(({ label, path, icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-800 ring-2 ring-blue-500 shadow-md' 
                    : 'hover:bg-blue-800/50'
                }`}
              >
                <Icon icon={icon} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-100'}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-5 bg-yellow-400 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="text-xs opacity-75 py-2 border-t border-blue-800">
          Admin Portal v1.0 © Franklin Templeton
        </div>
      </div>
    </aside>
  );
} 