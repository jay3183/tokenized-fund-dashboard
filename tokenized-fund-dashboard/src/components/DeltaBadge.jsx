import React from 'react';

// Custom arrow icon components
const ArrowUpRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3 mr-1 text-green-600"
  >
    <path d="M7 17l9.2-9.2M17 17V7H7" />
  </svg>
);

const ArrowDownRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3 mr-1 text-red-600"
  >
    <path d="M7 7l9.2 9.2M17 7v10H7" />
  </svg>
);

export default function DeltaBadge({ delta }) {
  // For null or undefined values, default to a small positive value
  if (delta == null || isNaN(delta)) delta = 0.01;
  
  // Ensure very small values still show as at least 0.01%
  if (Math.abs(delta) < 0.01) delta = 0.01 * (delta >= 0 ? 1 : -1);

  const isPositive = delta >= 0;
  const formatted = Math.abs(delta).toFixed(2);

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition duration-300 ${
        isPositive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isPositive ? <ArrowUpRight /> : <ArrowDownRight />}
      {isPositive ? '+' : '-'}
      {formatted}%
    </span>
  );
} 