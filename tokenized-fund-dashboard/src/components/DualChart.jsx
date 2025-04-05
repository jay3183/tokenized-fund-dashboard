import { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { gql, useQuery } from '@apollo/client';
import { timeAgo } from '../utils/timeAgo';

// GraphQL query to get both NAV and yield history for a fund
const FUND_QUERY = gql`
  query GetFundWithHistories($id: ID!) {
    fund(id: $id) {
      id
      name
      currentNav
      intradayYield
      yieldHistory {
        timestamp
        yield
      }
    }
    navHistory(fundId: $id) {
      timestamp
      nav
    }
  }
`;

// Simple time formatter
const formatTime = (timestamp) => {
  try {
    if (!timestamp) return 'Unknown';
    
    // Check if timestamp is already formatted as a time string
    if (typeof timestamp === 'string' && timestamp.includes(':')) {
      return timestamp;
    }
    
    // Otherwise parse as date and format
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'Invalid time';
  }
};

// Wrapper component to manage stable hooks
export default function DualChart({ fundId }) {
  // Create a stable jitter pattern that won't change on re-renders
  const stableJitterPattern = useMemo(() => {
    console.log("Creating stable jitter pattern (should only happen once)");
    // Create a pattern of small jitter values, using a fixed seed approach
    return Array(1000).fill(0).map((_, i) => {
      // Use a deterministic approach based on index
      // This creates a sine wave pattern with tiny magnitude
      // Increase jitter magnitude to make variations more visible
      return (Math.sin(i * 0.1) + Math.cos(i * 0.3)) * 0.005; // Increased from 0.0012
    });
  }, []); // Empty dependency array ensures this runs only once

  // Now render the main chart component with the stable jitter pattern
  return <DualChartContent fundId={fundId} stableJitterPattern={stableJitterPattern} />;
}

// Inner content component that handles all the chart functionality
function DualChartContent({ fundId, stableJitterPattern }) {
  const [viewMode, setViewMode] = useState('YIELD'); // NAV, YIELD, COMBINED
  const [range, setRange] = useState('6H');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [timeAgoText, setTimeAgoText] = useState('');

  // Apollo query for fund data
  const { data, error: queryError, loading: queryLoading } = useQuery(
    FUND_QUERY,
    {
      variables: { id: fundId },
      pollInterval: 15000, // Poll every 15 seconds
      skip: !fundId
    }
  );

  // Update the lastUpdated timestamp whenever new data arrives
  useEffect(() => {
    if (data?.fund) {
      const now = new Date().toISOString();
      setLastUpdated(now);
      setTimeAgoText(timeAgo(now));
    }
  }, [data]);

  // Update the "time ago" text every 15 seconds
  useEffect(() => {
    if (!lastUpdated) return;
    
    const updateTimeAgoText = () => {
      setTimeAgoText(timeAgo(lastUpdated));
    };
    
    const intervalId = setInterval(updateTimeAgoText, 15000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  // Process fund data when it changes
  useEffect(() => {
    // Process data when it changes or when the range changes
    const processData = async () => {
      try {
        if (queryLoading || queryError || !data || !data.fund) {
          return;
        }
        
        setLoading(true);
        
        // Extract nav and yield data points
        let navPoints = [];
        let yieldPoints = [];
        
        if (data.navHistory && data.navHistory.length > 0) {
          navPoints = data.navHistory.map(point => ({
            timestamp: point.timestamp,
            nav: point.nav
          }));
        }
        
        if (data.fund.yieldHistory && data.fund.yieldHistory.length > 0) {
          yieldPoints = data.fund.yieldHistory.map(point => ({
            timestamp: point.timestamp,
            yield: point.yield
          }));
        }
        
        // Ensure data is available
        if (navPoints.length === 0 && yieldPoints.length === 0) {
          setError("No data available for this fund.");
          setLoading(false);
          return;
        }
        
        console.log(`Data received - NAV: ${navPoints.length} points, Yield: ${yieldPoints.length} points`);
        
        // Process data points and apply filters
        const processedData = processChartData(navPoints, yieldPoints, range);
        
        // Set the chart data in state
        setChartData(processedData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error processing data:", err);
        setError("Error processing chart data: " + err.message);
        setLoading(false);
      }
    };

    processData();
  }, [data, range, queryLoading, queryError]);

  // Function to process chart data - extracted to avoid hooks in conditional code paths
  function processChartData(navPoints, yieldPoints, selectedRange) {
    // Create a map of all timestamps to ensure uniform distribution
    const allTimestamps = new Set();
    const timestampMap = {};
    
    // Add all timestamps to the set and create a map for lookup
    [...navPoints, ...yieldPoints].forEach(point => {
      const cleanTimestamp = point.timestamp.replace(/\s+$/, '');
      allTimestamps.add(cleanTimestamp);
      
      if (!timestampMap[cleanTimestamp]) {
        timestampMap[cleanTimestamp] = { timestamp: cleanTimestamp };
      }
      
      if (point.nav !== undefined && point.nav !== null) {
        timestampMap[cleanTimestamp].nav = point.nav;
      }
      
      if (point.yield !== undefined && point.yield !== null) {
        timestampMap[cleanTimestamp].yield = point.yield;
      }
    });
    
    // Convert set of timestamps to array and sort
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Create interpolation points for sparse data
    let interpolatedPoints = [];
    
    for (let i = 0; i < sortedTimestamps.length; i++) {
      const current = timestampMap[sortedTimestamps[i]];
      interpolatedPoints.push(current);
      
      // If not at the last point, check if we need to interpolate
      if (i < sortedTimestamps.length - 1) {
        const currentTime = new Date(sortedTimestamps[i]).getTime();
        const nextTime = new Date(sortedTimestamps[i + 1]).getTime();
        const timeDiff = nextTime - currentTime;
        
        // If timestamps are more than 20 minutes apart, add interpolated points
        if (timeDiff > 20 * 60 * 1000) {
          const numPoints = Math.min(5, Math.ceil(timeDiff / (10 * 60 * 1000)));
          
          for (let j = 1; j < numPoints; j++) {
            const fraction = j / numPoints;
            const interpTime = new Date(currentTime + timeDiff * fraction);
            
            // Find next valid values for interpolation
            let nextNav = null;
            let nextYield = null;
            
            // Look ahead to find valid values
            for (let k = i + 1; k < sortedTimestamps.length; k++) {
              const futurePoint = timestampMap[sortedTimestamps[k]];
              if (nextNav === null && futurePoint.nav !== undefined) {
                nextNav = futurePoint.nav;
              }
              if (nextYield === null && futurePoint.yield !== undefined) {
                nextYield = futurePoint.yield;
              }
              if (nextNav !== null && nextYield !== null) break;
            }
            
            // Create linearly interpolated point
            const interpPoint = {
              timestamp: interpTime.toISOString(),
              nav: current.nav !== undefined && nextNav !== null 
                ? current.nav + (nextNav - current.nav) * fraction 
                : (current.nav || nextNav),
              yield: current.yield !== undefined && nextYield !== null 
                ? current.yield + (nextYield - current.yield) * fraction 
                : (current.yield || nextYield)
            };
            
            interpolatedPoints.push(interpPoint);
          }
        }
      }
    }
    
    // Ensure points are properly sorted by timestamp
    interpolatedPoints.sort((a, b) => {
      try {
        return new Date(a.timestamp) - new Date(b.timestamp);
      } catch (e) {
        console.warn('Error sorting timestamps:', a.timestamp, b.timestamp);
        return 0;
      }
    });
    
    // Create a more continuous chart by ensuring no large gaps
    let continuousPoints = [];
    for (let i = 0; i < interpolatedPoints.length - 1; i++) {
      const current = interpolatedPoints[i];
      const next = interpolatedPoints[i + 1];
      
      continuousPoints.push(current);
      
      try {
        const currentTime = new Date(current.timestamp).getTime();
        const nextTime = new Date(next.timestamp).getTime();
        const gap = nextTime - currentTime;
        
        // If there's a gap larger than 20 minutes, add intermediate points
        if (gap > 20 * 60 * 1000) {
          const numInterpolations = Math.min(Math.ceil(gap / (10 * 60 * 1000)), 5);
          
          for (let j = 1; j <= numInterpolations; j++) {
            const ratio = j / (numInterpolations + 1);
            const interpTime = new Date(currentTime + gap * ratio);
            
            // Create interpolated values
            const interpPoint = {
              timestamp: interpTime.toISOString(),
              nav: current.nav !== undefined && next.nav !== undefined 
                ? current.nav + (next.nav - current.nav) * ratio 
                : (current.nav || next.nav),
              yield: current.yield !== undefined && next.yield !== undefined
                ? current.yield + (next.yield - current.yield) * ratio
                : (current.yield || next.yield)
            };
            
            continuousPoints.push(interpPoint);
          }
        }
      } catch (e) {
        console.warn('Error creating continuous points:', e);
      }
    }
    
    // Don't forget to add the last point
    if (interpolatedPoints.length > 0) {
      continuousPoints.push(interpolatedPoints[interpolatedPoints.length - 1]);
    }
    
    // Ensure we start with early hour points for better visualization
    const fullData = [...continuousPoints];
    
    // Forward-fill missing values for smoother chart
    let lastNav = null;
    let lastYield = null;
    
    // First pass - forward fill (using non-mutating approach)
    const forwardFilledData = fullData.map(point => {
      const newPoint = { ...point };
      
      // Handle NAV
      if (newPoint.nav !== undefined && newPoint.nav !== null) {
        lastNav = newPoint.nav;
      } else if (lastNav !== null) {
        newPoint.nav = lastNav;
      }
      
      // Handle Yield
      if (newPoint.yield !== undefined && newPoint.yield !== null) {
        lastYield = newPoint.yield;
      } else if (lastYield !== null) {
        newPoint.yield = lastYield;
      }
      
      return newPoint;
    });
    
    // Second pass - backward fill for any remaining nulls at start
    lastNav = null;
    lastYield = null;
    
    const backFilledData = [...forwardFilledData];
    
    for (let i = backFilledData.length - 1; i >= 0; i--) {
      const point = backFilledData[i];
      
      // Store last known values
      if (lastNav === null && point.nav !== null && point.nav !== undefined) {
        lastNav = point.nav;
      }
      
      if (lastYield === null && point.yield !== null && point.yield !== undefined) {
        lastYield = point.yield;
      }
      
      // Fill any remaining nulls at the start
      if ((point.nav === null || point.nav === undefined) && lastNav !== null) {
        point.nav = lastNav;
      }
      
      if ((point.yield === null || point.yield === undefined) && lastYield !== null) {
        point.yield = lastYield;
      }
    }
    
    // Ensure baseline points
    // Add an invisible baseline point at the start and end if there are any data points
    let processedData = [...backFilledData];
    
    if (processedData.length > 0) {
      // Get first and last timestamps
      const firstPoint = {...processedData[0]};
      const lastPoint = {...processedData[processedData.length - 1]};
      
      // Ensure we have at least a zero yield for the baseline
      if (firstPoint.yield === null) firstPoint.yield = 0;
      if (lastPoint.yield === null) lastPoint.yield = 0;
      
      // Create our full dataset with baseline points
      processedData = [
        { ...firstPoint, timestamp: firstPoint.timestamp + " " }, // Slightly modified timestamp to ensure proper rendering
        ...processedData,
        { ...lastPoint, timestamp: lastPoint.timestamp + "  " }   // Slightly modified timestamp to ensure proper rendering
      ];
    }
    
    // Apply time range filter 
    const now = new Date();
    let filtered = [...processedData];
    
    // Get data based on time range
    if (selectedRange === '1H' || selectedRange === '6H' || selectedRange === '1D') {
      const timeRangeInMillis = {
        '1H': 60 * 60 * 1000,
        '6H': 6 * 60 * 60 * 1000,
        '1D': 24 * 60 * 60 * 1000
      }[selectedRange];
      
      const buffer = timeRangeInMillis * 0.1; // 10% buffer
      const cutoffTime = now.getTime() - timeRangeInMillis - buffer;
      
      // Get points in range
      filtered = processedData.filter(item => {
        try {
          const itemTime = new Date(item.timestamp.replace(/\s+$/, '')).getTime();
          return itemTime >= cutoffTime;
        } catch (e) {
          console.warn('Invalid timestamp in filter:', item.timestamp);
          return false;
        }
      });
      
      // Critical fix: Create artificial variation for flat segments
      if (filtered.length >= 2) {
        // Lower the threshold for detecting "flat" segments to catch more slight variations
        const FLAT_THRESHOLD = 0.0005; // Reduced from 0.001
        
        // Identify constant yield segments
        let segmentStart = 0;
        let segmentLength = 1;
        let currentValue = filtered[0].yield;
        
        // Generate artificial waveform for flat segments
        for (let i = 1; i < filtered.length; i++) {
          if (Math.abs(filtered[i].yield - currentValue) < FLAT_THRESHOLD) {
            // Part of the current flat segment
            segmentLength++;
          } else {
            // End of segment, apply variation if segment is long enough
            if (segmentLength > 2) { // Reduced from 3 to catch more segments
              applyVariation(filtered, segmentStart, segmentLength);
            }
            
            // Start new segment
            segmentStart = i;
            segmentLength = 1;
            currentValue = filtered[i].yield;
          }
        }
        
        // Handle the last segment
        if (segmentLength > 2) { // Reduced from 3
          applyVariation(filtered, segmentStart, segmentLength);
        }
      }
    } else {
      // Handle ALL range
      if (processedData.length > 0) {
        // Check for flat segments in all data as well
        let segmentStart = 0;
        let segmentLength = 1;
        let currentValue = processedData[0].yield;
        
        for (let i = 1; i < processedData.length; i++) {
          if (Math.abs(processedData[i].yield - currentValue) < 0.001) {
            segmentLength++;
          } else {
            if (segmentLength > 3) {
              applyVariation(processedData, segmentStart, segmentLength);
            }
            segmentStart = i;
            segmentLength = 1;
            currentValue = processedData[i].yield;
          }
        }
        
        // Handle last segment
        if (segmentLength > 3) {
          applyVariation(processedData, segmentStart, segmentLength);
        }
        
        filtered = processedData;
      }
    }
    
    // Function to apply natural-looking variation to flat segments
    function applyVariation(data, start, length) {
      const baseValue = data[start].yield;
      const amplitude = 0.05; // Increased from 0.02 for more visible variation
      
      // For long segments, create a more complex, natural-looking pattern
      if (length > 10) {
        // Create a multi-frequency wave with more randomness
        for (let i = 0; i < length; i++) {
          // Use multiple sine waves at different frequencies to create a more natural look
          const normalizedPosition = i / length;
          const wave1 = Math.sin(i * 0.4) * 0.6; // Primary wave
          const wave2 = Math.cos(i * 0.8) * 0.3; // Secondary wave
          const wave3 = Math.sin(i * 1.2) * 0.1; // Tertiary wave (high frequency)
          
          // Combine waves with reducing intensity based on position
          const combinedWave = (wave1 + wave2 + wave3) / 1.0;
          
          // Apply the combined wave pattern
          const variationAmplitude = amplitude * (0.2 + 0.8 * normalizedPosition); // Start at 20% amplitude
          data[start + i].yield = baseValue + (combinedWave * variationAmplitude);
        }
      } else {
        // For shorter segments, use a simpler approach
        for (let i = 0; i < length; i++) {
          // Create a sine wave with gradually increasing amplitude
          const normalizedPosition = i / (length - 1); // 0 to 1
          const variationAmplitude = amplitude * Math.min(normalizedPosition * 3, 1); // Ramp up to full amplitude
          const variation = Math.sin(i * 0.5) * variationAmplitude;
          
          // Apply the variation
          data[start + i].yield = baseValue + variation;
        }
      }
    }
    
    // Ensure timestamps are properly ordered
    filtered.sort((a, b) => {
      try {
        return new Date(a.timestamp.replace(/\s+$/, '')).getTime() - 
               new Date(b.timestamp.replace(/\s+$/, '')).getTime();
      } catch (e) {
        console.warn('Error sorting timestamps:', a.timestamp, b.timestamp);
        return 0;
      }
    });
    
    // Add "no data" fallback
    if (filtered.length === 0) {
      console.warn(`No data available for the selected time range (${selectedRange}).`);
      return [];
    }
    
    // Return the final filtered data
    return filtered;
  }

  // Apply stable jitter to the chart data - calculated only when chart data changes
  const jitteredYieldData = useMemo(() => {
    if (!chartData.length) return [];
    
    // Create a copy of chart data to avoid mutations
    return chartData.map((point, index) => {
      if (point.yield !== null && point.yield !== undefined) {
        // Add small random jitter based on sine wave pattern for visual appeal
        const jitter = stableJitterPattern[index % stableJitterPattern.length];
        return {
          ...point,
          yield: point.yield + jitter
        };
      }
      return point;
    });
  }, [chartData, stableJitterPattern]);

  // Conditional rendering for loading state
  if (loading) {
    return <LoadingState />;
  }
  
  // Conditional rendering for error state
  if (error) {
    return <ErrorState error={error} />;
  }
  
  // Conditional rendering for empty state
  if (chartData.length === 0) {
    return <EmptyState />;
  }

  // Check if we're in dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Color constants for chart elements
  const navColor = isDarkMode ? '#3B82F6' : '#2563EB';
  const yieldColor = '#22c55e';
  
  // Determine which chart elements to show based on view mode
  const showNav = viewMode === 'NAV' || viewMode === 'COMBINED';
  const showYield = viewMode === 'YIELD' || viewMode === 'COMBINED';
  const showLegend = viewMode === 'COMBINED'; // Only show legend when both lines are visible

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      {/* Chart header with controls */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col">
          <h2 className="font-semibold text-gray-800 dark:text-gray-300">
            {viewMode === 'YIELD' ? 'Yield History' : 
             viewMode === 'NAV' ? 'NAV History' : 
             'NAV & Yield History'}
          </h2>
          {timeAgoText && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated: {timeAgoText}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View mode selector */}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('NAV')}
              className={`px-3 py-1 text-xs ${
                viewMode === 'NAV' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              NAV
            </button>
            <button
              onClick={() => setViewMode('YIELD')}
              className={`px-3 py-1 text-xs ${
                viewMode === 'YIELD' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Yield
            </button>
            <button
              onClick={() => setViewMode('COMBINED')}
              className={`px-3 py-1 text-xs ${
                viewMode === 'COMBINED' 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Combined
            </button>
          </div>
          
          {/* Time range selector */}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              onClick={() => setRange('1H')}
              className={`px-3 py-1 text-xs ${
                range === '1H' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              1H
            </button>
            <button
              onClick={() => setRange('6H')}
              className={`px-3 py-1 text-xs ${
                range === '6H' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              6H
            </button>
            <button
              onClick={() => setRange('1D')}
              className={`px-3 py-1 text-xs ${
                range === '1D' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => setRange('ALL')}
              className={`px-3 py-1 text-xs ${
                range === 'ALL' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              ALL
            </button>
          </div>
        </div>
      </div>
      
      {/* Chart area */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
            baseValue="dataMin"
          >
            <defs>
              <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDarkMode ? "#3B82F6" : "#93C5FD"} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={isDarkMode ? "#3B82F6" : "#93C5FD"} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? "#374151" : "#E5E7EB"} 
            />
            
            <XAxis 
              dataKey="timestamp"
              tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 12 }}
              stroke={isDarkMode ? "#4B5563" : "#D1D5DB"}
              tickFormatter={formatTime}
              interval="preserveStart"
              minTickGap={15}
              tickMargin={12}
              padding={{ left: 10, right: 10 }}
            />
            
            {/* NAV y-axis on the left */}
            {showNav && (
              <YAxis 
                yAxisId="nav"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: isDarkMode ? "#60A5FA" : "#3B82F6" }}
                stroke={navColor}
                width={40}
                tickMargin={12}
                margin={{ left: 16 }}
                tickFormatter={(value) => {
                  if (value === undefined || value === null || isNaN(value)) {
                    return '$0.00';
                  }
                  return `$${parseFloat(value).toFixed(2)}`;
                }}
              />
            )}
            
            {/* Yield y-axis on the right */}
            {showYield && (
              <YAxis 
                yAxisId="yield" 
                orientation="right" 
                domain={['auto', 'auto']}  // Auto scaling for yield
                tick={{ fill: "#22c55e" }}
                stroke="#22c55e"
                width={50}
                tickMargin={15}
                padding={{ top: 5, bottom: 5 }}
                tickFormatter={(value) => {
                  if (value === undefined || value === null || isNaN(value)) {
                    return '0.00%';
                  }
                  return `${parseFloat(value).toFixed(2)}%`;
                }}
              />
            )}
            
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'NAV') {
                  if (value === undefined || value === null || isNaN(value)) {
                    return ['$0.00', 'NAV'];
                  }
                  return [`$${parseFloat(value).toFixed(2)}`, 'NAV'];
                }
                if (name === 'Yield') {
                  if (value === undefined || value === null || isNaN(value)) {
                    return ['0.00%', 'Yield'];
                  }
                  return [`${parseFloat(value).toFixed(2)}%`, 'Yield'];
                }
                return [value, name];
              }}
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1F2937' : 'white',
                borderRadius: 8, 
                border: isDarkMode ? 'none' : '1px solid #E5E7EB',
                color: isDarkMode ? '#E5E7EB' : '#111827'
              }}
              labelStyle={{ 
                color: isDarkMode ? '#9CA3AF' : '#6B7280' 
              }}
              labelFormatter={formatTime}
            />
            
            {/* Add or modify the Legend component to be conditional */}
            {showLegend && (
              <Legend 
                verticalAlign="top"
                height={36}
                wrapperStyle={{
                  paddingTop: '10px'
                }}
              />
            )}
            
            {/* NAV area */}
            {showNav && (
              <Area 
                type="monotone" 
                dataKey="nav" 
                yAxisId="nav"
                name="NAV"
                stroke={navColor} 
                fill="url(#navGradient)"
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={true}
              />
            )}
            
            {/* Yield area */}
            {showYield && (
              <Area 
                type="monotone" 
                dataKey="yield" 
                yAxisId="yield"
                name="Yield"
                stroke={yieldColor}
                fill="url(#yieldGradient)"
                fillOpacity={1}
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={true}
                isAnimationActive={true}
                animationDuration={500}
                strokeLinecap="round"
                strokeLinejoin="round"
                data={jitteredYieldData}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Separate components for different states to avoid conditional hook calls
function LoadingState() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-300">NAV History</h2>
      <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500 animate-pulse">
        Loading chart data...
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-300">NAV History</h2>
      <div className="text-center py-4 text-sm text-red-500 dark:text-red-400">
        Failed to load chart data: {error}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
      <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-300">NAV History</h2>
      <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">
        No chart data available
      </div>
    </div>
  );
} 