import { useState } from 'react';
import { ArrowLeftRight, DollarSign, IndianRupee } from 'lucide-react';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<'USD' | 'INR'>('USD');
  const [toCurrency, setToCurrency] = useState<'USD' | 'INR'>('INR');
  const [result, setResult] = useState<string>('0');

  // Exchange rate (you can update this with real-time rates)
  const EXCHANGE_RATE = 94.86; // 1 USD = 94.86 INR (current rate)

  const convertCurrency = () => {
    const numAmount = parseFloat(amount) || 0;
    let converted = 0;

    if (fromCurrency === 'USD' && toCurrency === 'INR') {
      converted = numAmount * EXCHANGE_RATE;
    } else if (fromCurrency === 'INR' && toCurrency === 'USD') {
      converted = numAmount / EXCHANGE_RATE;
    } else {
      converted = numAmount;
    }

    setResult(converted.toFixed(2));
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult('0');
  };

  const formatCurrency = (value: string, currency: 'USD' | 'INR') => {
    const num = parseFloat(value) || 0;
    if (currency === 'USD') {
      return `$${num.toLocaleString()}`;
    } else {
      return `₹${num.toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-gray-300 hover:bg-[#21262D] transition-colors"
          >
            <ArrowLeftRight size={20} />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Currency Calculator</h1>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* From Currency */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Currency
              </label>
              <div className="relative">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as 'USD' | 'INR')}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 appearance-none cursor-pointer"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {fromCurrency === 'USD' ? (
                    <DollarSign size={20} className="text-gray-400" />
                  ) : (
                    <IndianRupee size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 placeholder-gray-500"
                min="0"
                step="0.01"
              />
              <div className="text-sm text-gray-400">
                {formatCurrency(amount, fromCurrency)}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={swapCurrencies}
                className="p-3 bg-[#238636] hover:bg-[#2ea043] rounded-full text-white transition-colors"
                title="Swap currencies"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            {/* To Currency */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Currency
              </label>
              <div className="relative">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as 'USD' | 'INR')}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 appearance-none cursor-pointer"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  {toCurrency === 'USD' ? (
                    <DollarSign size={20} className="text-gray-400" />
                  ) : (
                    <IndianRupee size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg min-h-[48px] flex items-center">
                <span className="text-xl font-semibold text-gray-200">
                  {formatCurrency(result, toCurrency)}
                </span>
              </div>
            </div>
          </div>

          {/* Convert Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={convertCurrency}
              className="px-8 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-lg transition-colors"
            >
              Convert Currency
            </button>
          </div>

          {/* Exchange Rate Info */}
          <div className="mt-6 p-4 bg-[#0D1117] border border-[#30363D] rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Exchange Rate Information</h3>
            <div className="space-y-1 text-sm text-gray-400">
              <p>1 USD = {EXCHANGE_RATE} INR</p>
              <p>1 INR = {(1 / EXCHANGE_RATE).toFixed(4)} USD</p>
              <p className="text-xs text-yellow-400 mt-2">
                *Current exchange rate: 1 USD = 94.86 INR. Rates may vary throughout the day.
              </p>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <h4 className="text-xs font-medium text-gray-400 mb-2">Common USD to INR</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>$1 = ₹{EXCHANGE_RATE}</p>
                  <p>$10 = ₹{(10 * EXCHANGE_RATE).toFixed(0)}</p>
                  <p>$100 = ₹{(100 * EXCHANGE_RATE).toFixed(0)}</p>
                  <p>$1000 = ₹{(1000 * EXCHANGE_RATE).toFixed(0)}</p>
                </div>
              </div>
              <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-lg">
                <h4 className="text-xs font-medium text-gray-400 mb-2">Common INR to USD</h4>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>₹100 = $${(100 / EXCHANGE_RATE).toFixed(2)}</p>
                  <p>₹500 = $${(500 / EXCHANGE_RATE).toFixed(2)}</p>
                  <p>₹1000 = $${(1000 / EXCHANGE_RATE).toFixed(2)}</p>
                  <p>₹5000 = $${(5000 / EXCHANGE_RATE).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
