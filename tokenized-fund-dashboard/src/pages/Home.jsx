import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on role
      if (role === 'INVESTOR') navigate('/investor');
      else if (role === 'MANAGER') navigate('/manager');
      else if (role === 'ADMIN') navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#00205B] via-slate-800 to-slate-900 text-white flex items-center justify-center px-4 py-20 min-h-[calc(100vh-5rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl text-center"
      >
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          Welcome to the <span className="text-[#f5b800]">Franklin Templeton</span> Fund Dashboard
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-8">
          This dashboard allows investors, fund managers, and admins to track NAV, manage portfolios, and monitor intraday yield — all in real-time.
        </p>
        <motion.button
          onClick={handleGetStarted}
          className="px-6 py-3 text-lg font-medium bg-white text-[#00205B] hover:bg-yellow-300 rounded-xl shadow-md transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
        </motion.button>
      </motion.div>
    </div>
  );
} 