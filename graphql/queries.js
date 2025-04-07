import { gql } from '@apollo/client';

export const GET_ADMIN_DASHBOARD = gql`
  query GetAdminDashboard {
    dashboardMetrics {
      totalAum
      activeFunds
      activeInvestors
      averageYield
    }
    recentAdminActivity {
      id
      actor
      action
      timestamp
      metadata
    }
    systemStatus {
      dbConnected
      chainlinkResponding
      yieldUpdaterRunning
    }
  }
`; 