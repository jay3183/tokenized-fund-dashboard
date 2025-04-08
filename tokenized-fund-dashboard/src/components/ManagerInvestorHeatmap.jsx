import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const ManagerInvestorHeatmap = () => {
  const [heatmapType, setHeatmapType] = useState('investment');
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  // Mock data for investor distribution
  const mockInvestorData = [
    { region: 'North America', investors: 1245, totalInvestment: 245800000, activityScore: 87 },
    { region: 'Europe', investors: 873, totalInvestment: 178300000, activityScore: 76 },
    { region: 'Asia Pacific', investors: 642, totalInvestment: 156700000, activityScore: 92 },
    { region: 'South America', investors: 312, totalInvestment: 67500000, activityScore: 64 },
    { region: 'Middle East', investors: 214, totalInvestment: 97800000, activityScore: 71 },
    { region: 'Africa', investors: 171, totalInvestment: 43200000, activityScore: 58 },
  ];
  
  // Mock data for detailed investor breakdown by country (for selected region)
  const mockCountryData = {
    'North America': [
      { country: 'United States', investors: 875, totalInvestment: 178400000, activityScore: 90 },
      { country: 'Canada', investors: 286, totalInvestment: 57200000, activityScore: 82 },
      { country: 'Mexico', investors: 84, totalInvestment: 10200000, activityScore: 76 },
    ],
    'Europe': [
      { country: 'United Kingdom', investors: 231, totalInvestment: 58700000, activityScore: 79 },
      { country: 'Germany', investors: 184, totalInvestment: 42300000, activityScore: 77 },
      { country: 'France', investors: 156, totalInvestment: 31500000, activityScore: 74 },
      { country: 'Switzerland', investors: 98, totalInvestment: 24800000, activityScore: 81 },
      { country: 'Italy', investors: 87, totalInvestment: 12600000, activityScore: 68 },
      { country: 'Other Europe', investors: 117, totalInvestment: 8400000, activityScore: 70 },
    ],
    'Asia Pacific': [
      { country: 'Singapore', investors: 187, totalInvestment: 64300000, activityScore: 95 },
      { country: 'Japan', investors: 156, totalInvestment: 39200000, activityScore: 88 },
      { country: 'Australia', investors: 129, totalInvestment: 27600000, activityScore: 86 },
      { country: 'Hong Kong', investors: 104, totalInvestment: 21500000, activityScore: 97 },
      { country: 'South Korea', investors: 66, totalInvestment: 4100000, activityScore: 89 },
    ],
    'South America': [
      { country: 'Brazil', investors: 142, totalInvestment: 31200000, activityScore: 71 },
      { country: 'Argentina', investors: 76, totalInvestment: 18700000, activityScore: 62 },
      { country: 'Chile', investors: 58, totalInvestment: 12400000, activityScore: 68 },
      { country: 'Colombia', investors: 36, totalInvestment: 5200000, activityScore: 55 },
    ],
    'Middle East': [
      { country: 'UAE', investors: 98, totalInvestment: 54300000, activityScore: 77 },
      { country: 'Saudi Arabia', investors: 67, totalInvestment: 32100000, activityScore: 68 },
      { country: 'Qatar', investors: 28, totalInvestment: 8200000, activityScore: 72 },
      { country: 'Israel', investors: 21, totalInvestment: 3200000, activityScore: 66 },
    ],
    'Africa': [
      { country: 'South Africa', investors: 83, totalInvestment: 24700000, activityScore: 65 },
      { country: 'Nigeria', investors: 45, totalInvestment: 10800000, activityScore: 57 },
      { country: 'Egypt', investors: 28, totalInvestment: 5700000, activityScore: 52 },
      { country: 'Kenya', investors: 15, totalInvestment: 2000000, activityScore: 59 },
    ],
  };
  
  // Function to calculate cell color based on investment amount or activity
  const getCellColor = (value, max, type) => {
    const normalizedValue = value / max;
    const intensity = Math.round(normalizedValue * 100);
    
    if (type === 'investment') {
      return `rgba(59, 130, 246, ${Math.max(0.2, normalizedValue)})`; // Blue for investment
    } else {
      return `rgba(16, 185, 129, ${Math.max(0.2, normalizedValue)})`; // Green for activity
    }
  };
  
  // Get maximum value for normalization
  const maxInvestment = Math.max(...mockInvestorData.map(d => d.totalInvestment));
  const maxActivity = Math.max(...mockInvestorData.map(d => d.activityScore));
  
  // Calculate breakdown data if a region is selected
  const selectedCountryData = selectedRegion ? mockCountryData[selectedRegion] : [];
  const maxCountryInvestment = selectedCountryData.length > 0 ? 
    Math.max(...selectedCountryData.map(d => d.totalInvestment)) : 0;
  const maxCountryActivity = selectedCountryData.length > 0 ? 
    Math.max(...selectedCountryData.map(d => d.activityScore)) : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold">Investor Heatmap</h2>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${heatmapType === 'investment' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              onClick={() => setHeatmapType('investment')}
            >
              By Investment
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${heatmapType === 'activity' ? 'bg-green-600 text-white' : 'text-gray-600'}`}
              onClick={() => setHeatmapType('activity')}
            >
              By Activity
            </button>
          </div>
        </div>
      </div>
      
      {/* Global Heatmap */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3">Global Distribution</h3>
        <p className="text-sm text-gray-600 mb-4">
          {heatmapType === 'investment' 
            ? 'Heatmap shows distribution of investment amounts by region. Click a region to see country breakdown.' 
            : 'Heatmap shows investor activity levels by region (trading frequency, engagement). Click a region to see country breakdown.'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {mockInvestorData.map(region => (
            <div 
              key={region.region}
              className={`rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${
                selectedRegion === region.region ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                backgroundColor: getCellColor(
                  heatmapType === 'investment' ? region.totalInvestment : region.activityScore,
                  heatmapType === 'investment' ? maxInvestment : maxActivity,
                  heatmapType
                )
              }}
              onClick={() => setSelectedRegion(region.region === selectedRegion ? null : region.region)}
            >
              <h4 className="font-semibold mb-2">{region.region}</h4>
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm opacity-90">Investors:</span>
                  <span className="text-sm font-medium">{region.investors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-90">Total:</span>
                  <span className="text-sm font-medium">{formatCurrency(region.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-90">Activity:</span>
                  <span className="text-sm font-medium">{region.activityScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm" style={{ 
              backgroundColor: heatmapType === 'investment' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'
            }}></div>
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="w-24 h-2 mx-2 rounded-sm" style={{
            background: heatmapType === 'investment' 
              ? 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 1))' 
              : 'linear-gradient(to right, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 1))'
          }}></div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm" style={{ 
              backgroundColor: heatmapType === 'investment' ? 'rgba(59, 130, 246, 1)' : 'rgba(16, 185, 129, 1)'
            }}></div>
            <span className="text-xs text-gray-600">High</span>
          </div>
        </div>
      </div>
      
      {/* Country Breakdown for selected region */}
      {selectedRegion && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">{selectedRegion} Breakdown</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Country</th>
                  <th className="px-3 py-2 text-right">Investors</th>
                  <th className="px-3 py-2 text-right">Total Investment</th>
                  <th className="px-3 py-2 text-right">Activity Score</th>
                  <th className="px-3 py-2 text-center">Heatmap</th>
                </tr>
              </thead>
              <tbody>
                {selectedCountryData.map(country => (
                  <tr key={country.country} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium">{country.country}</td>
                    <td className="px-3 py-2 text-right">{country.investors.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(country.totalInvestment)}</td>
                    <td className="px-3 py-2 text-right">{country.activityScore}/100</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <div 
                          className="w-full h-6 rounded"
                          style={{
                            backgroundColor: getCellColor(
                              heatmapType === 'investment' ? country.totalInvestment : country.activityScore,
                              heatmapType === 'investment' ? maxCountryInvestment : maxCountryActivity,
                              heatmapType
                            )
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Investor Activity Charts - Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Investment Distribution</h4>
              <div className="h-40 flex items-end justify-between space-x-1">
                {selectedCountryData.map((country, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(country.totalInvestment / maxCountryInvestment) * 100}%`,
                        opacity: 0.7 + (i / (selectedCountryData.length * 2))
                      }}
                    ></div>
                    <span className="text-xs mt-1 text-gray-500 truncate w-full text-center">
                      {country.country.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Investor Activity Trends</h4>
              <div className="h-40 flex items-center justify-center">
                {/* Placeholder for activity trend line chart */}
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Activity trend visualization would appear here</span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 100 40">
                    {/* X and Y axes */}
                    <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(75, 85, 99, 0.5)" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(75, 85, 99, 0.5)" strokeWidth="0.5" />
                    
                    {/* Sample activity line */}
                    <path 
                      d="M0,30 C10,28 20,15 30,20 C40,25 50,10 60,15 C70,20 80,5 90,10 L100,15" 
                      fill="none"
                      stroke={heatmapType === 'investment' ? "rgba(59, 130, 246, 0.8)" : "rgba(16, 185, 129, 0.8)"}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerInvestorHeatmap; 