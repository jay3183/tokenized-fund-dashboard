import React from 'react';

const StatusBadge = ({ label, isOk }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
    <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
    <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
      isOk 
        ? 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900' 
        : 'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900'
    }`}>
      {isOk ? 'Operational' : 'Down'}
    </span>
  </div>
);

const SystemStatus = ({ status }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h2>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatusBadge label="Database" isOk={status.dbConnected} />
        <StatusBadge label="Chainlink API" isOk={status.chainlinkResponding} />
        <StatusBadge label="Yield Updater" isOk={status.yieldUpdaterRunning} />
      </div>
    </div>
  );
};

export default SystemStatus; 