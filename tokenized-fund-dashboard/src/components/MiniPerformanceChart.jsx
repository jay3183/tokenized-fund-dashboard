import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { formatCurrency, formatPercentage } from '../utils/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Generate sample data based on time period
const generateData = (period) => {
  let data = [];
  let labels = [];
  const baseValue = 100;
  const volatility = 0.8; // Lower means more stable
  
  const now = new Date();
  const dataPoints = {
    '1D': 24,     // Hourly for 1 day
    '1W': 7,      // Daily for 1 week
    '1M': 30,     // Daily for 1 month
    '3M': 12,     // Weekly for 3 months
    'YTD': 12,    // Monthly for YTD (simplified)
    '1Y': 12,     // Monthly for 1 year
  }[period] || 24;
  
  let currentValue = baseValue;
  
  for (let i = 0; i < dataPoints; i++) {
    // Create labels based on period
    switch (period) {
      case '1D':
        const hour = (now.getHours() - (dataPoints - i - 1)) % 24;
        labels.push(`${hour >= 0 ? hour : 24 + hour}:00`);
        break;
      case '1W':
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - (dataPoints - i - 1));
        labels.push(dayDate.toLocaleDateString(undefined, { weekday: 'short' }));
        break;
      case '1M':
        const monthDate = new Date(now);
        monthDate.setDate(now.getDate() - (dataPoints - i - 1));
        labels.push(monthDate.getDate().toString());
        break;
      case '3M':
        const weekDate = new Date(now);
        weekDate.setDate(now.getDate() - ((dataPoints - i - 1) * 7));
        labels.push(weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        break;
      case 'YTD':
      case '1Y':
        const monthName = new Date(now);
        monthName.setMonth(now.getMonth() - (dataPoints - i - 1));
        labels.push(monthName.toLocaleDateString(undefined, { month: 'short' }));
        break;
      default:
        labels.push(i.toString());
    }
    
    // Calculate a random change with trend bias (slightly upward)
    const change = (Math.random() - 0.45) * volatility;
    currentValue = Math.max(currentValue * (1 + change / 100), currentValue * 0.99);
    
    data.push(currentValue);
  }
  
  return { data, labels };
};

const MiniPerformanceChart = ({ fund, height = 200 }) => {
  const [period, setPeriod] = useState('1M');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Calculate if trending up compared to start
  const trendingUp = chartData ? chartData.data[chartData.data.length - 1] > chartData.data[0] : true;
  const percentChange = chartData ? 
    ((chartData.data[chartData.data.length - 1] - chartData.data[0]) / chartData.data[0]) * 100 
    : 0;
  
  // Get first and last values
  const startValue = chartData ? chartData.data[0] : 100;
  const currentValue = chartData ? chartData.data[chartData.data.length - 1] : 100;
  
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate demo data for the selected period
        const generatedData = generateData(period);
        setChartData(generatedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, [period]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: 'rgba(200, 200, 200, 0.5)',
        borderWidth: 1,
        padding: 10,
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
        },
        callbacks: {
          title: () => null,
          label: context => `${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        display: false,
        beginAtZero: false,
      },
      x: {
        display: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          font: {
            size: 10,
          },
          color: '#9CA3AF',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hoverRadius: 4,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };
  
  const renderChartData = () => {
    if (!chartData) return null;
    
    const gradient = {
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        const color = trendingUp ? 
          ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0)'] :
          ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0)'];
          
        gradient.addColorStop(0, color[0]);
        gradient.addColorStop(1, color[1]);
        return gradient;
      },
      borderColor: trendingUp ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
    };
    
    return {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.data,
          ...gradient,
          fill: 'start',
          pointBackgroundColor: trendingUp ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
        },
      ],
    };
  };
  
  // Time period options
  const periodOptions = [
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: 'YTD', label: 'YTD' },
    { value: '1Y', label: '1Y' },
  ];
  
  return (
    <div className="card bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            <span className="gold-accent">Performance</span> Overview
          </h3>
          <div className={`text-sm font-medium mt-1 ${trendingUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <span className="mr-1">
              {trendingUp ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </span>
            {formatPercentage(Math.abs(percentChange))}
          </div>
        </div>
        
        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {periodOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-2 py-1 text-xs font-medium rounded ${
                period === option.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-650'
              } transition-colors`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse" style={{ height: `${height}px` }}>
          <div className="h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <>
          <div style={{ height: `${height}px` }}>
            <Line data={renderChartData()} options={chartOptions} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Starting Value</div>
              <div className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {formatCurrency(startValue)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Current Value</div>
              <div className={`text-base font-medium mt-1 ${trendingUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(currentValue)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MiniPerformanceChart; 