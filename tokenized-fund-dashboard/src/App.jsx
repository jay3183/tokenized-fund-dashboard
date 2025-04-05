import { useState, useEffect } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useMutation
} from '@apollo/client';
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
import { formatUSD, formatAUM } from './utils/formatCurrency';
import CountUp from 'react-countup';
import { format, parseISO } from 'date-fns';
import { timeAgo } from './utils/timeAgo';
import { useRole } from './RoleContext';

// Helper function for formatting timestamps consistently
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString([], { 
    month: 'short',
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
}

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_API,
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
  query GetPortfolio($fundId: ID!) {
    portfolio(fundId: $fundId, investorId: "1") {
      investorId
      fundId
      shares
    }
    fund(id: $fundId) {
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
function FundActions({ fund, role, mintShares, redeemShares, data }) {
  const [showMintTooltip, setShowMintTooltip] = useState(false);
  const [showRedeemTooltip, setShowRedeemTooltip] = useState(false);
  const [showWithdrawTooltip, setShowWithdrawTooltip] = useState(false);
  
  const handleMint = async () => {
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
            investorId: '1', 
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
      console.log('Redeem response:', res);
      toast.success(`Redeemed ${redeemedShares} shares!`, getToastOptions(role));
    } catch (err) {
      console.error('Redeem failed:', err);
      toast.error(`Redeem failed: ${err.message}`, getToastOptions(role));
    }
  };

  const handleWithdrawYield = async () => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation WithdrawYield($investorId: ID!, $fundId: ID!) {
              withdrawYield(investorId: $investorId, fundId: $fundId) {
                amount
                timestamp
              }
            }
          `,
          variables: {
            investorId: '1',
            fundId: fund.id
          }
        })
      });

      const result = await response.json();
      console.log('Yield withdrawn:', result);
      
      if (result.data && result.data.withdrawYield) {
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
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
      <div className="relative">
        <Button 
          variant="primary"
          onClick={handleMint}
          disabled={role !== 'INVESTOR'}
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
    </div>
  );
}

function FundList() {
  const { role } = useRole();
  const { loading, error, data, refetch } = useQuery(FUNDS_QUERY);
  const [mintShares] = useMutation(MINT_SHARES);
  const [redeemShares] = useMutation(REDEEM_SHARES);
  const [accruedToday, setAccruedToday] = useState(164.77); // simulate accrued yield
  
  console.log('FundList - Current Role:', role);
  
  // Create state variables outside of the map function
  const [prevNavMap, setPrevNavMap] = useState({});
  const [prevYieldMap, setPrevYieldMap] = useState({});

  useEffect(() => {
    if (data?.allFunds) {
      // Initialize or update the prev values
      const newNavMap = {...prevNavMap};
      const newYieldMap = {...prevYieldMap};
      
      data.allFunds.forEach(fund => {
        if (!prevNavMap[fund.id] || prevNavMap[fund.id] !== fund.currentNAV.nav) {
          newNavMap[fund.id] = fund.currentNAV.nav;
        }
        if (!prevYieldMap[fund.id] || prevYieldMap[fund.id] !== fund.intradayYield) {
          newYieldMap[fund.id] = fund.intradayYield;
        }
      });
      
      setPrevNavMap(newNavMap);
      setPrevYieldMap(newYieldMap);
    }
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) return <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading...</div>;

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md mx-4 my-6">
        <strong className="block mb-1">GraphQL Error:</strong>
        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div className="grid gap-6 px-4 sm:px-6 md:px-10 lg:px-32 max-w-5xl mx-auto">
      {data.allFunds.map((fund) => {
        // Use the stored previous values
        const prevNav = prevNavMap[fund.id] || fund.currentNAV.nav;
        const prevYield = prevYieldMap[fund.id] || fund.intradayYield;
        
        return (
          <Card key={fund.id} className="rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="space-y-3 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{fund.name}</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-x-6 gap-y-1">
                <p>Asset Type: <span className="font-medium">{fund.assetType}</span></p>
                <p>Chain: <span className="font-medium">{fund.chainId}</span></p>
                {fund.inceptionDate && <p>Inception: <span className="font-medium">{new Date(fund.inceptionDate).toLocaleDateString()}</span></p>}
                <p>Fund ID: <span className="font-medium">{fund.id}</span></p>
              </div>
              <p className="text-lg font-medium flex items-center gap-2">
                NAV:{' '}
                <span 
                  className={`font-semibold transition-all duration-500 ${
                    (fund.currentNAV?.nav ?? 0) > (prevNav ?? 0) 
                      ? "text-green-600 dark:text-green-400" 
                      : (fund.currentNAV?.nav ?? 0) < (prevNav ?? 0) 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  <CountUp
                    end={fund.currentNAV?.nav ?? 0}
                    duration={0.75}
                    decimals={2}
                    prefix="$"
                    separator=","
                  />
                </span>
                <span className="transition duration-300 ease-in-out">
                  <DeltaBadge 
                    delta={prevNav && prevNav !== 0 
                      ? ((fund.currentNAV?.nav - prevNav) / prevNav) * 100 
                      : 0.01}
                  />
                </span>
              </p>
              
              <p className="text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Tooltip message="Total Assets Under Management (AUM) in USD.">
                    <div className="inline-flex">
                      <InfoIcon />
                    </div>
                  </Tooltip>
                  <span className="ml-1">Total AUM:{' '}</span>
                </span>
                <span className="font-semibold text-black dark:text-white">
                  {formatAUM(fund.totalAum)}
                </span>
              </p>
              
              {/* Intraday Yield Display */}
              <div className="flex items-center">
                <p className="text-sm text-gray-700 flex items-center flex-wrap">
                  <span className="font-semibold">Intraday Yield: </span>
                  <span 
                    className={`ml-1 font-semibold transition-all duration-500 ${
                      (fund.intradayYield ?? 0) >= 0
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    } ${
                      (fund.intradayYield ?? 0) > (prevYield ?? 0)
                        ? "animate-pulse"
                        : (fund.intradayYield ?? 0) < (prevYield ?? 0)
                          ? "animate-pulse"
                          : ""
                    }`}
                  >
                    {(fund.intradayYield ?? 0) >= 0 ? "+" : ""}
                    <CountUp
                      end={fund.intradayYield ?? 0}
                      duration={0.75}
                      suffix="%"
                      decimals={2}
                    />
                    {(fund.intradayYield ?? 0) > (prevYield ?? 0)
                      ? '↑'
                      : (fund.intradayYield ?? 0) < (prevYield ?? 0)
                        ? '↓'
                        : ''}
                  </span>
                </p>
              </div>
              
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Updated: {timeAgo(fund.currentNAV.timestamp)}
              </p>
              
              {/* Chart display */}
              <DualChart fundId={fund.id} />
              
              {role === 'INVESTOR' && (
                <>
                  <PortfolioPanel fundId="F1" investorId="I1" />
                </>
              )}
              {role === 'ADMIN' && (
                <>
                  <AuditLog fundId={fund.id} />
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => window.open('/print-report', '_blank')}
                      className="flex items-center gap-1"
                    >
                      🖨️ Print Audit Report
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AuditLog({ fundId }) {
  const [filter, setFilter] = useState("ALL");
  const { loading, error, data } = useQuery(AUDIT_LOGS_QUERY, {
    variables: { fundId },
    skip: !fundId,
    pollInterval: 30000, 
  });

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
  useEffect(() => {
    // Add transition classes to body when component mounts
    document.body.classList.add('transition-colors', 'duration-300');
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('transition-colors', 'duration-300');
    };
  }, []);
  
  // Function to toggle dark mode with smooth transition
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  };
  
  // Check for saved preference on initial load
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <Header onToggleTheme={toggleDarkMode} />
        <div className="pt-24 px-4 max-w-7xl mx-auto">
          <FundList />
        </div>
      </div>
    </>
  );
}