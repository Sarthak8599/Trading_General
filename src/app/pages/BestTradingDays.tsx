import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingDown, Clock } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

export default function BestTradingDays() {
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
        setError('Failed to load trades for analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Calculate day of week statistics
  const dayOfWeekData = trades.reduce((acc, trade) => {
    const day = trade.day;
    if (!acc[day]) {
      acc[day] = { profit: 0, trades: 0, wins: 0 };
    }
    acc[day].profit += trade.profitLoss;
    acc[day].trades += 1;
    if (trade.profitLoss > 0) acc[day].wins += 1;
    return acc;
  }, {} as Record<string, { profit: number; trades: number; wins: number }>);

  const dayOfWeekProfits = Object.entries(dayOfWeekData).map(([day, data]) => ({
    day,
    profit: data.profit,
    trades: data.trades,
    winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
  }));

  // Calculate time of day statistics
  const timeOfDayData = trades.reduce((acc, trade) => {
    const hour = parseInt(trade.time.split(':')[0]);
    let timeSlot = '';
    if (hour >= 9 && hour < 11) timeSlot = '9:00 - 11:00';
    else if (hour >= 11 && hour < 13) timeSlot = '11:00 - 13:00';
    else if (hour >= 13 && hour < 15) timeSlot = '13:00 - 15:00';
    else if (hour >= 15 && hour < 17) timeSlot = '15:00 - 17:00';
    else timeSlot = 'Other';

    if (!acc[timeSlot]) {
      acc[timeSlot] = { profit: 0, trades: 0, wins: 0 };
    }
    acc[timeSlot].profit += trade.profitLoss;
    acc[timeSlot].trades += 1;
    if (trade.profitLoss > 0) acc[timeSlot].wins += 1;
    return acc;
  }, {} as Record<string, { profit: number; trades: number; wins: number }>);

  const timeOfDayProfits = Object.entries(timeOfDayData).map(([time, data]) => ({
    time,
    profit: data.profit,
    trades: data.trades,
    winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
  }));

  const bestDay = dayOfWeekProfits.length > 0 ? dayOfWeekProfits.reduce((max, day) => day.profit > max.profit ? day : max) : { day: 'N/A', profit: 0, trades: 0, winRate: 0 };
  const worstDay = dayOfWeekProfits.length > 0 ? dayOfWeekProfits.reduce((min, day) => day.profit < min.profit ? day : min) : { day: 'N/A', profit: 0, trades: 0, winRate: 0 };
  const bestTime = timeOfDayProfits.length > 0 ? timeOfDayProfits.reduce((max, time) => time.profit > max.profit ? time : max) : { time: 'N/A', profit: 0, trades: 0, winRate: 0 };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300">
        Loading trading day analysis...
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
        No trade data available. Add new trades in the Trade Journal to see trading day analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Best Trading Day Analysis</h1>
        <p className="text-gray-400">Identify your most profitable trading days and times</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Trophy className="text-[#00C853]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Best Trading Day</div>
              <div className="text-xl font-bold text-white">{bestDay.day}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-[#00C853]">₹{bestDay.profit.toLocaleString()}</span>
            <span className="text-sm text-gray-400">profit</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span>{bestDay.trades} trades</span>
            <span>•</span>
            <span>{bestDay.winRate}% win rate</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <TrendingDown className="text-[#FF5252]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Worst Trading Day</div>
              <div className="text-xl font-bold text-white">{worstDay.day}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-[#FF5252]">₹{worstDay.profit.toLocaleString()}</span>
            <span className="text-sm text-gray-400">profit</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span>{worstDay.trades} trades</span>
            <span>•</span>
            <span>{worstDay.winRate}% win rate</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Clock className="text-[#58A6FF]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Best Trading Time</div>
              <div className="text-lg font-bold text-white">{bestTime.time}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-[#00C853]">₹{bestTime.profit.toLocaleString()}</span>
            <span className="text-sm text-gray-400">profit</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span>{bestTime.trades} trades</span>
            <span>•</span>
            <span>{bestTime.winRate}% win rate</span>
          </div>
        </div>
      </div>

      {/* Day of Week Analysis */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Profit by Day of Week</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dayOfWeekProfits}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis 
              dataKey="day" 
              stroke="#8B949E" 
              style={{ fontSize: '13px' }}
            />
            <YAxis 
              stroke="#8B949E" 
              style={{ fontSize: '13px' }}
              label={{ value: 'Profit (₹)', angle: -90, position: 'insideLeft', fill: '#8B949E' }}
            />
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
              radius={[6, 6, 0, 0]}
              label={{ position: 'top', fill: '#8B949E', fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Day Stats */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363D]">
          <h3 className="text-lg font-semibold text-white">Detailed Statistics by Day</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D1117] border-b border-[#30363D]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Day</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Total Profit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Number of Trades</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Win Rate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Avg Profit/Trade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {dayOfWeekProfits.map((day) => (
                <tr key={day.day} className="hover:bg-[#0D1117] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{day.day}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${day.profit >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                      ₹{day.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{day.trades}</td>
                  <td className="px-6 py-4">
                    <span className="text-[#58A6FF] font-medium">{day.winRate}%</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    ₹{(day.profit / day.trades).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {day.day === bestDay.day && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-[#00C853] text-xs font-semibold rounded">
                        <Trophy size={12} />
                        Best
                      </span>
                    )}
                    {day.day === worstDay.day && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-[#FF5252] text-xs font-semibold rounded">
                        <TrendingDown size={12} />
                        Worst
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time of Day Analysis */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Profit by Time of Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeOfDayProfits} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis 
              type="number" 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              type="category" 
              dataKey="time" 
              stroke="#8B949E" 
              style={{ fontSize: '12px' }}
              width={150}
            />
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
              fill="#238636" 
              radius={[0, 6, 6, 0]}
              label={{ position: 'right', fill: '#8B949E', fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
