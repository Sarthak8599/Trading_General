import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Trophy, TrendingDown, Target, X, Calendar, ArrowRight, TrendingUp, BarChart3, PieChart, Activity, Percent, IndianRupee, Medal, AlertTriangle, Eye, Clock, CheckCircle, Sun } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

export default function StrategyAnalysis() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showTradesModal, setShowTradesModal] = useState(false);

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
        setError('Failed to load trades for strategy analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Get trades for selected strategy
  const strategyTrades = selectedStrategy 
    ? trades.filter(trade => trade.strategyName === selectedStrategy)
    : [];

  // Calculate strategy performance with day and time analysis
  const strategyData = trades.reduce((acc, trade) => {
    const strategy = trade.strategyName;
    if (!acc[strategy]) {
      acc[strategy] = { 
        profit: 0, trades: 0, wins: 0, losses: 0, totalProfit: 0, totalLoss: 0,
        dayStats: {},
        timeStats: {}
      };
    }
    acc[strategy].profit += trade.profitLoss;
    acc[strategy].trades += 1;
    
    // Track day performance
    const day = trade.day || new Date(trade.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[strategy].dayStats[day]) {
      acc[strategy].dayStats[day] = { profit: 0, wins: 0, trades: 0 };
    }
    acc[strategy].dayStats[day].profit += trade.profitLoss;
    acc[strategy].dayStats[day].trades += 1;
    if (trade.profitLoss > 0) {
      acc[strategy].dayStats[day].wins += 1;
    }
    
    // Track time performance (group by hour)
    const hour = trade.time ? trade.time.split(':')[0] + ':00' : 'N/A';
    if (!acc[strategy].timeStats[hour]) {
      acc[strategy].timeStats[hour] = { profit: 0, wins: 0, trades: 0 };
    }
    acc[strategy].timeStats[hour].profit += trade.profitLoss;
    acc[strategy].timeStats[hour].trades += 1;
    if (trade.profitLoss > 0) {
      acc[strategy].timeStats[hour].wins += 1;
    }
    
    if (trade.profitLoss > 0) {
      acc[strategy].wins += 1;
      acc[strategy].totalProfit += trade.profitLoss;
    } else {
      acc[strategy].losses += 1;
      acc[strategy].totalLoss += Math.abs(trade.profitLoss);
    }
    return acc;
  }, {} as Record<string, { 
    profit: number; trades: number; wins: number; losses: number; totalProfit: number; totalLoss: number;
    dayStats: Record<string, { profit: number; wins: number; trades: number }>;
    timeStats: Record<string, { profit: number; wins: number; trades: number }>;
  }>);

  const strategyPerformance = Object.entries(strategyData).map(([strategy, data]) => {
    // Find best day (most profitable)
    const bestDay = Object.entries(data.dayStats)
      .sort((a, b) => b[1].profit - a[1].profit)[0];
    
    // Find best time range (most successful trades)
    const timeEntries = Object.entries(data.timeStats)
      .filter(([_, stats]) => stats.trades > 0)
      .map(([time, stats]) => ({
        time,
        profit: stats.profit,
        trades: stats.trades,
        wins: stats.wins,
        winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
      }))
      .sort((a, b) => b.winRate - a.winRate); // Sort by win rate
    
    // Find consecutive time range with highest success
    let bestTimeRange = 'N/A';
    let bestTimeRangeProfit = 0;
    let bestTimeRangeWinRate = 0;
    
    if (timeEntries.length > 0) {
      // Convert times to numbers for comparison
      const timeNumbers = timeEntries.map(entry => ({
        ...entry,
        hour: parseInt(entry.time.split(':')[0])
      })).filter(entry => !isNaN(entry.hour));
      
      // Sort by hour
      timeNumbers.sort((a, b) => a.hour - b.hour);
      
      // Find best consecutive range (2-3 hours)
      let maxWinRate = 0;
      let maxProfit = 0;
      let bestStartHour = 0;
      let bestEndHour = 0;
      
      for (let i = 0; i < timeNumbers.length; i++) {
        // Check 2-hour range
        if (i + 1 < timeNumbers.length && timeNumbers[i + 1].hour - timeNumbers[i].hour <= 2) {
          const rangeTrades = timeNumbers[i].trades + timeNumbers[i + 1].trades;
          const rangeWins = timeNumbers[i].wins + timeNumbers[i + 1].wins;
          const rangeProfit = timeNumbers[i].profit + timeNumbers[i + 1].profit;
          const rangeWinRate = rangeTrades > 0 ? (rangeWins / rangeTrades) * 100 : 0;
          
          if (rangeWinRate > maxWinRate || (rangeWinRate === maxWinRate && rangeProfit > maxProfit)) {
            maxWinRate = rangeWinRate;
            maxProfit = rangeProfit;
            bestStartHour = timeNumbers[i].hour;
            bestEndHour = timeNumbers[i + 1].hour;
          }
        }
        
        // Check 3-hour range
        if (i + 2 < timeNumbers.length && timeNumbers[i + 2].hour - timeNumbers[i].hour <= 3) {
          const rangeTrades = timeNumbers[i].trades + timeNumbers[i + 1].trades + timeNumbers[i + 2].trades;
          const rangeWins = timeNumbers[i].wins + timeNumbers[i + 1].wins + timeNumbers[i + 2].wins;
          const rangeProfit = timeNumbers[i].profit + timeNumbers[i + 1].profit + timeNumbers[i + 2].profit;
          const rangeWinRate = rangeTrades > 0 ? (rangeWins / rangeTrades) * 100 : 0;
          
          if (rangeWinRate > maxWinRate || (rangeWinRate === maxWinRate && rangeProfit > maxProfit)) {
            maxWinRate = rangeWinRate;
            maxProfit = rangeProfit;
            bestStartHour = timeNumbers[i].hour;
            bestEndHour = timeNumbers[i + 2].hour;
          }
        }
      }
      
      // If no good range found, use the best single time
      if (maxWinRate === 0 && timeEntries.length > 0) {
        const bestSingle = timeEntries[0];
        bestTimeRange = bestSingle.time;
        bestTimeRangeProfit = bestSingle.profit;
        bestTimeRangeWinRate = bestSingle.winRate;
      } else if (maxWinRate > 0) {
        // Format the range
        if (bestStartHour === bestEndHour) {
          bestTimeRange = `${bestStartHour}:00`;
        } else {
          bestTimeRange = `${bestStartHour}:00-${bestEndHour + 1}:00`;
        }
        bestTimeRangeProfit = maxProfit;
        bestTimeRangeWinRate = maxWinRate;
      }
    }
    
    return {
      strategy,
      profit: data.profit,
      trades: data.trades,
      wins: data.wins,
      winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      avgProfit: data.trades > 0 ? data.profit / data.trades : 0,
      profitFactor: data.totalLoss > 0 ? data.totalProfit / data.totalLoss : data.totalProfit > 0 ? data.totalProfit : 0,
      bestDay: bestDay ? bestDay[0] : 'N/A',
      bestDayProfit: bestDay ? bestDay[1].profit : 0,
      bestTime: bestTimeRange,
      bestTimeProfit: bestTimeRangeProfit,
      bestTimeWinRate: bestTimeRangeWinRate,
    };
  });

  const bestStrategy = strategyPerformance.length > 0 ? strategyPerformance.reduce((max, strat) => 
    strat.profit > max.profit ? strat : max
  ) : { strategy: 'N/A', profit: 0, trades: 0, winRate: 0, avgProfit: 0, profitFactor: 0 };
  const worstStrategy = strategyPerformance.length > 0 ? strategyPerformance.reduce((min, strat) => 
    strat.profit < min.profit ? strat : min
  ) : { strategy: 'N/A', profit: 0, trades: 0, winRate: 0, avgProfit: 0, profitFactor: 0 };
  const highestWinRate = strategyPerformance.length > 0 ? strategyPerformance.reduce((max, strat) => 
    strat.winRate > max.winRate ? strat : max
  ) : { strategy: 'N/A', profit: 0, trades: 0, winRate: 0, avgProfit: 0, profitFactor: 0 };

  const handleStrategyClick = (strategy: string) => {
    setSelectedStrategy(strategy);
    setShowTradesModal(true);
  };

  const closeModal = () => {
    setShowTradesModal(false);
    setSelectedStrategy(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300">
        Loading strategy analysis...
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
        No trade data available. Add new trades in the Trade Journal to see strategy analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Strategy Analysis</h1>
        <p className="text-gray-400">Analyze performance of your trading strategies</p>
      </div>

      {/* Key Strategy Insights */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Trophy className="text-[#00C853]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Best Strategy</div>
              <div className="text-xl font-bold text-white">{bestStrategy.strategy}</div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#00C853]">₹{bestStrategy.profit.toLocaleString()}</span>
              <span className="text-sm text-gray-400">total profit</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{bestStrategy.trades} trades</span>
              <span>•</span>
              <span>{bestStrategy.winRate}% win rate</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <TrendingDown className="text-[#FF5252]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Worst Strategy</div>
              <div className="text-xl font-bold text-white">{worstStrategy.strategy}</div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#FF5252]">₹{Math.abs(worstStrategy.profit).toLocaleString()}</span>
              <span className="text-sm text-gray-400">loss</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{worstStrategy.trades} trades</span>
              <span>•</span>
              <span>{worstStrategy.winRate}% win rate</span>
            </div>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Target className="text-[#58A6FF]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Highest Win Rate</div>
              <div className="text-xl font-bold text-white">{highestWinRate.strategy}</div>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#58A6FF]">{highestWinRate.winRate}%</span>
              <span className="text-sm text-gray-400">accuracy</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{highestWinRate.trades} trades</span>
              <span>•</span>
              <span>₹{highestWinRate.profit.toLocaleString()} profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Profit by Strategy */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profit by Strategy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis 
                dataKey="strategy" 
                stroke="#8B949E" 
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Profit']}
              />
              <Bar 
                dataKey="profit" 
                fill="#00C853"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win Rate by Strategy */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Win Rate by Strategy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={strategyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis 
                dataKey="strategy" 
                stroke="#8B949E" 
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`${value}%`, 'Win Rate']}
              />
              <Bar 
                dataKey="winRate" 
                fill="#58A6FF"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Performance Line Chart */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Strategy Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={strategyPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis 
              dataKey="strategy" 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
              label={{ value: 'Profit (₹)', angle: -90, position: 'insideLeft', fill: '#8B949E' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
              label={{ value: 'Win Rate (%)', angle: 90, position: 'insideRight', fill: '#8B949E' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="profit" 
              stroke="#00C853" 
              strokeWidth={2}
              name="Profit"
              dot={{ fill: '#00C853', r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="winRate" 
              stroke="#58A6FF" 
              strokeWidth={2}
              name="Win Rate"
              dot={{ fill: '#58A6FF', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Strategy Table */}
      <div className="bg-gradient-to-br from-[#161B22] to-[#0D1117] border border-[#30363D] rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#30363D] bg-gradient-to-r from-[#0D1117] via-[#161B22] to-[#0D1117]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#58A6FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Detailed Strategy Statistics</h3>
              <p className="text-xs text-gray-400">Click on any strategy name to view all trades</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-[#1C2128] via-[#21262D] to-[#1C2128] border-b border-[#30363D]">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-[#58A6FF]" />
                    Strategy
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-3 h-3 text-green-400" />
                    Profit
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-400" />
                    Trades
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <Percent className="w-3 h-3 text-purple-400" />
                    Win Rate
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-3 h-3 text-orange-400" />
                    Avg Profit
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3 h-3 text-yellow-400" />
                    Best Day
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-pink-400" />
                    Best Time Range
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Wins
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {strategyPerformance
                .sort((a, b) => b.profit - a.profit)
                .map((strategy, index) => (
                  <tr 
                    key={strategy.strategy} 
                    className={`group transition-all duration-200 cursor-pointer border-b border-[#30363D]/50 hover:bg-gradient-to-r hover:from-[#21262D]/80 hover:via-[#30363D]/60 hover:to-[#21262D]/80 ${
                      index % 2 === 0 ? 'bg-[#161B22]/50' : 'bg-[#0D1117]/30'
                    }`}
                  >
                    <td className="px-4 py-4" onClick={() => handleStrategyClick(strategy.strategy)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all group-hover:scale-110 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 text-yellow-400 border border-yellow-500/50' :
                          strategy.profit < 0 ? 'bg-gradient-to-br from-red-500/30 to-red-900/30 text-red-400 border border-red-500/50' :
                          'bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-[#58A6FF] border border-blue-500/50'
                        }`}>
                          {index === 0 ? <Trophy className="w-4 h-4" /> : 
                           strategy.profit < 0 ? <AlertTriangle className="w-4 h-4" /> : 
                           <span>{index + 1}</span>}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white group-hover:text-[#58A6FF] transition-colors block">
                            {strategy.strategy}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-3 h-3" /> Click to view trades
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-sm ${
                        strategy.profit >= 0 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-green-400 border border-green-500/30' 
                          : 'bg-gradient-to-r from-red-500/20 to-red-900/10 text-red-400 border border-red-500/30'
                      }`}>
                        {strategy.profit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        ₹{strategy.profit.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-400">{strategy.trades}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke="#21262D"
                              strokeWidth="4"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke={strategy.winRate >= 60 ? '#00C853' : strategy.winRate >= 40 ? '#58A6FF' : '#FF5252'}
                              strokeWidth="4"
                              strokeDasharray={`${strategy.winRate * 1.26} 126`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {strategy.winRate}%
                          </span>
                        </div>
                        <div className="w-16 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              strategy.winRate >= 60 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
                              strategy.winRate >= 40 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 
                              'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${strategy.winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-semibold ${
                        strategy.avgProfit >= 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {strategy.avgProfit >= 0 ? '+' : '-'}₹{Math.abs(strategy.avgProfit).toFixed(2)}
                      </div>
                      <span className="text-xs text-gray-500">per trade</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-yellow-400">{strategy.bestDay}</span>
                        <span className={`text-xs ${strategy.bestDayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {strategy.bestDayProfit >= 0 ? '+' : '-'}₹{Math.abs(strategy.bestDayProfit).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-pink-400">{strategy.bestTime}</span>
                        <span className={`text-xs ${strategy.bestTimeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {strategy.bestTimeProfit >= 0 ? '+' : '-'}₹{Math.abs(strategy.bestTimeProfit).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {strategy.bestTimeWinRate > 0 ? `${Math.round(strategy.bestTimeWinRate)}% win rate` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center border border-green-500/30">
                          <span className="text-sm font-bold text-green-400">{strategy.wins}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <div className="text-green-400 font-semibold">{strategy.winRate}%</div>
                          <div>win rate</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trades Modal */}
      {showTradesModal && selectedStrategy && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363D] bg-[#0D1117]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-[#58A6FF]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedStrategy}</h3>
                  <p className="text-sm text-gray-400">{strategyTrades.length} trades found</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-[#30363D] rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[70vh] p-6">
              {strategyTrades.length > 0 ? (
                <div className="space-y-3">
                  {strategyTrades
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((trade, index) => (
                      <div
                        key={trade.id}
                        className={`p-4 rounded-lg border transition-all hover:scale-[1.01] ${
                          trade.profitLoss >= 0
                            ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30'
                            : 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 rounded-full bg-[#0D1117] flex items-center justify-center text-sm font-bold text-gray-400">
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{trade.symbol}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  trade.optionType === 'CE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.optionType}
                                </span>
                                <span className="text-gray-400 text-sm">@{trade.strikePrice}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-sm text-gray-400">{trade.date}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-sm text-gray-400">{trade.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Entry → Exit</div>
                              <div className="text-sm text-gray-300">₹{trade.entryPrice} → ₹{trade.exitPrice}</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xl font-bold ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.profitLoss >= 0 ? '+' : '-'}₹{Math.abs(trade.profitLoss).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                {trade.profitLoss >= 0 ? (
                                  <TrendingUp className="w-3 h-3 text-green-400" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-red-400" />
                                )}
                                <span className={`text-xs ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {trade.profitLoss >= 0 ? 'Win' : 'Loss'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {(trade.mistakeTag || trade.emotionTag || trade.notes) && (
                          <div className="mt-3 pt-3 border-t border-[#30363D]/50 flex flex-wrap gap-2">
                            {trade.mistakeTag && trade.mistakeTag !== 'no' && (
                              <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">
                                Mistake: {trade.mistakeTag}
                              </span>
                            )}
                            {trade.emotionTag && trade.emotionTag !== 'no' && (
                              <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">
                                Emotion: {trade.emotionTag}
                              </span>
                            )}
                            {trade.notes && (
                              <span className="px-2 py-1 bg-gray-700/30 text-gray-400 text-xs rounded truncate max-w-md">
                                {trade.notes}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No trades found for this strategy</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#30363D] bg-[#0D1117] flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Total P&L for <span className="text-white font-semibold">{selectedStrategy}</span>:
                <span className={`ml-2 font-bold ${strategyTrades.reduce((acc, t) => acc + t.profitLoss, 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {strategyTrades.reduce((acc, t) => acc + t.profitLoss, 0) >= 0 ? '+' : '-'}
                  ₹{Math.abs(strategyTrades.reduce((acc, t) => acc + t.profitLoss, 0)).toLocaleString()}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#30363D] hover:bg-[#3D444D] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
