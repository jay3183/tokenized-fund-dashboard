import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent } from '../components/ui';
import { formatAUM } from '../utils/formatCurrency';
import { timeAgo } from '../utils/timeAgo';
import DeltaBadge from './DeltaBadge';
import YieldBadge from './YieldBadge';
import { useAuth } from '../RoleContext';

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

export default function FundList({ onSelectFund }) {
  const { role } = useAuth();
  const { loading, error, data, refetch } = useQuery(FUNDS_QUERY);
  const [selectedFundIdx, setSelectedFundIdx] = useState(0);
  
  console.log("FundList - Current Role:", role);
  
  useEffect(() => {
    // Setup polling for periodic updates
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetch]);
  
  const handleSelectFund = (index) => {
    setSelectedFundIdx(index);
    // Call onSelectFund callback with the selected fund
    onSelectFund && onSelectFund(data?.allFunds?.[index] || null);
  };

  if (loading) return <div className="p-4">Loading funds...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading funds: {error.message}</div>;
  if (!data || !data.allFunds || data.allFunds.length === 0) {
    return <div className="p-4">No funds available</div>;
  }

  return (
    <div className="space-y-4">
      {data.allFunds.map((fund, idx) => {
        // Calculate current NAV difference for delta badges
        const currentNav = parseFloat(fund.currentNav || 0);
        const previousNav = parseFloat(fund.previousNav || 0);
        const hasChange = previousNav > 0;
        const navDiff = hasChange ? currentNav - previousNav : 0;
        const navPercentChange = hasChange ? (navDiff / previousNav) * 100 : 0;
        
        console.log(`[DEBUG] Fund ${fund.name} NAV Values from server:`, {
          currentNav: fund.currentNav,
          previousNav: fund.previousNav, 
          delta: navDiff
        });
        
        const isSelected = idx === selectedFundIdx;
        
        return (
          <Card 
            key={fund.id || idx} 
            onClick={() => handleSelectFund(idx)}
            className={`cursor-pointer transition-all duration-200 ${
              isSelected 
                ? 'border-blue-500 shadow-md dark:border-blue-400'
                : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-700'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{fund.name}</h3>
                {isSelected && (
                  <div className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                {hasChange && (
                  <DeltaBadge direction={navDiff >= 0 ? 'up' : 'down'} value={`${Math.abs(navPercentChange).toFixed(2)}%`} />
                )}
                <YieldBadge value={`${fund.intradayYield}%`} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2 mt-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current NAV</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${currentNav.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total AUM</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${formatAUM(fund.totalAum)}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Updated {timeAgo(fund.currentNAV?.timestamp || new Date())}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 