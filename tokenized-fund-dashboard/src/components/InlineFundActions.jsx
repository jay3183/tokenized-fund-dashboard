import React from 'react';

export default function InlineFundActions({ fund }) {
  if (!fund) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500 italic">
        No fund selected
      </div>
    );
  }

  const handleMint = () => {
    console.log(`Minting shares for fund: ${fund.name}`);
    // Add your mint logic here
  };

  const handleRedeem = () => {
    console.log(`Redeeming shares for fund: ${fund.name}`);
    // Add your redeem logic here
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing yield from fund: ${fund.name}`);
    // Add your withdraw logic here
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <button
        onClick={handleMint}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
      >
        + Mint Shares
      </button>

      <button
        onClick={handleRedeem}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded"
      >
        - Redeem Shares
      </button>

      <button
        onClick={handleWithdraw}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded"
      >
        Withdraw Yield
      </button>
    </div>
  );
} 