import { useNavigate } from 'react-router-dom';
import type { Portfolio } from '../types/portfolio';
import { INVESTMENT_TYPES } from '../types/portfolio';

interface PortfolioListProps {
  portfolios: Portfolio[];
  onEdit?: (portfolio: Portfolio) => void;
  onDelete?: (portfolio: Portfolio) => void;
  onAddTransaction?: (portfolio: Portfolio) => void;
  onViewTransactions?: (portfolio: Portfolio) => void;
  onUpdateNav?: (portfolio: Portfolio) => void;
  onUpdateStockPrice?: (portfolio: Portfolio) => void;
}

export function PortfolioList({ portfolios, onEdit, onDelete, onAddTransaction, onViewTransactions, onUpdateNav, onUpdateStockPrice }: PortfolioListProps) {
  const navigate = useNavigate();
  
  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No portfolios yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create your first portfolio to start tracking investments</p>
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolios.map((portfolio, index) => {
        const investmentType = INVESTMENT_TYPES[portfolio.investmentType];

        return (
          <div
            key={portfolio.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 overflow-hidden transform hover:scale-105 animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Header */}
            <div className={`${investmentType.color} p-4 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{investmentType.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{portfolio.name}</h3>
                    <p className="text-sm opacity-90">{investmentType.label}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(portfolio)}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition"
                      title="Edit portfolio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${portfolio.name}"? This action cannot be undone.`)) {
                          onDelete(portfolio);
                        }
                      }}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition"
                      title="Delete portfolio"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Current Value */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Value</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.currentValue)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Invested: {formatCurrency(portfolio.totalInvested)}</span>
                  <span className={`font-medium ${portfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(portfolio.returnPercentage)}
                  </span>
                </div>
                {/* Total Units for Mutual Funds */}
                {portfolio.investmentType === 'mutual_fund' && portfolio.totalUnits !== undefined && portfolio.totalUnits > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Total Units: <span className="font-semibold text-gray-900 dark:text-white">{portfolio.totalUnits.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transactions</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{portfolio.transactionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Return</p>
                  <p className={`text-lg font-semibold ${portfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolio.totalReturn)}
                  </p>
                </div>
              </div>

              {/* Target Progress */}
              {portfolio.targetAmount && portfolio.targetAmount > 0 && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Target Progress</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.min(Math.round((portfolio.currentValue / portfolio.targetAmount) * 100), 100)}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        of {formatCurrency(portfolio.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (portfolio.currentValue / portfolio.targetAmount) * 100 >= 100
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : (portfolio.currentValue / portfolio.targetAmount) * 100 >= 66
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : (portfolio.currentValue / portfolio.targetAmount) * 100 >= 33
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{
                        width: `${Math.min((portfolio.currentValue / portfolio.targetAmount) * 100, 100)}%`
                      }}
                    />
                  </div>
                  {portfolio.currentValue < portfolio.targetAmount && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatCurrency(portfolio.targetAmount - portfolio.currentValue)} remaining
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              {portfolio.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                  {portfolio.description}
                </p>
              )}

              {/* Action Buttons */}
              {(onAddTransaction || onViewTransactions || onUpdateNav || onUpdateStockPrice) && (
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    {onAddTransaction && (
                      <button
                        onClick={() => onAddTransaction(portfolio)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition shadow-sm"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Transaction
                        </span>
                      </button>
                    )}
                    {onViewTransactions && portfolio.transactionCount > 0 && (
                      <button
                        onClick={() => onViewTransactions(portfolio)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          View History
                        </span>
                      </button>
                    )}
                  </div>

                  {/* View Details button for PVD */}
                  {portfolio.investmentType === 'pvd' && (
                    <button
                      onClick={() => navigate(`/pvd/${portfolio.id}`)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition shadow-sm"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View PVD Details
                      </span>
                    </button>
                  )}

                  {/* View Details button for Cooperative */}
                  {portfolio.investmentType === 'cooperative' && (
                    <button
                      onClick={() => navigate(`/cooperative/${portfolio.id}`)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-sm"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Cooperative Details
                      </span>
                    </button>
                  )}
                  
                  {/* Update NAV button for mutual funds */}
                  {onUpdateNav && portfolio.investmentType === 'mutual_fund' && (
                    <button
                      onClick={() => onUpdateNav(portfolio)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition shadow-sm"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Update NAV
                        {portfolio.currentNavPerUnit && portfolio.currentNavPerUnit > 0 && (
                          <span className="ml-1.5 text-xs opacity-90">
                            (฿{portfolio.currentNavPerUnit.toFixed(4)})
                          </span>
                        )}
                      </span>
                    </button>
                  )}
                  
                  {/* Update Stock Price button for stocks */}
                  {onUpdateStockPrice && portfolio.investmentType === 'stock' && (
                    <button
                      onClick={() => onUpdateStockPrice(portfolio)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition shadow-sm"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Update Price
                        {portfolio.currentStockPriceUSD && portfolio.currentStockPriceUSD > 0 && (
                          <span className="ml-1.5 text-xs opacity-90">
                            (${portfolio.currentStockPriceUSD.toFixed(2)})
                          </span>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
