import { useEffect, useState } from 'react';
import type { PortfolioStats as Stats } from '../hooks/usePortfolio';

interface PortfolioStatsProps {
  stats: Stats;
}

export function PortfolioStats({ stats }: PortfolioStatsProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [animatedInvested, setAnimatedInvested] = useState(0);
  const [animatedReturn, setAnimatedReturn] = useState(0);

  useEffect(() => {
    // Animate numbers on mount or when stats change
    const duration = 1000; // 1 second
    const steps = 60; // 60 fps
    const increment = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setAnimatedValue(Math.floor(stats.totalValue * easeProgress));
      setAnimatedCount(Math.floor(stats.portfolioCount * easeProgress));
      setAnimatedInvested(Math.floor(stats.totalInvested * easeProgress));
      setAnimatedReturn(stats.totalReturn * easeProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValue(stats.totalValue);
        setAnimatedCount(stats.portfolioCount);
        setAnimatedInvested(stats.totalInvested);
        setAnimatedReturn(stats.totalReturn);
      }
    }, increment);

    return () => clearInterval(timer);
  }, [stats.totalValue, stats.portfolioCount, stats.totalInvested, stats.totalReturn]);
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Portfolio Value Card */}
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fadeIn">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Portfolio Value</dt>
                <dd className="text-2xl font-bold text-gray-900 transition-all duration-300">
                  {formatCurrency(animatedValue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolios Count Card */}
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse" style={{ animationDelay: '0.1s' }}>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Portfolios</dt>
                <dd className="text-2xl font-bold text-gray-900 transition-all duration-300">{animatedCount}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Invested Card */}
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center animate-pulse" style={{ animationDelay: '0.2s' }}>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Invested</dt>
                <dd className="text-2xl font-bold text-gray-900 transition-all duration-300">
                  {formatCurrency(animatedInvested)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Return Card */}
      <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center animate-pulse ${
                stats.totalReturn >= 0 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`} style={{ animationDelay: '0.3s' }}>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Return</dt>
                <dd className={`text-2xl font-bold transition-all duration-300 ${
                  stats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(animatedReturn / stats.totalInvested * 100)}
                </dd>
                <dd className={`text-sm transition-all duration-300 ${
                  stats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(animatedReturn)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
