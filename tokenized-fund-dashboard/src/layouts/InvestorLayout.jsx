import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

export default function InvestorLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <div className="flex flex-1 pt-16"> {/* Add padding-top to account for fixed header */}
        <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 