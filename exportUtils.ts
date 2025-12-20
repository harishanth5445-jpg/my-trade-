
import { Trade } from './types';

/**
 * Utility to export an array of trades to a CSV file.
 */
export const exportTradesToCSV = (trades: Trade[], filename: string = 'tradenexus_export.csv') => {
  if (trades.length === 0) return;

  const headers = [
    'Date',
    'Asset',
    'Side',
    'Status',
    'Net P&L',
    'Contracts',
    'Duration',
    'Setup',
    'Rating',
    'Remarks'
  ];

  const rows = trades.map(t => [
    t.date,
    t.symbol,
    t.side,
    t.status,
    t.netPL.toFixed(2),
    t.contracts,
    t.duration,
    `"${t.setup.replace(/"/g, '""')}"`, // Escape quotes in strings
    t.rating || 0,
    `"${(t.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
