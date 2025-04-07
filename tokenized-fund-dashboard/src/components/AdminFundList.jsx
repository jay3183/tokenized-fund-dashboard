import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const AdminFundList = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // Mock data for demonstration
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockFunds = [
          {
            id: 'fund1',
            name: 'OnChain Growth Fund',
            nav: 102.45,
            aum: 3245600,
            investors: 48,
            yield: 4.2,
            dailyChange: 0.32,
            status: 'active',
            type: 'growth',
            chain: 'ethereum'
          },
          {
            id: 'fund2',
            name: 'Fixed Income Fund',
            nav: 98.75,
            aum: 2180000,
            investors: 36,
            yield: 3.8,
            dailyChange: -0.15,
            status: 'active',
            type: 'income',
            chain: 'polygon'
          },
          {
            id: 'fund3',
            name: 'Tech Innovation ETF',
            nav: 115.32,
            aum: 1840000,
            investors: 29,
            yield: 1.9,
            dailyChange: 1.24,
            status: 'active',
            type: 'sector',
            chain: 'ethereum'
          },
          {
            id: 'fund4',
            name: 'Balanced Portfolio',
            nav: 105.18,
            aum: 980000,
            investors: 18,
            yield: 3.1,
            dailyChange: 0.08,
            status: 'active',
            type: 'balanced',
            chain: 'avalanche'
          },
          {
            id: 'fund5',
            name: 'Global Market Index',
            nav: 110.27,
            aum: 0,
            investors: 0,
            yield: 2.7,
            dailyChange: 0.45,
            status: 'inactive',
            type: 'index',
            chain: 'polygon'
          },
          {
            id: 'fund6',
            name: 'Crypto Blue Chip',
            nav: 88.64,
            aum: 0,
            investors: 0,
            yield: 5.8,
            dailyChange: -1.35,
            status: 'inactive',
            type: 'crypto',
            chain: 'ethereum'
          },
          {
            id: 'fund7',
            name: 'Sustainable Future',
            nav: 103.92,
            aum: 736000,
            investors: 12,
            yield: 2.3,
            dailyChange: 0.17,
            status: 'active',
            type: 'esg',
            chain: 'avalanche'
          },
        ];
        
        setFunds(mockFunds);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching funds:', err);
        setError('Failed to load funds. Please try again.');
        setLoading(false);
      }
    };
    
    fetchFunds();
  }, []);
  
  // Handle toggling fund status
  const handleToggleFundStatus = (fundId) => {
    setFunds(funds.map(fund => 
      fund.id === fundId 
        ? { ...fund, status: fund.status === 'active' ? 'inactive' : 'active' } 
        : fund
    ));
  };
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted and filtered data
  const getSortedFunds = () => {
    let sortableFunds = [...funds];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      sortableFunds = sortableFunds.filter(fund => fund.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sortableFunds = sortableFunds.filter(fund => 
        fund.name.toLowerCase().includes(query) || 
        fund.type.toLowerCase().includes(query) ||
        fund.chain.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      sortableFunds.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableFunds;
  };
  
  const sortedAndFilteredFunds = getSortedFunds();
  
  // Header for sortable columns
  const SortableHeader = ({ children, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 select-none"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {isSorted && (
            <span>
              {sortConfig.direction === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </span>
          )}
        </div>
      </th>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Fund Management
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search funds..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Funds</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <div className="text-red-500 dark:text-red-400">{error}</div>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : sortedAndFilteredFunds.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No funds match your search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <SortableHeader sortKey="name">Fund Name</SortableHeader>
                <SortableHeader sortKey="nav">NAV</SortableHeader>
                <SortableHeader sortKey="aum">AUM</SortableHeader>
                <SortableHeader sortKey="investors">Investors</SortableHeader>
                <SortableHeader sortKey="yield">Yield</SortableHeader>
                <SortableHeader sortKey="dailyChange">Daily</SortableHeader>
                <SortableHeader sortKey="status">Status</SortableHeader>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAndFilteredFunds.map((fund) => (
                <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                        {fund.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{fund.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {fund.type} | {fund.chain}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(fund.nav)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {fund.aum ? formatCurrency(fund.aum) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {fund.investors || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    {formatPercentage(fund.yield)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`
                      ${fund.dailyChange >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                      }
                    `}>
                      {fund.dailyChange >= 0 ? '+' : ''}{formatPercentage(fund.dailyChange)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleFundStatus(fund.id)}
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                          ${fund.status === 'active' ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}
                        `}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                            transition duration-200 ease-in-out
                            ${fund.status === 'active' ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>
                      <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {fund.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Fund"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Update NAV/Yield"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </button>
                      <button 
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                        title="View Investors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <button className="bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-dark transition-colors text-sm">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Fund
          </span>
        </button>
      </div>
    </div>
  );
};

export default AdminFundList; 