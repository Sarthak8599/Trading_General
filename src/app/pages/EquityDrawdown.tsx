import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

export default function EquityDrawdown() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to load trades for equity analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Calculate equity curve from trades
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const startingEquity = 100000; // Starting capital
  let runningEquity = startingEquity;
  let peakEquity = startingEquity;

  const equityCurve = sortedTrades.map(trade => {
    runningEquity += trade.profitLoss;
    peakEquity = Math.max(peakEquity, runningEquity);
    return {
      date: trade.date,
      equity: runningEquity,
    };
  });

  // Calculate drawdown data
  const drawdownData = equityCurve.map((point, index) => {
    const peakSoFar = Math.max(...equityCurve.slice(0, index + 1).map(p => p.equity));
    const drawdown = ((peakSoFar - point.equity) / peakSoFar) * 100;
    return {
      date: point.date,
      drawdown: drawdown,
    };
  });

  // Calculate metrics
  const currentEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : startingEquity;
  const totalReturn = currentEquity - startingEquity;
  const returnPercentage = ((totalReturn / startingEquity) * 100).toFixed(2);
  
  const maxDrawdown = drawdownData.length > 0 ? Math.min(...drawdownData.map(d => d.drawdown)) : 0;
  const currentDrawdown = drawdownData.length > 0 ? drawdownData[drawdownData.length - 1].drawdown : 0;

  // Find largest trades
  const largestProfit = trades.length > 0 ? trades.reduce((max, trade) => 
    trade.profitLoss > max.profitLoss ? trade : max
  ) : { profitLoss: 0, date: 'N/A', strategyName: 'N/A' };
  const largestLoss = trades.length > 0 ? trades.reduce((min, trade) => 
    trade.profitLoss < min.profitLoss ? trade : min
  ) : { profitLoss: 0, date: 'N/A', strategyName: 'N/A' };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300">
        Loading equity analysis...
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

  if (trades.length === 0) {
    return (
      <div className="text-gray-400 p-4 bg-[#161B22] rounded-lg border border-[#30363D]">
        No trade data available. Add new trades in the Trade Journal to see equity analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Equity & Drawdown Tracking</h1>
        <p className="text-gray-400">Monitor your capital growth and drawdown periods</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-[#00C853]" size={20} />
            <span className="text-sm text-gray-400">Current Equity</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ₹{currentEquity.toLocaleString()}
          </div>
          <div className="text-sm text-[#00C853]">
            +₹{totalReturn.toLocaleString()} ({returnPercentage}%)
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="text-[#FF5252]" size={20} />
            <span className="text-sm text-gray-400">Max Drawdown</span>
          </div>
          <div className="text-2xl font-bold text-[#FF5252] mb-1">
            {maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-400">
            Lowest point from peak
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="text-[#00C853]" size={20} />
            <span className="text-sm text-gray-400">Largest Profit</span>
          </div>
          <div className="text-2xl font-bold text-[#00C853] mb-1">
            ₹{largestProfit.profitLoss.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {largestProfit.date || 'N/A'}
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="text-[#FF5252]" size={20} />
            <span className="text-sm text-gray-400">Largest Loss</span>
          </div>
          <div className="text-2xl font-bold text-[#FF5252] mb-1">
            ₹{Math.abs(largestLoss.profitLoss).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {largestLoss.date || 'N/A'}
          </div>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={equityCurve}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C853" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis 
              dataKey="date" 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
              domain={['dataMin - 5000', 'dataMax + 5000']}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '6px',
                color: '#fff'
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Equity']}
            />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke="#00C853" 
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Capital Growth Chart */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Capital Growth Chart</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={equityCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis 
              dataKey="date" 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
              domain={['dataMin - 5000', 'dataMax + 5000']}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '6px',
                color: '#fff'
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Capital']}
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="#238636" 
              strokeWidth={3}
              dot={{ fill: '#238636', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown Chart */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Drawdown Chart</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={drawdownData}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5252" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF5252" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis 
              dataKey="date" 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '6px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value}%`, 'Drawdown']}
            />
            <Area 
              type="monotone" 
              dataKey="drawdown" 
              stroke="#FF5252" 
              strokeWidth={2}
              fill="url(#drawdownGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Largest Trades Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Largest Profit Trade</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#0D1117] rounded-lg">
              <span className="text-sm text-gray-400">Amount</span>
              <span className="text-lg font-bold text-[#00C853]">₹{largestProfit.profitLoss.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0D1117] rounded-lg">
              <span className="text-sm text-gray-400">Date</span>
              <span className="text-sm text-white">{largestProfit.date || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0D1117] rounded-lg">
              <span className="text-sm text-gray-400">Strategy</span>
              <span className="text-sm text-white">{largestProfit.strategyName}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Largest Loss Trade</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#0D1117] rounded-lg">
              <span className="text-sm text-gray-400">Amount</span>
              <span className="text-lg font-bold text-[#FF5252]">₹{Math.abs(largestLoss.profitLoss).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0D1117] rounded-lg">
              <span className="text-sm text-gray-400">Date</span>
              <span className="text-sm text-white">{largestLoss.date || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0D1117] rounded-lg">
              <span className="text-sm text-gray-400">Strategy</span>
              <span className="text-sm text-white">{largestLoss.strategyName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-[#0D1117] rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Starting Capital</div>
            <div className="text-xl font-bold text-white">₹{startingEquity.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-[#0D1117] rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Current Capital</div>
            <div className="text-xl font-bold text-[#00C853]">₹{currentEquity.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-[#0D1117] rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Total Gain</div>
            <div className="text-xl font-bold text-[#00C853]">₹{totalReturn.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-[#0D1117] rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Return %</div>
            <div className="text-xl font-bold text-[#00C853]">{returnPercentage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
