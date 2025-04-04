import { LineChart, Line, ResponsiveContainer } from 'recharts';

/**
 * A small sparkline chart showing yield history trends
 * @param {Array} data - Yield history data, typically last 5 points
 * @returns {JSX.Element} - Sparkline chart component
 */
export default function YieldSparkline({ data }) {
  if (!data || data.length === 0) return null;

  // Determine if the overall trend is positive or negative
  const firstPoint = data[0]?.yield || 0;
  const lastPoint = data[data.length - 1]?.yield || 0;
  const isPositive = lastPoint >= firstPoint;
  
  // Use green for positive trends, red for negative
  const lineColor = isPositive ? '#16a34a' : '#dc2626';
  
  return (
    <div className="w-16 h-8 inline-block ml-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="yield" 
            stroke={lineColor} 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 