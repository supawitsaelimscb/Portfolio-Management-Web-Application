export type TransactionType = 'deposit' | 'withdrawal';

// Mutual fund specific details
export interface MutualFundDetails {
  fundName: string;
  installmentNo: number;
  unitsPurchased: number;
  pricePerUnit: number;
}

// Stock specific details
export interface StockDetails {
  stockName: string;
  installmentNo: number;
  unitsPurchased: number;
  pricePerUnitUSD: number;
  exchangeRate: number;
  purchaseValueTHB: number;
}

export interface Transaction {
  id: string;
  userId: string;
  portfolioId: string;
  type: TransactionType;
  amount: number;
  date: Date;
  notes?: string;
  // Mutual fund specific fields (optional, only for mutual_fund type)
  mutualFundDetails?: MutualFundDetails;
  // Stock specific fields (optional, only for stock type)
  stockDetails?: StockDetails;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  portfolioId: string;
  type: TransactionType;
  amount: number;
  date: Date;
  notes?: string;
  // Mutual fund specific fields (optional)
  mutualFundDetails?: MutualFundDetails;
  // Stock specific fields (optional)
  stockDetails?: StockDetails;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  date?: Date;
  notes?: string;
  mutualFundDetails?: MutualFundDetails;
  stockDetails?: StockDetails;
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  netInvested: number;
  transactionCount: number;
}
