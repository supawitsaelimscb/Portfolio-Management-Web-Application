import type { Transaction } from '../types/transaction';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (transactionId: string) => void;
  onEdit?: (transaction: Transaction) => void;
  deletingId?: string | null;
}

export function TransactionList({ transactions, onDelete, onEdit, deletingId }: TransactionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    try {
      return format(date, 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No transactions yet</h3>
        <p className="text-xs text-gray-500">Add your first deposit to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center space-x-3 flex-1">
            {/* Icon */}
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              transaction.type === 'deposit' 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              {transaction.type === 'deposit' ? (
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-semibold ${
                  transaction.type === 'deposit' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  {transaction.mutualFundDetails && (
                    <span className="ml-2 text-xs font-normal text-gray-600">
                      #{transaction.mutualFundDetails.installmentNo}
                    </span>
                  )}
                  {transaction.stockDetails && (
                    <span className="ml-2 text-xs font-normal text-gray-600">
                      #{transaction.stockDetails.installmentNo}
                    </span>
                  )}
                </p>
                <p className={`text-base font-bold ${
                  transaction.type === 'deposit' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
              
              {/* Mutual Fund Details */}
              {transaction.mutualFundDetails && (
                <div className="mt-1">
                  <p className="text-xs font-medium text-gray-700">
                    {transaction.mutualFundDetails.fundName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.mutualFundDetails.unitsPurchased.toFixed(4)} units × ฿{transaction.mutualFundDetails.pricePerUnit.toFixed(4)}
                  </p>
                </div>
              )}
              
              {/* Stock Details */}
              {transaction.stockDetails && (
                <div className="mt-1">
                  <p className="text-xs font-medium text-gray-700">
                    {transaction.stockDetails.stockName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.stockDetails.unitsPurchased.toFixed(4)} units × ${transaction.stockDetails.pricePerUnitUSD.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Exchange: ฿{transaction.stockDetails.exchangeRate.toFixed(2)} = ฿{transaction.stockDetails.purchaseValueTHB.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.date)}
                </p>
                {transaction.notes && !transaction.mutualFundDetails && !transaction.stockDetails && (
                  <p className="text-xs text-gray-500 truncate ml-2 max-w-[150px]">
                    {transaction.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 ml-2">
              {/* Edit Button */}
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Edit transaction"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete this transaction? This will update your portfolio balance.')) {
                      onDelete(transaction.id);
                    }
                  }}
                  disabled={deletingId === transaction.id}
                  className={`p-1.5 rounded transition ${
                    deletingId === transaction.id
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title="Delete transaction"
                >
                  {deletingId === transaction.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
