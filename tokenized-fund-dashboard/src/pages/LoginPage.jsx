import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Example: use preset demo emails to simulate login
    if (email === 'investor@example.com') {
      localStorage.setItem('token', 'demo_token_I1_INVESTOR');
      localStorage.setItem('role', 'INVESTOR');
      navigate('/investor');
    } else if (email === 'admin@example.com') {
      localStorage.setItem('token', 'demo_token_A1_ADMIN');
      localStorage.setItem('role', 'ADMIN');
      navigate('/admin');
    } else if (email === 'manager@example.com') {
      localStorage.setItem('token', 'demo_token_M1_MANAGER');
      localStorage.setItem('role', 'MANAGER');
      navigate('/manager');
    } else {
      alert('Invalid credentials. Use one of the demo accounts.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b2447] to-[#132043] px-4 py-16">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-2xl font-bold text-center mb-1">Tokenized Fund Dashboard</h1>
        <p className="text-sm text-center text-slate-300 mb-6">Sign in to manage your investments</p>

        <label className="block mb-2 text-sm font-medium">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-slate-300 text-black bg-white placeholder-slate-400 focus:ring-2 focus:ring-gold-500"
          placeholder="you@example.com"
        />

        <label className="block mt-4 mb-2 text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-slate-300 text-black bg-white placeholder-slate-400 focus:ring-2 focus:ring-gold-500"
          placeholder="••••••••"
        />

        <button
          onClick={handleLogin}
          className="mt-6 w-full py-2 rounded-md bg-gold-500 text-white font-semibold shadow hover:bg-yellow-500 transition"
        >
          Sign In
        </button>

        <div className="mt-6 border-t border-white/10 pt-4 text-sm">
          <p className="font-semibold mb-2">Demo Accounts</p>
          <div className="grid grid-cols-2 gap-1">
            <span className="text-slate-300">Investor:</span> <code>investor@example.com</code>
            <span className="text-slate-300">Admin:</span> <code>admin@example.com</code>
            <span className="text-slate-300">Manager:</span> <code>manager@example.com</code>
            <span className="text-slate-300">All passwords:</span> <code>password</code>
          </div>
        </div>
      </div>
    </div>
  );
} 