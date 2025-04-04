import { useState, useEffect, createContext, useContext } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useMutation
} from '@apollo/client';
import toast, { Toaster } from 'react-hot-toast';
import { Card, CardContent, Button } from './components/ui';
import DualChart from './components/DualChart';
import DeltaBadge from './components/DeltaBadge';
import YieldBadge from './components/YieldBadge';
import AccruedYield from './components/AccruedYield';
import Header from './components/Header';
import FundCard from './components/FundCard';
import { formatUSD, formatAUM } from './utils/formatCurrency';
import CountUp from 'react-countup';
import { timeAgo } from './utils/timeAgo';

// Helper function for formatting timestamps consistently
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
}

const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
});

const RoleContext = createContext();
export const useRole = () => useContext(RoleContext);

const FUNDS_QUERY = gql`
  query GetAllFunds {
    allFunds {
      id
      name
      chainId
      assetType
      inceptionDate
      intradayYield
      totalAum
      currentNav
      navHistory {
        id
        timestamp
        nav
        source
      }
      yieldHistory {
        timestamp
        yield
      }
    }
  }
`;

const FUND_DETAIL_QUERY = gql`
  query GetFundDetail($id: ID!) {
    fund(id: $id) {
      id
      name
      chainId
      assetType
      inceptionDate
      intradayYield
      totalAum
      currentNav
      navHistory {
        id
        timestamp
        nav
        source
      }
      yieldHistory {
        timestamp
        yield
      }
    }
  }
`;

const MINT_SHARES = gql`
  mutation MintShares($input: MintSharesInput!) {
    mintShares(input: $input) {
      sharesMinted
      navUsed
      timestamp
    }
  }
`;

const REDEEM_SHARES = gql`
  mutation RedeemShares($input: RedeemSharesInput!) {
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
      target
      metadata
    }
  }
`;

export const PORTFOLIO_QUERY = gql`
  query GetPortfolio($investorId: ID!, $fundId: ID!) {
    user(id: $investorId) {
      id
      name
      holdings {
        fundId
        shares
      }
    }
    fund(id: $fundId) {
      intradayYield
      currentNav
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
function FundActions({ fund, role, mintShares, redeemShares, data }) {
  const [showMintTooltip, setShowMintTooltip] = useState(false);
  const [showRedeemTooltip, setShowRedeemTooltip] = useState(false);
  
  const handleMint = async () => {
    try {
      const amount = 500;
      if (amount <= 0 || isNaN(amount)) {
        return toast.error("Invalid amount");
      }
      
      const nav = fund.currentNav;
      const mintedShares = parseFloat((amount / nav).toFixed(2));
      
      const res = await mintShares({
        variables: { 
          input: {
            fundId: fund.id, 
            investorId: '1', 
            amountUsd: amount
          }
        },
      });
      console.log('✅ Mint response:', res);
      toast.success(
        `Successfully minted ${res.data.mintShares.sharesMinted.toFixed(2)} shares at $${res.data.mintShares.navUsed.toFixed(2)} per share.`,
        getToastOptions(role)
      );
    } catch (err) {
      console.error('❌ Mint failed:', err);
      toast.error(`Mint failed: ${err.message}`, getToastOptions(role));
    }
  };
  
  const handleRedeem = async () => {
    try {
      const redeemedShares = 10;
      if (redeemedShares <= 0 || isNaN(redeemedShares)) {
        return toast.error("Invalid shares amount");
      }
      
      const res = await redeemShares({
        variables: { 
          input: {
            fundId: fund.id, 
            investorId: '1', 
            shares: redeemedShares
          }
        },
      });
      console.log('✅ Redeem response:', res);
      toast.success(`Redeemed ${redeemedShares} shares!`, getToastOptions(role));
    } catch (err) {
      console.error('❌ Redeem failed:', err);
      toast.error(`Redeem failed: ${err.message}`, getToastOptions(role));
    }
  };
  
  return (
    <div className="flex gap-2">
      {role === 'INVESTOR' && (
        <>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            onClick={handleMint}
            onMouseEnter={() => setShowMintTooltip(true)}
            onMouseLeave={() => setShowMintTooltip(false)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Mint $500
          </button>
          <button
            className="bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 text-sm"
            onClick={handleRedeem}
            onMouseEnter={() => setShowRedeemTooltip(true)}
            onMouseLeave={() => setShowRedeemTooltip(false)}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Redeem 10 Shares
          </button>
        </>
      )}
    </div>
  );
}

// Main Fund List Component that displays all available funds
function FundList() {
  const [selectedFundId, setSelectedFundId] = useState(null);
  const { loading, error, data, refetch } = useQuery(FUNDS_QUERY, {
    pollInterval: 15000, // Poll every 15 seconds
  });
  
  const [mintShares] = useMutation(MINT_SHARES, {
    refetchQueries: [{ query: FUNDS_QUERY }],
  });
  
  const [redeemShares] = useMutation(REDEEM_SHARES, {
    refetchQueries: [{ query: FUNDS_QUERY }],
  });
  
  const { role } = useRole();
  
  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);
  
  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 dark:border-gray-700">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2 dark:bg-gray-700"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-3 dark:bg-gray-700"></div>
          <div className="h-24 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-950 dark:border-red-500">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading funds</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const funds = data?.allFunds || [];
  
  if (funds.length === 0) return <div>No funds available.</div>;
  
  // If no fund is selected, select the first one
  useEffect(() => {
    if (funds.length > 0 && !selectedFundId) {
      setSelectedFundId(funds[0].id);
    }
  }, [funds, selectedFundId]);
  
  // Get the selected fund
  const selectedFund = funds.find(fund => fund.id === selectedFundId) || funds[0];
  
  const lastUpdate = formatTime(new Date().toISOString());
  
  // Format the inception date
  const formattedInceptionDate = selectedFund.inceptionDate ? 
    new Date(selectedFund.inceptionDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'N/A';
  
  // Format yield history for charts
  const yieldHistory = selectedFund.yieldHistory.slice(-100).map(item => ({
    time: item.timestamp,
    value: item.yield,
  }));
  
  // Format NAV history for charts
  const navHistory = selectedFund.navHistory ? selectedFund.navHistory.slice(-100).map(item => ({
    time: item.timestamp,
    value: item.nav,
  })) : [];
  
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {funds.map(fund => (
          <FundCard 
            key={fund.id} 
            fund={fund} 
            onClick={(id) => setSelectedFundId(id)}
            isSelected={fund.id === selectedFundId}
          />
        ))}
      </div>
      
      <Card className="relative">
        <CardContent>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-medium">{selectedFund.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFund.assetType} • {selectedFund.chainId} • Inception: {formattedInceptionDate}
              </p>
            </div>
            <FundActions
              fund={selectedFund}
              role={role}
              mintShares={mintShares}
              redeemShares={redeemShares}
              data={data}
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current NAV</div>
              <div className="text-2xl font-bold flex items-center">
                <CountUp
                  start={selectedFund.currentNav - 0.1}
                  end={selectedFund.currentNav}
                  duration={0.5}
                  decimals={2}
                  prefix="$"
                />
                <DeltaBadge className="ml-2" 
                  value={(selectedFund.navHistory && selectedFund.navHistory.length > 1) 
                    ? selectedFund.currentNav - selectedFund.navHistory[selectedFund.navHistory.length - 2].nav 
                    : 0} 
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Intraday Yield</div>
              <div className="text-2xl font-bold flex items-center">
                <CountUp
                  start={selectedFund.intradayYield - 0.01}
                  end={selectedFund.intradayYield}
                  duration={0.5}
                  decimals={3}
                  suffix="%"
                />
                <YieldBadge className="ml-2" value={0.01} />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total AUM</div>
              <div className="text-2xl font-bold">
                {formatAUM(selectedFund.totalAum)}
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <DualChart yieldData={yieldHistory} navData={navHistory} />
          </div>
          
          <div className="text-right text-xs text-gray-500 mt-2 dark:text-gray-400">
            Last Updated: {lastUpdate}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Portfolio panel to display user's holdings of a specific fund
function PortfolioPanel({ fundId }) {
  const { loading, error, data } = useQuery(PORTFOLIO_QUERY, {
    variables: { investorId: '1', fundId },
    pollInterval: 5000,
  });
  
  if (loading) return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-red-600 dark:text-red-400">
      Error loading portfolio: {error.message}
    </div>
  );
  
  if (!data?.user) return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
      No portfolio data available. Try minting some shares.
    </div>
  );
  
  const holdings = data.user.holdings.find(h => h.fundId === fundId);
  
  // If no holdings for this fund
  if (!holdings || !holdings.shares) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">You don't own any shares of this fund yet.</p>
        <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Mint shares to get started
        </button>
      </div>
    );
  }
  
  const shares = holdings.shares;
  const nav = data.fund.currentNav;
  const yield_ = data.fund.intradayYield;
  const value = shares * nav;
  
  // Calculate accrued yield
  const dailyYield = value * (yield_ / 100) / 365; // Daily yield
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-medium">Your Portfolio</h3>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Shares Owned</div>
          <div className="font-medium">{shares.toFixed(2)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
          <div className="font-medium">{formatUSD(value)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Intraday Yield</div>
          <div className="font-medium">{yield_.toFixed(4)}%</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Accrued Today</div>
          <AccruedYield value={dailyYield} />
        </div>
      </div>
    </div>
  );
}

// Audit log panel for admins
function AuditLog({ fundId }) {
  const { loading, error, data } = useQuery(AUDIT_LOGS_QUERY, {
    variables: { fundId },
    pollInterval: 15000,
  });
  
  if (loading) return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-red-600 dark:text-red-400">
      Error loading audit logs: {error.message}
    </div>
  );
  
  if (!data?.auditLogs || data.auditLogs.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400 text-center py-3">No audit logs available.</div>;
  }
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-medium">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
        {data.auditLogs.slice(0, 10).map(log => (
          <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex justify-between">
              <span className="font-medium text-gray-900 dark:text-gray-100">{log.action}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(log.timestamp)}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">By {log.actor}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {log.metadata && typeof log.metadata === 'object' && (
                <ul className="space-y-1">
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {
                        typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : value.toString()
                      }
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('INVESTOR');
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference, default to system preference
    const saved = localStorage.getItem('darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    // Apply the dark mode class to the document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  // Handler for preventing button focus
  const preventFocus = (e) => {
    e.preventDefault();
    if (e.relatedTarget) {
      e.relatedTarget.blur();
    }
    if (e.currentTarget) {
      e.currentTarget.blur();
    }
  };
  
  // Switch role between investor and admin
  const toggleRole = () => {
    setRole(role === 'INVESTOR' ? 'ADMIN' : 'INVESTOR');
    toast.success(
      `Switched to ${role === 'INVESTOR' ? 'ADMIN' : 'INVESTOR'} mode`,
      getToastOptions(role === 'INVESTOR' ? 'ADMIN' : 'INVESTOR')
    );
  };
  
  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header
          role={role} 
          toggleRole={toggleRole}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <main className="container mx-auto px-4 py-6 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <FundList />
            </div>
            <div className="space-y-4">
              <PortfolioPanel fundId="F1" />
              {role === 'ADMIN' && <AuditLog fundId="F1" />}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </RoleContext.Provider>
  );
}