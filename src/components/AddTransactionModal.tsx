import { useState, useEffect } from 'react';
import type { CreateTransactionInput, TransactionType } from '../types/transaction';
import type { InvestmentType } from '../types/portfolio';
import { transactionService } from '../services/transaction';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTransactionInput) => Promise<void>;
  portfolioId: string;
  portfolioName: string;
  investmentType?: InvestmentType;
}

export function AddTransactionModal({ isOpen, onClose, onCreate, portfolioId, portfolioName, investmentType }: AddTransactionModalProps) {
  const [formData, setFormData] = useState<{
    type: TransactionType;
    amount: string;
    date: string;
    notes: string;
    // Mutual fund fields
    fundName: string;
    installmentNo: string;
    unitsPurchased: string;
    pricePerUnit: string;
    // Stock fields
    stockName: string;
    stockInstallmentNo: string;
    stockUnits: string;
    pricePerUnitUSD: string;
    exchangeRate: string;
  }>({
    type: 'deposit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    fundName: '',
    installmentNo: '',
    unitsPurchased: '',
    pricePerUnit: '',
    stockName: '',
    stockInstallmentNo: '',
    stockUnits: '',
    pricePerUnitUSD: '',
    exchangeRate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingFundNames, setExistingFundNames] = useState<string[]>([]);
  const [existingStockNames, setExistingStockNames] = useState<string[]>([]);

  // Fetch existing fund/stock names when modal opens
  useEffect(() => {
    const fetchNames = async () => {
      if (isOpen && portfolioId) {
        try {
          const transactions = await transactionService.getPortfolioTransactions(portfolioId);
          
          if (investmentType === 'mutual_fund') {
            const uniqueFundNames = [...new Set(
              transactions
                .filter(t => t.mutualFundDetails?.fundName)
                .map(t => t.mutualFundDetails!.fundName)
            )];
            setExistingFundNames(uniqueFundNames);
            
            // Auto-fill fund name if there's only one
            if (uniqueFundNames.length === 1 && !formData.fundName) {
              setFormData(prev => ({ ...prev, fundName: uniqueFundNames[0] }));
            }

            // Auto-calculate next installment number
            const nextInstallmentNo = transactions.length + 1;
            setFormData(prev => ({ ...prev, installmentNo: nextInstallmentNo.toString() }));
          }
          
          if (investmentType === 'stock') {
            const uniqueStockNames = [...new Set(
              transactions
                .filter(t => t.stockDetails?.stockName)
                .map(t => t.stockDetails!.stockName)
            )];
            setExistingStockNames(uniqueStockNames);
            
            // Auto-fill stock name if there's only one
            if (uniqueStockNames.length === 1 && !formData.stockName) {
              setFormData(prev => ({ ...prev, stockName: uniqueStockNames[0] }));
            }

            // Auto-calculate next installment number
            const nextInstallmentNo = transactions.length + 1;
            setFormData(prev => ({ ...prev, stockInstallmentNo: nextInstallmentNo.toString() }));
          }
        } catch (error) {
          console.error('Failed to fetch transaction data:', error);
        }
      }
    };
    fetchNames();
  }, [isOpen, investmentType, portfolioId]);

  const formatNumberWithCommas = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    return parseInt(digits, 10).toLocaleString('en-US');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    setFormData({ ...formData, amount: digits ? formatNumberWithCommas(digits) : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let amountValue: number;
    
    // For mutual funds, calculate amount from units * price
    if (investmentType === 'mutual_fund') {
      const units = parseFloat(formData.unitsPurchased);
      const price = parseFloat(formData.pricePerUnit);
      
      if (!units || units <= 0) {
        setError('Units purchased must be greater than 0');
        return;
      }
      if (!price || price <= 0) {
        setError('Price per unit must be greater than 0');
        return;
      }
      if (!formData.fundName.trim()) {
        setError('Fund name is required');
        return;
      }
      if (!formData.installmentNo || parseInt(formData.installmentNo) <= 0) {
        setError('Installment number must be greater than 0');
        return;
      }
      
      amountValue = units * price;
    } 
    // For stocks, calculate THB value from units * USD price * exchange rate
    else if (investmentType === 'stock') {
      const units = parseFloat(formData.stockUnits);
      const priceUSD = parseFloat(formData.pricePerUnitUSD);
      const exchangeRate = parseFloat(formData.exchangeRate);
      
      if (!units || units <= 0) {
        setError('Units purchased must be greater than 0');
        return;
      }
      if (!priceUSD || priceUSD <= 0) {
        setError('Price per unit (USD) must be greater than 0');
        return;
      }
      if (!exchangeRate || exchangeRate <= 0) {
        setError('Exchange rate must be greater than 0');
        return;
      }
      if (!formData.stockName.trim()) {
        setError('Stock name is required');
        return;
      }
      if (!formData.stockInstallmentNo || parseInt(formData.stockInstallmentNo) <= 0) {
        setError('Installment number must be greater than 0');
        return;
      }
      
      amountValue = units * priceUSD * exchangeRate;
    } 
    else {
      amountValue = parseFloat(formData.amount.replace(/,/g, ''));
      if (!amountValue || amountValue <= 0) {
        setError('Amount must be greater than 0');
        return;
      }
    }

    setIsLoading(true);

    try {
      const input: CreateTransactionInput = {
        portfolioId,
        type: formData.type,
        amount: amountValue,
        date: new Date(formData.date),
        notes: formData.notes,
      };

      // Add mutual fund details if applicable
      if (investmentType === 'mutual_fund') {
        input.mutualFundDetails = {
          fundName: formData.fundName,
          installmentNo: parseInt(formData.installmentNo),
          unitsPurchased: parseFloat(formData.unitsPurchased),
          pricePerUnit: parseFloat(formData.pricePerUnit),
        };
      }
      
      // Add stock details if applicable
      if (investmentType === 'stock') {
        const units = parseFloat(formData.stockUnits);
        const priceUSD = parseFloat(formData.pricePerUnitUSD);
        const exchangeRate = parseFloat(formData.exchangeRate);
        
        input.stockDetails = {
          stockName: formData.stockName,
          installmentNo: parseInt(formData.stockInstallmentNo),
          unitsPurchased: units,
          pricePerUnitUSD: priceUSD,
          exchangeRate: exchangeRate,
          purchaseValueTHB: units * priceUSD * exchangeRate,
        };
      }

      await onCreate(input);
      
      // Reset form
      setFormData({
        type: 'deposit',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        fundName: '',
        installmentNo: '',
        unitsPurchased: '',
        pricePerUnit: '',
        stockName: '',
        stockInstallmentNo: '',
        stockUnits: '',
        pricePerUnitUSD: '',
        exchangeRate: '',
      });
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
      onClose();
    }
  };

  if (!isOpen) return null;

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
              <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
              <p className="text-sm text-gray-500 mt-1">
                {portfolioName}
                {investmentType === 'mutual_fund' && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    Mutual Fund
                  </span>
                )}
              </p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'deposit' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'deposit'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      formData.type === 'deposit' ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      <svg className={`h-5 w-5 ${formData.type === 'deposit' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Deposit</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'withdrawal' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'withdrawal'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      formData.type === 'withdrawal' ? 'bg-red-500' : 'bg-gray-200'
                    }`}>
                      <svg className={`h-5 w-5 ${formData.type === 'withdrawal' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Withdrawal</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mutual Fund Fields */}
            {investmentType === 'mutual_fund' && (
              <>
                <div>
                  <label htmlFor="fundName" className="block text-sm font-medium text-gray-700 mb-1">
                    Fund Name *
                  </label>
                  <input
                    id="fundName"
                    type="text"
                    required
                    list="fundNameOptions"
                    value={formData.fundName}
                    onChange={(e) => setFormData({ ...formData, fundName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., SCBS&P500"
                  />
                  <datalist id="fundNameOptions">
                    {existingFundNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  {existingFundNames.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Select from dropdown or type a new fund name
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="installmentNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Installment No. *
                  </label>
                  <input
                    id="installmentNo"
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={formData.installmentNo}
                    onChange={(e) => setFormData({ ...formData, installmentNo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-set to next number (you can edit if needed)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="unitsPurchased" className="block text-sm font-medium text-gray-700 mb-1">
                      Units Purchased *
                    </label>
                    <input
                      id="unitsPurchased"
                      type="number"
                      required
                      min="0"
                      step="0.0001"
                      value={formData.unitsPurchased}
                      onChange={(e) => setFormData({ ...formData, unitsPurchased: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit *
                    </label>
                    <input
                      id="pricePerUnit"
                      type="number"
                      required
                      min="0"
                      step="0.0001"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0000"
                    />
                  </div>
                </div>

                {/* Calculated Purchase Value */}
                {formData.unitsPurchased && formData.pricePerUnit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Purchase Value:</span>
                      <span className="text-lg font-bold text-blue-700">
                        ฿{(parseFloat(formData.unitsPurchased) * parseFloat(formData.pricePerUnit)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Stock Fields */}
            {investmentType === 'stock' && (
              <>
                <div>
                  <label htmlFor="stockName" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Name *
                  </label>
                  <input
                    id="stockName"
                    type="text"
                    required
                    list="stockNameOptions"
                    value={formData.stockName}
                    onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NVDA, AAPL, TSLA"
                  />
                  <datalist id="stockNameOptions">
                    {existingStockNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  {existingStockNames.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Select from dropdown or type a new stock ticker
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="stockInstallmentNo" className="block text-sm font-medium text-gray-700 mb-1">
                    Installment No. *
                  </label>
                  <input
                    id="stockInstallmentNo"
                    type="number"
                    required
                    min="1"
                    value={formData.stockInstallmentNo}
                    onChange={(e) => setFormData({ ...formData, stockInstallmentNo: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🔢 Auto-incremented based on transaction history
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stockUnits" className="block text-sm font-medium text-gray-700 mb-1">
                      Units Purchased *
                    </label>
                    <input
                      id="stockUnits"
                      type="number"
                      required
                      min="0"
                      step="0.0001"
                      value={formData.stockUnits}
                      onChange={(e) => setFormData({ ...formData, stockUnits: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0000"
                    />
                  </div>

                  <div>
                    <label htmlFor="pricePerUnitUSD" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit (USD) *
                    </label>
                    <input
                      id="pricePerUnitUSD"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.pricePerUnitUSD}
                      onChange={(e) => setFormData({ ...formData, pricePerUnitUSD: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="$0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Exchange Rate (THB/USD) *
                  </label>
                  <input
                    id="exchangeRate"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="31.88"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💱 Current exchange rate from USD to THB
                  </p>
                </div>

                {/* Calculated Purchase Value */}
                {formData.stockUnits && formData.pricePerUnitUSD && formData.exchangeRate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">USD Value:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ${(parseFloat(formData.stockUnits) * parseFloat(formData.pricePerUnitUSD)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                        <span className="text-sm font-medium text-gray-700">Purchase Value (THB):</span>
                        <span className="text-lg font-bold text-blue-700">
                          ฿{(parseFloat(formData.stockUnits) * parseFloat(formData.pricePerUnitUSD) * parseFloat(formData.exchangeRate)).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Amount (only for non-mutual fund and non-stock) */}
            {investmentType !== 'mutual_fund' && investmentType !== 'stock' && (
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (THB) *
              </label>
              <input
                id="amount"
                type="text"
                required
                value={formData.amount}
                onChange={handleAmountChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            )}

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add notes (optional)"
              />
            </div>

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
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ${
                  formData.type === 'deposit'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  `Add ${formData.type === 'deposit' ? 'Deposit' : 'Withdrawal'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
