import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useTransaction } from '../hooks/useTransaction';
import { useNavigate } from 'react-router-dom';
import { PortfolioList } from '../components/PortfolioList';
import { CreatePortfolioModal } from '../components/CreatePortfolioModal';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ViewTransactionsModal } from '../components/ViewTransactionsModal';
import { PortfolioStats } from '../components/PortfolioStats';
import { PortfolioDistributionChart } from '../components/PortfolioDistributionChart';
import { PerformanceChart } from '../components/PerformanceChart';
import { transactionService } from '../services/transaction';
import type { Portfolio } from '../types/portfolio';
import type { Transaction } from '../types/transaction';

export function Dashboard() {
  const { appUser, logout } = useAuth();
  const { portfolios, isLoading, createPortfolio, deletePortfolio, stats, refreshPortfolios } = usePortfolio();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isViewTransactionsModalOpen, setIsViewTransactionsModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const { createTransaction } = useTransaction(selectedPortfolio?.id);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const handleAddTransaction = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsTransactionModalOpen(true);
  };

  const handleViewTransactions = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsViewTransactionsModalOpen(true);
  };

  const handleTransactionCreated = async () => {
    // Refresh portfolios to update stats
    await refreshPortfolios();
    // Refresh all transactions for charts
    await fetchAllTransactions();
  };

  const fetchAllTransactions = async () => {
    if (!appUser?.uid) return;
    try {
      const transactions = await transactionService.getUserTransactions(appUser.uid);
      setAllTransactions(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, [appUser?.uid]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio Manager</h1>
                <p className="text-sm text-gray-500">Welcome back, {appUser?.displayName}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Portfolio Statistics */}
          <PortfolioStats stats={stats} />

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PortfolioDistributionChart portfolios={portfolios} />
            <PerformanceChart portfolios={portfolios} allTransactions={allTransactions} />
          </div>

          {/* Create Portfolio Button */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">My Portfolios</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-md"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Portfolio
            </button>
          </div>

          {/* Portfolio List */}
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-600">Loading portfolios...</p>
            </div>
          ) : (
            <PortfolioList
              portfolios={portfolios}
              onDelete={deletePortfolio}
              onAddTransaction={handleAddTransaction}
              onViewTransactions={handleViewTransactions}
            />
          )}

          {/* Create Portfolio Modal */}
          <CreatePortfolioModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={createPortfolio}
          />

          {/* Add Transaction Modal */}
          <AddTransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => {
              setIsTransactionModalOpen(false);
              setSelectedPortfolio(null);
            }}
            onCreate={async (input) => {
              await createTransaction(input);
              await handleTransactionCreated();
            }}
            portfolioId={selectedPortfolio?.id || ''}
            portfolioName={selectedPortfolio?.name || ''}
            investmentType={selectedPortfolio?.investmentType}
          />

          {/* View Transactions Modal */}
          <ViewTransactionsModal
            isOpen={isViewTransactionsModalOpen}
            onClose={() => {
              setIsViewTransactionsModalOpen(false);
              setSelectedPortfolio(null);
              refreshPortfolios();
              fetchAllTransactions();
            }}
            portfolio={selectedPortfolio}
          />
        </div>
      </main>
    </div>
  );
}
