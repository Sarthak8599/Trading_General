import { useState } from 'react';
import { Search, Filter, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { mockTrades } from '../data/mockData';

export default function TradeHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('all');
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterMistake, setFilterMistake] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const strategies = ['all', ...Array.from(new Set(mockTrades.map(t => t.strategyName)))];
  const symbols = ['all', 'NIFTY', 'BANKNIFTY'];
  const mistakes = ['all', ...Array.from(new Set(mockTrades.map(t => t.mistakeTag).filter(Boolean) as string[]))];

  let filteredTrades = mockTrades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.strategyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrategy = filterStrategy === 'all' || trade.strategyName === filterStrategy;
    const matchesSymbol = filterSymbol === 'all' || trade.symbol === filterSymbol;
    const matchesResult = filterResult === 'all' || trade.tradeResult.toLowerCase() === filterResult;
    const matchesMistake = filterMistake === 'all' || trade.mistakeTag === filterMistake;
    
    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = matchesDateRange && trade.date >= startDate;
    }
    if (endDate) {
      matchesDateRange = matchesDateRange && trade.date <= endDate;
    }
    
    return matchesSearch && matchesStrategy && matchesSymbol && matchesResult && matchesMistake && matchesDateRange;
  });

  // Sorting
  filteredTrades = [...filteredTrades].sort((a, b) => {
    let aValue: any = a[sortBy as keyof typeof a];
    let bValue: any = b[sortBy as keyof typeof b];
    
    if (sortBy === 'profitLoss') {
      aValue = a.profitLoss;
      bValue = b.profitLoss;
    }
    
    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const totalProfit = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = filteredTrades.filter(t => t.profitLoss > 0).length;
  const losingTrades = filteredTrades.filter(t => t.profitLoss < 0).length;
  const winRate = filteredTrades.length > 0 
    ? ((winningTrades / filteredTrades.length) * 100).toFixed(1) 
    : 0;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Trade History</h1>
          <p className="text-gray-400">Advanced filtering and analysis of all trades</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
          <div className="text-sm text-gray-400 mb-1">Total Trades</div>
          <div className="text-2xl font-bold text-white">{filteredTrades.length}</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
          <div className="text-sm text-gray-400 mb-1">Total P&L</div>
          <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
            ₹{totalProfit.toLocaleString()}
          </div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
          <div className="text-sm text-gray-400 mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-[#58A6FF]">{winRate}%</div>
        </div>
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
          <div className="text-sm text-gray-400 mb-1">W/L Ratio</div>
          <div className="text-2xl font-bold text-white">{winningTrades}/{losingTrades}</div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="text-[#58A6FF]" size={20} />
          <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Date Range Start</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 focus:outline-none focus:border-[#238636]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Date Range End</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 focus:outline-none focus:border-[#238636]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#238636]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Strategy</label>
            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#238636]"
            >
              {strategies.map(strategy => (
                <option key={strategy} value={strategy}>
                  {strategy === 'all' ? 'All Strategies' : strategy}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Symbol</label>
            <select
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#238636]"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>
                  {symbol === 'all' ? 'All Symbols' : symbol}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Result</label>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#238636]"
            >
              <option value="all">All Results</option>
              <option value="win">Wins Only</option>
              <option value="loss">Losses Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-2">Mistake</label>
            <select
              value={filterMistake}
              onChange={(e) => setFilterMistake(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 text-sm focus:outline-none focus:border-[#238636]"
            >
              {mistakes.map(mistake => (
                <option key={mistake} value={mistake}>
                  {mistake === 'all' ? 'All Mistakes' : mistake}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trade Table with Sorting */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0D1117] border-b border-[#30363D]">
                <th 
                  onClick={() => handleSort('date')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Strike</th>
                <th 
                  onClick={() => handleSort('strategyName')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  Strategy {sortBy === 'strategyName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Exit</th>
                <th 
                  onClick={() => handleSort('profitLoss')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  P&L {sortBy === 'profitLoss' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Result</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Mistake</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D]">
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-[#0D1117] transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.time}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#58A6FF]">{trade.symbol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      trade.optionType === 'CE' ? 'bg-green-900/30 text-[#00C853]' : 'bg-red-900/30 text-[#FF5252]'
                    }`}>
                      {trade.optionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{trade.strikePrice}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 bg-[#0D1117] border border-[#30363D] rounded text-gray-300">
                      {trade.strategyName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">₹{trade.entryPrice}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">₹{trade.exitPrice}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {trade.profitLoss >= 0 ? (
                        <TrendingUp size={14} className="text-[#00C853]" />
                      ) : (
                        <TrendingDown size={14} className="text-[#FF5252]" />
                      )}
                      <span className={`text-sm font-semibold ${
                        trade.profitLoss >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'
                      }`}>
                        ₹{Math.abs(trade.profitLoss).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      trade.tradeResult === 'Win' 
                        ? 'bg-green-900/30 text-[#00C853]' 
                        : 'bg-red-900/30 text-[#FF5252]'
                    }`}>
                      {trade.tradeResult}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {trade.mistakeTag && (
                      <span className="text-xs px-2 py-1 bg-yellow-900/30 text-[#FFD600] rounded">
                        {trade.mistakeTag}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{trade.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Showing {filteredTrades.length} of {mockTrades.length} trades</span>
        <span>Click column headers to sort</span>
      </div>
    </div>
  );
}
