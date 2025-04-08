import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaCoins, 
  FaUsers, 
  FaChartLine, 
  FaPercentage, 
  FaClipboardList, 
  FaCog
} from 'react-icons/fa';

const NavItem = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={`
        flex items-center px-4 py-3 rounded-lg mb-2
        transition-colors duration-200
        ${active 
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      <span className="mr-3 text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const navItems = [
    {
      to: '/admin',
      icon: <FaHome />,
      label: 'Dashboard',
      active: pathname === '/admin'
    },
    {
      to: '/admin/funds',
      icon: <FaCoins />,
      label: 'Funds',
      active: pathname === '/admin/funds'
    },
    {
      to: '/admin/users',
      icon: <FaUsers />,
      label: 'Users',
      active: pathname === '/admin/users'
    },
    {
      to: '/admin/nav',
      icon: <FaChartLine />,
      label: 'NAV Controls',
      active: pathname === '/admin/nav'
    },
    {
      to: '/admin/yield',
      icon: <FaPercentage />,
      label: 'Yield Controls',
      active: pathname === '/admin/yield'
    },
    {
      to: '/admin/audit',
      icon: <FaClipboardList />,
      label: 'Audit Logs',
      active: pathname === '/admin/audit'
    },
    {
      to: '/admin/settings',
      icon: <FaCog />,
      label: 'Settings',
      active: pathname === '/admin/settings'
    }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-900 h-full shadow-md py-6 px-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white px-4">Admin Portal</h2>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <NavItem 
            key={index}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={item.active}
          />
        ))}
      </nav>
      
      <div className="mt-auto pt-8 px-4">
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <Link 
            to="/" 
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            ← Return to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 