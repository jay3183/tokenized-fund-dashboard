import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ADMIN_DASHBOARD } from '../graphql/queries';
import FundChart from './FundChart';
import YieldChart from './YieldChart';
import AuditLogPanel from './AuditLogPanel';
import SystemStatus from './SystemStatus';
import Sidebar from './Sidebar';

const AdminDashboardContent = () => {
  const { data, loading, error } = useQuery(GET_ADMIN_DASHBOARD);

  if (loading) return <div className="p-4">Loading admin dashboard...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading admin data.</div>;

  const { dashboardMetrics, recentAdminActivity, systemStatus } = data;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <SystemStatus status={systemStatus} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FundChart metrics={dashboardMetrics} />
        <YieldChart metrics={dashboardMetrics} />
      </div>
      <div className="mt-6">
        <AuditLogPanel logs={recentAdminActivity} />
      </div>
    </>
  );
};

const AdminPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <AdminDashboardContent />
        </div>
      </main>
    </div>
  );
};

export default AdminPage; 