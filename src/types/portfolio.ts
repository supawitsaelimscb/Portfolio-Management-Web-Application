export type InvestmentType = 
  | 'cooperative'
  | 'pvd'
  | 'mutual_fund'
  | 'stock'
  | 'savings';

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  investmentType: InvestmentType;
  targetAmount?: number;
  currentValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  transactionCount: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  color?: string;
  // Mutual fund specific fields
  currentNavPerUnit?: number;
  totalUnits?: number;
  // Stock specific fields
  currentStockPriceUSD?: number;
  currentExchangeRate?: number;
}

export interface CreatePortfolioInput {
  name: string;
  investmentType: InvestmentType;
  targetAmount?: number;
  description?: string;
  color?: string;
}

export interface UpdatePortfolioInput {
  name?: string;
  targetAmount?: number;
  description?: string;
  color?: string;
}

export const INVESTMENT_TYPES: Record<InvestmentType, { label: string; icon: string; color: string; chartColor: string }> = {
  cooperative: {
    label: 'Cooperative',
    icon: '🏛️',
    color: 'bg-blue-500',
    chartColor: '#3b82f6', // blue-500
  },
  pvd: {
    label: 'Provident Fund (PVD)',
    icon: '💼',
    color: 'bg-green-500',
    chartColor: '#22c55e', // green-500
  },
  mutual_fund: {
    label: 'Mutual Fund',
    icon: '📊',
    color: 'bg-purple-500',
    chartColor: '#a855f7', // purple-500
  },
  stock: {
    label: 'Stock',
    icon: '📈',
    color: 'bg-red-500',
    chartColor: '#ef4444', // red-500
  },
  savings: {
    label: 'Savings',
    icon: '💰',
    color: 'bg-yellow-500',
    chartColor: '#eab308', // yellow-500
  },
};
