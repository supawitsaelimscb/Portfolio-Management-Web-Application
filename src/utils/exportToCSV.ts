import type { Transaction } from '../types/transaction';
import { format } from 'date-fns';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  portfolioName: string
): void {
  // Define CSV headers
  const headers = [
    'Date',
    'Type',
    'Amount',
    'Fund Name',
    'Installment No.',
    'Units Purchased',
    'Price Per Unit',
    'Purchase Value',
    'Stock Name',
    'Price Per Unit USD',
    'Exchange Rate',
    'Notes',
  ];

  // Convert transactions to CSV rows
  const rows = transactions.map((transaction) => {
    const date = transaction.date instanceof Date 
      ? transaction.date 
      : new Date(transaction.date);
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
    const amount = transaction.amount.toFixed(2);
    
    // Mutual fund details (if available)
    const fundName = transaction.mutualFundDetails?.fundName || '';
    const fundInstallmentNo = transaction.mutualFundDetails?.installmentNo?.toString() || '';
    const fundUnits = transaction.mutualFundDetails?.unitsPurchased?.toFixed(4) || '';
    const fundPricePerUnit = transaction.mutualFundDetails?.pricePerUnit?.toFixed(4) || '';
    const fundPurchaseValue = transaction.mutualFundDetails
      ? (transaction.mutualFundDetails.unitsPurchased * transaction.mutualFundDetails.pricePerUnit).toFixed(2)
      : '';
    
    // Stock details (if available)
    const stockName = transaction.stockDetails?.stockName || '';
    const stockInstallmentNo = transaction.stockDetails?.installmentNo?.toString() || '';
    const stockUnits = transaction.stockDetails?.unitsPurchased?.toFixed(4) || '';
    const stockPriceUSD = transaction.stockDetails?.pricePerUnitUSD?.toFixed(2) || '';
    const stockExchangeRate = transaction.stockDetails?.exchangeRate?.toFixed(2) || '';
    const stockPurchaseValue = transaction.stockDetails?.purchaseValueTHB?.toFixed(2) || '';
    
    const notes = transaction.notes || '';

    return [
      formattedDate,
      type,
      amount,
      fundName || stockName,
      fundInstallmentNo || stockInstallmentNo,
      fundUnits || stockUnits,
      fundPricePerUnit || stockPurchaseValue,
      fundPurchaseValue || stockPurchaseValue,
      stockName,
      stockPriceUSD,
      stockExchangeRate,
      notes,
    ];
  });

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => 
      row.map((cell) => {
        // Escape cells containing commas, quotes, or newlines
        const cellString = String(cell);
        if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
          return `"${cellString.replace(/"/g, '""')}"`;
        }
        return cellString;
      }).join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = `${portfolioName.replace(/[^a-z0-9]/gi, '_')}_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
