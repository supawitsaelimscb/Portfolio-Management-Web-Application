import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Portfolio } from '../types/portfolio';

interface StockPrice {
  date: string;
  price: number;
  change: number;
  changePercent: number;
}

interface UpdateStockPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (pricePerUnitUSD: number, exchangeRate: number) => Promise<void>;
  portfolio: Portfolio | null;
}

export function UpdateStockPriceModal({ isOpen, onClose, onUpdate, portfolio }: UpdateStockPriceModalProps) {
  const [pricePerUnitUSD, setPricePerUnitUSD] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [stockSymbol, setStockSymbol] = useState<string>('');

  useEffect(() => {
    if (isOpen && portfolio?.currentStockPriceUSD) {
      setPricePerUnitUSD(portfolio.currentStockPriceUSD.toString());
    } else if (isOpen) {
      setPricePerUnitUSD('');
    }
    
    if (isOpen && portfolio?.currentExchangeRate) {
      setExchangeRate(portfolio.currentExchangeRate.toString());
    } else if (isOpen) {
      setExchangeRate('');
    }

    // Reset stock data when modal opens
    if (isOpen) {
      setStockPrices([]);
      setSelectedDate('');
      setStockSymbol('');
      setError(null);
    }
  }, [isOpen, portfolio]);

  // Fetch stock prices from Yahoo Finance API (free alternative)
  const fetchStockPrices = async () => {
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setIsFetchingPrice(true);
    setError(null);

    try {
      // Using Yahoo Finance API via RapidAPI or free alternative
      // For demo, using a free Yahoo Finance alternative API
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol.toUpperCase()}`, {
        params: {
          interval: '1d',
          range: '5d', // Last 5 days
        }
      });

      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];
      const previousClose = result.meta.chartPreviousClose;

      const prices: StockPrice[] = timestamps.map((timestamp: number, index: number) => {
        const date = new Date(timestamp * 1000);
        const price = quotes.close[index];
        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        return {
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
        };
      }).filter((p: StockPrice) => p.price); // Filter out null prices

      setStockPrices(prices.reverse()); // Most recent first

      // Auto-select the most recent price
      if (prices.length > 0) {
        const latest = prices[0];
        setSelectedDate(latest.date);
        setPricePerUnitUSD(latest.price.toString());
      }
    } catch (err: any) {
      console.error('Failed to fetch stock prices:', err);
      setError(`Failed to fetch stock prices. Please enter manually or try again. Make sure the stock symbol is correct (e.g., NVDA, AAPL).`);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handlePriceSelect = (price: StockPrice) => {
    setSelectedDate(price.date);
    setPricePerUnitUSD(price.price.toString());
  };

  const calculatePreview = () => {
    const price = parseFloat(pricePerUnitUSD);
    const rate = parseFloat(exchangeRate);
    
    if (price && rate && portfolio?.totalUnits) {
      const totalValueUSD = portfolio.totalUnits * price;
      const totalValueTHB = totalValueUSD * rate;
      
      // Calculate average cost per unit from transactions
      let avgCostUSD = 0;
      if (portfolio.totalInvested > 0 && portfolio.totalUnits > 0) {
        // Estimate average cost (totalInvested in THB / totalUnits / some avg exchange rate)
        // Since we don't store historical exchange rates, this is an approximation
        avgCostUSD = (portfolio.totalInvested / portfolio.totalUnits) / (rate || 1);
      }
      
      const profitLossPerUnit = price - avgCostUSD;
      const profitLossTotal = profitLossPerUnit * portfolio.totalUnits;
      const profitLossPercent = avgCostUSD > 0 ? (profitLossPerUnit / avgCostUSD) * 100 : 0;
      
      return {
        totalValueUSD,
        totalValueTHB,
        pricePerUnitTHB: price * rate,
        avgCostUSD,
        profitLossPerUnit,
        profitLossTotal,
        profitLossPercent,
      };
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceValue = parseFloat(pricePerUnitUSD);
    const rateValue = parseFloat(exchangeRate);

    if (!priceValue || priceValue <= 0) {
      setError('Stock price must be greater than 0');
      return;
    }

    if (!rateValue || rateValue <= 0) {
      setError('Exchange rate must be greater than 0');
      return;
    }

    setIsLoading(true);

    try {
      await onUpdate(priceValue, rateValue);
      setPricePerUnitUSD('');
      setExchangeRate('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setPricePerUnitUSD('');
      setExchangeRate('');
      setStockPrices([]);
      setSelectedDate('');
      setStockSymbol('');
      onClose();
    }
  };

  if (!isOpen || !portfolio) return null;

  const preview = calculatePreview();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Stock Price</h2>
              <p className="text-sm text-gray-500 mt-1">{portfolio.name}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">Enter the current stock price and exchange rate</p>
                <p className="mt-1">This will recalculate your portfolio value based on total units owned.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Stock Info (if exists) */}
            {portfolio.currentStockPriceUSD && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500">Current Stock Price</p>
                <p className="text-lg font-bold text-gray-900">
                  ${portfolio.currentStockPriceUSD.toFixed(2)} USD
                  {portfolio.currentExchangeRate && (
                    <span className="text-sm text-gray-600 ml-2">
                      @ ฿{portfolio.currentExchangeRate.toFixed(2)} = ฿{(portfolio.currentStockPriceUSD * portfolio.currentExchangeRate).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Stock Symbol Input and Fetch Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label htmlFor="stockSymbol" className="block text-sm font-medium text-blue-900 mb-2">
                Fetch Latest Stock Price
              </label>
              <div className="flex gap-2">
                <input
                  id="stockSymbol"
                  type="text"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="e.g., NVDA, AAPL, TSLA"
                />
                <button
                  type="button"
                  onClick={fetchStockPrices}
                  disabled={isFetchingPrice || !stockSymbol.trim()}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isFetchingPrice ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Fetch'
                  )}
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Enter stock symbol to fetch latest prices from Yahoo Finance
              </p>
            </div>

            {/* Historical Prices List */}
            {stockPrices.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Recent Prices for {stockSymbol}
                  </p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {stockPrices.map((stockPrice) => (
                    <button
                      key={stockPrice.date}
                      type="button"
                      onClick={() => handlePriceSelect(stockPrice)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0 ${
                        selectedDate === stockPrice.date ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(stockPrice.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-lg font-bold text-gray-900">${stockPrice.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${stockPrice.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change.toFixed(2)}
                          </p>
                          <p className={`text-xs ${stockPrice.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({stockPrice.changePercent >= 0 ? '+' : ''}{stockPrice.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Price Input */}
            <div>
              <label htmlFor="pricePerUnitUSD" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Price per Unit (USD) *
              </label>
              <input
                id="pricePerUnitUSD"
                type="number"
                required
                min="0"
                step="0.01"
                value={pricePerUnitUSD}
                onChange={(e) => setPricePerUnitUSD(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select from above or enter manually
              </p>
            </div>

            {/* Exchange Rate Input */}
            <div>
              <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 mb-1">
                Exchange Rate (USD to THB) *
              </label>
              <input
                id="exchangeRate"
                type="number"
                required
                min="0"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current USD to THB exchange rate
              </p>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-green-800 uppercase tracking-wide">Preview</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total Units:</span>
                    <span className="font-semibold text-gray-900">{portfolio.totalUnits?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Current Price:</span>
                    <span className="font-semibold text-gray-900">
                      ${parseFloat(pricePerUnitUSD).toFixed(2)} = ฿{preview.pricePerUnitTHB.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Profit/Loss Analysis */}
                  {preview.avgCostUSD > 0 && (
                    <>
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Avg. Cost per Unit:</span>
                          <span className="font-medium text-gray-900">${preview.avgCostUSD.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${preview.profitLossPerUnit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">Profit/Loss per Unit:</span>
                          <span className={`text-sm font-bold ${preview.profitLossPerUnit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {preview.profitLossPerUnit >= 0 ? '+' : ''}${preview.profitLossPerUnit.toFixed(2)}
                            <span className="text-xs ml-1">
                              ({preview.profitLossPercent >= 0 ? '+' : ''}{preview.profitLossPercent.toFixed(2)}%)
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-700">Total Profit/Loss:</span>
                          <span className={`text-lg font-bold ${preview.profitLossTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {preview.profitLossTotal >= 0 ? '+' : ''}${preview.profitLossTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Value:</span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${preview.totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-lg font-bold text-green-700">฿{preview.totalValueTHB.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Price'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
