import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, BarChart3, Target, Award, Sparkles } from 'lucide-react';
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
      
      // Set calendar to month of most recent trade
      if (mappedData.length > 0) {
        const sortedDates = mappedData.map(t => t.date).sort();
        const mostRecentDate = sortedDates[sortedDates.length - 1];
        if (mostRecentDate) {
          const [year, month] = mostRecentDate.split('-').map(Number);
          if (year && month) {
            setCurrentDate(new Date(year, month - 1, 1));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load trades:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate trades by date
  const tradesByDate = trades.reduce((acc, trade) => {
    if (!acc[trade.date]) {
      acc[trade.date] = { profitLoss: 0, tradeCount: 0, trades: [] };
    }
    acc[trade.date].profitLoss += trade.profitLoss;
    acc[trade.date].tradeCount += 1;
    acc[trade.date].trades.push(trade);
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
      days.push(
        <div key={`empty-${i}`} className="bg-[#0D1117]/50 rounded-xl p-2 min-h-[110px] border border-[#21262D]/30" />
      );
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
            relative rounded-xl p-3 min-h-[110px] cursor-pointer transition-all duration-300 overflow-hidden
            ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B1117] scale-[1.02]' : ''}
            ${dayData ? '' : 'bg-gradient-to-br from-[#0D1117] to-[#111820] border border-[#21262D]/50 hover:border-[#30363D] hover:from-[#111820] hover:to-[#161B22]'}
            ${isProfit ? 'bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/40 hover:from-green-500/30 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/20' : ''}
            ${isLoss ? 'bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border border-red-500/40 hover:from-red-500/30 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20' : ''}
            ${!dayData ? '' : 'hover:scale-[1.02]'}
          `}
        >
          {/* Day number with badge */}
          <div className="flex items-center justify-between mb-2">
            <span className={`
              text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
              ${isProfit ? 'bg-green-500/20 text-green-300' : isLoss ? 'bg-red-500/20 text-red-300' : 'bg-[#21262D] text-gray-400'}
            `}>
              {day}
            </span>
            {dayData && (
              <Sparkles className={`w-3 h-3 ${isProfit ? 'text-green-400 animate-pulse' : isLoss ? 'text-red-400' : 'text-gray-600'}`} />
            )}
          </div>
          
          {dayData && (
            <div className="space-y-2">
              {/* P&L Amount */}
              <div className={`text-lg font-bold ${isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-400'}`}>
                {isProfit ? '+' : ''}₹{Math.abs(dayData.profitLoss).toLocaleString()}
              </div>
              
              {/* Trade count badge */}
              <div className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${isProfit ? 'bg-green-500/20 text-green-300' : isLoss ? 'bg-red-500/20 text-red-300' : 'bg-gray-700/50 text-gray-400'}
              `}>
                <BarChart3 className="w-3 h-3" />
                {dayData.tradeCount} trade{dayData.tradeCount > 1 ? 's' : ''}
              </div>
              
              {/* Win/Loss indicator */}
              <div className="flex items-center gap-1">
                {dayData.trades.filter(t => t.profitLoss > 0).length > 0 && (
                  <span className="text-xs text-green-400">
                    {dayData.trades.filter(t => t.profitLoss > 0).length}W
                  </span>
                )}
                {dayData.trades.filter(t => t.profitLoss < 0).length > 0 && (
                  <span className="text-xs text-red-400">
                    {dayData.trades.filter(t => t.profitLoss < 0).length}L
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Hover glow effect */}
          {dayData && (
            <div className={`
              absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none
              ${isProfit ? 'bg-gradient-to-t from-green-500/10 to-transparent' : isLoss ? 'bg-gradient-to-t from-red-500/10 to-transparent' : ''}
            `} />
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDayData = selectedDate ? tradesByDate[selectedDate] : null;

  // Calculate monthly totals
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
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-[#21262D] hover:bg-[#30363D] text-gray-300 rounded-lg text-sm transition-colors"
          >
            Today
          </button>
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

      {/* Monthly Summary Cards - Enhanced */}
      <div className="grid grid-cols-4 gap-4">
        <div className="group bg-gradient-to-br from-[#161B22] to-[#1a2332] border border-[#30363D] hover:border-green-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400 font-medium">Net P&L</div>
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
              <BarChart3 className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${netMonthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netMonthlyPnL >= 0 ? '+' : '-'}₹{Math.abs(netMonthlyPnL).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>

        <div className="group bg-gradient-to-br from-[#161B22] to-[#1a2332] border border-[#30363D] hover:border-green-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400 font-medium">Gross Profit</div>
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-400">
            +₹{totalMonthlyProfit.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Winning trades</div>
        </div>

        <div className="group bg-gradient-to-br from-[#161B22] to-[#1a2332] border border-[#30363D] hover:border-red-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400 font-medium">Gross Loss</div>
            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400">
            -₹{totalMonthlyLoss.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Losing trades</div>
        </div>

        <div className="group bg-gradient-to-br from-[#161B22] to-[#1a2332] border border-[#30363D] hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400 font-medium">Win/Loss Days</div>
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold">
            <span className="text-green-400">{profitableDays}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-red-400">{lossDays}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Trading days</div>
        </div>
      </div>

      {/* Legend - Enhanced */}
      <div className="flex items-center gap-6 text-sm bg-[#161B22] border border-[#30363D] rounded-xl p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-green-500/40 to-green-600/20 border border-green-500/50 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-green-400" />
          </div>
          <span className="text-gray-300 font-medium">Profit Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-red-500/40 to-red-600/20 border border-red-500/50 flex items-center justify-center">
            <TrendingDown className="w-3 h-3 text-red-400" />
          </div>
          <span className="text-gray-300 font-medium">Loss Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-[#0D1117] to-[#161B22] border border-[#30363D]/50" />
          <span className="text-gray-300 font-medium">No Trades</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">
          Click on any day to view trade details
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-300">Loading calendar data...</div>}

      {!loading && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {/* Week day headers - Enhanced */}
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 py-3 bg-[#0D1117] rounded-lg border border-[#21262D]">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </div>
      )}

      {/* Selected Day Details - Enhanced */}
      {selectedDate && selectedDayData && (
        <div className="mt-6 bg-gradient-to-br from-[#161B22] to-[#1a2332] border border-[#30363D] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${selectedDayData.profitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <Award className={`w-6 h-6 ${selectedDayData.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-sm text-gray-400">{selectedDayData.tradeCount} trades executed</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${selectedDayData.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selectedDayData.profitLoss >= 0 ? '+' : '-'}₹{Math.abs(selectedDayData.profitLoss).toLocaleString()}
            </div>
          </div>
          
          {/* Trade Cards */}
          <div className="grid gap-3">
            {selectedDayData.trades.map((trade, index) => (
              <div 
                key={trade.id} 
                className={`
                  flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01]
                  ${trade.profitLoss >= 0 
                    ? 'bg-gradient-to-r from-green-500/10 to-transparent border-green-500/30 hover:border-green-400/50' 
                    : 'bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30 hover:border-red-400/50'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${trade.profitLoss >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                  `}>
                    #{index + 1}
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
                    <div className="text-sm text-gray-400">{trade.strategyName || 'No Strategy'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Entry → Exit</div>
                    <div className="text-sm text-gray-300">₹{trade.entryPrice} → ₹{trade.exitPrice}</div>
                  </div>
                  <div className={`text-xl font-bold ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.profitLoss >= 0 ? '+' : '-'}₹{Math.abs(trade.profitLoss).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Day Summary */}
          <div className="mt-4 pt-4 border-t border-[#30363D] grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Winning Trades</div>
              <div className="text-lg font-bold text-green-400">
                {selectedDayData.trades.filter(t => t.profitLoss > 0).length}
              </div>
            </div>
            <div className="text-center border-x border-[#30363D]">
              <div className="text-xs text-gray-500 mb-1">Losing Trades</div>
              <div className="text-lg font-bold text-red-400">
                {selectedDayData.trades.filter(t => t.profitLoss < 0).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Win Rate</div>
              <div className="text-lg font-bold text-blue-400">
                {Math.round((selectedDayData.trades.filter(t => t.profitLoss > 0).length / selectedDayData.trades.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
