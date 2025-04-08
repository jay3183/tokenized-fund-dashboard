import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, gql } from '@apollo/client';
import { Card } from '../components/ui';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatNumber';

// Query to get all transactions
const GET_TRANSACTIONS = gql`
  query GetAllTransactions($investorId: ID!) {
    userTransactions(userId: $investorId) {
      id
      type
      date
      amount
      shares
      navPrice
      status
      fundId
      fundName
    }
  }
`;

// Define transaction types and their colors
const TRANSACTION_TYPES = {
  MINT: { label: 'Purchase', color: 'bg-green-100 text-green-800' },
  REDEEM: { label: 'Sell', color: 'bg-red-100 text-red-800' },
  YIELD_WITHDRAWAL: { label: 'Yield Withdrawal', color: 'bg-blue-100 text-blue-800' },
  DISTRIBUTION: { label: 'Distribution', color: 'bg-purple-100 text-purple-800' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
};

export default function InvestorTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: 'ALL',
    dateRange: 'ALL',
    search: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  const { data, loading, error } = useQuery(GET_TRANSACTIONS, {
    variables: { investorId: user?.id || '' },
    skip: !user?.id,
    pollInterval: 60000, // Refresh every minute
    onError: (error) => {
      console.error('Transaction query error:', error);
    }
  });
  
  // When data changes, update the transactions state
  useEffect(() => {
    if (data?.userTransactions) {
      setTransactions(data.userTransactions);
    }
  }, [data]);
  
  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filters.type !== 'ALL' && transaction.type !== filters.type) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange !== 'ALL') {
      const txDate = new Date(transaction.date);
      const now = new Date();
      
      if (filters.dateRange === 'LAST_7_DAYS') {
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        if (txDate < lastWeek) return false;
      } else if (filters.dateRange === 'LAST_30_DAYS') {
        const lastMonth = new Date(now.setDate(now.getDate() - 30));
        if (txDate < lastMonth) return false;
      } else if (filters.dateRange === 'LAST_YEAR') {
        const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
        if (txDate < lastYear) return false;
      }
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(searchTerm) ||
        transaction.fundName.toLowerCase().includes(searchTerm) ||
        transaction.type.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });
  
  // Sort transactions based on sort config
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Handle sort request
  const requestSort = (key) => {
    setSortConfig(prevSortConfig => {
      // If clicking the same column, toggle direction
      if (prevSortConfig.key === key) {
        return {
          key,
          direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      
      // Otherwise, sort by the new column in ascending order
      return { key, direction: 'asc' };
    });
  };
  
  // Get sort indicator for table headers
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };
  
  if (!user) {
    return (
      <div className="text-center text-red-500 my-8">
        User not authenticated.
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Transaction History</h1>
        <Card>
          <div className="p-6 animate-pulse">
            <div className="h-10 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Transaction History</h1>
        <Card>
          <div className="p-6 text-red-500">
            Error loading transactions: {error.message}
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Transaction History</h1>
      
      {/* Filter Controls */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Filters</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <option value="ALL">All Types</option>
                <option value="MINT">Purchase</option>
                <option value="REDEEM">Sell</option>
                <option value="YIELD_WITHDRAWAL">Yield Withdrawal</option>
                <option value="DISTRIBUTION">Distribution</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="ALL">All Time</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="LAST_YEAR">Last Year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          {sortedTransactions.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('date')}
                  >
                    Date{getSortIndicator('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('amount')}
                  >
                    Amount{getSortIndicator('amount')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                    onClick={() => requestSort('shares')}
                  >
                    Shares{getSortIndicator('shares')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    NAV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Fund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedTransactions.map((transaction) => {
                  const txType = TRANSACTION_TYPES[transaction.type] || TRANSACTION_TYPES.OTHER;
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${txType.color}`}>
                          {txType.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {formatCurrency(transaction.amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {transaction.shares || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {transaction.navPrice ? formatCurrency(transaction.navPrice) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {transaction.fundName || transaction.fundId || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {transaction.id.slice(0, 10)}...
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No transactions found matching your filters.
            </div>
          )}
        </div>
      </Card>
      
      {/* Information about transaction types */}
      <div className="mt-6 bg-white shadow-sm rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-medium text-slate-800 mb-3">About Transaction Types</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className={`inline-block mb-2 px-2 py-1 text-xs font-medium rounded-full ${TRANSACTION_TYPES.MINT.color}`}>
              {TRANSACTION_TYPES.MINT.label}
            </span>
            <p className="text-sm text-slate-600">Purchase of fund shares</p>
          </div>
          <div>
            <span className={`inline-block mb-2 px-2 py-1 text-xs font-medium rounded-full ${TRANSACTION_TYPES.REDEEM.color}`}>
              {TRANSACTION_TYPES.REDEEM.label}
            </span>
            <p className="text-sm text-slate-600">Sale of fund shares</p>
          </div>
          <div>
            <span className={`inline-block mb-2 px-2 py-1 text-xs font-medium rounded-full ${TRANSACTION_TYPES.YIELD_WITHDRAWAL.color}`}>
              {TRANSACTION_TYPES.YIELD_WITHDRAWAL.label}
            </span>
            <p className="text-sm text-slate-600">Withdrawal of accrued yield</p>
          </div>
          <div>
            <span className={`inline-block mb-2 px-2 py-1 text-xs font-medium rounded-full ${TRANSACTION_TYPES.DISTRIBUTION.color}`}>
              {TRANSACTION_TYPES.DISTRIBUTION.label}
            </span>
            <p className="text-sm text-slate-600">Automated distribution payment</p>
          </div>
        </div>
      </div>
    </div>
  );
} 