import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, isAuthenticated, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the dashboard based on role
      let dashboardPath = '/';
      if (role === 'INVESTOR') dashboardPath = '/investor';
      else if (role === 'MANAGER') dashboardPath = '/manager';
      else if (role === 'ADMIN') dashboardPath = '/admin';
      
      // Redirect to dashboard 
      navigate(dashboardPath);
    }
  }, [isAuthenticated, role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Starting login for:', email);
      
      // Simulate login for demo accounts
      if (email === 'investor@example.com') {
        await login('demo_token_I1_INVESTOR', { id: 'I1', role: 'INVESTOR', name: 'Jane Investor', email });
        setSuccess(true);
        setTimeout(() => navigate('/investor'), 500);
      } else if (email === 'admin@example.com') {
        await login('demo_token_A1_ADMIN', { id: 'A1', role: 'ADMIN', name: 'Alex Admin', email });
        setSuccess(true);
        setTimeout(() => navigate('/admin'), 500);
      } else if (email === 'manager@example.com') {
        await login('demo_token_M1_MANAGER', { id: 'M1', role: 'MANAGER', name: 'Mark Manager', email });
        setSuccess(true);
        setTimeout(() => navigate('/manager'), 500);
      } else {
        throw new Error('Unknown email. Try investor@example.com, admin@example.com, or manager@example.com');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in. Please try again.');
      setLoading(false);
    }
  };

  // Demo accounts that users can quickly select
  const demoAccounts = [
    { label: 'Investor', email: 'investor@example.com' },
    { label: 'Manager', email: 'manager@example.com' },
    { label: 'Admin', email: 'admin@example.com' }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-secondary py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white shadow-xl rounded-2xl p-8 w-full max-w-md overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary/10 rounded-full"></div>
        
        {/* Success animation overlay */}
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="bg-primary/10 rounded-full p-4"
            >
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute mt-24 text-slate-700 font-medium"
            >
              Login successful! Redirecting...
            </motion.p>
          </motion.div>
        )}
        
        <div className="relative z-0">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-block mb-4"
            >
              <svg width="48" height="48" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                <rect width="36" height="36" rx="6" fill="#00205B" />
                <path d="M6 10H30V14H6V10Z" fill="#B8860B" />
                <path d="M6 16H24V20H6V16Z" fill="#B8860B" />
                <path d="M6 22H28V26H6V22Z" fill="#B8860B" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-1 text-slate-800">
              Franklin Templeton
            </h2>
            <p className="text-slate-500 text-sm">
              Tokenized Fund Dashboard
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="block w-full px-4 py-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent peer"
                required
              />
              <label 
                htmlFor="email" 
                className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3 peer-focus:text-primary"
              >
                Email
              </label>
            </div>
            
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                className="block w-full px-4 py-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent peer"
                required
              />
              <label 
                htmlFor="password" 
                className="absolute text-sm text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3 peer-focus:text-primary"
              >
                Password
              </label>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg shadow-md hover:from-primary-dark hover:to-primary-darker transition-colors duration-300 disabled:opacity-70 flex justify-center items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </motion.button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Demo Accounts</h3>
            <div className="space-y-2">
              {demoAccounts.map(account => (
                <motion.button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('password');
                  }}
                  className="flex justify-between items-center w-full px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading || success}
                >
                  <span className="font-medium text-slate-700">{account.label}</span>
                  <code className="text-xs bg-white px-2 py-1 rounded font-mono text-slate-600">
                    {account.email}
                  </code>
                </motion.button>
              ))}
              <p className="text-xs text-slate-500 text-center mt-2">
                Password: <code className="bg-slate-100 px-2 py-0.5 rounded">password</code>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}