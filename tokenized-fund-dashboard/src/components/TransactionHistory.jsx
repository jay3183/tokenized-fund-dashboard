import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: 't1',
    type: 'MINT',
    date: '2023-04-01T10:30:00Z',
    amount: 5000,
    shares: 51.02,
    navPrice: 97.98,
    status: 'CONFIRMED'
  },
  {
    id: 't2',
    type: 'YIELD_PAYMENT',
    date: '2023-04-02T14:15:00Z',
    amount: 120.50,
    status: 'CONFIRMED'
  },
  {
    id: 't3',
    type: 'REDEEM',
    date: '2023-04-05T09:45:00Z',
    amount: 2000,
    shares: 20.28,
    navPrice: 98.61,
    status: 'CONFIRMED'
  },
  {
    id: 't4',
    type: 'MINT',
    date: '2023-04-10T11:20:00Z',
    amount: 10000,
    shares: 100.87,
    navPrice: 99.14,
    status: 'CONFIRMED'
  },
  {
    id: 't5',
    type: 'YIELD_PAYMENT',
    date: '2023-04-15T16:30:00Z',
    amount: 245.75,
    status: 'CONFIRMED'
  },
  {
    id: 't6',
    type: 'REDEEM',
    date: '2023-04-20T13:10:00Z',
    amount: 4000,
    shares: 40.12,
    navPrice: 99.70,
    status: 'CONFIRMED'
  },
  {
    id: 't7',
    type: 'MINT',
    date: '2023-04-25T10:05:00Z',
    amount: 7500,
    shares: 75.03,
    navPrice: 99.96,
    status: 'CONFIRMED'
  },
  {
    id: 't8',
    type: 'YIELD_PAYMENT',
    date: '2023-04-30T15:45:00Z',
    amount: 310.25,
    status: 'CONFIRMED'
  },
  {
    id: 't9',
    type: 'YIELD_PAYMENT',
    date: '2023-05-01T15:45:00Z',
    amount: 62.30,
    status: 'CONFIRMED'
  },
  {
    id: 't10',
    type: 'REDEEM',
    date: '2023-05-05T14:20:00Z',
    amount: 3000,
    shares: 29.94,
    navPrice: 100.21,
    status: 'CONFIRMED'
  },
  {
    id: 't11',
    type: 'MINT',
    date: '2023-05-10T11:15:00Z',
    amount: 15000,
    shares: 149.44,
    navPrice: 100.38,
    status: 'CONFIRMED'
  },
  {
    id: 't12',
    type: 'YIELD_PAYMENT',
    date: '2023-05-15T16:40:00Z',
    amount: 412.90,
    status: 'CONFIRMED'
  }
];

const TRANSACTION_TYPES = {
  MINT: 'Mint',
  REDEEM: 'Redeem',
  YIELD_PAYMENT: 'Yield Payment',
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isDownloading, setIsDownloading] = useState(false);
  
  const transactionsPerPage = 6;
  
  // Fetch transactions data
  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setTransactions(MOCK_TRANSACTIONS);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  // Apply filters
  useEffect(() => {
    // Apply type filter
    let result = transactions;
    
    if (filter !== 'ALL') {
      result = result.filter(t => t.type === filter);
    }
    
    // Apply date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      result = result.filter(t => new Date(t.date) >= fromDate);
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(t => new Date(t.date) <= toDate);
    }
    
    setFilteredTransactions(result);
    setCurrentPage(1);
  }, [transactions, filter, dateRange]);
  
  // Get current page transactions
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  // Handle page changes
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  // Handle downloading PDF statement
  const handleDownloadStatement = () => {
    setIsDownloading(true);
    
    // Filter by currently applied filters for the statement
    let statementTransactions = filteredTransactions;
    
    // Simulate PDF generation delay
    setTimeout(() => {
      console.log('Downloading statement for transactions:', statementTransactions);
      setIsDownloading(false);
      
      // Show success message
      alert('Transaction statement has been downloaded to your device');
    }, 2000);
  };
  
  // Transaction type badge
  const TransactionTypeBadge = ({ type }) => {
    let bgClass = '';
    let textClass = '';
    
    switch (type) {
      case 'MINT':
        bgClass = 'bg-blue-100 dark:bg-blue-900/30';
        textClass = 'text-blue-800 dark:text-blue-300';
        break;
      case 'REDEEM':
        bgClass = 'bg-amber-100 dark:bg-amber-900/30';
        textClass = 'text-amber-800 dark:text-amber-300';
        break;
      case 'YIELD_PAYMENT':
        bgClass = 'bg-green-100 dark:bg-green-900/30';
        textClass = 'text-green-800 dark:text-green-300';
        break;
      default:
        bgClass = 'bg-gray-100 dark:bg-gray-800';
        textClass = 'text-gray-800 dark:text-gray-300';
    }
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass} ${textClass}`}>
        {TRANSACTION_TYPES[type] || type}
      </span>
    );
  };
  
  // Empty state
  if (!loading && filteredTransactions.length === 0) {
    return (
      <div className="card bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            <span className="gold-accent">Transaction</span> History
          </h3>
          <div className="flex space-x-3">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-secondary"
            >
              <option value="ALL">All Types</option>
              <option value="MINT">Mints</option>
              <option value="REDEEM">Redemptions</option>
              <option value="YIELD_PAYMENT">Yield Payments</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-1">No transactions found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
            There are no transactions matching your current filter criteria. Try changing the filters or check back later.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-white dark:bg-gray-800 shadow-md rounded-xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            <span className="gold-accent">Transaction</span> History
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Date range filter */}
            <div className="flex items-center space-x-2">
              <input 
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-secondary"
              />
              <span className="text-gray-500 dark:text-gray-400">to</span>
              <input 
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-secondary"
              />
            </div>
            
            {/* Transaction type filter */}
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-secondary dark:focus:ring-secondary"
            >
              <option value="ALL">All Types</option>
              <option value="MINT">Mints</option>
              <option value="REDEEM">Redemptions</option>
              <option value="YIELD_PAYMENT">Yield Payments</option>
            </select>
            
            {/* Download statement button */}
            <button
              onClick={handleDownloadStatement}
              disabled={isDownloading || filteredTransactions.length === 0}
              className={`flex items-center px-3 py-1.5 text-sm rounded-lg 
                ${isDownloading || filteredTransactions.length === 0
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors'
                }`}
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Statement PDF
                </>
              )}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-1/4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="w-1/5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-1/4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
                <div className="w-1/5">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="w-1/5 text-right">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded ml-auto w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:-mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pl-4 sm:pl-6 pr-3 py-3">Date & Time</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Amount</th>
                    <th className="px-3 py-3">Shares</th>
                    <th className="px-3 py-3">NAV Price</th>
                    <th className="px-3 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {currentTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm"
                    >
                      <td className="pl-4 sm:pl-6 pr-3 py-4 text-gray-900 dark:text-white whitespace-nowrap">
                        <div>{format(new Date(transaction.date), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(transaction.date), 'h:mm a')}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <TransactionTypeBadge type={transaction.type} />
                      </td>
                      <td className="px-3 py-4 text-gray-900 dark:text-white whitespace-nowrap font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-3 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {transaction.shares ? transaction.shares.toFixed(4) : '-'}
                      </td>
                      <td className="px-3 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {transaction.navPrice ? formatCurrency(transaction.navPrice) : '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <span className={`px-2 py-1 text-xs rounded-full 
                          ${transaction.status === 'CONFIRMED'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : transaction.status === 'PENDING'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm font-medium 
                      ${currentPage === 1
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`px-3 py-1 rounded text-sm font-medium 
                        ${currentPage === i + 1
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm font-medium 
                      ${currentPage === totalPages
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 