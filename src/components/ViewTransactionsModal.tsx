import { useState } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import { useToast } from '../contexts/ToastContext';
import { TransactionList } from './TransactionList';
import { EditTransactionModal } from './EditTransactionModal';
import { exportTransactionsToCSV } from '../utils/exportToCSV';
import { generateSinglePortfolioReport } from '../utils/exportToPDF';
import type { Portfolio } from '../types/portfolio';
import type { Transaction, UpdateTransactionInput } from '../types/transaction';

interface ViewTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio | null;
}

export function ViewTransactionsModal({ isOpen, onClose, portfolio }: ViewTransactionsModalProps) {
  const { transactions, isLoading, deleteTransaction, updateTransaction } = useTransaction(portfolio?.id);
  const { showToast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [searchText, setSearchText] = useState('');

  const handleDelete = async (transactionId: string) => {
    setDeletingId(transactionId);
    try {
      await deleteTransaction(transactionId);
      showToast('Transaction deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete transaction', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (transactionId: string, input: UpdateTransactionInput) => {
    try {
      await updateTransaction(transactionId, input);
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
      showToast('Transaction updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update transaction', 'error');
      throw error;
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by date range
    if (startDate) {
      const txDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
      const start = new Date(startDate);
      if (txDate < start) return false;
    }
    if (endDate) {
      const txDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      if (txDate > end) return false;
    }

    // Filter by type
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }

    // Filter by search text
    if (searchText) {
      const search = searchText.toLowerCase();
      const matchesNotes = transaction.notes?.toLowerCase().includes(search);
      const matchesFundName = transaction.mutualFundDetails?.fundName?.toLowerCase().includes(search);
      const matchesAmount = transaction.amount.toString().includes(search);
      if (!matchesNotes && !matchesFundName && !matchesAmount) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setTypeFilter('all');
    setSearchText('');
  };

  const handleExport = () => {
    if (portfolio) {
      exportTransactionsToCSV(filteredTransactions, portfolio.name);
    }
  };

  const handleExportPDF = async () => {
    if (!portfolio) return;
    
    setIsExportingPDF(true);
    try {
      await generateSinglePortfolioReport(
        portfolio,
        filteredTransactions
      );
      showToast('PDF report generated successfully', 'success');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showToast('Failed to generate PDF report', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const hasActiveFilters = startDate || endDate || typeFilter !== 'all' || searchText;

  if (!isOpen || !portfolio) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-500 mt-1">{portfolio.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF || filteredTransactions.length === 0}
                  className="text-xs text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isExportingPDF ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handleExport}
                  disabled={filteredTransactions.length === 0}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'deposit' | 'withdrawal')}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="deposit">Deposits Only</option>
                  <option value="withdrawal">Withdrawals Only</option>
                </select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">Search</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Notes, fund name, amount..."
                  className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Results count */}
            <div className="text-xs text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-gray-600 text-sm">Loading transactions...</p>
              </div>
            ) : (
              <TransactionList
                transactions={filteredTransactions}
                onDelete={handleDelete}
                onEdit={handleEdit}
                deletingId={deletingId}
              />
            )}
          </div>

          {/* Close Button */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onUpdate={handleUpdate}
        transaction={selectedTransaction}
        portfolioName={portfolio?.name || ''}
        investmentType={portfolio?.investmentType}
      />
    </div>
  );
}
