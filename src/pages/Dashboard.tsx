import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useTransaction } from '../hooks/useTransaction';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { PortfolioList } from '../components/PortfolioList';
import { CreatePortfolioModal } from '../components/CreatePortfolioModal';
import { EditPortfolioModal } from '../components/EditPortfolioModal';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { ViewTransactionsModal } from '../components/ViewTransactionsModal';
import { UpdateNavModal } from '../components/UpdateNavModal';
import { UpdateStockPriceModal } from '../components/UpdateStockPriceModal';
import { PortfolioStats } from '../components/PortfolioStats';
import { PortfolioDistributionChart } from '../components/PortfolioDistributionChart';
import { PerformanceChart } from '../components/PerformanceChart';
import { ToastContainer } from '../components/ToastContainer';
import { transactionService } from '../services/transaction';
import { portfolioService } from '../services/portfolio';
import type { Portfolio } from '../types/portfolio';
import type { Transaction } from '../types/transaction';

export function Dashboard() {
  const { appUser, logout } = useAuth();
  const { portfolios, isLoading, createPortfolio, updatePortfolio, deletePortfolio, stats, refreshPortfolios } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isViewTransactionsModalOpen, setIsViewTransactionsModalOpen] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [isStockPriceModalOpen, setIsStockPriceModalOpen] = useState(false);
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

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsEditModalOpen(true);
  };

  const handleUpdatePortfolio = async (portfolioId: string, input: any) => {
    try {
      await updatePortfolio(portfolioId, input);
      setIsEditModalOpen(false);
      setSelectedPortfolio(null);
      refreshPortfolios();
      showToast('Portfolio updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update portfolio', 'error');
      throw error;
    }
  };

  const handleViewTransactions = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsViewTransactionsModalOpen(true);
  };

  const handleUpdateNav = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsNavModalOpen(true);
  };

  const handleNavUpdate = async (navPerUnit: number) => {
    if (!selectedPortfolio) return;
    try {
      await portfolioService.updateNav(selectedPortfolio.id, navPerUnit);
      // Trigger recalculation of portfolio stats
      await transactionService.updatePortfolioStats(selectedPortfolio.id);
      await refreshPortfolios();
      showToast('NAV updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update NAV', 'error');
      console.error('Failed to update NAV:', error);
      throw error;
    }
  };

  const handleUpdateStockPrice = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsStockPriceModalOpen(true);
  };

  const handleStockPriceUpdate = async (pricePerUnitUSD: number, exchangeRate: number) => {
    if (!selectedPortfolio) return;
    try {
      await portfolioService.updateStockPrice(selectedPortfolio.id, pricePerUnitUSD, exchangeRate);
      // Trigger recalculation of portfolio stats
      await transactionService.updatePortfolioStats(selectedPortfolio.id);
      await refreshPortfolios();
      showToast('Stock price updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update stock price', 'error');
      console.error('Failed to update stock price:', error);
      throw error;
    }
  };

  const handleTransactionCreated = async () => {
    // Refresh portfolios to update stats
    await refreshPortfolios();
    // Refresh all transactions for charts
    await fetchAllTransactions();
    showToast('Transaction added successfully', 'success');
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {appUser?.photoURL ? (
                <img
                  src={appUser.photoURL}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Manager</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back{appUser?.displayName ? `, ${appUser.displayName}` : ''}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                title="Settings"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <svg className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolios</h2>
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
              onEdit={handleEditPortfolio}
              onDelete={async (portfolio) => {
                try {
                  await deletePortfolio(portfolio.id);
                  showToast('Portfolio deleted successfully', 'success');
                } catch (error) {
                  showToast('Failed to delete portfolio', 'error');
                }
              }}
              onAddTransaction={handleAddTransaction}
              onViewTransactions={handleViewTransactions}
              onUpdateNav={handleUpdateNav}
              onUpdateStockPrice={handleUpdateStockPrice}
            />
          )}

          {/* Create Portfolio Modal */}
          <CreatePortfolioModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={async (input) => {
              try {
                await createPortfolio(input);
                showToast('Portfolio created successfully', 'success');
              } catch (error) {
                showToast('Failed to create portfolio', 'error');
                throw error;
              }
            }}
          />

          {/* Edit Portfolio Modal */}
          <EditPortfolioModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPortfolio(null);
            }}
            onUpdate={handleUpdatePortfolio}
            portfolio={selectedPortfolio}
          />

          {/* Add Transaction Modal */}
          <AddTransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => {
              setIsTransactionModalOpen(false);
              setSelectedPortfolio(null);
            }}
            onCreate={async (input) => {
              try {
                await createTransaction(input);
                await handleTransactionCreated();
              } catch (error) {
                showToast('Failed to add transaction', 'error');
                throw error;
              }
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

          {/* Update NAV Modal */}
          <UpdateNavModal
            isOpen={isNavModalOpen}
            onClose={() => {
              setIsNavModalOpen(false);
              setSelectedPortfolio(null);
            }}
          onUpdate={handleNavUpdate}
          portfolio={selectedPortfolio}
        />

          {/* Update Stock Price Modal */}
          <UpdateStockPriceModal
            isOpen={isStockPriceModalOpen}
            onClose={() => {
              setIsStockPriceModalOpen(false);
              setSelectedPortfolio(null);
            }}
            onUpdate={handleStockPriceUpdate}
            portfolio={selectedPortfolio}
          />

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </main>
  </div>
  );
}