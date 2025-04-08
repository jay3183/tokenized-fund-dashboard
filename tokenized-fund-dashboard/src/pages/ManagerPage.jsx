import React from 'react';
import ManagerPortal from '../components/ManagerPortal';
import ManagerFundPerformance from '../components/ManagerFundPerformance';
import ManagerInvestorHeatmap from '../components/ManagerInvestorHeatmap';
import ManagerAlertCenter from '../components/ManagerAlertCenter';

const ManagerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerPortal />
    </div>
  );
};

export default ManagerPage; 