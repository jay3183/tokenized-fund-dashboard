import { useRef, useEffect, useState } from 'react';

export default function DeltaBadge({ nav, fundId }) {
  // Default to 0, ensuring nav is a number
  const safeNav = nav == null ? 0 : nav;
  const prev = useRef(safeNav);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    if (safeNav === 0 && prev.current === 0) {
      setDelta(0);
    } else {
      setDelta(safeNav - prev.current);
      prev.current = safeNav;
    }
  }, [safeNav]);

  if (delta === 0) return null;

  const isUp = delta > 0;
  const color = isUp 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-600 dark:text-red-400';
  const sign = isUp ? '+' : '';
  const arrow = isUp ? '▲' : '▼';

  return (
    <span className={`text-sm font-medium ${color} ml-2 transition-colors duration-300 flex items-center`}>
      {arrow} {sign}{Math.abs(delta).toFixed(2)}
    </span>
  );
} 