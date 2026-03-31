import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Calculator, DollarSign } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

export default function CapitalRisk() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load saved settings from localStorage or use defaults
  const [baseCapital, setBaseCapital] = useState(() => {
    const saved = localStorage.getItem('tradingCapital');
    return saved ? Number(saved) : 100000;
  });
  const [riskPerTrade, setRiskPerTrade] = useState(() => {
    const saved = localStorage.getItem('riskPerTrade');
    return saved ? Number(saved) : 2;
  });
  const [maxDailyLoss, setMaxDailyLoss] = useState(() => {
    const saved = localStorage.getItem('maxDailyLoss');
    return saved ? Number(saved) : 5;
  });
  const [stopLossPoints, setStopLossPoints] = useState(() => {
    const saved = localStorage.getItem('stopLossPoints');
    return saved ? Number(saved) : 50;
  });
  const [lotSizeCapital, setLotSizeCapital] = useState(() => {
    const saved = localStorage.getItem('lotSizeCapital');
    return saved ? Number(saved) : 100000;
  });
  const [lotSizeRisk, setLotSizeRisk] = useState(() => {
    const saved = localStorage.getItem('lotSizeRisk');
    return saved ? Number(saved) : 2;
  });
  const [lotSizeStopLoss, setLotSizeStopLoss] = useState(() => {
    const saved = localStorage.getItem('lotSizeStopLoss');
    return saved ? Number(saved) : 50;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tradingCapital', String(baseCapital));
  }, [baseCapital]);

  useEffect(() => {
    localStorage.setItem('riskPerTrade', String(riskPerTrade));
  }, [riskPerTrade]);

  useEffect(() => {
    localStorage.setItem('maxDailyLoss', String(maxDailyLoss));
  }, [maxDailyLoss]);

  useEffect(() => {
    localStorage.setItem('stopLossPoints', String(stopLossPoints));
  }, [stopLossPoints]);

  useEffect(() => {
    localStorage.setItem('lotSizeCapital', String(lotSizeCapital));
  }, [lotSizeCapital]);

  useEffect(() => {
    localStorage.setItem('lotSizeRisk', String(lotSizeRisk));
  }, [lotSizeRisk]);

  useEffect(() => {
    localStorage.setItem('lotSizeStopLoss', String(lotSizeStopLoss));
  }, [lotSizeStopLoss]);

  useEffect(() => {
    const loadTrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await TradeService.getAllTrades();
        // Convert snake_case database data to camelCase for UI
        const mappedData = data.map(dbTrade => ({
          id: dbTrade.id,
          date: dbTrade.date,
          time: dbTrade.time,
          day: dbTrade.day,
          tradeName: dbTrade.trade_name,
          symbol: dbTrade.symbol,
          optionType: dbTrade.option_type,
          strikePrice: dbTrade.strike_price,
          strategyName: dbTrade.strategy_name,
          entryPrice: dbTrade.entry_price,
          exitPrice: dbTrade.exit_price,
          quantity: dbTrade.quantity,
          lotSize: dbTrade.lot_size,
          stopLoss: dbTrade.stop_loss,
          target: dbTrade.target,
          riskAmount: dbTrade.risk_amount,
          riskRewardRatio: dbTrade.risk_reward_ratio,
          profitLoss: dbTrade.profit_loss,
          tradeResult: dbTrade.trade_result,
          mistakeTag: dbTrade.mistake_tag,
          emotionTag: dbTrade.emotionTag,
          notes: dbTrade.notes || '',
        }));
        setTrades(mappedData);
      } catch (err) {
        console.error('Failed to load trades:', err);
        setError('Failed to load trades for risk analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Calculate total P&L from all trades
  const totalPnL = trades.reduce((acc, trade) => acc + trade.profitLoss, 0);
  
  // Current capital = base capital + total P&L
  const totalCapital = baseCapital + totalPnL;

  // Calculations using current capital (base + P&L)
  const riskAmount = (totalCapital * riskPerTrade) / 100;
  const maxDailyLossAmount = (totalCapital * maxDailyLoss) / 100;
  const suggestedStopLoss = riskAmount / 0.02; // Example calculation
  const suggestedPositionSize = Math.floor(riskAmount / stopLossPoints);
  
  // Calculate today's actual loss from trades
  const today = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter(trade => trade.date === today);
  const currentDayLoss = todayTrades.reduce((total, trade) => 
    trade.profitLoss < 0 ? total + Math.abs(trade.profitLoss) : total, 0
  );
  const remainingDailyRisk = maxDailyLossAmount - currentDayLoss;
  const isMaxLossReached = currentDayLoss >= maxDailyLossAmount;

  // Lot Size Calculator
  const lotSizeRiskAmount = (lotSizeCapital * lotSizeRisk) / 100;
  const recommendedLotSize = Math.floor(lotSizeRiskAmount / lotSizeStopLoss);
  const lotValue = recommendedLotSize * 50; // NIFTY lot size = 50

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300">
        Loading risk analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#2A1A1A] p-4 rounded-lg border border-[#803030] text-orange-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Capital & Risk Management</h1>
        <p className="text-gray-400">Manage your trading capital and risk per trade</p>
      </div>

      {/* Warning Banner */}
      {isMaxLossReached && (
        <div className="bg-red-900/20 border-2 border-[#FF5252] rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-900/40 rounded-lg">
              <AlertTriangle className="text-[#FF5252]" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#FF5252] mb-1">
                STOP TRADING - Daily Loss Limit Reached
              </h3>
              <p className="text-gray-300">
                You have reached your maximum daily loss limit. Do not take any more trades today.
                Review your trades and come back tomorrow with a clear mind.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Configuration */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-[#00C853]" size={24} />
            <h3 className="text-lg font-semibold text-white">Risk Settings</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
              <div className="text-sm text-gray-400 mb-1">Base Capital (Your Input)</div>
              <div className="text-2xl font-bold text-white">₹{baseCapital.toLocaleString()}</div>
            </div>
            <div className={`p-4 rounded-lg border ${
              totalPnL >= 0 ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'
            }`}>
              <div className="text-sm text-gray-400 mb-1">Total P&L from Trades</div>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : '-'}₹{Math.abs(totalPnL).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Trading Capital (₹)
              </label>
              <input
                type="number"
                value={baseCapital}
                onChange={(e) => setBaseCapital(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
              />
              <p className="text-xs text-gray-500 mt-1">This is your initial capital. Current capital includes P&L.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Risk Per Trade (%)
              </label>
              <input
                type="number"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                min="0.5"
                max="10"
                step="0.5"
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 1-2% per trade</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Maximum Daily Loss Limit (%)
              </label>
              <input
                type="number"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(Number(e.target.value))}
                min="1"
                max="20"
                step="1"
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 3-5% per day</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Stop Loss Points (for position sizing)
              </label>
              <input
                type="number"
                value={stopLossPoints}
                onChange={(e) => setStopLossPoints(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
              />
            </div>
          </div>
        </div>

        {/* Risk Calculations */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="text-[#58A6FF]" size={24} />
            <h3 className="text-lg font-semibold text-white">Risk Calculations</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-600 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Current Capital (Base + P&L)</div>
              <div className="text-3xl font-bold text-green-400">₹{totalCapital.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Automatically updated based on your trades</div>
            </div>

            <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
              <div className="text-sm text-gray-400 mb-1">Suggested Risk Amount Per Trade</div>
              <div className="text-2xl font-bold text-[#00C853]">₹{riskAmount.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
              <div className="text-sm text-gray-400 mb-1">Based on Current Capital</div>
              <div className="text-xs text-gray-500">₹{totalCapital.toLocaleString()} × {riskPerTrade}%</div>
            </div>

            <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
              <div className="text-sm text-gray-400 mb-1">Maximum Daily Loss Limit</div>
              <div className="text-2xl font-bold text-[#FF5252]">₹{maxDailyLossAmount.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
              <div className="text-sm text-gray-400 mb-1">Suggested Position Size (Quantity)</div>
              <div className="text-2xl font-bold text-[#58A6FF]">{suggestedPositionSize}</div>
              <div className="text-xs text-gray-500 mt-1">Based on your stop loss points</div>
            </div>

            <div className={`p-4 rounded-lg border ${
              remainingDailyRisk <= 0 
                ? 'bg-red-900/20 border-[#FF5252]' 
                : 'bg-[#0D1117] border-[#30363D]'
            }`}>
              <div className="text-sm text-gray-400 mb-1">Remaining Daily Risk</div>
              <div className={`text-2xl font-bold ${
                remainingDailyRisk <= 0 ? 'text-[#FF5252]' : 'text-[#FFD600]'
              }`}>
                ₹{remainingDailyRisk.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Current day loss: ₹{currentDayLoss.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lot Size Calculator */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="text-[#FFD600]" size={24} />
          <h3 className="text-lg font-semibold text-white">Lot Size Calculator</h3>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Capital (₹)
            </label>
            <input
              type="number"
              value={lotSizeCapital}
              onChange={(e) => {
                const newVal = Number(e.target.value);
                setLotSizeCapital(newVal);
                // Also update base capital when lot size capital changes
                setBaseCapital(newVal);
              }}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              value={lotSizeRisk}
              onChange={(e) => setLotSizeRisk(Number(e.target.value))}
              min="0.5"
              max="10"
              step="0.5"
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Stop Loss Points
            </label>
            <input
              type="number"
              value={lotSizeStopLoss}
              onChange={(e) => setLotSizeStopLoss(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white focus:outline-none focus:border-[#238636]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="p-5 bg-[#0D1117] rounded-lg border border-[#30363D]">
            <div className="text-sm text-gray-400 mb-2">Risk Amount</div>
            <div className="text-2xl font-bold text-[#FFD600]">₹{lotSizeRiskAmount.toLocaleString()}</div>
          </div>

          <div className="p-5 bg-[#0D1117] rounded-lg border border-[#30363D]">
            <div className="text-sm text-gray-400 mb-2">Recommended Lot Size</div>
            <div className="text-2xl font-bold text-[#00C853]">{recommendedLotSize}</div>
            <div className="text-xs text-gray-500 mt-1">NIFTY/BANKNIFTY quantity</div>
          </div>

          <div className="p-5 bg-[#0D1117] rounded-lg border border-[#30363D]">
            <div className="text-sm text-gray-400 mb-2">Position Value</div>
            <div className="text-2xl font-bold text-[#58A6FF]">₹{lotValue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Approximate contract value</div>
          </div>
        </div>
      </div>

      {/* Risk Management Tips */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Management Best Practices</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Never Risk More Than 2%</div>
              <p className="text-sm text-gray-400">Keep individual trade risk at 1-2% of total capital</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Set Daily Loss Limits</div>
              <p className="text-sm text-gray-400">Stop trading when you hit 3-5% daily loss</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Always Use Stop Loss</div>
              <p className="text-sm text-gray-400">Never enter a trade without a predefined stop loss</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Position Sizing Matters</div>
              <p className="text-sm text-gray-400">Calculate correct position size based on stop loss</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
