import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboard from '../components/AdminDashboard';
import AdminFundList from '../components/AdminFundList';
import AdminUserManagement from '../components/AdminUserManagement';
import AdminAuditLog from '../components/AdminAuditLog';
import AdminNavControls from '../components/AdminNavControls';
import AdminYieldControls from '../components/AdminYieldControls';
import AdminSettings from '../components/AdminSettings';

const DASHBOARD_QUERY = gql`
  query DashboardMetrics {
    dashboardMetrics {
      totalAum
      activeFunds
      activeInvestors
      averageYield
    }
    recentAdminActivity {
      id
      action
      actor
      timestamp
      metadata
    }
  }
`;

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data, loading, error } = useQuery(DASHBOARD_QUERY);

  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Extract data for passing to components
  const metrics = data?.dashboardMetrics;
  const logs = data?.recentAdminActivity;

  // Render the active section based on state
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard metrics={metrics} logs={logs} loading={loading} error={error} />;
      case 'funds':
        return <AdminFundList />;
      case 'users':
        return <AdminUserManagement />;
      case 'audit':
        return <AdminAuditLog />;
      case 'nav-controls':
        return <AdminNavControls />;
      case 'yield-controls':
        return <AdminYieldControls />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard metrics={metrics} logs={logs} loading={loading} error={error} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <AdminHeader onNavigate={handleNavigation} />
      
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={handleToggleSidebar} 
          onNavigate={handleNavigation}
          activeSection={activeSection}
        />
        
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
          <div className="container mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage; 