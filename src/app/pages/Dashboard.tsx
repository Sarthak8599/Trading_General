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
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
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

  const today = new Date().toISOString().slice(0, 10);
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
    <div className="space-y-6">
      <div>
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

      <div className="grid grid-cols-4 gap-6">
        {metrics.map(metric => {
          const Icon = metric.icon;
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
