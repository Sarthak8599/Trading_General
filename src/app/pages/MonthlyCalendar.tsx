import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { TradeService } from '../../lib/tradeService';
import { Trade } from '../data/mockData';

interface DayData {
  date: string;
  profitLoss: number;
  tradeCount: number;
  trades: Trade[];
}

export default function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const data = await TradeService.getAllTrades();
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
    } finally {
      setLoading(false);
    }
  };

  // Aggregate trades by date - handle both YYYY-MM-DD and DD/MM/YYYY formats
  const tradesByDate = trades.reduce((acc, trade) => {
    // Normalize date to YYYY-MM-DD format
    let normalizedDate = trade.date;
    if (trade.date.includes('/')) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = trade.date.split('/');
      if (parts.length === 3) {
        normalizedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    if (!acc[normalizedDate]) {
      acc[normalizedDate] = { profitLoss: 0, tradeCount: 0, trades: [] };
    }
    acc[normalizedDate].profitLoss += trade.profitLoss;
    acc[normalizedDate].tradeCount += 1;
    acc[normalizedDate].trades.push(trade);
    return acc;
  }, {} as Record<string, { profitLoss: number; tradeCount: number; trades: Trade[] }>);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const getDayData = (day: number): DayData | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = tradesByDate[dateStr];
    if (!data) return null;
    return {
      date: dateStr,
      profitLoss: data.profitLoss,
      tradeCount: data.tradeCount,
      trades: data.trades
    };
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="bg-[#0D1117] rounded-lg p-2 min-h-[100px]" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = getDayData(day);
      const isProfit = dayData && dayData.profitLoss > 0;
      const isLoss = dayData && dayData.profitLoss < 0;
      const isSelected = selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      days.push(
        <div
          key={day}
          onClick={() => {
            if (dayData) {
              setSelectedDate(dayData.date);
            }
          }}
          className={`
            rounded-lg p-2 min-h-[100px] cursor-pointer transition-all
            ${isSelected ? 'ring-2 ring-white' : ''}
            ${dayData ? '' : 'bg-[#0D1117] hover:bg-[#161B22]'}
            ${isProfit ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border border-green-700/50' : ''}
            ${isLoss ? 'bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-700/50' : ''}
            ${!dayData ? '' : 'hover:scale-[1.02]'}
          `}
        >
          <div className="text-sm font-medium text-gray-400 mb-1">{day}</div>
          {dayData && (
            <div className="space-y-1">
              <div className={`text-xs font-bold ${isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'}`}>
                {isProfit ? '+' : ''}₹{dayData.profitLoss.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {dayData.tradeCount} trade{dayData.tradeCount > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDayData = selectedDate ? tradesByDate[selectedDate] : null;

  // Calculate monthly totals - handle both date formats
  const monthlyTrades = Object.entries(tradesByDate).filter(([dateStr]) => {
    const date = new Date(dateStr);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  const totalMonthlyProfit = monthlyTrades.reduce((sum, [, data]) => sum + (data.profitLoss > 0 ? data.profitLoss : 0), 0);
  const totalMonthlyLoss = monthlyTrades.reduce((sum, [, data]) => sum + (data.profitLoss < 0 ? Math.abs(data.profitLoss) : 0), 0);
  const netMonthlyPnL = totalMonthlyProfit - totalMonthlyLoss;
  const profitableDays = monthlyTrades.filter(([, data]) => data.profitLoss > 0).length;
  const lossDays = monthlyTrades.filter(([, data]) => data.profitLoss < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <CalendarIcon className="text-blue-400" />
            Monthly Calendar
          </h1>
          <p className="text-gray-400">Track your daily trading performance at a glance</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] rounded-lg p-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-[#21262D] rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-white font-medium min-w-[180px] text-center">
              {monthName}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-[#21262D] rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Net P&L</div>
          <div className={`text-xl font-bold ${netMonthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netMonthlyPnL >= 0 ? '+' : '-'}₹{Math.abs(netMonthlyPnL).toLocaleString()}
          </div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Gross Profit</div>
          <div className="text-xl font-bold text-green-400">+₹{totalMonthlyProfit.toLocaleString()}</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Gross Loss</div>
          <div className="text-xl font-bold text-red-400">-₹{totalMonthlyLoss.toLocaleString()}</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Win/Loss Days</div>
          <div className="text-xl font-bold">
            <span className="text-green-400">{profitableDays}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-red-400">{lossDays}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-900/50 border border-green-700" />
          <span className="text-gray-400">Profit Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-900/50 border border-red-700" />
          <span className="text-gray-400">Loss Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0D1117]" />
          <span className="text-gray-400">No Trades</span>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-300">Loading calendar data...</div>}

      {!loading && (
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {renderCalendarDays()}
        </div>
      )}

      {/* Selected Day Details */}
      {selectedDate && selectedDayData && (
        <div className="mt-6 bg-[#161B22] border border-[#30363D] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Trades on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className={`text-lg font-bold ${selectedDayData.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selectedDayData.profitLoss >= 0 ? '+' : '-'}₹{Math.abs(selectedDayData.profitLoss).toLocaleString()}
            </div>
          </div>
          
          <div className="space-y-3">
            {selectedDayData.trades.map((trade, index) => (
              <div key={trade.id} className="flex items-center justify-between py-3 border-b border-[#30363D] last:border-0">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">#{index + 1}</span>
                  <div>
                    <div className="text-white font-medium">{trade.symbol} {trade.optionType}</div>
                    <div className="text-xs text-gray-400">{trade.strategyName || 'No Strategy'}</div>
                  </div>
                </div>
                <div className={`font-bold ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.profitLoss >= 0 ? '+' : '-'}₹{Math.abs(trade.profitLoss).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
