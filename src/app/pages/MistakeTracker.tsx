import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

export default function MistakeTracker() {
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
        setError('Failed to load trades for mistake tracking.');
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Calculate mistake frequency
  const mistakeData = trades.reduce((acc, trade) => {
    if (trade.mistakeTag) {
      const mistake = trade.mistakeTag;
      if (!acc[mistake]) {
        acc[mistake] = { count: 0, losses: 0 };
      }
      acc[mistake].count += 1;
      if (trade.profitLoss < 0) {
        acc[mistake].losses += 1;
      }
    }
    return acc;
  }, {} as Record<string, { count: number; losses: number }>);

  const mistakeFrequency = Object.entries(mistakeData).map(([mistake, data]) => ({
    mistake,
    count: data.count,
    losses: data.losses,
  }));

  // Calculate emotion analysis
  const emotionData = trades.reduce((acc, trade) => {
    if (trade.emotionTag) {
      const emotion = trade.emotionTag;
      if (!acc[emotion]) {
        acc[emotion] = { count: 0, wins: 0, losses: 0, totalProfit: 0 };
      }
      acc[emotion].count += 1;
      acc[emotion].totalProfit += trade.profitLoss;
      if (trade.profitLoss > 0) {
        acc[emotion].wins += 1;
      } else {
        acc[emotion].losses += 1;
      }
    }
    return acc;
  }, {} as Record<string, { count: number; wins: number; losses: number; totalProfit: number }>);

  const emotionAnalysis = Object.entries(emotionData).map(([emotion, data]) => ({
    emotion,
    count: data.count,
    wins: data.wins,
    losses: data.losses,
    winRate: data.count > 0 ? Math.round((data.wins / data.count) * 100) : 0,
    avgProfit: data.count > 0 ? data.totalProfit / data.count : 0,
  }));

  const mostCommonMistake = mistakeFrequency.length > 0 ? mistakeFrequency.reduce((max, mistake) => 
    mistake.count > max.count ? mistake : max
  ) : { mistake: 'N/A', count: 0, losses: 0 };

  const COLORS = ['#FF5252', '#FFD600', '#FF9800', '#F44336', '#E91E63'];

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-300">
        Loading mistake tracking analysis...
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
        No trade data available. Add new trades in the Trade Journal to see mistake tracking.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Mistake & Discipline Tracker</h1>
        <p className="text-gray-400">Track your trading mistakes and emotional patterns</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <AlertTriangle className="text-[#FF5252]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Most Common Mistake</div>
              <div className="text-xl font-bold text-white">{mostCommonMistake.mistake}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-[#FF5252]">{mostCommonMistake.count}</span>
            <span className="text-sm text-gray-400">occurrences</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Brain className="text-[#FFD600]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Mistakes</div>
              <div className="text-xl font-bold text-white">This Month</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-[#FFD600]">
              {mistakeFrequency.reduce((sum, m) => sum + m.count, 0)}
            </span>
            <span className="text-sm text-gray-400">total errors</span>
          </div>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <TrendingUp className="text-[#00C853]" size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-400">Best Emotional State</div>
              <div className="text-xl font-bold text-white">Confident</div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-[#00C853]">₹1,543.75</span>
            <span className="text-sm text-gray-400">avg profit</span>
          </div>
        </div>
      </div>

      {/* Mistake Frequency Chart */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Mistake Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mistakeFrequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis 
                dataKey="mistake" 
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
                formatter={(value: number) => [value, 'Count']}
              />
              <Bar 
                dataKey="count" 
                fill="#FF5252"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Mistake Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mistakeFrequency}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ mistake, percent }) => `${mistake}: ${((percent * 100) || 0).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {mistakeFrequency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mistake Details Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363D]">
          <h3 className="text-lg font-semibold text-white">Mistake Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D1117] border-b border-[#30363D]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Mistake Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">% of Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Impact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Action Needed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {mistakeFrequency.map((mistake, index) => {
                const totalMistakes = mistakeFrequency.reduce((sum, m) => sum + m.count, 0);
                const percentage = totalMistakes > 0 ? ((mistake.count / totalMistakes) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={mistake.mistake} className="hover:bg-[#0D1117] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-white">{mistake.mistake}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#FF5252] font-semibold">{mistake.count}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{percentage}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        mistake.count > 10 
                          ? 'bg-red-900/30 text-[#FF5252]' 
                          : mistake.count > 5 
                          ? 'bg-yellow-900/30 text-[#FFD600]' 
                          : 'bg-blue-900/30 text-[#58A6FF]'
                      }`}>
                        {mistake.count > 10 ? 'High' : mistake.count > 5 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {mistake.count > 10 ? 'Immediate attention required' : 'Monitor closely'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emotion Analysis */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Emotion Analysis</h3>
        <div className="grid grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emotionAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis 
                dataKey="emotion" 
                stroke="#8B949E" 
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: number) => [value, 'Trades']}
              />
              <Bar dataKey="count" fill="#58A6FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emotionAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis 
                dataKey="emotion" 
                stroke="#8B949E" 
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161B22',
                  border: '1px solid #30363D',
                  borderRadius: '6px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`₹${(value || 0).toFixed(2)}`, 'Avg Profit']}
              />
              <Bar dataKey="avgProfit" fill="#00C853" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Impact Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#30363D]">
          <h3 className="text-lg font-semibold text-white">Emotional State Impact on Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D1117] border-b border-[#30363D]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Emotion</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trades</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Avg Profit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {emotionAnalysis
                .sort((a, b) => b.avgProfit - a.avgProfit)
                .map((emotion) => (
                  <tr key={emotion.emotion} className="hover:bg-[#0D1117] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{emotion.emotion}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{emotion.count}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${
                        emotion.avgProfit >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'
                      }`}>
                        ₹{(emotion.avgProfit || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        emotion.avgProfit > 1000 
                          ? 'bg-green-900/30 text-[#00C853]' 
                          : emotion.avgProfit > 0 
                          ? 'bg-blue-900/30 text-[#58A6FF]' 
                          : 'bg-red-900/30 text-[#FF5252]'
                      }`}>
                        {emotion.avgProfit > 1000 ? 'Excellent' : emotion.avgProfit > 0 ? 'Good' : 'Poor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {emotion.avgProfit > 0 
                        ? 'Continue trading in this state' 
                        : 'Avoid trading when feeling this way'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discipline Tips */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Discipline Improvement Tips</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Wait for Your Setup</div>
              <p className="text-sm text-gray-400">FOMO is your biggest enemy. Wait for confirmed signals.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Limit Daily Trades</div>
              <p className="text-sm text-gray-400">Set a maximum number of trades per day to avoid overtrading.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Never Revenge Trade</div>
              <p className="text-sm text-gray-400">After a loss, take a break. Don't try to "win it back".</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[#0D1117] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#00C853] mt-2" />
            <div>
              <div className="font-medium text-white mb-1">Stay Calm & Confident</div>
              <p className="text-sm text-gray-400">Your best trades happen when you're calm and confident.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
