import React from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import CountUp from 'react-countup';
import { PORTFOLIO_QUERY } from '../graphql/queries';
import * as Tooltip from '@radix-ui/react-tooltip';

function PortfolioPanel({ fundId }) {
  const { loading, error, data } = useQuery(PORTFOLIO_QUERY, {
    variables: { fundId },
    skip: !fundId,
  });

  // Calculate values for display
  const yieldPercentage = data?.fund?.intradayYield || 0;
  const nav = data?.fund?.currentNAV?.nav || 0;
  const shares = data?.portfolio?.shares || 0;
  
  // Fix calculation: yield percentage * NAV * shares
  const accruedToday = (yieldPercentage / 100) * nav * shares;
  
  // Format as currency
  const formattedAccrued = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(accruedToday);

  return (
    <Card className="mb-4">
      <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Your Portfolio</h3>
      {loading ? (
        <div className="space-y-2" aria-label="Loading portfolio data">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-400" aria-live="polite">Failed to load portfolio data</p>
      ) : !data?.portfolio ? (
        <p className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">No portfolio data found</p>
      ) : (
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-4">

            {/* Shares held with tooltip */}
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm sm:text-base whitespace-nowrap" aria-label="Shares held information">
              ✅ You hold 
              <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                  <Tooltip.Trigger className="font-semibold text-green-800 cursor-help" aria-label={`${shares.toFixed(2)} shares. Click for more information`}>
                    {shares.toFixed(2)} shares
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content 
                      className="bg-gray-900 text-white px-3 py-1.5 rounded text-xs max-w-[220px]"
                      sideOffset={5}
                      aria-live="polite"
                    >
                      <p>Exact shares: {shares}</p>
                      <p>Each share represents a tokenized unit of this fund.</p>
                      <p>Current NAV: ${nav.toFixed(2)} per share</p>
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>

            {/* Stats */}
            <div className="flex items-center divide-x divide-gray-200 text-sm sm:text-base text-right">
              
              <div className="px-4">
                <p className="text-gray-500">Intraday Yield</p>
                <p className="text-blue-600 font-semibold" aria-label={`Intraday Yield: ${yieldPercentage.toFixed(2)}%`}>
                  <CountUp end={yieldPercentage} suffix="%" decimals={2} duration={0.75} />
                </p>
              </div>

              <div className="px-4">
                <p className="text-gray-500">Accrued Today</p>
                <Tooltip.Provider delayDuration={300}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <p className="text-green-700 font-semibold cursor-help" aria-label={`Accrued Today: ${formattedAccrued}`}>
                        <CountUp 
                          end={accruedToday} 
                          prefix="$" 
                          decimals={2} 
                          duration={0.75}
                          separator=","
                        />
                      </p>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content 
                        className="bg-gray-900 text-white px-3 py-1.5 rounded text-xs max-w-[220px]"
                        sideOffset={5}
                      >
                        <p>This is the income earned today based on:</p>
                        <ul className="list-disc pl-4 mt-1">
                          <li>Current Yield: {yieldPercentage.toFixed(2)}%</li>
                          <li>NAV per Share: ${nav.toFixed(2)}</li>
                          <li>Shares Held: {shares.toFixed(2)}</li>
                        </ul>
                        <Tooltip.Arrow className="fill-gray-900" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>

            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}

export default PortfolioPanel; 