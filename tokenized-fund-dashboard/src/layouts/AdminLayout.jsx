import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 pt-[3rem]">
      <div className="flex flex-1 h-full">
        <AdminSidebar />
        <main className="flex-1 p-5 md:p-6 bg-gray-50 overflow-y-auto shadow-inner">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
} 