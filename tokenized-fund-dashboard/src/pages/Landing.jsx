import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Landing() {
  const { isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log('[Landing] User already authenticated, redirecting to dashboard');
      
      if (role === 'INVESTOR') {
        navigate('/investor');
      } else if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'MANAGER') {
        navigate('/manager');
      }
    }
  }, [isAuthenticated, role, loading, navigate]);

  // Function to handle Get Started click
  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on role
      if (role === 'INVESTOR') navigate('/investor');
      else if (role === 'ADMIN') navigate('/admin');
      else if (role === 'MANAGER') navigate('/manager');
    } else {
      navigate('/login');
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl text-center"
      >
        <h1 className="text-4xl font-bold mb-4 text-primary dark:text-white">Welcome to the Franklin Templeton Fund Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-6">
          This dashboard allows investors, fund managers, and admins to track NAV, manage portfolios, and monitor intraday yield — all in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleGetStarted}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark shadow-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
} 