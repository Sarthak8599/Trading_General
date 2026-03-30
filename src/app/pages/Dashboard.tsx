import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, Brain, Heart, Activity } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

function getWeekLabel(dateString: string) {
  const date = new Date(dateString);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
  return weekNumber.toString();
}

function formatMonthLabel(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
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
        console.error('Unable to load trades for dashboard:', err);
        setError('Unable to load trades. Dashboard will show results once trades are created.');
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalTrades = trades.length;
  const totalProfit = trades.reduce((acc, trade) => acc + trade.profitLoss, 0);
  const grossProfit = trades.filter(t => t.profitLoss > 0).reduce((acc, t) => acc + t.profitLoss, 0);
  const grossLoss = trades.filter(t => t.profitLoss < 0).reduce((acc, t) => acc + t.profitLoss, 0);
  const winTrades = trades.filter(t => t.profitLoss > 0).length;
  const lossTrades = trades.filter(t => t.profitLoss <= 0).length;

  const winRate = totalTrades ? Number(((winTrades / totalTrades) * 100).toFixed(1)) : 0;
  const lossRate = totalTrades ? Number(((lossTrades / totalTrades) * 100).toFixed(1)) : 0;
  const profitFactor = grossLoss === 0 ? (totalProfit || 0) : Number((grossProfit / Math.abs(grossLoss)).toFixed(2));
  const expectancy = totalTrades ? Number((totalProfit / totalTrades).toFixed(2)) : 0;

  // Calculate mistake and emotion analytics
  const mistakesCount = trades.reduce((acc, trade) => {
    if (trade.mistakeTag && trade.mistakeTag.trim() !== '' && trade.mistakeTag.toLowerCase() !== 'no') {
      acc[trade.mistakeTag] = (acc[trade.mistakeTag] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const emotionsCount = trades.reduce((acc, trade) => {
    if (trade.emotionTag && trade.emotionTag.trim() !== '' && trade.emotionTag.toLowerCase() !== 'no') {
      acc[trade.emotionTag] = (acc[trade.emotionTag] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedMistakes = Object.entries(mistakesCount).sort(([,a], [,b]) => b - a).slice(0, 5);
  const sortedEmotions = Object.entries(emotionsCount).sort(([,a], [,b]) => b - a).slice(0, 5);

  // Today's trades count for overtrading warning
  const todayTradesCount = trades.filter(t => t.date === today).length;
  const maxDailyTrades = 3;
  const isOvertrading = todayTradesCount >= maxDailyTrades;
  const oneWeekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const dailyGroups = new Map<string, number>();
  const weeklyGroups = new Map<string, number>();
  const monthlyGroups = new Map<string, number>();
  const yearlyGroups = new Map<number, number>();

  trades.forEach(trade => {
    dailyGroups.set(trade.date, (dailyGroups.get(trade.date) || 0) + trade.profitLoss);
    const weekLabel = getWeekLabel(trade.date);
    weeklyGroups.set(weekLabel, (weeklyGroups.get(weekLabel) || 0) + trade.profitLoss);
    const monthLabel = formatMonthLabel(trade.date);
    monthlyGroups.set(monthLabel, (monthlyGroups.get(monthLabel) || 0) + trade.profitLoss);
    const year = new Date(trade.date).getFullYear();
    yearlyGroups.set(year, (yearlyGroups.get(year) || 0) + trade.profitLoss);
  });

  const dailyProfit = dailyGroups.get(today) || 0;
  
  // Debug: Log today's date and available dates
  console.log('Dashboard Debug - Today:', today);
  console.log('Dashboard Debug - Available dates:', Array.from(dailyGroups.keys()));
  console.log('Dashboard Debug - Daily groups:', Object.fromEntries(dailyGroups));
  console.log('Dashboard Debug - Total trades:', trades.length);
  console.log('Dashboard Debug - Trade dates:', trades.map(t => ({ date: t.date, profit: t.profitLoss })));
  const weeklyProfit = trades
    .filter(trade => {
      const d = new Date(trade.date);
      return d >= oneWeekAgo && d <= new Date();
    })
    .reduce((acc, trade) => acc + trade.profitLoss, 0);
  const monthlyProfit = trades
    .filter(trade => {
      const d = new Date(trade.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, trade) => acc + trade.profitLoss, 0);
  const yearlyProfit = trades
    .filter(trade => new Date(trade.date).getFullYear() === currentYear)
    .reduce((acc, trade) => acc + trade.profitLoss, 0);

  const metrics = [
    { title: 'Daily Profit', value: `₹${dailyProfit.toLocaleString()}`, trades: totalTrades, icon: DollarSign, color: 'text-[#00C853]' },
    { title: 'Weekly Profit', value: `₹${weeklyProfit.toLocaleString()}`, trades: totalTrades, icon: TrendingUp, color: 'text-[#00C853]' },
    { title: 'Monthly Profit', value: `₹${monthlyProfit.toLocaleString()}`, trades: totalTrades, icon: TrendingUp, color: 'text-[#00C853]' },
    { title: 'Yearly Profit', value: `₹${yearlyProfit.toLocaleString()}`, trades: totalTrades, icon: TrendingUp, color: 'text-[#00C853]' }
  ];

  const profitMetrics = [
    { label: 'Total Profit', value: `₹${totalProfit.toLocaleString()}`, positive: totalProfit >= 0 },
    { label: 'Net Profit', value: `₹${totalProfit.toLocaleString()}`, positive: totalProfit >= 0 },
    { label: 'Gross Profit', value: `₹${grossProfit.toLocaleString()}`, positive: grossProfit >= 0 },
    { label: 'Gross Loss', value: `₹${Math.abs(grossLoss).toLocaleString()}`, positive: false }
  ];

  const performanceStats = [
    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: 'text-[#00C853]' },
    { label: 'Loss Rate', value: `${lossRate}%`, icon: TrendingDown, color: 'text-[#FF5252]' },
    { label: 'Profit Factor', value: `${profitFactor.toFixed(2)}`, icon: TrendingUp, color: 'text-[#00C853]' },
    { label: 'Expectancy', value: `₹${expectancy.toFixed(2)}`, icon: DollarSign, color: 'text-[#00C853]' }
  ];

  const dailyProfitsData = Array.from(dailyGroups.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, profit]) => ({ date, profit }));

  const weeklyProfitsData = Array.from(weeklyGroups.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([week, profit]) => ({ week, profit }));

  const monthlyProfitsData = Array.from(monthlyGroups.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, profit]) => ({ month, profit }));

  const yearlyProfitsData = Array.from(yearlyGroups.entries())
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, profit]) => ({ year, profit }));

  return (
    <div className="space-y-6 relative">
      {/* Animated Candlestick Chart Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: 0.5 }}>
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="candleGradientUp" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00C853" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00C853" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="candleGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF5252" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF5252" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Animated candlesticks */}
          <g className="animate-pulse">
            {/* Candlestick 1 - Green */}
            <rect x="50" y="200" width="8" height="60" fill="url(#candleGradientUp)" opacity="0.4">
              <animate attributeName="height" values="60;80;60" dur="3s" repeatCount="indefinite" />
              <animate attributeName="y" values="200;190;200" dur="3s" repeatCount="indefinite" />
            </rect>
            <line x1="54" y1="180" x2="54" y2="280" stroke="#00C853" strokeWidth="1" opacity="0.5">
              <animate attributeName="y1" values="180;170;180" dur="3s" repeatCount="indefinite" />
              <animate attributeName="y2" values="280;300;280" dur="3s" repeatCount="indefinite" />
            </line>
            
            {/* Candlestick 2 - Red */}
            <rect x="120" y="150" width="8" height="45" fill="url(#candleGradientDown)" opacity="0.4">
              <animate attributeName="height" values="45;35;45" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="y" values="150;160;150" dur="2.5s" repeatCount="indefinite" />
            </rect>
            <line x1="124" y1="120" x2="124" y2="210" stroke="#FF5252" strokeWidth="1" opacity="0.5">
              <animate attributeName="y1" values="120;110;120" dur="2.5s" repeatCount="indefinite" />
            </line>
            
            {/* Candlestick 3 - Green */}
            <rect x="190" y="250" width="8" height="70" fill="url(#candleGradientUp)" opacity="0.4">
              <animate attributeName="height" values="70;90;70" dur="4s" repeatCount="indefinite" />
              <animate attributeName="y" values="250;240;250" dur="4s" repeatCount="indefinite" />
            </rect>
            <line x1="194" y1="200" x2="194" y2="340" stroke="#00C853" strokeWidth="1" opacity="0.5" />
            
            {/* Candlestick 4 - Red */}
            <rect x="260" y="180" width="8" height="50" fill="url(#candleGradientDown)" opacity="0.4">
              <animate attributeName="height" values="50;30;50" dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="y" values="180;200;180" dur="3.5s" repeatCount="indefinite" />
            </rect>
            <line x1="264" y1="150" x2="264" y2="250" stroke="#FF5252" strokeWidth="1" opacity="0.5" />
            
            {/* Candlestick 5 - Green */}
            <rect x="330" y="300" width="8" height="55" fill="url(#candleGradientUp)" opacity="0.4">
              <animate attributeName="height" values="55;75;55" dur="2.8s" repeatCount="indefinite" />
            </rect>
            <line x1="334" y1="250" x2="334" y2="370" stroke="#00C853" strokeWidth="1" opacity="0.5" />
            
            {/* Additional candlesticks for pattern */}
            <rect x="400" y="220" width="8" height="40" fill="url(#candleGradientDown)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
            </rect>
            <rect x="470" y="160" width="8" height="65" fill="url(#candleGradientUp)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.2s" repeatCount="indefinite" />
            </rect>
            <rect x="540" y="280" width="8" height="35" fill="url(#candleGradientDown)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.7s" repeatCount="indefinite" />
            </rect>
            <rect x="610" y="190" width="8" height="80" fill="url(#candleGradientUp)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.8s" repeatCount="indefinite" />
            </rect>
            <rect x="680" y="240" width="8" height="45" fill="url(#candleGradientDown)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.9s" repeatCount="indefinite" />
            </rect>
            <rect x="750" y="170" width="8" height="70" fill="url(#candleGradientUp)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.4s" repeatCount="indefinite" />
            </rect>
            <rect x="820" y="260" width="8" height="50" fill="url(#candleGradientDown)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3.1s" repeatCount="indefinite" />
            </rect>
            <rect x="890" y="210" width="8" height="60" fill="url(#candleGradientUp)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.6s" repeatCount="indefinite" />
            </rect>
            <rect x="960" y="150" width="8" height="40" fill="url(#candleGradientDown)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite" />
            </rect>
            <rect x="1030" y="290" width="8" height="75" fill="url(#candleGradientUp)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.2s" repeatCount="indefinite" />
            </rect>
            <rect x="1100" y="200" width="8" height="55" fill="url(#candleGradientDown)" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3.3s" repeatCount="indefinite" />
            </rect>
            
            {/* Grid lines */}
            <line x1="0" y1="400" x2="1200" y2="400" stroke="#30363D" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="200" x2="1200" y2="200" stroke="#30363D" strokeWidth="0.5" opacity="0.3" />
            <line x1="0" y1="600" x2="1200" y2="600" stroke="#30363D" strokeWidth="0.5" opacity="0.3" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 space-y-6">
        <h1 className="text-2xl font-bold text-white mb-2">Performance Dashboard</h1>
        <p className="text-gray-400">Track your trading performance and key metrics</p>
      </div>

      {loading && <div className="text-center py-12 text-gray-300">Loading dashboard data...</div>}
      {error && <div className="bg-[#2A1A1A] p-4 rounded-lg border border-[#803030] text-orange-200">{error}</div>}
      {!loading && !error && totalTrades === 0 && (
        <div className="text-gray-400 p-4 bg-[#161B22] rounded-lg border border-[#30363D]">
          No trade data available. Add new trades in the Trade Journal to see dashboard metrics update.
        </div>
      )}

      {/* Overtrading Warning */}
      {todayTradesCount >= maxDailyTrades && (
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-500/50 rounded-xl p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-400 mb-1">
                ⚠️ Overtrading Alert - {todayTradesCount} Trades Completed!
              </h3>
              <p className="text-gray-300">
                You have reached your daily limit of {maxDailyTrades} trades. Stop trading for today to avoid emotional decisions and preserve your capital.
              </p>
            </div>
            <div className="text-center px-4 py-2 bg-red-500/20 rounded-lg">
              <div className="text-xs text-gray-400">Daily Limit</div>
              <div className="text-2xl font-bold text-red-400">{todayTradesCount}/{maxDailyTrades}</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Trade Count Indicator */}
      {todayTradesCount > 0 && todayTradesCount < maxDailyTrades && (
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-gray-300">Today's Trades</span>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(maxDailyTrades)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < todayTradesCount
                      ? 'bg-green-500 text-white'
                      : 'bg-[#21262D] text-gray-500 border border-[#30363D]'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {maxDailyTrades - todayTradesCount} trade{maxDailyTrades - todayTradesCount !== 1 ? 's' : ''} remaining
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {metrics.map(metric => {
          return (
            <div key={metric.title} className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{metric.title}</span>
                <Icon className={metric.color} size={20} />
              </div>
              <div className={`text-2xl font-bold mb-1 ${metric.color}`}>{metric.value}</div>
              <div className="text-xs text-gray-500">{metric.trades} trades</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {profitMetrics.map(metric => (
          <div key={metric.label} className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
            <div className="text-xs text-gray-400 mb-2">{metric.label}</div>
            <div className={`text-xl font-bold ${metric.positive ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyProfitsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="date" stroke="#8B949E" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '6px', color: '#fff' }} />
              <Bar dataKey="profit" fill="#00C853" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyProfitsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="week" stroke="#8B949E" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '6px', color: '#fff' }} />
              <Line type="monotone" dataKey="profit" stroke="#00C853" strokeWidth={2} dot={{ fill: '#00C853' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyProfitsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="month" stroke="#8B949E" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '6px', color: '#fff' }} />
              <Bar dataKey="profit" fill="#238636" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Yearly Profit</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={yearlyProfitsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
              <XAxis dataKey="year" stroke="#8B949E" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8B949E" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D', borderRadius: '6px', color: '#fff' }} />
              <Line type="monotone" dataKey="profit" stroke="#238636" strokeWidth={2} dot={{ fill: '#238636' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mistakes & Emotions Analysis */}
      {(sortedMistakes.length > 0 || sortedEmotions.length > 0) && (
        <div className="grid grid-cols-2 gap-6">
          {/* Repeated Mistakes Section */}
          {sortedMistakes.length > 0 && (
            <div className="bg-gradient-to-br from-[#161B22] to-[#1a1f2e] border border-[#30363D] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Repeated Mistakes</h3>
              </div>
              <div className="space-y-3">
                {sortedMistakes.map(([mistake, count], index) => (
                  <div key={mistake} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg border border-[#21262D] hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-gray-300 font-medium">{mistake}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-orange-400">{count}</span>
                      <span className="text-xs text-gray-500">times</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                💡 Tip: Focus on eliminating your top mistake to improve performance
              </p>
            </div>
          )}

          {/* Emotions Tracking Section */}
          {sortedEmotions.length > 0 && (
            <div className="bg-gradient-to-br from-[#161B22] to-[#1a1f2e] border border-[#30363D] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Emotions While Trading</h3>
              </div>
              <div className="space-y-3">
                {sortedEmotions.map(([emotion, count], index) => (
                  <div key={emotion} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg border border-[#21262D] hover:border-pink-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-gray-300 font-medium">{emotion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-pink-400">{count}</span>
                      <span className="text-xs text-gray-500">times</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                💡 Tip: Avoid trading when experiencing negative emotions
              </p>
            </div>
          )}
        </div>
      )}
      {/* Performance Stats */}
      <div className="grid grid-cols-4 gap-6">
        {performanceStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={stat.color} size={18} />
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
