import React, { useState, useEffect } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useMutation,
  useApolloClient
} from '@apollo/client';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Card, CardContent, Button, Tooltip, InfoIcon } from './components/ui';
import NavChart from './components/NavChart';
import YieldChart from './components/YieldChart';
import DualChart from './components/DualChart';
import DeltaBadge from './components/DeltaBadge';
import YieldBadge from './components/YieldBadge';
import AccruedYield from './components/AccruedYield';
import PortfolioPanel from './components/PortfolioPanel';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import { formatUSD, formatAUM } from './utils/formatCurrency';
import { formatNumber, formatCurrency } from './utils/formatNumber';
import CountUp from 'react-countup';
import { format, parseISO } from 'date-fns';
import { timeAgo } from './utils/timeAgo';
import { useAuth } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import './App.css';
import FundCard from './components/FundCard';
import { ApolloError } from '@apollo/client';
import FundDetails from './components/FundDetails';
import FundStats from './components/FundStats';
import AppFundActions from './components/FundActions';
import InlineFundActionsComponent from './components/InlineFundActions';
import NavYieldOverview from './components/NavYieldOverview';
import PortfolioBalance from './components/PortfolioBalance';
import AnnualYieldPanel from './components/AnnualYieldPanel';
import TransactionHistory from './components/TransactionHistory';
import MiniPerformanceChart from './components/MiniPerformanceChart';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import FundList from './components/FundList';
import InvestorDashboard from './pages/InvestorDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import InvestorLayout from './layouts/InvestorLayout';

// Placeholder components for routing
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <main className="flex-grow">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </div>
    </main>
  </div>
);

const DashboardLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <main className="flex-grow">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </div>
    </main>
  </div>
);

// Define a helper function to get dashboard path based on role
export function getDashboardByRole(role) {
  switch (role) {
    case ROLES.INVESTOR:
      return '/investor';
    case ROLES.MANAGER:
      return '/manager';
    case ROLES.ADMIN:
      return '/admin';
    default:
      return '/login';
  }
}

const LoginPage = () => <Login />;
const HomePage = () => <Home />;
const SignupPage = () => <div>Signup Page</div>;
const AboutPage = () => <div>About Page</div>;
const ForgotPasswordPage = () => <div>Forgot Password Page</div>;
const Dashboard = () => <div>Main Dashboard</div>;
const FundDetail = () => <div>Fund Detail</div>;
const PortfolioPage = () => <div>Portfolio Page</div>;
const SettingsPage = () => <div>Settings Page</div>;
const SupportPage = () => <div>Support Page</div>;
const NotFoundPage = () => (
  <div className="text-center py-12">
    <h1 className="text-4xl font-bold mb-6">404 - Page Not Found</h1>
    <p className="text-xl mb-8">The page you are looking for does not exist.</p>
  </div>
);

// Define the roles constant
export const ROLES = {
  INVESTOR: 'INVESTOR',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
};

// Helper function for formatting timestamps consistently
function formatTime(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle both string and numeric timestamps
    let date;
    
    if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
      // Handle numeric timestamp (Unix epoch)
      date = new Date(parseInt(timestamp, 10));
    } else {
      // Handle ISO string format timestamp
      date = new Date(timestamp);
    }
    
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid Date';
    }
    
    return date.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'Invalid Date';
  }
}

// Helper function for formatting percentages
function formatPercentage(value, digits = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%';
  }
  
  return `${value.toFixed(digits)}%`;
}

// Helper function for formatting dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
}

// Helper function for formatting dollar amounts
function formatDollarAmount(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  return formatCurrency(amount);
}

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_API || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

const FUNDS_QUERY = gql`
  query GetAllFunds {
    allFunds {
      id
      name
      chainId
      assetType
      inceptionDate
      intradayYield
      currentNav
      previousNav
      totalAum
      yieldHistory {
        timestamp
        yield
      }
      currentNAV {
        nav
        timestamp
        source
      }
    }
  }
`;

const MINT_SHARES = gql`
  mutation Mint($input: MintSharesInput!) {
    mintShares(input: $input) {
      sharesMinted
      navUsed
      timestamp
    }
  }
`;

const REDEEM_SHARES = gql`
  mutation Redeem($input: RedeemSharesInput!) {
    redeemShares(input: $input) {
      sharesRedeemed
      navUsed
      amountUsd
      timestamp
    }
  }
`;

const AUDIT_LOGS_QUERY = gql`
  query AuditLogs($fundId: ID!) {
    auditLogs(fundId: $fundId) {
      id
      timestamp
      actor
      action
      metadata
    }
  }
`;

export const PORTFOLIO_QUERY = gql`
  query GetPortfolio($fundId: ID!, $investorId: ID!) {
    portfolio(fundId: $fundId, investorId: $investorId) {
      investorId
      fundId
      shares
    }
    fund(id: $fundId) {
      currentNav
      previousNav
      intradayYield
      currentNAV {
        nav
      }
    }
  }
`;

// Define a reusable skeleton component
export function Skeleton({ className = "", width }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={width ? { width } : {}}
    />
  );
}

// Update toast configurations based on role
const getToastOptions = (role) => {
  const baseStyle = {
    duration: 4000,
    position: 'top-right',
  };
  
  if (role === 'INVESTOR') {
    return {
      ...baseStyle,
      style: {
        background: '#dcfce7',  // Light green background
        color: '#166534',       // Dark green text
        border: '1px solid #bbf7d0', // Light green border
      },
      iconTheme: {
        primary: '#22c55e',     // Green icon
        secondary: '#dcfce7',   // Light green background
      }
    };
  } else {
    return {
      ...baseStyle,
      style: {
        background: '#dbeafe',  // Light blue background
        color: '#1e40af',       // Dark blue text
        border: '1px solid #bfdbfe', // Light blue border
      },
      iconTheme: {
        primary: '#3b82f6',     // Blue icon
        secondary: '#dbeafe',   // Light blue background
      }
    };
  }
};

// Separate component to handle fund actions with tooltips
function InlineFundActions({ fund, mintShares, redeemShares, data }) {
  const { isAuthenticated, user, role } = useAuth();
  const apolloClient = useApolloClient();
  const [showMintTooltip, setShowMintTooltip] = useState(false);
  const [showRedeemTooltip, setShowRedeemTooltip] = useState(false);
  const [showWithdrawTooltip, setShowWithdrawTooltip] = useState(false);
  const [showAuditTooltip, setShowAuditTooltip] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  
  // Only allow investor actions if authenticated with proper role
  const canPerformInvestorActions = isAuthenticated && user && role === 'INVESTOR';
  const canViewAuditInfo = role === 'ADMIN' || role === 'MANAGER';
  
  const fundId = fund.id;
  const investorId = user?.id || localStorage.getItem('userId');

  const handleMint = async () => {
    if (!canPerformInvestorActions) {
      toast.error("Permission denied: Only investors can mint shares");
      return;
    }
    
    try {
      const amount = 500;
      if (amount <= 0 || isNaN(amount)) {
        return toast.error("Invalid amount");
      }
      
      const nav = fund.currentNAV.nav;
      const mintedShares = parseFloat((amount / nav).toFixed(2));
      
      const res = await mintShares({
        variables: { 
          input: {
            fundId: fund.id, 
            investorId: investorId, 
            amountUsd: amount
          }
        },
      });
      console.log('Mint response:', res);
      toast.success(
        `Successfully minted ${res.data.mintShares.sharesMinted.toFixed(2)} shares at $${res.data.mintShares.navUsed.toFixed(2)} per share.`,
        getToastOptions(role)
      );
    } catch (err) {
      console.error('Mint failed:', err);
      toast.error(`Mint failed: ${err.message}`, getToastOptions(role));
      return;
    }
  };
  
  const handleRedeem = async () => {
    if (!canPerformInvestorActions) {
      toast.error("Permission denied: Only investors can redeem shares");
      return;
    }
    
    try {
      const redeemedShares = 10;
      if (redeemedShares <= 0 || isNaN(redeemedShares)) {
        return toast.error("Invalid shares amount");
      }
      
      const res = await redeemShares({
        variables: { 
          input: {
            fundId: fund.id, 
            investorId: investorId, 
            shares: redeemedShares
          }
        },
      });
      console.log('Redeem response:', res);
      toast.success(`Redeemed ${redeemedShares} shares!`, getToastOptions(role));
    } catch (err) {
      console.error('Redeem failed:', err);
      toast.error(`Redeem failed: ${err.message}`, getToastOptions(role));
      return;
    }
  };

  const handleWithdrawYield = async () => {
    if (!canPerformInvestorActions) {
      toast.error("Permission denied: Only investors can withdraw yield");
      return;
    }
    
    // No investor ID indicates we're not authenticated
    if (!investorId) {
      toast.error("Please log in to withdraw yield", getToastOptions(role));
      return;
    }
    
    setWithdrawLoading(true);
    try {
      // Use client to execute GraphQL mutation directly
      const client = apolloClient;
      const result = await client.mutate({
        mutation: gql`
          mutation WithdrawYield($investorId: ID!, $fundId: ID!) {
            withdrawYield(investorId: $investorId, fundId: $fundId) {
              amount
              timestamp
            }
          }
        `,
        variables: {
          investorId,
          fundId
        }
      });
      
      setWithdrawLoading(false);
      
      if (result.data?.withdrawYield) {
        const { amount, timestamp } = result.data.withdrawYield;
        toast.success(`Successfully withdrawn $${amount.toFixed(2)} yield!`, 
          getToastOptions(role)
        );
      } else if (result.errors) {
        throw new Error(result.errors[0].message);
      }
    } catch (err) {
      console.error('❌ Withdraw yield failed:', err);
      toast.error(`Withdraw yield failed: ${err.message}`, getToastOptions(role));
      setWithdrawLoading(false);
      return;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
      {canPerformInvestorActions && (
        <>
          <div className="relative">
            <Button 
              variant="primary"
              onClick={handleMint}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
              onMouseEnter={() => setShowMintTooltip(true)}
              onMouseLeave={() => setShowMintTooltip(false)}
              onFocus={() => setShowMintTooltip(true)}
              onBlur={() => setShowMintTooltip(false)}
              aria-label="Mint new shares"
              title="Mint new shares into the fund"
            >
              + Mint Shares
            </Button>
            {showMintTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded shadow-lg z-10 mb-1 whitespace-nowrap">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                <p>Mint new shares based on current NAV</p>
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button 
              variant="secondary"
              onClick={handleRedeem}
              className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 transition-colors duration-300 text-white"
              onMouseEnter={() => setShowRedeemTooltip(true)}
              onMouseLeave={() => setShowRedeemTooltip(false)}
              onFocus={() => setShowRedeemTooltip(true)}
              onBlur={() => setShowRedeemTooltip(false)}
              aria-label="Redeem shares"
              title="Redeem existing shares from the fund"
            >
              - Redeem Shares
            </Button>
            {showRedeemTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded shadow-lg z-10 mb-1 whitespace-nowrap">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                <p>Redeem your shares for underlying assets</p>
              </div>
            )}
          </div>
          
          <div className="relative">
            <Button 
              variant="primary"
              onClick={handleWithdrawYield}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 transition-colors duration-300 text-white"
              onMouseEnter={() => setShowWithdrawTooltip(true)}
              onMouseLeave={() => setShowWithdrawTooltip(false)}
              onFocus={() => setShowWithdrawTooltip(true)}
              onBlur={() => setShowWithdrawTooltip(false)}
              aria-label="Withdraw accrued yield"
              title="Withdraw accrued yield from the fund"
            >
              Withdraw Yield
            </Button>
            {showWithdrawTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded shadow-lg z-10 mb-1 whitespace-nowrap">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                <p>Withdraw accrued yield from your investment</p>
              </div>
            )}
          </div>
        </>
      )}

      {canViewAuditInfo && (
        <div className="relative">
          <Button 
            variant="secondary"
            onClick={() => window.open('/print-report', '_blank')}
            className="w-full sm:w-auto"
            onMouseEnter={() => setShowAuditTooltip(true)}
            onMouseLeave={() => setShowAuditTooltip(false)}
            onFocus={() => setShowAuditTooltip(true)}
            onBlur={() => setShowAuditTooltip(false)}
          >
            🖨️ Print Audit Report
          </Button>
          {showAuditTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-gray-800 text-white text-sm px-3 py-1.5 rounded shadow-lg z-10 mb-1 whitespace-nowrap">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              <p>Print detailed audit report</p>
            </div>
          )}
        </div>
      )}

      {!canPerformInvestorActions && !canViewAuditInfo && (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center text-sm text-gray-600 dark:text-gray-300">
          <p>You don't have permission to perform actions on this fund.</p>
        </div>
      )}
    </div>
  );
}

function AuditLog({ fundId }) {
  const { role } = useAuth();
  const [filter, setFilter] = useState("ALL");
  const { loading, error, data } = useQuery(AUDIT_LOGS_QUERY, {
    variables: { fundId },
    skip: !fundId || role !== 'ADMIN',
    pollInterval: 30000, 
  });

  // If not admin, show a message instead of the log
  if (role !== 'ADMIN') {
    return (
      <Card>
        <div className="p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to view audit logs.
          </p>
        </div>
      </Card>
    );
  }

  const filteredLogs = data?.auditLogs?.filter(
    log => filter === "ALL" || log.action === filter
  ) || [];

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">Audit Log</h3>
        <select 
          onChange={(e) => setFilter(e.target.value)} 
          value={filter}
          className="text-sm border rounded p-1 bg-white dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="ALL">All</option>
          <option value="NAV_UPDATE">NAV Updates</option>
          <option value="MINT">Mint</option>
          <option value="REDEEM">Redeem</option>
        </select>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-400">Failed to load audit logs</p>
      ) : !filteredLogs.length ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs available</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{formatTime(log.timestamp)}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{log.actor}</span>
              </div>
              <p className="text-sm mt-1">{log.action}</p>
              {log.metadata && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{JSON.stringify(log.metadata)}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [managerView, setManagerView] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleAdminView = () => setAdminView(!adminView);
  const toggleManagerView = () => setManagerView(!managerView);
  
  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <PortfolioProvider>
      <Toaster position="top-right" />
      <div className="App">
        <Header 
          toggleDarkMode={toggleDarkMode} 
          adminView={adminView}
          toggleAdminView={toggleAdminView}
          managerView={managerView}
          toggleManagerView={toggleManagerView}
        />
        <div className="pt-20"> {/* Add padding to account for fixed header */}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <PublicLayout>
                <Header 
                  toggleDarkMode={toggleDarkMode} 
                  adminView={adminView}
                  toggleAdminView={toggleAdminView}
                  managerView={managerView}
                  toggleManagerView={toggleManagerView}
                />
                <div className="pt-20">
                  <HomePage />
                </div>
              </PublicLayout>
            } />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><SignupPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

            {/* Investor routes */}
            <Route path="/investor/*" element={
              <PrivateRoute allowedRoles={[ROLES.INVESTOR]}>
                <InvestorLayout />
              </PrivateRoute>
            }>
              <Route index element={<InvestorDashboard />} />
              <Route path="portfolio" element={<div>Portfolio</div>} />
              <Route path="transactions" element={<div>Transactions</div>} />
              <Route path="settings" element={<div>Settings</div>} />
            </Route>

            {/* Manager routes */}
            <Route path="/manager" element={
              <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
                <ManagerPage />
              </PrivateRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="funds" element={<div>Funds Management</div>} />
              <Route path="users" element={<div>User Management</div>} />
              <Route path="audit" element={<div>Audit Logs</div>} />
              <Route path="nav" element={<div>NAV Controls</div>} />
              <Route path="yield" element={<div>Yield Controls</div>} />
              <Route path="settings" element={<div>Settings</div>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </PortfolioProvider>
  );
}