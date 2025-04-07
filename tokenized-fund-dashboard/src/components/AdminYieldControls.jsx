import React, { useState, useEffect } from 'react';
import { formatPercentage, formatDate } from '../utils/formatters';

const AdminYieldControls = () => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFund, setSelectedFund] = useState(null);
  const [yieldValue, setYieldValue] = useState('');
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationSettings, setSimulationSettings] = useState({
    volatility: 'medium',
    direction: 'neutral',
    duration: '7'
  });
  
  // Mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockFunds = [
          {
            id: 'fund1',
            name: 'OnChain Growth Fund',
            currentYield: 4.2,
            yieldHistory: [
              { value: 4.15, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
              { value: 4.08, date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
              { value: 4.11, date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
            ]
          },
          {
            id: 'fund2',
            name: 'Fixed Income Fund',
            currentYield: 3.8,
            yieldHistory: [
              { value: 3.8, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
              { value: 3.85, date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
              { value: 3.9, date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
            ]
          },
          {
            id: 'fund3',
            name: 'Tech Innovation ETF',
            currentYield: 1.9,
            yieldHistory: [
              { value: 1.85, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
              { value: 1.9, date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
              { value: 1.95, date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
            ]
          }
        ];
        
        setFunds(mockFunds);
        if (mockFunds.length > 0) {
          setSelectedFund(mockFunds[0]);
          setYieldValue(mockFunds[0].currentYield.toString());
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load funds. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFundChange = (e) => {
    const fundId = e.target.value;
    const fund = funds.find(f => f.id === fundId);
    setSelectedFund(fund);
    setYieldValue(fund.currentYield.toString());
  };
  
  const handleYieldChange = (e) => {
    // Only allow valid numbers
    const value = e.target.value;
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setYieldValue(value);
    }
  };
  
  const handleSimulationSettingChange = (e) => {
    const { name, value } = e.target;
    setSimulationSettings({
      ...simulationSettings,
      [name]: value
    });
  };
  
  const handleUpdateYield = async () => {
    if (!selectedFund) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedFunds = funds.map(fund => 
        fund.id === selectedFund.id
          ? {
              ...fund,
              currentYield: parseFloat(yieldValue),
              yieldHistory: [
                { value: parseFloat(yieldValue), date: new Date().toISOString() },
                ...fund.yieldHistory
              ]
            }
          : fund
      );
      
      setFunds(updatedFunds);
      setSelectedFund(updatedFunds.find(f => f.id === selectedFund.id));
      
      // Show success (in real app would use a toast or notification)
      alert(`Yield for ${selectedFund.name} updated successfully to ${yieldValue}%`);
    } catch (err) {
      console.error('Error updating yield:', err);
      setError('Failed to update yield. Please try again.');
    }
  };
  
  const handleRunSimulation = async () => {
    if (!selectedFund) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would actually run a simulation on the backend
      alert(`Simulation started for ${selectedFund.name} with settings:
      - Volatility: ${simulationSettings.volatility}
      - Direction: ${simulationSettings.direction}
      - Duration: ${simulationSettings.duration} days`);
    } catch (err) {
      console.error('Error running simulation:', err);
      setError('Failed to run simulation. Please try again.');
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Yield Management
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update or simulate yield values for funds
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              <>
                <div className="mb-6">
                  <label htmlFor="fund-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Fund
                  </label>
                  <select
                    id="fund-select"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={selectedFund?.id || ''}
                    onChange={handleFundChange}
                  >
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name} ({formatPercentage(fund.currentYield)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <div className="bg-gray-100 dark:bg-gray-750 p-4 rounded-lg mb-4">
                    <div className="flex items-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={simulationMode}
                          onChange={(e) => setSimulationMode(e.target.checked)}
                        />
                        <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Simulation Mode
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  {simulationMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Volatility
                        </label>
                        <select
                          name="volatility"
                          value={simulationSettings.volatility}
                          onChange={handleSimulationSettingChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">Low (±0.1%)</option>
                          <option value="medium">Medium (±0.25%)</option>
                          <option value="high">High (±0.5%)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Direction
                        </label>
                        <select
                          name="direction"
                          value={simulationSettings.direction}
                          onChange={handleSimulationSettingChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="up">Upward Trend</option>
                          <option value="neutral">Neutral</option>
                          <option value="down">Downward Trend</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duration (Days)
                        </label>
                        <select
                          name="duration"
                          value={simulationSettings.duration}
                          onChange={handleSimulationSettingChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="3">3 Days</option>
                          <option value="7">7 Days</option>
                          <option value="14">14 Days</option>
                          <option value="30">30 Days</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={handleRunSimulation}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Run Simulation
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="yield-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Yield Value (%)
                      </label>
                      <div className="relative">
                        <input
                          id="yield-value"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                          value={yieldValue}
                          onChange={handleYieldChange}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500 dark:text-gray-400">%</span>
                        </div>
                      </div>
                      {selectedFund && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Current value: {formatPercentage(selectedFund.currentYield)}
                        </div>
                      )}
                      <button
                        onClick={handleUpdateYield}
                        className="w-full mt-4 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Update Yield
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Yield History
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedFund ? selectedFund.name : 'Select a fund to view history'}
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : !selectedFund ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                Select a fund to view yield history
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Yield Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="bg-blue-50 dark:bg-blue-900/10">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Current
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPercentage(selectedFund.currentYield)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {selectedFund.yieldHistory.length > 0 ? (
                          <span className={`
                            ${selectedFund.currentYield >= selectedFund.yieldHistory[0].value 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                            }
                          `}>
                            {selectedFund.currentYield >= selectedFund.yieldHistory[0].value ? '+' : ''}
                            {formatPercentage(selectedFund.currentYield - selectedFund.yieldHistory[0].value)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                    
                    {selectedFund.yieldHistory.map((item, index) => {
                      const nextItem = selectedFund.yieldHistory[index + 1];
                      const change = nextItem ? (item.value - nextItem.value) : null;
                      
                      return (
                        <tr key={item.date} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(new Date(item.date))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatPercentage(item.value)}
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
                                {formatPercentage(change)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminYieldControls; 