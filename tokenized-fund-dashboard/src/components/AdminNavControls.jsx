import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';

const AdminNavControls = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFund, setSelectedFund] = useState(null);
  const [navValue, setNavValue] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
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
            lastUpdated: new Date().toISOString(),
            historicalNavs: [
              { value: 102.13, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
              { value: 101.85, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), updatedBy: 'admin@example.com' },
              { value: 101.72, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
            ]
          },
          {
            id: 'fund2',
            name: 'Fixed Income Fund',
            nav: 98.75,
            lastUpdated: new Date().toISOString(),
            historicalNavs: [
              { value: 98.90, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
              { value: 99.05, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
              { value: 99.12, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), updatedBy: 'admin@example.com' },
            ]
          },
          {
            id: 'fund3',
            name: 'Tech Innovation ETF',
            nav: 115.32,
            lastUpdated: new Date().toISOString(),
            historicalNavs: [
              { value: 114.08, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
              { value: 113.45, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
              { value: 112.89, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
            ]
          },
          {
            id: 'fund4',
            name: 'Balanced Portfolio',
            nav: 105.18,
            lastUpdated: new Date().toISOString(),
            historicalNavs: [
              { value: 105.10, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
              { value: 104.92, timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), updatedBy: 'admin@example.com' },
              { value: 104.78, timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), updatedBy: 'system' },
            ]
          },
        ];
        
        setFunds(mockFunds);
        if (mockFunds.length > 0) {
          setSelectedFund(mockFunds[0]);
          setNavValue(mockFunds[0].nav.toFixed(2));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching funds:', err);
        setError('Failed to load funds. Please try again.');
        setLoading(false);
      }
    };
    
    fetchFunds();
  }, []);
  
  const handleFundSelection = (e) => {
    const fundId = e.target.value;
    const fund = funds.find(f => f.id === fundId);
    setSelectedFund(fund);
    setNavValue(fund.nav.toFixed(2));
    setJustification('');
    setSuccessMessage('');
  };
  
  const handleNavValueChange = (e) => {
    // Only allow valid numbers
    const value = e.target.value;
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setNavValue(value);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFund) return;
    
    // Validate inputs
    if (!navValue || isNaN(parseFloat(navValue))) {
      setError('Please enter a valid NAV value.');
      return;
    }
    
    if (!justification.trim()) {
      setError('Please provide a justification for this manual update.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the NAV in our state
      const updatedFunds = funds.map(fund => 
        fund.id === selectedFund.id 
          ? {
              ...fund,
              nav: parseFloat(navValue),
              lastUpdated: new Date().toISOString(),
              historicalNavs: [
                {
                  value: parseFloat(navValue),
                  timestamp: new Date().toISOString(),
                  updatedBy: 'admin@example.com'
                },
                ...fund.historicalNavs
              ]
            }
          : fund
      );
      
      setFunds(updatedFunds);
      setSelectedFund(updatedFunds.find(f => f.id === selectedFund.id));
      setSuccessMessage(`${selectedFund.name} NAV updated successfully to ${formatCurrency(parseFloat(navValue))}`);
      setJustification('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Error updating NAV:', err);
      setError('Failed to update NAV. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Manual NAV Update
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Make manual adjustments to fund Net Asset Values
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="text-red-500 dark:text-red-400">{error}</div>
                <button 
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="fund-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Fund
                  </label>
                  <select
                    id="fund-select"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedFund?.id || ''}
                    onChange={handleFundSelection}
                  >
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name} ({formatCurrency(fund.nav)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="nav-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New NAV Value
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="nav-value"
                      type="text"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      value={navValue}
                      onChange={handleNavValueChange}
                    />
                  </div>
                  {selectedFund && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Current value: {formatCurrency(selectedFund.nav)}
                      <span className="mx-2">|</span>
                      Last updated: {formatDate(new Date(selectedFund.lastUpdated))}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="justification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Justification <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="justification"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="4"
                    placeholder="Explain why this manual update is necessary..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    required
                  ></textarea>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This will be recorded in the audit log
                  </div>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg">
                    {successMessage}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !selectedFund}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Update NAV'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              NAV History
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedFund ? selectedFund.name : 'Select a fund to view history'}
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : !selectedFund ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                Select a fund to view NAV history
              </div>
            ) : selectedFund.historicalNavs.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                No historical data available for this fund
              </div>
            ) : (
              <>
                <div className="flex items-center mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      NAV Updates Info
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      System updates are performed automatically every 30 minutes during market hours. Manual updates require audit justification.
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          NAV Value
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Change
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Updated By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr className="bg-blue-50 dark:bg-blue-900/10">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(new Date(selectedFund.lastUpdated))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(selectedFund.nav)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {selectedFund.historicalNavs.length > 0 ? (
                            <span className={`
                              ${selectedFund.nav >= selectedFund.historicalNavs[0].value 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                              }
                            `}>
                              {selectedFund.nav >= selectedFund.historicalNavs[0].value ? '+' : ''}
                              {formatCurrency(selectedFund.nav - selectedFund.historicalNavs[0].value)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          Current
                        </td>
                      </tr>
                      
                      {selectedFund.historicalNavs.map((nav, index) => {
                        const nextNav = selectedFund.historicalNavs[index + 1];
                        const change = nextNav ? (nav.value - nextNav.value) : null;
                        
                        return (
                          <tr key={nav.timestamp} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(new Date(nav.timestamp))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(nav.value)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {change !== null ? (
                                <span className={`
                                  ${change >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                  }
                                `}>
                                  {change >= 0 ? '+' : ''}
                                  {formatCurrency(change)}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {nav.updatedBy === 'system' ? (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                  </svg>
                                  Automatic
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {nav.updatedBy}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {selectedFund.historicalNavs.length > 10 && (
                  <div className="flex justify-center mt-6">
                    <button className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center">
                      View Full History
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavControls; 