import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card } from './ui';
import { useAuth } from '../RoleContext';

const AUDIT_LOGS_QUERY = gql`
  query GetAuditLogs($fundId: ID!) {
    auditLogs(fundId: $fundId) {
      id
      timestamp
      actor
      action
      target
      metadata
    }
  }
`;

// Helper function to format timestamps
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export default function AdminAuditLog({ fundId }) {
  const { role } = useAuth();
  const [filter, setFilter] = useState("ALL");
  
  const { loading, error, data } = useQuery(AUDIT_LOGS_QUERY, {
    variables: { fundId },
    pollInterval: 30000, 
    skip: !fundId // Skip the query if no fundId is provided
  });

  // If not admin, show a message instead of the log
  if (role !== 'ADMIN') {
    return (
      <Card>
        <div className="p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to view audit logs.
          </p>
        </div>
      </Card>
    );
  }

  // Show message if no fund is selected
  if (!fundId) {
    return (
      <Card>
        <div className="p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please select a fund to view audit logs.
          </p>
        </div>
      </Card>
    );
  }

  const filteredLogs = data?.auditLogs?.filter(
    log => filter === "ALL" || log.action === filter
  ) || [];

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700 dark:text-gray-300">Audit Log</h3>
        <select 
          onChange={(e) => setFilter(e.target.value)} 
          value={filter}
          className="text-sm border rounded p-1 bg-white dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="ALL">All</option>
          <option value="NAV_UPDATE">NAV Updates</option>
          <option value="MINT">Mint</option>
          <option value="REDEEM">Redeem</option>
          <option value="YIELD_UPDATE">Yield Updates</option>
          <option value="AUDIT_CHECK">Audit Checks</option>
        </select>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-400">Failed to load audit logs: {error.message}</p>
      ) : !filteredLogs.length ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs available</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{formatTime(log.timestamp)}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{log.actor}</span>
              </div>
              <p className="text-sm mt-1">{log.action} - {log.target}</p>
              {log.metadata && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{JSON.stringify(log.metadata)}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
} 