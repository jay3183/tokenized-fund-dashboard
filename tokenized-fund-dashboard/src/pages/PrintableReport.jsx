import { useQuery, gql } from '@apollo/client';
import { useEffect } from 'react';

const AUDIT_LOGS = gql`
  query AllLogs {
    allFunds {
      id
      name
      auditLogs {
        id
        timestamp
        actor
        action
        metadata
      }
    }
  }
`;

export default function PrintableReport() {
  const { data, loading, error } = useQuery(AUDIT_LOGS);

  useEffect(() => {
    // Trigger print dialog on load
    if (!loading && !error) {
      setTimeout(() => {
        window.print();
      }, 1000); // Small delay to ensure styles are applied
    }
  }, [loading, error]);

  if (loading) return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Loading Compliance Report...</h1>
      <p>Please wait while we generate your report.</p>
    </div>
  );

  if (error) return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Error Loading Report</h1>
      <p className="text-red-500">{error.message}</p>
    </div>
  );

  return (
    <div className="p-8 font-mono text-xs print:text-[8pt]">
      <div className="mb-8 print:mb-4">
        <h1 className="text-2xl font-bold mb-2 print:text-xl">Tokenized Fund Compliance Report</h1>
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleString()}</p>
        <p className="text-sm mt-2 print:hidden">
          <button 
            onClick={() => window.print()} 
            className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            🖨️ Print Report
          </button>
        </p>
      </div>
      
      {data?.allFunds?.map(fund => (
        <div key={fund.id} className="mb-6 page-break-inside-avoid">
          <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-1 mb-2">
            {fund.name} (ID: {fund.id})
          </h2>
          
          {fund.auditLogs && fund.auditLogs.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-200">
                  <th className="text-left p-2 border">Timestamp</th>
                  <th className="text-left p-2 border">Actor</th>
                  <th className="text-left p-2 border">Action</th>
                  <th className="text-left p-2 border">Details</th>
                </tr>
              </thead>
              <tbody>
                {fund.auditLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-2 border">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-2 border">{log.actor}</td>
                    <td className="p-2 border">{log.action}</td>
                    <td className="p-2 border font-mono text-xs whitespace-pre-wrap">
                      {log.metadata ? JSON.stringify(log.metadata, null, 2) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No audit logs available for this fund</p>
          )}
        </div>
      ))}
      
      <div className="mt-8 text-center text-xs text-gray-500 print:mt-4">
        <p>End of Compliance Report - Confidential</p>
      </div>
    </div>
  );
} 