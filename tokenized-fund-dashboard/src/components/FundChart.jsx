import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FundChart({ navHistory, yieldHistory }) {
  const [selectedRange, setSelectedRange] = useState("ALL");
  const now = Date.now();

  // Merge navHistory and yieldHistory by timestamp
  const mergedData = useMemo(() => {
    const navMap = new Map();
    const yieldMap = new Map();
    
    // Create maps for quick lookup
    navHistory.forEach(item => {
      navMap.set(new Date(item.timestamp).getTime(), item.nav);
    });
    
    yieldHistory.forEach(item => {
      yieldMap.set(new Date(item.timestamp).getTime(), item.yield);
    });
    
    // Combine all timestamps
    const allTimestamps = [...new Set([
      ...navHistory.map(item => new Date(item.timestamp).getTime()),
      ...yieldHistory.map(item => new Date(item.timestamp).getTime()),
    ])].sort();
    
    // Create combined dataset
    return allTimestamps.map(timestamp => {
      const date = new Date(timestamp);
      return {
        timestamp: date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        rawTimestamp: timestamp,
        nav: navMap.get(timestamp) || null,
        yield: yieldMap.get(timestamp) || null
      };
    });
  }, [navHistory, yieldHistory]);

  const filteredData = useMemo(() => {
    const cutoff = {
      "1H": now - 3600 * 1000,
      "6H": now - 6 * 3600 * 1000,
      "1D": now - 24 * 3600 * 1000,
      "ALL": 0,
    }[selectedRange];
    return mergedData.filter((point) => point.rawTimestamp > cutoff);
  }, [mergedData, selectedRange]);
  
  return (
    <div className="h-[300px] p-4">
      <div className="flex space-x-2 justify-end mb-2">
        {["1H", "6H", "1D", "ALL"].map((range) => (
          <button
            key={range}
            className={`text-xs px-2 py-1 rounded ${selectedRange === range ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setSelectedRange(range)}
          >
            {range}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
          margin={{
            top: 20,
            right: 40,
            left: 40,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) =>
              new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            interval="preserveStartEnd"
            minTickGap={30}
            padding={{ left: 25, right: 25 }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => `$${parseFloat(value).toFixed(2)}`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickMargin={12}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${parseFloat(value).toFixed(2)}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "NAV") return [`$${value.toFixed(2)}`, "NAV"];
              if (name === "Yield") return [`${value.toFixed(2)}%`, "Yield"];
              return [value, name];
            }}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="nav"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="NAV"
            yAxisId="left"
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Yield"
            yAxisId="right"
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 