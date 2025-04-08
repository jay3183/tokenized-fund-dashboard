import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaHome, FaFileAlt, FaHistory, FaCog } from 'react-icons/fa';

const InvestorSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const navItems = [
    {
      to: '/investor',
      icon: <FaHome />,
      label: 'Dashboard',
      active: pathname === '/investor'
    },
    {
      to: '/investor/portfolio',
      icon: <FaFileAlt />,
      label: 'Portfolio',
      active: pathname === '/investor/portfolio'
    },
    {
      to: '/investor/transactions',
      icon: <FaHistory />,
      label: 'Transactions',
      active: pathname === '/investor/transactions'
    },
    {
      to: '/investor/settings',
      icon: <FaCog />,
      label: 'Settings',
      active: pathname === '/investor/settings'
    }
  ];
  
  return (
    <div className="bg-white h-full shadow-md py-6 px-4 w-64">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 px-4">Investor Portal</h2>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <Link 
            key={index}
            to={item.to} 
            className={`
              flex items-center px-4 py-3 rounded-lg mb-2
              transition-colors duration-200
              ${item.active 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-8 px-4">
        <div className="border-t border-gray-200 pt-4">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← Return to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function InvestorLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 pt-[3rem]">
      <div className="flex flex-1 h-full">
        <aside className="hidden md:block">
          <InvestorSidebar />
        </aside>
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto shadow-inner">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
} 