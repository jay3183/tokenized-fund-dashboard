import React from 'react';

// Reusable card components
const MetricCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl shadow p-4 text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
  </div>
);

const RecentActivity = () => (
  <div className="bg-white rounded-xl shadow p-5">
    <h3 className="font-semibold mb-3 text-gray-700">Recent Activity</h3>
    <ul className="space-y-2 text-sm">
      {/* Placeholder for activity items */}
      <li className="py-2 border-b border-gray-100">No recent activities</li>
    </ul>
  </div>
);

const SystemStatus = () => (
  <div className="bg-white rounded-xl shadow p-5">
    <h3 className="font-semibold mb-3 text-gray-700">System Status</h3>
    <ul className="space-y-1 text-sm">
      <li className="flex items-center gap-2">
        <span className="text-green-500">✅</span> GraphQL API
      </li>
      <li className="flex items-center gap-2">
        <span className="text-green-500">✅</span> Database
      </li>
      <li className="flex items-center gap-2">
        <span className="text-green-500">✅</span> Blockchain Node
      </li>
    </ul>
  </div>
);

export default function AdminDashboard() {
  const metrics = [
    { label: 'Total AUM', value: '23.3K' },
    { label: 'Active Investors', value: '1' },
    { label: 'Active Funds', value: '1' },
    { label: 'Average Yield', value: '1.88%', color: 'text-red-500' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, index) => (
          <MetricCard key={index} label={m.label} value={m.value} color={m.color} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemStatus />
      </div>
    </div>
  );
} 