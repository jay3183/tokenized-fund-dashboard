import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Card } from './ui';
import { useAuth } from '../contexts/AuthContext';

// Query for fund-specific audit logs
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

// Query for all audit logs across funds
const ALL_AUDIT_LOGS_QUERY = gql`
  query GetAllAuditLogs {
    allLogs {
      id
      timestamp
      actor
      action
      target
      metadata
      fundId
    }
  }
`;

// Helper function to format timestamps
function formatTime(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  try {
    let date;
    
    // Handle different timestamp formats
    if (typeof timestamp === 'number' || /^\d+$/.test(timestamp)) {
      // Handle numeric timestamp (Unix epoch)
      date = new Date(parseInt(timestamp, 10));
    } else if (typeof timestamp === 'string') {
      // If it's a JSON string, try to parse it
      try {
        const parsed = JSON.parse(timestamp);
        if (parsed && typeof parsed === 'object' && parsed.timestamp) {
          date = new Date(parsed.timestamp);
        } else {
          date = new Date(timestamp);
        }
      } catch (e) {
        // Not JSON, treat as date string
        date = new Date(timestamp);
      }
    } else {
      date = new Date(timestamp);
    }
    
    // Verify the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp format:', timestamp);
      return 'Invalid date';
    }
    
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error('Error formatting timestamp:', e, 'Timestamp value:', timestamp);
    return 'Invalid date';
  }
}

// Format metadata for display
function formatMetadata(metadata) {
  if (!metadata) return null;
  
  try {
    // If it's a string that looks like JSON, try to parse it
    if (typeof metadata === 'string' && (metadata.startsWith('{') || metadata.startsWith('['))) {
      try {
        const parsed = JSON.parse(metadata);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        // If parsing fails, return the original string
        return metadata;
      }
    }
    
    // If it's already an object, stringify it with formatting
    if (typeof metadata === 'object') {
      return JSON.stringify(metadata, null, 2);
    }
    
    // Otherwise just return as string
    return metadata.toString();
  } catch (error) {
    console.error('Error formatting metadata:', error, 'Original metadata:', metadata);
    return 'Invalid metadata';
  }
}

export default function AdminAuditLog({ fundId = 'F1' }) {
  const { user } = useAuth();
  const role = user?.role;
  const [filter, setFilter] = useState("ALL");
  
  // Use different query based on whether fundId is provided
  const queryToUse = fundId ? AUDIT_LOGS_QUERY : ALL_AUDIT_LOGS_QUERY;
  const variables = fundId ? { fundId } : {};
  
  const { loading, error, data } = useQuery(queryToUse, {
    variables,
    pollInterval: 30000,
    fetchPolicy: "network-only"
  });

  // If not admin, show a message instead of the log
  if (role !== 'ADMIN') {
    return (
      <Card>
        <div className="p-4 text-center">
          <p className="text-gray-600">
            You need admin privileges to view audit logs.
          </p>
        </div>
      </Card>
    );
  }

  // Get logs from whichever query was used
  const logs = fundId ? data?.auditLogs : data?.allLogs;
  
  // Filter logs based on selected filter
  const filteredLogs = logs?.filter(
    log => filter === "ALL" || log.action === filter
  ) || [];
  
  // Render loading state
  if (loading) {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
          <h3 className="font-medium text-gray-700">
            {fundId ? `Audit Log: Fund ${fundId}` : 'All Audit Logs'}
          </h3>
          <select 
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
            className="text-sm border rounded p-1 bg-white w-full sm:w-auto"
            disabled
          >
            <option value="ALL">All</option>
          </select>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col space-y-1">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1 sm:mb-0" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
          <h3 className="font-medium text-gray-700">
            {fundId ? `Audit Log: Fund ${fundId}` : 'All Audit Logs'}
          </h3>
          <select 
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
            className="text-sm border rounded p-1 bg-white w-full sm:w-auto"
          >
            <option value="ALL">All</option>
          </select>
        </div>
        <p className="text-sm text-red-500">
          Failed to load audit logs: {error.message}
        </p>
      </Card>
    );
  }
  
  // Render empty state
  if (!filteredLogs.length) {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
          <h3 className="font-medium text-gray-700">
            {fundId ? `Audit Log: Fund ${fundId}` : 'All Audit Logs'}
          </h3>
          <select 
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
            className="text-sm border rounded p-1 bg-white w-full sm:w-auto"
          >
            <option value="ALL">All</option>
            <option value="NAV_UPDATE">NAV Updates</option>
            <option value="MINT">Mint</option>
            <option value="REDEEM">Redeem</option>
            <option value="WITHDRAW_YIELD">Yield Withdrawals</option>
          </select>
        </div>
        <p className="text-sm text-gray-500">
          No audit logs available
        </p>
      </Card>
    );
  }
  
  // Render logs
  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
        <h3 className="font-medium text-gray-700">
          {fundId ? `Audit Log: Fund ${fundId}` : 'All Audit Logs'}
        </h3>
        <select 
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
          className="text-sm border rounded p-1 bg-white w-full sm:w-auto"
        >
          <option value="ALL">All</option>
          <option value="NAV_UPDATE">NAV Updates</option>
          <option value="MINT">Mint</option>
          <option value="REDEEM">Redeem</option>
          <option value="WITHDRAW_YIELD">Yield Withdrawals</option>
        </select>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {filteredLogs.map((log) => (
          <div key={log.id} className="border-b border-gray-100 pb-2 last:border-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs">
              <span className="text-gray-500 mb-1 sm:mb-0">
                {formatTime(log.timestamp)}
              </span>
              <span className="font-medium text-gray-700">
                {log.actor}
              </span>
            </div>
            <p className="text-sm mt-1">
              {log.action} - {log.target}
            </p>
            {log.metadata && (
              <p className="text-xs text-gray-500 mt-1 break-words whitespace-pre-wrap overflow-x-auto">
                {formatMetadata(log.metadata)}
              </p>
            )}
            {!fundId && log.fundId && (
              <p className="text-xs text-blue-500 mt-1">
                Fund: {log.fundId}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
} 