import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Portfolio } from '../types/portfolio';
import { INVESTMENT_TYPES } from '../types/portfolio';

interface PortfolioDistributionChartProps {
  portfolios: Portfolio[];
}

export function PortfolioDistributionChart({ portfolios }: PortfolioDistributionChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group portfolios by investment type and sum their current values
  const distributionData = portfolios.reduce((acc, portfolio) => {
    const existingType = acc.find(item => item.type === portfolio.investmentType);
    
    if (existingType) {
      existingType.value += portfolio.currentValue;
    } else {
      const typeInfo = INVESTMENT_TYPES[portfolio.investmentType];
      acc.push({
        type: portfolio.investmentType,
        name: typeInfo.label,
        value: portfolio.currentValue,
        color: typeInfo.chartColor,
      });
    }
    
    return acc;
  }, [] as Array<{ type: string; name: string; value: number; color: string }>);

  // Filter out zero values
  const chartData = distributionData.filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No portfolio data to display</p>
          <p className="text-xs text-gray-400 mt-1">Create a portfolio and add transactions to see distribution</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Chart Container */}
      <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-500 ease-in-out ${
        isExpanded 
          ? 'fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-auto animate-scaleIn' 
          : 'animate-scaleOut'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 transition-all duration-300">Portfolio Distribution</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
          {isExpanded ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={isExpanded ? 600 : 300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={isExpanded ? 180 : 80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(_value, entry: any) => (
              <span className="text-sm text-gray-700">
                {entry.payload.name}: {formatCurrency(entry.payload.value)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
    </>
  );
}
