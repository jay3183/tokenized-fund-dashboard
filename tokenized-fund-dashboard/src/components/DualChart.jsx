import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function DualChart({ yieldData, navData }) {
  const [activeTab, setActiveTab] = useState('yield');
  
  // Format the data for the chart
  const data = yieldData.map(item => ({
    time: new Date(item.time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    yield: item.value,
    timestamp: item.time
  }));
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'yield' ? 'Yield: ' : 'NAV: '}
              <span className="font-medium">
                {entry.name === 'yield' ? `${entry.value.toFixed(4)}%` : `$${entry.value.toFixed(2)}`}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full h-full">
      <div className="flex mb-3 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'yield' 
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('yield')}
        >
          Intraday Yield
        </button>
        {navData.length > 0 && (
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'nav' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('nav')}
          >
            NAV History
          </button>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            className="text-gray-500 dark:text-gray-400"
          />
          <YAxis 
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
            orientation="right"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={value => activeTab === 'yield' ? `${value.toFixed(2)}%` : `$${value.toFixed(2)}`}
            className="text-gray-500 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          
          {activeTab === 'yield' && (
            <Area 
              type="monotone" 
              dataKey="yield" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#colorYield)" 
              name="yield"
              isAnimationActive={true}
              animationDuration={500}
            />
          )}
          
          {activeTab === 'nav' && navData.length > 0 && (
            <Area 
              type="monotone" 
              dataKey="nav" 
              stroke="#10b981" 
              fillOpacity={1}
              fill="url(#colorNav)" 
              name="nav"
              isAnimationActive={true}
              animationDuration={500}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 