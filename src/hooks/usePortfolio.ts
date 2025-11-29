import { useState, useEffect } from 'react';
import { portfolioService } from '../services/portfolio';
import { useAuth } from './useAuth';
import type { Portfolio, CreatePortfolioInput, UpdatePortfolioInput } from '../types/portfolio';

export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  transactionCount: number;
  portfolioCount: number;
}

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load portfolios on mount
  useEffect(() => {
    if (user) {
      loadPortfolios();
    }
  }, [user]);

  const loadPortfolios = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await portfolioService.getUserPortfolios(user.uid);
      setPortfolios(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading portfolios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createPortfolio = async (input: CreatePortfolioInput): Promise<Portfolio> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      const newPortfolio = await portfolioService.createPortfolio(user.uid, input);
      setPortfolios((prev) => [newPortfolio, ...prev]);
      return newPortfolio;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePortfolio = async (
    portfolioId: string,
    input: UpdatePortfolioInput
  ): Promise<void> => {
    try {
      setError(null);
      await portfolioService.updatePortfolio(portfolioId, input);
      
      // Update local state
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId
            ? { ...p, ...input, updatedAt: new Date() }
            : p
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deletePortfolio = async (portfolioId: string): Promise<void> => {
    try {
      setError(null);
      await portfolioService.deletePortfolio(portfolioId);
      
      // Update local state
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshPortfolios = () => {
    loadPortfolios();
  };

  // Calculate total statistics
  const totalValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0);
  const totalInvested = portfolios.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const transactionCount = portfolios.reduce((sum, p) => sum + p.transactionCount, 0);

  return {
    portfolios,
    isLoading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolios,
    stats: {
      totalValue,
      totalInvested,
      totalReturn,
      returnPercentage: totalReturnPercentage,
      transactionCount,
      portfolioCount: portfolios.length,
    },
  };
}
