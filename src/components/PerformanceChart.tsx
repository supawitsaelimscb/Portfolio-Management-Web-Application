import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import type { Portfolio } from '../types/portfolio';
import type { Transaction } from '../types/transaction';

interface PerformanceChartProps {
  portfolios: Portfolio[];
  allTransactions: Transaction[];
}

interface DataPoint {
  date: string;
  value: number;
  invested: number;
}

export function PerformanceChart({ portfolios, allTransactions }: PerformanceChartProps) {
  // Generate chart data from transactions
  const generateChartData = (): DataPoint[] => {
    if (allTransactions.length === 0) {
      return [];
    }

    // Sort transactions by date
    const sortedTransactions = [...allTransactions].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    const dataPoints: DataPoint[] = [];
    let runningBalance = 0;

    sortedTransactions.forEach((transaction) => {
      const transDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
      
      // Update running balance
      if (transaction.type === 'deposit') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      const dateStr = format(transDate, 'yyyy-MM-dd');
      
      // Check if we already have a data point for this date
      const existingPoint = dataPoints.find(p => p.date === dateStr);
      
      if (existingPoint) {
        // Update the existing point
        existingPoint.value = runningBalance;
        existingPoint.invested = runningBalance;
      } else {
        // Add new data point
        dataPoints.push({
          date: dateStr,
          value: runningBalance,
          invested: runningBalance,
        });
      }
    });

    // Add current value as the last point if we have portfolios
    if (portfolios.length > 0 && dataPoints.length > 0) {
      const totalCurrentValue = portfolios.reduce((sum, p) => sum + p.currentValue, 0);
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastPoint = dataPoints[dataPoints.length - 1];
      
      if (lastPoint.date !== today) {
        dataPoints.push({
          date: today,
          value: totalCurrentValue,
          invested: lastPoint.invested,
        });
      } else {
        lastPoint.value = totalCurrentValue;
      }
    }

    return dataPoints;
  };

  const chartData = generateChartData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM');
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = format(parseISO(data.date), 'dd MMM yyyy');
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{date}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-blue-600 flex items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                Portfolio Value
              </span>
              <span className="text-xs font-semibold text-gray-900">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-green-600 flex items-center">
                <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
                Total Invested
              </span>
              <span className="text-xs font-semibold text-gray-900">{formatCurrency(data.invested)}</span>
            </div>
            {data.value !== data.invested && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-600">Gain/Loss</span>
                <span className={`text-xs font-semibold ${
                  data.value - data.invested >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(data.value - data.invested)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No transaction history yet</p>
          <p className="text-xs text-gray-400 mt-1">Add transactions to track your portfolio performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            formatter={(value) => value === 'value' ? 'Portfolio Value' : 'Total Invested'}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="invested" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#10b981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
