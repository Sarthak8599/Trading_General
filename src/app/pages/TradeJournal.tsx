import { useState, useEffect, type FormEvent } from 'react';
import { Search, Filter, Plus, Upload, TrendingUp, TrendingDown, Trash2, Download, Edit3, FileUp } from 'lucide-react';
import { Trade } from '../data/mockData';
import { TradeService } from '../../lib/tradeService';

export default function TradeJournal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('all');
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTradeId, setEditTradeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPreview, setImportPreview] = useState<Trade[]>([]);

  // Load trades from Supabase on component mount
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const tradesData = await TradeService.getAllTrades();
      const mappedTrades = tradesData.map(mapDbDataToTrade);
      setTrades(mappedTrades);
    } catch (err) {
      console.error('Failed to load trades:', err);

      let userMessage = 'Failed to load trades. Using local data as fallback.';
      if (err && typeof err === 'object' && 'message' in err) {
        const msg = (err as { message?: string }).message;
        if (msg?.includes("Could not find the table 'public.trades'")) {
          userMessage =
            "Supabase table 'trades' is missing. Create it in your Supabase dashboard using the provided SQL script and reload.";
        }
      }

      setError(userMessage);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert snake_case database data to camelCase for UI
  const mapDbDataToTrade = (dbTrade: any): Trade => {
    return {
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
    };
  };

  const [newTrade, setNewTrade] = useState<Partial<Trade>>({
    date: '',
    time: '',
    day: '',
    tradeName: '',
    symbol: 'NIFTY',
    optionType: 'CE',
    strikePrice: 0,
    strategyName: '',
    entryPrice: 0,
    exitPrice: 0,
    quantity: 0,
    lotSize: 1,
    stopLoss: 0,
    target: 0,
    riskAmount: 0,
    riskRewardRatio: '1:1',
    profitLoss: 0,
    tradeResult: 'Win',
    mistakeTag: '',
    emotionTag: '',
    notes: '',
  });

  const strategies = ['all', ...Array.from(new Set(trades.map(t => t.strategyName)))];
  const symbols = ['all', ...Array.from(new Set(trades.map(t => t.symbol)))];

  const filteredTrades = trades.filter(trade => {
    const term = searchTerm.toLowerCase();
    const symbol = (trade.symbol ?? '').toString().toLowerCase();
    const strategy = (trade.strategyName ?? '').toLowerCase();

    const matchesSearch = symbol.includes(term) || strategy.includes(term);
    const matchesStrategy = filterStrategy === 'all' || trade.strategyName === filterStrategy;
    const matchesSymbol = filterSymbol === 'all' || trade.symbol === filterSymbol;

    return matchesSearch && matchesStrategy && matchesSymbol;
  });

  const handleInputChange = (key: keyof Trade, value: string | number) => {
    setNewTrade(prev => ({ ...prev, [key]: value }));
  };

  const handleAddNewTrade = () => {
    setShowAddForm(true);
    setEditTradeId(null);
  };

  const handleEditTrade = (trade: Trade) => {
    setShowAddForm(true);
    setEditTradeId(trade.id);
    setNewTrade({ ...trade });
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setEditTradeId(null);
    setNewTrade({
      date: '',
      time: '',
      day: '',
      tradeName: '',
      symbol: 'NIFTY',
      optionType: 'CE',
      strikePrice: 0,
      strategyName: '',
      entryPrice: 0,
      exitPrice: 0,
      quantity: 0,
      lotSize: 1,
      stopLoss: 0,
      target: 0,
      riskAmount: 0,
      riskRewardRatio: '1:1',
      profitLoss: 0,
      tradeResult: 'Win',
      mistakeTag: '',
      emotionTag: '',
      notes: '',
    });
  };

  const handleSubmitAddTrade = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newTrade.date || !newTrade.time || !newTrade.day || !newTrade.strategyName) {
      alert('Please fill date, time, day, and strategy name');
      return;
    }

    try {
      setSaving(true);
      const tradeData = {
        date: newTrade.date || '',
        time: newTrade.time || '',
        day: newTrade.day || '',
        trade_name: newTrade.tradeName || '',
        symbol: (newTrade.symbol as 'NIFTY' | 'BANKNIFTY') || 'NIFTY',
        option_type: (newTrade.optionType as 'CE' | 'PE') || 'CE',
        strike_price: Number(newTrade.strikePrice) || 0,
        strategy_name: newTrade.strategyName || '',
        entry_price: Number(newTrade.entryPrice) || 0,
        exit_price: Number(newTrade.exitPrice) || 0,
        quantity: Number(newTrade.quantity) || 0,
        lot_size: Number(newTrade.lotSize) || 1,
        stop_loss: Number(newTrade.stopLoss) || 0,
        target: Number(newTrade.target) || 0,
        risk_amount: Number(newTrade.riskAmount) || 0,
        risk_reward_ratio: String(newTrade.riskRewardRatio || '1:1'),
        profit_loss: Number(newTrade.profitLoss) || 0,
        trade_result: (newTrade.tradeResult as 'Win' | 'Loss') || 'Win',
        mistake_tag: newTrade.mistakeTag,
        emotionTag: newTrade.emotionTag,
        notes: newTrade.notes || '',
      };

      if (editTradeId) {
        await TradeService.updateTrade(editTradeId, tradeData);
      } else {
        await TradeService.createTrade(tradeData);
      }

      await loadTrades(); // Reload all trades
      handleCancelAdd();
    } catch (err) {
      console.error('Failed to save trade:', err);
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Failed to save trade. ${message}`);
      if (typeof message === 'string' && message.includes("Could not find the table 'public.trades'")) {
        setError("Supabase table 'trades' is missing. Please create it using SQL from README.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!window.confirm('Delete this trade?')) return;

    try {
      await TradeService.deleteTrade(id);
      await loadTrades(); // Reload all trades
    } catch (err) {
      console.error('Failed to delete trade:', err);
      alert('Failed to delete trade. Please try again.');
    }
  };

  const exportToCsv = () => {
    if (trades.length === 0) {
      alert('No trades to export');
      return;
    }

    const headers = [
      'Date', 'Time', 'Day', 'Trade Name', 'Symbol', 'Type', 'Strike', 'Strategy', 'Entry', 'Exit', 'Qty', 'R:R', 'P&L', 'Result', 'Mistake', 'Emotion', 'Notes'
    ];

    const formatDateForExcel = (dateStr: string) => {
      if (!dateStr) return '';
      // Convert YYYY-MM-DD to DD/MM/YYYY format for better Excel compatibility
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    const rows = trades.map(t => [
      formatDateForExcel(t.date),
      t.time,
      t.day,
      t.tradeName || '',
      t.symbol,
      t.optionType,
      t.strikePrice,
      t.strategyName,
      t.entryPrice,
      t.exitPrice,
      t.quantity,
      t.riskRewardRatio,
      t.profitLoss,
      t.tradeResult,
      t.mistakeTag || '',
      t.emotionTag || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    // Add UTF-8 BOM for Excel to recognize special characters
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `trade-journal-${new Date().toISOString().slice(0,10)}.csv`);
    link.click();
  };

  const parseCSV = (csvText: string): Trade[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);

    const parsedTrades: Trade[] = [];
    
    rows.forEach((row, index) => {
      try {
        const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (cleanValues.length >= 14) {
          const trade: Trade = {
            id: `import-${Date.now()}-${index}`,
            date: cleanValues[0] || '',
            time: cleanValues[1] || '',
            day: cleanValues[2] || '',
            tradeName: cleanValues[3] || '',
            symbol: cleanValues[4] as any || 'NIFTY',
            optionType: cleanValues[5] as any || 'CE',
            strikePrice: parseFloat(cleanValues[6]) || 0,
            strategyName: cleanValues[7] || '',
            entryPrice: parseFloat(cleanValues[8]) || 0,
            exitPrice: parseFloat(cleanValues[9]) || 0,
            quantity: parseInt(cleanValues[10]) || 0,
            lotSize: 1,
            stopLoss: 0,
            target: 0,
            riskAmount: 0,
            riskRewardRatio: cleanValues[11] || '1:1',
            profitLoss: parseFloat(cleanValues[12]) || 0,
            tradeResult: cleanValues[13] as any || 'Win',
            mistakeTag: cleanValues[14] || '',
            emotionTag: cleanValues[15] || '',
            notes: cleanValues[16] || '',
          };
          
          parsedTrades.push(trade);
        }
      } catch (error) {
        console.error(`Error parsing row ${index + 1}:`, error);
      }
    });

    return parsedTrades;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedTrades = parseCSV(csvText);
      
      if (parsedTrades.length === 0) {
        alert('No valid trades found in CSV file');
        return;
      }

      setImportPreview(parsedTrades);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;

    try {
      setImporting(true);
      
      for (const trade of importPreview) {
        const tradeData = {
          date: trade.date,
          time: trade.time,
          day: trade.day,
          trade_name: trade.tradeName,
          symbol: trade.symbol,
          option_type: trade.optionType,
          strike_price: trade.strikePrice,
          strategy_name: trade.strategyName,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          quantity: trade.quantity,
          lot_size: trade.lotSize,
          stop_loss: trade.stopLoss,
          target: trade.target,
          risk_amount: trade.riskAmount,
          risk_reward_ratio: trade.riskRewardRatio,
          profit_loss: trade.profitLoss,
          trade_result: trade.tradeResult,
          mistake_tag: trade.mistakeTag,
          emotionTag: trade.emotionTag,
          notes: trade.notes,
        };
        
        await TradeService.createTrade(tradeData);
      }

      await loadTrades();
      setShowImportDialog(false);
      setImportPreview([]);
      alert(`Successfully imported ${importPreview.length} trades!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import trades. Please check the CSV format and try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Trade Journal Notebook</h1>
          <p className="text-gray-400">Record and manage all your trades</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportToCsv} className="flex items-center gap-2 px-4 py-2 bg-[#0B55D0] hover:bg-[#196add] text-white rounded-lg transition-colors">
            <Download size={18} />
            Export CSV
          </button>
          <button onClick={() => setShowImportDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-[#6f42c1] hover:bg-[#7950f2] text-white rounded-lg transition-colors">
            <FileUp size={18} />
            Import CSV
          </button>
          <button onClick={handleAddNewTrade} className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors">
            <Plus size={18} />
            Add New Trade
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by symbol or strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#238636]"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400" />
            
            <select
              value={filterStrategy}
              onChange={(e) => setFilterStrategy(e.target.value)}
              className="px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 focus:outline-none focus:border-[#238636]"
            >
              {strategies.map(strategy => (
                <option key={strategy} value={strategy}>
                  {strategy === 'all' ? 'All Strategies' : strategy}
                </option>
              ))}
            </select>
            
            <select
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 focus:outline-none focus:border-[#238636]"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>
                  {symbol === 'all' ? 'All Symbols' : symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            {editTradeId ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <form onSubmit={handleSubmitAddTrade} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input value={newTrade.date} onChange={(e) => handleInputChange('date', e.target.value)} required type="date" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Enter trade date (e.g. 2026-03-27)</p>
            </div>
            <div>
              <input value={newTrade.time} onChange={(e) => handleInputChange('time', e.target.value)} required type="time" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Enter trade time (e.g. 09:45)</p>
            </div>
            <div>
              <input value={newTrade.day} onChange={(e) => handleInputChange('day', e.target.value)} required placeholder="Day" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Enter day of week (e.g. Monday)</p>
            </div>
            <div>
              <input value={newTrade.tradeName} onChange={(e) => handleInputChange('tradeName', e.target.value)} placeholder="Trade Name (e.g. NIFTY Breakout)" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Give your trade a meaningful name for reference</p>
            </div>
            <div>
              <select value={newTrade.symbol} onChange={(e) => handleInputChange('symbol', e.target.value)} className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200">
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="BTC">BTC</option>
                <option value="GOLD">GOLD</option>
                <option value="EUR/USD">EUR/USD</option>
                <option value="SENSEX">SENSEX</option>
                <option value="MIDCAP">MIDCAP</option>
                <option value="USD/JPY">USD/JPY</option>
                <option value="CRUDEOIL">CRUDEOIL</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Select the instrument symbol</p>
            </div>
            <div>
              <select value={newTrade.optionType} onChange={(e) => handleInputChange('optionType', e.target.value)} className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200">
                <option value="CE">CE</option>
                <option value="PE">PE</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Select option type (CE/PE)</p>
            </div>
            <div>
              <input type="number" value={newTrade.strikePrice} onChange={(e) => handleInputChange('strikePrice', Number(e.target.value))} placeholder="Strike Price" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Strike price (e.g. 22500)</p>
            </div>
            <div>
              <input value={newTrade.strategyName} onChange={(e) => handleInputChange('strategyName', e.target.value)} required placeholder="Strategy Name" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Strategy tag (e.g. Breakout)</p>
            </div>
            <div>
              <input type="number" value={newTrade.entryPrice} onChange={(e) => handleInputChange('entryPrice', Number(e.target.value))} placeholder="Entry" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Entry price (e.g. 145.5)</p>
            </div>
            <div>
              <input type="number" value={newTrade.exitPrice} onChange={(e) => handleInputChange('exitPrice', Number(e.target.value))} placeholder="Exit" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Exit price (e.g. 178.2)</p>
            </div>
            <div>
              <input type="number" value={newTrade.quantity} onChange={(e) => handleInputChange('quantity', Number(e.target.value))} placeholder="Quantity" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Quantity (e.g. 50)</p>
            </div>
            <div>
              <input value={newTrade.riskRewardRatio} onChange={(e) => handleInputChange('riskRewardRatio', e.target.value)} placeholder="Risk/Reward" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Risk/Reward ratio (e.g. 1:3.3)</p>
            </div>
            <div>
              <input type="number" value={newTrade.profitLoss} onChange={(e) => handleInputChange('profitLoss', Number(e.target.value))} placeholder="Profit/Loss" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">P&L amount (positive or negative)</p>
            </div>
            <div>
              <select value={newTrade.tradeResult} onChange={(e) => handleInputChange('tradeResult', e.target.value)} className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200">
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Trade outcome (Win/Loss)</p>
            </div>
            <div>
              <input value={newTrade.mistakeTag} onChange={(e) => handleInputChange('mistakeTag', e.target.value)} placeholder="Mistake Tag" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Optional error note (e.g. Late Entry)</p>
            </div>
            <div>
              <input value={newTrade.emotionTag} onChange={(e) => handleInputChange('emotionTag', e.target.value)} placeholder="Emotion Tag" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Optional emotion tag (e.g. Fear)</p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <input value={newTrade.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="Notes" className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200" />
              <p className="mt-1 text-xs text-gray-400">Long text notes for this trade.</p>
            </div>
            <div className="col-span-1 md:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={handleCancelAdd} className="px-4 py-2 bg-[#444C56] text-white rounded-lg" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg disabled:opacity-50" disabled={saving}>
                {saving ? 'Saving...' : (editTradeId ? 'Update Trade' : 'Save Trade')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trade Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#238636] mx-auto mb-4"></div>
              <p className="text-gray-400">Loading trades...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-400 mb-2">⚠️ Error loading trades</div>
              <p className="text-gray-400 text-sm">{error}</p>
              <button 
                onClick={loadTrades} 
                className="mt-4 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0D1117] border-b border-[#30363D]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Trade Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Strike</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Strategy</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Exit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">R:R</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">P&L</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Mistake</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Emotion</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Screenshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363D]">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-[#0D1117] transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.time}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.tradeName || '-'} </td>
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
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.riskRewardRatio}</td>
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
                    <td className="px-4 py-3">
                      {trade.emotionTag && (
                        <span className="text-xs px-2 py-1 bg-blue-900/30 text-[#58A6FF] rounded">
                          {trade.emotionTag}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{trade.notes}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button onClick={() => handleEditTrade(trade)} className="text-blue-300 hover:text-blue-100" title="Edit Trade">
                        <Edit3 size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300" title="Screenshot">
                        <Upload size={16} />
                      </button>
                      <button onClick={() => handleDeleteTrade(trade.id)} className="text-red-400 hover:text-red-200" title="Delete Trade">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <div className="text-sm text-gray-400">
          Showing {filteredTrades.length} of {trades.length} trades
        </div>
      )}

      {/* Import CSV Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Import CSV File</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#238636] file:text-white hover:file:bg-[#2ea043]"
              />
            </div>

            {importPreview.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Preview ({importPreview.length} trades found)
                </h3>
                <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363D]">
                        <th className="text-left py-2 text-gray-400">Date</th>
                        <th className="text-left py-2 text-gray-400">Symbol</th>
                        <th className="text-left py-2 text-gray-400">Strategy</th>
                        <th className="text-left py-2 text-gray-400">P&L</th>
                        <th className="text-left py-2 text-gray-400">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 10).map((trade, index) => (
                        <tr key={index} className="border-b border-[#30363D]/30">
                          <td className="py-2 text-gray-300">{trade.date}</td>
                          <td className="py-2 text-gray-300">{trade.symbol}</td>
                          <td className="py-2 text-gray-300">{trade.strategyName}</td>
                          <td className={`py-2 font-semibold ${trade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profitLoss >= 0 ? '+' : ''}₹{Math.abs(trade.profitLoss)}
                          </td>
                          <td className="py-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              trade.tradeResult === 'Win' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-red-900/30 text-red-400'
                            }`}>
                              {trade.tradeResult}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {importPreview.length > 10 && (
                        <tr>
                          <td colSpan={5} className="py-2 text-center text-gray-400">
                            ... and {importPreview.length - 10} more trades
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>CSV Format:</strong> Date, Time, Day, Trade Name, Symbol, Type, Strike, Strategy, Entry, Exit, Qty, R:R, P&L, Result, Mistake, Emotion, Notes
              </p>
              <p className="text-xs text-blue-400 mt-1">
                Export a CSV first to see the correct format
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportPreview([]);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              {importPreview.length > 0 && (
                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : `Import ${importPreview.length} Trades`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
