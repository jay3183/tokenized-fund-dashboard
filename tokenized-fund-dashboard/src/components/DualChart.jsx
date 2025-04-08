import { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { gql, useQuery } from '@apollo/client';
import { timeAgo } from '../utils/timeAgo';
import { format } from 'date-fns';
import { NAV_HISTORY } from '../graphql/queries';
import { formatNumber, formatCurrency } from '../utils/formatNumber';

// GraphQL query to get yield history for a fund
const GET_FUND_DATA = gql`
  query GetFundData($fundId: ID!) {
    fund(id: $fundId) {
      id
      name
      currentNav
      previousNav
      intradayYield
      yieldHistory {
        timestamp
        yield
      }
      yieldSnapshots {
        timestamp
        yield
        source
      }
      currentNAV {
        nav
        timestamp
      }
    }
  }
`;

// Simple time formatter
const formatTime = (timestamp) => {
  try {
    if (!timestamp) return 'Unknown';
    
    // Handle case where multiple ISO strings might be concatenated
    let cleanTimestamp = timestamp;
    
    // Check if we have a string with multiple timestamps
    if (typeof timestamp === 'string') {
      // If we have a situation like "2025-04-04T18:33:14.324Z2025-04-04T22:08:14.324Z"
      if (timestamp.includes('Z') && timestamp.indexOf('Z') < timestamp.length - 1) {
        // Extract just the first timestamp
        cleanTimestamp = timestamp.substring(0, timestamp.indexOf('Z') + 1);
      }
    }
    
    // Parse as date and format
    const date = new Date(cleanTimestamp);
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', cleanTimestamp, 'from original:', timestamp);
      return 'Invalid time';
    }
    
    // Display more specific time formatting for better readability
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'Invalid time';
  }
};

// Wrapper component to manage stable hooks
export default function DualChart({ fundId, navHistory, yieldHistory, currentNav, currentYield, className }) {
  const userId = localStorage.getItem('userId');
  const isAuthenticated = !!localStorage.getItem('token');
  
  // Return early if not authenticated
  if (!isAuthenticated || !userId) {
    return (
      <div className={`bg-white rounded-xl p-4 h-72 w-full shadow-md border border-gray-100 ${className || ''}`}>
        <p className="text-center text-gray-500">Please log in to view charts</p>
      </div>
    );
  }
  
  console.log("[DEBUG] DualChart rendering with:", { 
    fundId, 
    navHistoryLength: navHistory?.length,
    yieldHistoryLength: yieldHistory?.length,
    currentNav,
    currentYield
  });

  // Now render the main chart component with simplified props
  return <DualChartContent 
    fundId={fundId}
    navHistory={navHistory}
    yieldHistory={yieldHistory}
    currentNav={currentNav}
    currentYield={currentYield}
    className={className}
  />;
}

// Inner content component that handles all the chart functionality
function DualChartContent({ fundId, navHistory: propNavHistory, yieldHistory: propYieldHistory, currentNav, currentYield, className }) {
  const [viewMode, setViewMode] = useState('COMBINED'); // Changed default to COMBINED to show both NAV and yield
  const [range, setRange] = useState('ALL'); // Show all data points by default
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [latestTimestamp, setLatestTimestamp] = useState(new Date().toISOString());

  // Remove dark mode checking since we're standardizing on light mode
  useEffect(() => {
    setIsDarkMode(false); // Always use light mode
  }, []);

  // Only fetch from API if we don't have props data
  const shouldFetchFromApi = !propNavHistory?.length && !propYieldHistory?.length;
  
  // Apollo query for yield data - only if we don't have props
  const { data: yieldData, error: yieldError, loading: yieldLoading } = useQuery(
    GET_FUND_DATA,
    {
      variables: { fundId },
      pollInterval: 15000, // Poll every 15 seconds
      skip: !fundId || !shouldFetchFromApi
    }
  );
  
  // Apollo query for NAV history data - only if we don't have props
  const { data: navData, error: navError, loading: navLoading } = useQuery(
    NAV_HISTORY,
    {
      variables: { fundId },
      pollInterval: 15000, // Poll every 15 seconds
      skip: !fundId || !shouldFetchFromApi,
      fetchPolicy: 'network-only' // Always get fresh data from server
    }
  );
  
  // Use either props or fetched data
  const navHistory = propNavHistory?.length ? propNavHistory : navData?.navHistory || [];
  const yieldHistory = propYieldHistory?.length ? propYieldHistory : yieldData?.fund?.yieldHistory || [];
  
  // Log data availability
  useEffect(() => {
    console.log("[DEBUG] Chart data sources:", {
      usingPropsData: !!propNavHistory?.length,
      usingFetchedData: !propNavHistory?.length && !!navData?.navHistory?.length,
      navHistoryLength: navHistory?.length,
      yieldHistoryLength: yieldHistory?.length,
      dataIsLoading: shouldFetchFromApi && (yieldLoading || navLoading)
    });
  }, [propNavHistory, navData, yieldData, yieldLoading, navLoading, shouldFetchFromApi]);

  // Log data retrieval for debugging
  useEffect(() => {
    if (navHistory?.length > 0) {
      console.log(`[NAV HISTORY] Using ${navHistory.length} data points`);
      
      // Ensure that we have data to display by logging additional details
      const firstPoint = navHistory[0];
      const lastPoint = navHistory[navHistory.length - 1];
      console.log('[NAV HISTORY] First point:', firstPoint);
      console.log('[NAV HISTORY] Last point:', lastPoint);
    }
  }, [navHistory]);

  // Update the latestTimestamp whenever new data arrives
  useEffect(() => {
    if (yieldHistory?.length || navHistory?.length) {
      const now = new Date().toISOString();
      setLatestTimestamp(now);
    }
  }, [yieldHistory, navHistory]);

  // Process fund data when it changes
  useEffect(() => {
    // Process data when it changes or when the range changes
    const processData = async () => {
      try {
        console.log("[DEBUG] Processing chart data:", { 
          navHistoryLength: navHistory?.length,
          yieldHistoryLength: yieldHistory?.length
        });
        
        const isDataLoading = shouldFetchFromApi && (yieldLoading || navLoading);
        const hasNoData = shouldFetchFromApi && (!yieldData?.fund && !navData?.navHistory);
        
        if (isDataLoading || hasNoData) {
          return;
        }
        
        console.log("[DEBUG] Processing data for chart with range:", range);
        setLoading(true);
        
        // Extract nav and yield data points
        let navPoints = [];
        let yieldPoints = [];
        
        // Add static fallback data to ensure we always have something to display
        const fallbackTimestamps = [];
        const now = new Date();
        for (let i = 0; i < 10; i++) {
          fallbackTimestamps.push(new Date(now.getTime() - (i * 30 * 60 * 1000)));
        }
        
        fallbackTimestamps.reverse(); // Ensure chronological order
        
        if (navHistory && navHistory.length > 0) {
          // Debug the raw navHistory data
          console.log("[DEBUG] Raw NAV History Data:", navHistory);
          
          // Create accurate timestamps for all entries
          navPoints = [...navHistory]
            .filter(point => point && (point.timestamp || point.timestamp === 0))
            .map(point => {
              try {
                // Handle both string and numeric timestamps
                let timestamp = point.timestamp;
                let date;
                
                // Convert any numeric timestamps to Date objects
                if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
                  const numericTimestamp = parseInt(timestamp, 10);
                  date = new Date(numericTimestamp);
                } else {
                  date = new Date(timestamp);
                }
                
                if (isNaN(date.getTime())) {
                  console.error("Invalid timestamp:", timestamp);
                  return null;
                }
                
                // Create a new object with standardized timestamp
                return {
                  timestamp: date.toISOString(),
                  rawDate: date,
                  nav: point.nav,
                  id: point.id
                };
              } catch (err) {
                console.error("Failed to process NAV point:", point, err);
                return null;
              }
            })
            .filter(point => point !== null)
            .sort((a, b) => a.rawDate - b.rawDate);
            
          console.log(`[DEBUG] Processed NAV History: ${navPoints.length} valid points`);
        } else {
          console.log("[DEBUG] No NAV history data, using fallback values");
          // If no real data, create fallback data for visualization
          navPoints = fallbackTimestamps.map((date, index) => {
            // Base NAV around 100 with slight variations
            const baseValue = 100;
            const variation = 0.02 * Math.sin(index * 0.5) + 0.01 * Math.cos(index * 1.2);
            return {
              timestamp: date.toISOString(),
              rawDate: date,
              nav: baseValue + variation,
              id: `fallback-${index}`
            };
          });
        }
        
        if (yieldHistory && yieldHistory.length > 0) {
          // Debug the raw yieldHistory data
          console.log("[DEBUG] Raw Yield History Data:", yieldHistory);
          
          // Create accurate timestamps for all entries
          yieldPoints = [...yieldHistory]
            .filter(point => point && (point.timestamp || point.timestamp === 0))
            .map(point => {
              try {
                // Handle both string and numeric timestamps
                let timestamp = point.timestamp;
                let date;
                
                // Convert any numeric timestamps to Date objects
                if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
                  const numericTimestamp = parseInt(timestamp, 10);
                  date = new Date(numericTimestamp);
                } else {
                  date = new Date(timestamp);
                }
                
                if (isNaN(date.getTime())) {
                  console.error("Invalid timestamp:", timestamp);
                  return null;
                }
                
                // Ensure yield values are properly parsed as numbers
                let yieldValue = point.yield;
                if (typeof yieldValue === 'string') {
                  yieldValue = parseFloat(yieldValue);
                }
                
                if (isNaN(yieldValue)) {
                  console.error("Invalid yield value:", point.yield);
                  yieldValue = 1.6; // Fallback to a default value
                }
                
                // Create a new object with standardized timestamp
                return {
                  timestamp: date.toISOString(),
                  rawDate: date,
                  yield: yieldValue,
                  source: point.source
                };
              } catch (err) {
                console.error("Failed to process Yield point:", point, err);
                return null;
              }
            })
            .filter(point => point !== null)
            .sort((a, b) => a.rawDate - b.rawDate);
            
          console.log(`[DEBUG] Processed Yield History: ${yieldPoints.length} valid points`);
          
          // Log specific yield values for debugging
          if (yieldPoints.length > 0) {
            console.log("[DEBUG] First yield value:", yieldPoints[0].yield);
            console.log("[DEBUG] Last yield value:", yieldPoints[yieldPoints.length-1].yield);
            console.log("[DEBUG] Yield values sample:", yieldPoints.slice(0, 3).map(p => p.yield));
          } else {
            console.warn("[WARN] No valid yield points after processing!");
          }
        } else {
          console.log("[DEBUG] No yield history data, using fallback values");
          // If no real data, create fallback data for visualization
          yieldPoints = fallbackTimestamps.map((date, index) => {
            // Base yield around 1.6% with slight variations
            const baseValue = 1.6;
            const variation = 0.05 * Math.sin(index * 0.7) + 0.03 * Math.cos(index * 1.5);
            return {
              timestamp: date.toISOString(),
              rawDate: date,
              yield: baseValue + variation,
              source: 'fallback'
            };
          });
        }
        
        // Ensure data is available - at this point we should have at least fallback data
        if (navPoints.length === 0 && yieldPoints.length === 0) {
          console.error("[ERROR] No valid data points found after processing, including fallbacks");
          setError("No data available for this fund.");
          setLoading(false);
          return;
        }
        
        // Process data points and apply filters
        const processedData = processChartData(navPoints, yieldPoints, range);
        
        // Downsample data for readability if we have many points
        const sampledData = downsampleData(processedData);
        
        // Debug the processed chart data
        console.log(`[DEBUG] Final chart data: ${processedData.length} points, sampled to ${sampledData.length}`);
        
        // Set the chart data in state
        setChartData(sampledData);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("[ERROR] Error processing data:", err);
        setError("Error processing chart data: " + err.message);
        setLoading(false);
      }
    };

    // Add debounce to prevent rapid consecutive calls
    const timeoutId = setTimeout(() => {
      processData();
    }, 100);
    
    return () => clearTimeout(timeoutId);
    
  }, [fundId, navHistory, yieldHistory, range, shouldFetchFromApi, yieldLoading, navLoading, yieldError, navError]);

  // Function to process chart data - extracted to avoid hooks in conditional code paths
  function processChartData(navPoints, yieldPoints, selectedRange) {
    try {
      console.log(`[DEBUG] Processing chart data with ${navPoints.length} NAV points and ${yieldPoints.length} yield points`);
      
      // Create a map of all timestamps to ensure uniform distribution
      const allTimestamps = new Set();
      const timestampMap = {};
      
      // Add all timestamps to the set and create a map for lookup
      [...navPoints, ...yieldPoints].forEach(point => {
        if (!point || !point.timestamp) return;
        
        try {
          // Use the timestamp directly since we've already validated it
          allTimestamps.add(point.timestamp);
          
          if (!timestampMap[point.timestamp]) {
            timestampMap[point.timestamp] = { 
              timestamp: point.timestamp,
              rawDate: point.rawDate // We now pass the date object directly
            };
          }
          
          if (point.nav !== undefined && point.nav !== null) {
            timestampMap[point.timestamp].nav = point.nav;
          }
          
          if (point.yield !== undefined && point.yield !== null) {
            timestampMap[point.timestamp].yield = point.yield;
          }
        } catch (err) {
          console.error("Error processing timestamp:", point.timestamp, err);
        }
      });
      
      // Convert set of timestamps to array and sort chronologically
      const sortedTimestamps = Array.from(allTimestamps)
        .sort((a, b) => new Date(a) - new Date(b));
      
      console.log(`[DEBUG] Sorted ${sortedTimestamps.length} unique timestamps`);
      
      // Ensure we have at least 2 timestamps to work with
      if (sortedTimestamps.length < 2) {
        console.warn("[WARN] Not enough unique timestamps, creating additional points");
        
        // Add at least two points if we don't have enough
        const now = new Date();
        const then = new Date(now.getTime() - 30 * 60 * 1000);
        
        // Only add if not already present
        const nowIso = now.toISOString();
        const thenIso = then.toISOString();
        
        if (!timestampMap[nowIso]) {
          allTimestamps.add(nowIso);
          timestampMap[nowIso] = {
            timestamp: nowIso,
            rawDate: now,
            nav: 100.0,
            yield: 1.6
          };
        }
        
        if (!timestampMap[thenIso]) {
          allTimestamps.add(thenIso);
          timestampMap[thenIso] = {
            timestamp: thenIso,
            rawDate: then,
            nav: 99.95,
            yield: 1.59
          };
        }
      }
      
      // Create a dense timeline with interpolated points
      let interpolatedPoints = [];
      
      // Generate a dense timeline to ensure consistent data density
      if (sortedTimestamps.length > 0) {
        // Find earliest and latest timestamps
        const firstTime = new Date(sortedTimestamps[0]).getTime();
        const lastTime = new Date(sortedTimestamps[sortedTimestamps.length - 1]).getTime();
        
        // Ensure timespan is at least 1 hour for better visualization
        const timeSpan = Math.max(lastTime - firstTime, 60 * 60 * 1000);
        
        console.log(`[DEBUG] Time span of data: ${timeSpan / (60 * 1000)} minutes`);
        
        // Number of points to create (minimum 20)
        const desiredPoints = Math.max(20, sortedTimestamps.length * 2);
        
        // Create evenly spaced points across the time range
        for (let i = 0; i < desiredPoints; i++) {
          const fraction = i / (desiredPoints - 1);
          const pointTime = new Date(firstTime + timeSpan * fraction);
          
          // Find the nearest real data points before and after
          let beforePoint = null;
          let afterPoint = null;
          
          for (let j = 0; j < sortedTimestamps.length; j++) {
            const currentPointTime = new Date(sortedTimestamps[j]).getTime();
            
            if (currentPointTime <= pointTime.getTime()) {
              beforePoint = timestampMap[sortedTimestamps[j]];
            }
            
            if (currentPointTime >= pointTime.getTime() && !afterPoint) {
              afterPoint = timestampMap[sortedTimestamps[j]];
            }
          }
          
          // If exact match to an existing point, use it
          if (beforePoint && beforePoint.rawDate.getTime() === pointTime.getTime()) {
            interpolatedPoints.push(beforePoint);
            continue;
          }
          
          // Create an interpolated point
          const newPoint = {
            timestamp: pointTime.toISOString(),
            rawDate: pointTime,
            timeFormatted: format(pointTime, 'h:mm a')
          };
          
          // Interpolate NAV if possible
          if (beforePoint && afterPoint && 
              beforePoint.nav !== undefined && afterPoint.nav !== undefined) {
            const beforeTime = beforePoint.rawDate.getTime();
            const afterTime = afterPoint.rawDate.getTime();
            const timeDiff = afterTime - beforeTime;
            
            if (timeDiff > 0) {
              const localFraction = (pointTime.getTime() - beforeTime) / timeDiff;
              const navDiff = afterPoint.nav - beforePoint.nav;
              newPoint.nav = beforePoint.nav + navDiff * localFraction;
            } else {
              newPoint.nav = beforePoint.nav;
            }
          } else if (beforePoint && beforePoint.nav !== undefined) {
            newPoint.nav = beforePoint.nav;
          } else if (afterPoint && afterPoint.nav !== undefined) {
            newPoint.nav = afterPoint.nav;
          }
          
          // Interpolate yield if possible
          if (beforePoint && afterPoint && 
              beforePoint.yield !== undefined && afterPoint.yield !== undefined &&
              !isNaN(beforePoint.yield) && !isNaN(afterPoint.yield)) {
            const beforeTime = beforePoint.rawDate.getTime();
            const afterTime = afterPoint.rawDate.getTime();
            const timeDiff = afterTime - beforeTime;
            
            if (timeDiff > 0) {
              const localFraction = (pointTime.getTime() - beforeTime) / timeDiff;
              const yieldDiff = afterPoint.yield - beforePoint.yield;
              newPoint.yield = beforePoint.yield + yieldDiff * localFraction;
            } else {
              newPoint.yield = beforePoint.yield;
            }
          } else if (beforePoint && beforePoint.yield !== undefined && !isNaN(beforePoint.yield)) {
            newPoint.yield = beforePoint.yield;
          } else if (afterPoint && afterPoint.yield !== undefined && !isNaN(afterPoint.yield)) {
            newPoint.yield = afterPoint.yield;
          } else {
            // If we have no valid yield data nearby, use a fallback
            // This ensures there are no gaps in the yield line
            newPoint.yield = 1.6;
          }
          
          // Verify the yield value is valid
          if (newPoint.yield !== undefined && (isNaN(newPoint.yield) || newPoint.yield === null)) {
            console.warn("Generated invalid yield value:", newPoint.yield);
            newPoint.yield = 1.6; // Use fallback
          }
          
          interpolatedPoints.push(newPoint);
        }
      }
      
      // Sort all points by timestamp to ensure proper ordering
      interpolatedPoints = interpolatedPoints.sort((a, b) => a.rawDate - b.rawDate);
      
      // Pre-format time strings for all points
      interpolatedPoints = interpolatedPoints.map(point => {
        try {
          return {
            ...point,
            timeFormatted: format(point.rawDate, 'h:mm a')
          };
        } catch (err) {
          return {
            ...point,
            timeFormatted: 'Invalid time'
          };
        }
      });
      
      // Filter based on time range
      let filteredPoints = interpolatedPoints;
      
      if (selectedRange && selectedRange !== 'ALL') {
        const now = new Date();
        let cutoff = now;
        
        if (selectedRange === '1H') {
          cutoff = new Date(now.getTime() - 60 * 60 * 1000);
        } else if (selectedRange === '6H') {
          cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        } else if (selectedRange === '1D') {
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        
        filteredPoints = interpolatedPoints.filter(point => point.rawDate >= cutoff);
      }
      
      // Ensure we have a minimum number of data points for any time range
      if (filteredPoints.length < 5) {
        console.log("[DEBUG] Not enough data points after filtering, using all available points");
        filteredPoints = interpolatedPoints;
      }
      
      // Ensure we have at least some minimal number of points for visualization
      if (filteredPoints.length < 10) {
        console.log("[DEBUG] Adding extra points to ensure good visualization");
        
        // Create a more dense set of points based on the first and last points
        const morePoints = [];
        
        if (filteredPoints.length >= 2) {
          const first = filteredPoints[0];
          const last = filteredPoints[filteredPoints.length - 1];
          const timeRange = last.rawDate - first.rawDate;
          
          for (let i = 1; i < 9; i++) {
            const fraction = i / 10;
            const newTime = new Date(first.rawDate.getTime() + timeRange * fraction);
            
            // Find nearest points for interpolation
            let beforeIndex = 0;
            for (let j = 0; j < filteredPoints.length - 1; j++) {
              if (filteredPoints[j].rawDate <= newTime && filteredPoints[j+1].rawDate >= newTime) {
                beforeIndex = j;
                break;
              }
            }
            
            const before = filteredPoints[beforeIndex];
            const after = filteredPoints[Math.min(beforeIndex + 1, filteredPoints.length - 1)];
            
            // Calculate interpolation ratio
            const segmentRange = after.rawDate - before.rawDate;
            const segmentFraction = segmentRange > 0 ? 
              (newTime - before.rawDate) / segmentRange : 0;
            
            // Create new point
            const newPoint = {
              timestamp: newTime.toISOString(),
              rawDate: newTime,
              timeFormatted: format(newTime, 'h:mm a')
            };
            
            // Interpolate values
            if (before.nav !== undefined && after.nav !== undefined) {
              newPoint.nav = before.nav + (after.nav - before.nav) * segmentFraction;
            }
            
            if (before.yield !== undefined && after.yield !== undefined) {
              newPoint.yield = before.yield + (after.yield - before.yield) * segmentFraction;
            }
            
            morePoints.push(newPoint);
          }
          
          // Add the new points and re-sort
          filteredPoints = [...filteredPoints, ...morePoints].sort((a, b) => a.rawDate - b.rawDate);
        }
      }
      
      // Log number of points for debugging
      console.log(`[DEBUG] ${selectedRange} range filter: ${filteredPoints.length} points after filtering and enhancement`);
      
      return filteredPoints;
    } catch (error) {
      console.error("Error in processChartData:", error);
      
      // Return a minimal fallback dataset in case of error
      const fallbackData = [];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        const pointTime = new Date(now.getTime() - (9-i) * 10 * 60 * 1000);
        fallbackData.push({
          timestamp: pointTime.toISOString(),
          rawDate: pointTime, 
          timeFormatted: format(pointTime, 'h:mm a'),
          nav: 100 + i * 0.01,
          yield: 1.5 + i * 0.01
        });
      }
      
      return fallbackData; 
    }
  }

  // Function to downsample data for smoother chart rendering
  const downsampleData = (data) => {
    if (!data || data.length < 20) return data; // Don't downsample small datasets
    
    // For larger datasets, downsample based on size
    const sampleRate = Math.max(1, Math.floor(data.length / 75)); // Target ~75 points max
    
    console.log(`[DEBUG] Downsampling with rate: ${sampleRate} (${data.length} points)`);
    
    // Always include the first and last point for accurate range representation
    if (sampleRate > 1) {
      const first = data[0];
      const last = data[data.length - 1];
      
      const sampled = data.filter((_, index) => index % sampleRate === 0);
      
      // Ensure first and last points are included
      if (sampled[0] !== first) sampled.unshift(first);
      if (sampled[sampled.length - 1] !== last) sampled.push(last);
      
      return sampled;
    }
    
    return data;
  };

  // Function to determine Y-axis domain for NAV chart with improved visibility
  const getNavDomain = () => {
    if (chartData.length === 0) return [99, 101]; // Default domain if no data
    
    const navValues = chartData
      .filter(point => point.nav !== undefined && point.nav !== null)
      .map(point => point.nav);
    
    if (navValues.length === 0) return [99, 101]; // Default domain if no valid values
    
    const minNav = Math.min(...navValues);
    const maxNav = Math.max(...navValues);
    const range = maxNav - minNav;
    
    // If range is very small, create artificial range for better visibility
    if (range < 0.5) {
      // Center the midpoint and expand proportionally to exaggerate small moves
      const midpoint = (minNav + maxNav) / 2;
      const amplifiedRange = Math.max(0.2, range * 3); // At least 0.2 or 3x the actual range
      return [
        Math.max(0, midpoint - amplifiedRange / 2),
        midpoint + amplifiedRange / 2
      ];
    } else {
      // Otherwise add reasonable padding (10% of range)
      const padding = Math.max(0.1, range * 0.1);
      return [
        // Ensure we don't go below 0 for NAV values
        Math.max(0, minNav - padding), 
        maxNav + padding
      ];
    }
  };

  // Create and memoize series data for the chart
  const seriesData = useMemo(() => {
    if (!chartData || chartData.length === 0) return {};
    
    // Get min/max values for scaling
    const navValues = chartData.map(d => d.nav).filter(v => v !== undefined && v !== null);
    const yieldValues = chartData.map(d => d.yield).filter(v => v !== undefined && v !== null);
    
    const navMin = Math.min(...navValues) * 0.998;
    const navMax = Math.max(...navValues) * 1.002;
    const yieldMin = Math.min(...yieldValues) * 0.98;
    const yieldMax = Math.max(...yieldValues) * 1.02;
    
    // Color definitions
    const navColor = '#3B82F6';
    const yieldColor = '#10B981';
    
    return {
      navMin, navMax, yieldMin, yieldMax,
      navColor, yieldColor
    };
  }, [chartData]);

  // New custom styles for range buttons
  const getRangeButtonStyles = (buttonRange) => {
    return buttonRange === range
      ? 'bg-secondary text-white border-secondary shadow-md'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  };

  const getViewButtonStyles = (buttonView) => {
    return buttonView === viewMode
      ? 'bg-primary text-white border-primary shadow-md'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  };

  if (loading) {
    return <LoadingState className={className} />;
  }

  if (error) {
    return <ErrorState error={error} className={className} />;
  }

  if (!chartData.length) {
    return <EmptyState className={className} />;
  }

  // Modified to use custom styles and more elegant design
  return (
    <div className={`chart-container bg-white rounded-xl p-5 shadow-md border border-gray-100 ${className || ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-gray-800">
          <span className="gold-accent">Performance</span> Overview
        </h3>
        <div className="flex space-x-2">
          {/* View mode toggles */}
          <div className="flex rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getViewButtonStyles('NAV')}`}
              onClick={() => setViewMode('NAV')}
            >
              NAV
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getViewButtonStyles('YIELD')}`}
              onClick={() => setViewMode('YIELD')}
            >
              Yield
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getViewButtonStyles('COMBINED')}`}
              onClick={() => setViewMode('COMBINED')}
            >
              Combined
            </button>
          </div>
          
          {/* Range selection buttons */}
          <div className="flex rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getRangeButtonStyles('1H')}`}
              onClick={() => setRange('1H')}
            >
              1H
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getRangeButtonStyles('6H')}`}
              onClick={() => setRange('6H')}
            >
              6H
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getRangeButtonStyles('1D')}`}
              onClick={() => setRange('1D')}
            >
              1D
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${getRangeButtonStyles('ALL')}`}
              onClick={() => setRange('ALL')}
            >
              ALL
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesData.navColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={seriesData.navColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={seriesData.yieldColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={seriesData.yieldColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(209, 213, 219, 0.5)"
            />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatTime}
              stroke="#6b7280"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickLine={{ stroke: "#d1d5db" }}
            />
            {(viewMode === 'NAV' || viewMode === 'COMBINED') && (
              <YAxis 
                yAxisId="nav"
                orientation="left" 
                domain={getNavDomain()}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                stroke={seriesData.navColor}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={{ stroke: "#d1d5db" }}
              />
            )}
            {(viewMode === 'YIELD' || viewMode === 'COMBINED') && (
              <YAxis 
                yAxisId="yield"
                orientation="right" 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value.toFixed(2)}%`}
                stroke={seriesData.yieldColor}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={{ stroke: "#d1d5db" }}
              />
            )}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{
                stroke: "rgba(107, 114, 128, 0.3)",
                strokeWidth: 1,
                strokeDasharray: "3 3"
              }}
            />
            <Legend verticalAlign="top" height={36} />
            {(viewMode === 'NAV' || viewMode === 'COMBINED') && (
              <Area 
                type="monotone" 
                dataKey="nav" 
                yAxisId="nav"
                name="NAV ($)" 
                stroke={seriesData.navColor} 
                strokeWidth={2}
                fill="url(#navFill)" 
                activeDot={{ 
                  r: 6, 
                  stroke: seriesData.navColor,
                  strokeWidth: 1,
                  fill: seriesData.navColor
                }} 
              />
            )}
            {(viewMode === 'YIELD' || viewMode === 'COMBINED') && (
              <Area 
                type="monotone" 
                dataKey="yield" 
                yAxisId="yield" 
                name="Yield (%)" 
                stroke={seriesData.yieldColor} 
                strokeWidth={2}
                fill="url(#yieldFill)" 
                activeDot={{ 
                  r: 6, 
                  stroke: seriesData.yieldColor,
                  strokeWidth: 1,
                  fill: seriesData.yieldColor
                }} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>Last updated: {timeAgo(latestTimestamp)}</span>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: seriesData.navColor }}></div>
            <span>NAV: ${formatNumber(currentNav)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: seriesData.yieldColor }}></div>
            <span>Yield: {formatNumber(currentYield)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add these modified loading, error and empty states with improved styling

function LoadingState({ className }) {
  return (
    <div className={`chart-container bg-white rounded-xl p-5 h-80 flex items-center justify-center shadow-md border border-gray-100 ${className || ''}`}>
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-t-secondary border-gray-200 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading chart data...</p>
      </div>
    </div>
  );
}

function ErrorState({ error, className }) {
  return (
    <div className={`chart-container bg-white rounded-xl p-5 h-80 flex items-center justify-center shadow-md border border-gray-100 ${className || ''}`}>
      <div className="text-center p-6 max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Error</h3>
        <p className="text-gray-600 mb-4">
          {error?.message || "Unable to load chart data. Please try again later."}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ className }) {
  return (
    <div className={`chart-container bg-white rounded-xl p-5 h-80 flex items-center justify-center shadow-md border border-gray-100 ${className || ''}`}>
      <div className="text-center p-6 max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 text-gray-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Chart Data</h3>
        <p className="text-gray-600">
          There is no chart data available to display at this time.
        </p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="text-xs font-medium text-gray-500 mb-2">
        {formatTime(label)}
      </p>
      {payload.map((entry, index) => {
        // Customize the tooltip based on NAV or yield
        const isNav = entry.dataKey === "nav";
        const valuePrefix = isNav ? "$" : "";
        const valueSuffix = isNav ? "" : "%";
        const colorClass = isNav ? "text-blue-600" : "text-amber-600";
        
        return (
          <div key={`tooltip-${index}`} className="flex items-center justify-between mb-1 last:mb-0">
            <span className="flex items-center">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">
                {entry.name}:
              </span>
            </span>
            <span className={`text-xs font-medium ml-4 ${colorClass}`}>
              {valuePrefix}{formatNumber(entry.value, 3)}{valueSuffix}
            </span>
          </div>
        );
      })}
    </div>
  );
}; 