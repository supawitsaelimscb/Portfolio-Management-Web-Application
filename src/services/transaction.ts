import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { portfolioService } from './portfolio';
import type { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionStats } from '../types/transaction';

export const transactionService = {
  // Create new transaction
  async createTransaction(userId: string, input: CreateTransactionInput): Promise<Transaction> {
    try {
      const transactionRef = doc(collection(db, 'transactions'));
      const now = Timestamp.now();

      const transactionData: any = {
        userId,
        portfolioId: input.portfolioId,
        type: input.type,
        amount: input.amount,
        date: Timestamp.fromDate(input.date),
        notes: input.notes || '',
        createdAt: now,
        updatedAt: now,
      };

      // Add mutual fund details if provided
      if (input.mutualFundDetails) {
        transactionData.mutualFundDetails = input.mutualFundDetails;
      }
      
      // Add stock details if provided
      if (input.stockDetails) {
        transactionData.stockDetails = input.stockDetails;
      }

      // Add PVD details if provided
      if (input.pvdDetails) {
        transactionData.pvdDetails = input.pvdDetails;
      }

      // Add Cooperative details if provided
      if (input.cooperativeDetails) {
        transactionData.cooperativeDetails = input.cooperativeDetails;
      }

      await setDoc(transactionRef, transactionData);

      const transaction: Transaction = {
        id: transactionRef.id,
        userId,
        portfolioId: input.portfolioId,
        type: input.type,
        amount: input.amount,
        date: input.date,
        notes: input.notes,
        mutualFundDetails: input.mutualFundDetails,
        stockDetails: input.stockDetails,
        pvdDetails: input.pvdDetails,
        cooperativeDetails: input.cooperativeDetails,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      // Update portfolio statistics
      await this.updatePortfolioStats(input.portfolioId);

      if (import.meta.env.DEV) {
        console.log('✅ Transaction created:', transaction.type, transaction.amount);
      }
      return transaction;
    } catch (error: any) {
      console.error('❌ Error creating transaction:', error.message);
      throw error;
    }
  },

  // Get all transactions for a portfolio
  async getPortfolioTransactions(portfolioId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('portfolioId', '==', portfolioId)
      );

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          userId: data.userId,
          portfolioId: data.portfolioId,
          type: data.type,
          amount: data.amount,
          date: data.date?.toDate(),
          notes: data.notes,
          mutualFundDetails: data.mutualFundDetails,
          stockDetails: data.stockDetails,
          pvdDetails: data.pvdDetails,
          cooperativeDetails: data.cooperativeDetails,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });

      // Sort by date in descending order (most recent first)
      transactions.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.getTime() - a.date.getTime();
      });

      if (import.meta.env.DEV) {
        console.log(`✅ Fetched ${transactions.length} transactions`);
      }
      return transactions;
    } catch (error: any) {
      console.error('❌ Error fetching transactions:', error.message);
      throw error;
    }
  },

  // Get all transactions for a user
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          userId: data.userId,
          portfolioId: data.portfolioId,
          type: data.type,
          amount: data.amount,
          date: data.date?.toDate(),
          notes: data.notes,
          mutualFundDetails: data.mutualFundDetails,
          stockDetails: data.stockDetails,
          pvdDetails: data.pvdDetails,
          cooperativeDetails: data.cooperativeDetails,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });

      return transactions;
    } catch (error: any) {
      console.error('❌ Error fetching user transactions:', error.message);
      throw error;
    }
  },

  // Get single transaction
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        portfolioId: data.portfolioId,
        type: data.type,
        amount: data.amount,
        date: data.date?.toDate(),
        notes: data.notes,
        mutualFundDetails: data.mutualFundDetails,
        stockDetails: data.stockDetails,
        pvdDetails: data.pvdDetails,
        cooperativeDetails: data.cooperativeDetails,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    } catch (error: any) {
      console.error('❌ Error fetching transaction:', error.message);
      throw error;
    }
  },

  // Update transaction
  async updateTransaction(
    transactionId: string,
    portfolioId: string,
    input: UpdateTransactionInput
  ): Promise<void> {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      const updateData: any = {
        ...input,
        updatedAt: Timestamp.now(),
      };

      if (input.date) {
        updateData.date = Timestamp.fromDate(input.date);
      }

      await updateDoc(docRef, updateData);

      // Update portfolio statistics
      await this.updatePortfolioStats(portfolioId);

      if (import.meta.env.DEV) {
        console.log('✅ Transaction updated:', transactionId);
      }
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error.message);
      throw error;
    }
  },

  // Delete transaction
  async deleteTransaction(transactionId: string, portfolioId: string): Promise<void> {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      await deleteDoc(docRef);

      // Update portfolio statistics
      await this.updatePortfolioStats(portfolioId);

      if (import.meta.env.DEV) {
        console.log('✅ Transaction deleted:', transactionId);
      }
    } catch (error: any) {
      console.error('❌ Error deleting transaction:', error.message);
      throw error;
    }
  },

  // Calculate transaction statistics for a portfolio
  async getPortfolioStats(portfolioId: string): Promise<TransactionStats> {
    try {
      const transactions = await this.getPortfolioTransactions(portfolioId);

      let totalDeposits = 0;
      let totalWithdrawals = 0;

      transactions.forEach((t) => {
        if (t.type === 'deposit') {
          totalDeposits += t.amount;
        } else {
          totalWithdrawals += t.amount;
        }
      });

      return {
        totalDeposits,
        totalWithdrawals,
        netInvested: totalDeposits - totalWithdrawals,
        transactionCount: transactions.length,
      };
    } catch (error: any) {
      console.error('❌ Error calculating stats:', error.message);
      throw error;
    }
  },

  // Calculate total units for mutual fund portfolios
  async getMutualFundUnits(portfolioId: string): Promise<number> {
    try {
      const transactions = await this.getPortfolioTransactions(portfolioId);
      let totalUnits = 0;

      transactions.forEach((t) => {
        if (t.mutualFundDetails) {
          if (t.type === 'deposit') {
            totalUnits += t.mutualFundDetails.unitsPurchased;
          } else {
            totalUnits -= t.mutualFundDetails.unitsPurchased;
          }
        }
      });

      return totalUnits;
    } catch (error: any) {
      console.error('❌ Error calculating units:', error.message);
      throw error;
    }
  },

  // Calculate total units for stock portfolios
  async getStockUnits(portfolioId: string): Promise<number> {
    try {
      const transactions = await this.getPortfolioTransactions(portfolioId);
      let totalUnits = 0;

      transactions.forEach((t) => {
        if (t.stockDetails) {
          if (t.type === 'deposit') {
            totalUnits += t.stockDetails.unitsPurchased;
          } else {
            totalUnits -= t.stockDetails.unitsPurchased;
          }
        }
      });

      return totalUnits;
    } catch (error: any) {
      console.error('❌ Error calculating stock units:', error.message);
      throw error;
    }
  },

  // Update portfolio statistics after transaction changes
  async updatePortfolioStats(portfolioId: string): Promise<void> {
    try {
      const stats = await this.getPortfolioStats(portfolioId);
      
      // Get portfolio to check type and current NAV
      const portfolio = await portfolioService.getPortfolio(portfolioId);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      let currentValue: number;
      let totalUnits = 0;

      // For mutual funds, calculate value based on units × NAV
      if (portfolio.investmentType === 'mutual_fund') {
        totalUnits = await this.getMutualFundUnits(portfolioId);
        
        if (portfolio.currentNavPerUnit && portfolio.currentNavPerUnit > 0) {
          currentValue = totalUnits * portfolio.currentNavPerUnit;
        } else {
          // If no NAV set, use net invested as fallback
          currentValue = stats.netInvested;
        }
      } else if (portfolio.investmentType === 'stock') {
        // For stocks, calculate value based on units × price × exchange rate
        totalUnits = await this.getStockUnits(portfolioId);
        
        if (portfolio.currentStockPriceUSD && portfolio.currentStockPriceUSD > 0 && 
            portfolio.currentExchangeRate && portfolio.currentExchangeRate > 0) {
          currentValue = totalUnits * portfolio.currentStockPriceUSD * portfolio.currentExchangeRate;
        } else {
          // If no price set, use net invested as fallback
          currentValue = stats.netInvested;
        }
      } else {
        // For other types, current value equals net invested
        currentValue = stats.netInvested;
      }

      const totalReturn = currentValue - stats.netInvested;
      const returnPercentage = stats.netInvested > 0 
        ? (totalReturn / stats.netInvested) * 100 
        : 0;

      await portfolioService.updatePortfolioStats(portfolioId, {
        currentValue,
        totalInvested: stats.netInvested,
        totalReturn,
        returnPercentage,
        transactionCount: stats.transactionCount,
        totalUnits,
      });

      if (import.meta.env.DEV) {
        console.log('✅ Portfolio stats updated');
      }
    } catch (error: any) {
      console.error('❌ Error updating portfolio stats:', error.message);
      throw error;
    }
  },
};
