import React from 'react';

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-5xl font-extrabold text-primary dark:text-white text-center">Welcome to the Franklin Templeton Fund Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300 mt-4 text-center max-w-xl">Track NAVs, yield performance, and portfolio insights in real-time.</p>
      <div className="mt-8 space-x-4">
        <a href="/login" className="bg-primary text-white px-6 py-3 rounded-lg text-sm shadow hover:bg-primary-dark transition">Get Started</a>
      </div>
    </div>
  );
} 