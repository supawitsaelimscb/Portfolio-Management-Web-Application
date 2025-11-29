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
import type { Portfolio, CreatePortfolioInput, UpdatePortfolioInput } from '../types/portfolio';

export const portfolioService = {
  // Create new portfolio
  async createPortfolio(userId: string, input: CreatePortfolioInput): Promise<Portfolio> {
    try {
      const portfolioRef = doc(collection(db, 'portfolios'));
      const now = Timestamp.now();

      const portfolioData = {
        userId,
        name: input.name,
        investmentType: input.investmentType,
        targetAmount: input.targetAmount || 0,
        currentValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        returnPercentage: 0,
        transactionCount: 0,
        description: input.description || '',
        color: input.color || '',
        currentNavPerUnit: 0,
        totalUnits: 0,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(portfolioRef, portfolioData);

      const portfolio: Portfolio = {
        id: portfolioRef.id,
        ...portfolioData,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      console.log('✅ Portfolio created:', portfolio.name);
      return portfolio;
    } catch (error: any) {
      console.error('❌ Error creating portfolio:', error.message);
      throw error;
    }
  },

  // Get all portfolios for a user
  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      const q = query(
        collection(db, 'portfolios'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const portfolios: Portfolio[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        portfolios.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          investmentType: data.investmentType,
          targetAmount: data.targetAmount,
          currentValue: data.currentValue,
          totalInvested: data.totalInvested,
          totalReturn: data.totalReturn,
          returnPercentage: data.returnPercentage,
          transactionCount: data.transactionCount,
          description: data.description,
          color: data.color,
          currentNavPerUnit: data.currentNavPerUnit || 0,
          totalUnits: data.totalUnits || 0,
          currentStockPriceUSD: data.currentStockPriceUSD || 0,
          currentExchangeRate: data.currentExchangeRate || 0,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });

      console.log(`✅ Fetched ${portfolios.length} portfolios`);
      return portfolios;
    } catch (error: any) {
      console.error('❌ Error fetching portfolios:', error.message);
      throw error;
    }
  },

  // Get single portfolio by ID
  async getPortfolio(portfolioId: string): Promise<Portfolio | null> {
    try {
      const docRef = doc(db, 'portfolios', portfolioId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        name: data.name,
        investmentType: data.investmentType,
        targetAmount: data.targetAmount,
        currentValue: data.currentValue,
        totalInvested: data.totalInvested,
        totalReturn: data.totalReturn,
        returnPercentage: data.returnPercentage,
        transactionCount: data.transactionCount,
        description: data.description,
        color: data.color,
        currentNavPerUnit: data.currentNavPerUnit || 0,
        totalUnits: data.totalUnits || 0,
        currentStockPriceUSD: data.currentStockPriceUSD || 0,
        currentExchangeRate: data.currentExchangeRate || 0,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    } catch (error: any) {
      console.error('❌ Error fetching portfolio:', error.message);
      throw error;
    }
  },

  // Update portfolio
  async updatePortfolio(
    portfolioId: string,
    input: UpdatePortfolioInput
  ): Promise<void> {
    try {
      const docRef = doc(db, 'portfolios', portfolioId);
      const updateData: any = {
        ...input,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);
      console.log('✅ Portfolio updated:', portfolioId);
    } catch (error: any) {
      console.error('❌ Error updating portfolio:', error.message);
      throw error;
    }
  },

  // Delete portfolio
  async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      const docRef = doc(db, 'portfolios', portfolioId);
      await deleteDoc(docRef);
      console.log('✅ Portfolio deleted:', portfolioId);
    } catch (error: any) {
      console.error('❌ Error deleting portfolio:', error.message);
      throw error;
    }
  },

  // Update portfolio statistics (called after transactions change)
  async updatePortfolioStats(
    portfolioId: string,
    stats: {
      currentValue: number;
      totalInvested: number;
      totalReturn: number;
      returnPercentage: number;
      transactionCount: number;
      totalUnits?: number;
    }
  ): Promise<void> {
    try {
      const docRef = doc(db, 'portfolios', portfolioId);
      await updateDoc(docRef, {
        ...stats,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Portfolio stats updated:', portfolioId);
    } catch (error: any) {
      console.error('❌ Error updating portfolio stats:', error.message);
      throw error;
    }
  },

  // Update NAV for mutual fund portfolio
  async updateNav(portfolioId: string, navPerUnit: number): Promise<void> {
    try {
      const docRef = doc(db, 'portfolios', portfolioId);
      await updateDoc(docRef, {
        currentNavPerUnit: navPerUnit,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ NAV updated:', portfolioId, navPerUnit);
    } catch (error: any) {
      console.error('❌ Error updating NAV:', error.message);
      throw error;
    }
  },

  // Update stock price for stock portfolio
  async updateStockPrice(portfolioId: string, pricePerUnitUSD: number, exchangeRate: number): Promise<void> {
    try {
      const docRef = doc(db, 'portfolios', portfolioId);
      await updateDoc(docRef, {
        currentStockPriceUSD: pricePerUnitUSD,
        currentExchangeRate: exchangeRate,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Stock price updated:', portfolioId, pricePerUnitUSD, exchangeRate);
    } catch (error: any) {
      console.error('❌ Error updating stock price:', error.message);
      throw error;
    }
  },
};
