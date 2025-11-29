export type TransactionType = 'deposit' | 'withdrawal';

// Mutual fund specific details
export interface MutualFundDetails {
  fundName: string;
  installmentNo: number;
  unitsPurchased: number;
  pricePerUnit: number;
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
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  date?: Date;
  notes?: string;
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  netInvested: number;
  transactionCount: number;
}
