// Mock Data for Trading Journal

export interface Trade {
  id: string;
  date: string;
  time: string;
  day: string;
  tradeName?: string;
  symbol: 'NIFTY' | 'BANKNIFTY' | 'BTC' | 'GOLD' | 'EUR/USD' | 'SENSEX' | 'MIDCAP' | 'USD/JPY' | 'CRUDEOIL';
  optionType: 'CE' | 'PE';
  strikePrice: number;
  strategyName: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  lotSize: number;
  stopLoss: number;
  target: number;
  riskAmount: number;
  riskRewardRatio: string;
  profitLoss: number;
  tradeResult: 'Win' | 'Loss';
  mistakeTag?: string;
  emotionTag?: string;
  notes: string;
}

export const mockTrades: Trade[] = [
  {
    id: '1',
    date: '2026-03-24',
    time: '09:45',
    day: 'Monday',
    symbol: 'NIFTY',
    optionType: 'CE',
    strikePrice: 22500,
    strategyName: 'Breakout',
    entryPrice: 145.50,
    exitPrice: 178.20,
    quantity: 50,
    lotSize: 1,
    stopLoss: 135.00,
    target: 180.00,
    riskAmount: 525,
    riskRewardRatio: '1:3.3',
    profitLoss: 1635,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Clean breakout above resistance'
  },
  {
    id: '2',
    date: '2026-03-24',
    time: '11:20',
    day: 'Monday',
    symbol: 'BANKNIFTY',
    optionType: 'PE',
    strikePrice: 47500,
    strategyName: 'Trend Following',
    entryPrice: 220.75,
    exitPrice: 198.50,
    quantity: 15,
    lotSize: 1,
    stopLoss: 235.00,
    target: 190.00,
    riskAmount: 213.75,
    riskRewardRatio: '1:2.1',
    profitLoss: -333.75,
    tradeResult: 'Loss',
    mistakeTag: 'Late Entry',
    emotionTag: 'Fear',
    notes: 'Entered too late, trend already exhausted'
  },
  {
    id: '3',
    date: '2026-03-25',
    time: '10:15',
    day: 'Tuesday',
    symbol: 'NIFTY',
    optionType: 'PE',
    strikePrice: 22400,
    strategyName: 'Support Bounce',
    entryPrice: 132.25,
    exitPrice: 165.80,
    quantity: 50,
    lotSize: 1,
    stopLoss: 120.00,
    target: 170.00,
    riskAmount: 612.50,
    riskRewardRatio: '1:3.1',
    profitLoss: 1677.50,
    tradeResult: 'Win',
    emotionTag: 'Calm',
    notes: 'Perfect support level bounce'
  },
  {
    id: '4',
    date: '2026-03-25',
    time: '14:30',
    day: 'Tuesday',
    symbol: 'BANKNIFTY',
    optionType: 'CE',
    strikePrice: 48000,
    strategyName: 'Reversal',
    entryPrice: 185.00,
    exitPrice: 172.30,
    quantity: 15,
    lotSize: 1,
    stopLoss: 175.00,
    target: 210.00,
    riskAmount: 150,
    riskRewardRatio: '1:2.5',
    profitLoss: -190.50,
    tradeResult: 'Loss',
    mistakeTag: 'FOMO',
    emotionTag: 'Greed',
    notes: 'Rushed into trade without confirmation'
  },
  {
    id: '5',
    date: '2026-03-26',
    time: '09:30',
    day: 'Wednesday',
    symbol: 'NIFTY',
    optionType: 'CE',
    strikePrice: 22600,
    strategyName: 'Gap Fill',
    entryPrice: 155.75,
    exitPrice: 188.90,
    quantity: 50,
    lotSize: 1,
    stopLoss: 145.00,
    target: 190.00,
    riskAmount: 537.50,
    riskRewardRatio: '1:3.2',
    profitLoss: 1657.50,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Gap up opening, good momentum'
  },
  {
    id: '6',
    date: '2026-03-26',
    time: '13:45',
    day: 'Wednesday',
    symbol: 'BANKNIFTY',
    optionType: 'PE',
    strikePrice: 47800,
    strategyName: 'Breakout',
    entryPrice: 245.50,
    exitPrice: 288.20,
    quantity: 15,
    lotSize: 1,
    stopLoss: 230.00,
    target: 290.00,
    riskAmount: 232.50,
    riskRewardRatio: '1:2.8',
    profitLoss: 640.50,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Strong breakdown below support'
  },
  {
    id: '7',
    date: '2026-03-27',
    time: '10:00',
    day: 'Thursday',
    symbol: 'NIFTY',
    optionType: 'CE',
    strikePrice: 22550,
    strategyName: 'Trend Following',
    entryPrice: 168.25,
    exitPrice: 205.75,
    quantity: 50,
    lotSize: 1,
    stopLoss: 155.00,
    target: 210.00,
    riskAmount: 662.50,
    riskRewardRatio: '1:3.2',
    profitLoss: 1875,
    tradeResult: 'Win',
    emotionTag: 'Calm',
    notes: 'Strong uptrend continuation'
  },
  {
    id: '8',
    date: '2026-03-27',
    time: '14:15',
    day: 'Thursday',
    symbol: 'BANKNIFTY',
    optionType: 'CE',
    strikePrice: 48200,
    strategyName: 'Scalping',
    entryPrice: 195.50,
    exitPrice: 189.75,
    quantity: 15,
    lotSize: 1,
    stopLoss: 190.00,
    target: 205.00,
    riskAmount: 82.50,
    riskRewardRatio: '1:1.7',
    profitLoss: -86.25,
    tradeResult: 'Loss',
    mistakeTag: 'Overtrading',
    emotionTag: 'Fear',
    notes: 'Took too many trades today'
  },
  {
    id: '9',
    date: '2026-03-20',
    time: '09:50',
    day: 'Thursday',
    symbol: 'NIFTY',
    optionType: 'PE',
    strikePrice: 22300,
    strategyName: 'Reversal',
    entryPrice: 142.00,
    exitPrice: 175.50,
    quantity: 50,
    lotSize: 1,
    stopLoss: 130.00,
    target: 180.00,
    riskAmount: 600,
    riskRewardRatio: '1:3.2',
    profitLoss: 1675,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Perfect reversal pattern'
  },
  {
    id: '10',
    date: '2026-03-21',
    time: '11:30',
    day: 'Friday',
    symbol: 'BANKNIFTY',
    optionType: 'CE',
    strikePrice: 47900,
    strategyName: 'Breakout',
    entryPrice: 205.25,
    exitPrice: 245.80,
    quantity: 15,
    lotSize: 1,
    stopLoss: 195.00,
    target: 250.00,
    riskAmount: 153.75,
    riskRewardRatio: '1:4.4',
    profitLoss: 608.25,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Explosive breakout with volume'
  },
  {
    id: '11',
    date: '2026-03-21',
    time: '14:45',
    day: 'Friday',
    symbol: 'NIFTY',
    optionType: 'CE',
    strikePrice: 22650,
    strategyName: 'Support Bounce',
    entryPrice: 162.75,
    exitPrice: 157.20,
    quantity: 50,
    lotSize: 1,
    stopLoss: 155.00,
    target: 185.00,
    riskAmount: 387.50,
    riskRewardRatio: '1:2.9',
    profitLoss: -277.50,
    tradeResult: 'Loss',
    mistakeTag: 'Revenge Trade',
    emotionTag: 'Greed',
    notes: 'Should not have traded after 2pm'
  },
  {
    id: '12',
    date: '2026-03-17',
    time: '10:20',
    day: 'Monday',
    symbol: 'NIFTY',
    optionType: 'PE',
    strikePrice: 22450,
    strategyName: 'Trend Following',
    entryPrice: 158.50,
    exitPrice: 192.30,
    quantity: 50,
    lotSize: 1,
    stopLoss: 148.00,
    target: 195.00,
    riskAmount: 525,
    riskRewardRatio: '1:3.5',
    profitLoss: 1690,
    tradeResult: 'Win',
    emotionTag: 'Calm',
    notes: 'Trend was very strong'
  },
  {
    id: '13',
    date: '2026-03-18',
    time: '09:35',
    day: 'Tuesday',
    symbol: 'BANKNIFTY',
    optionType: 'PE',
    strikePrice: 47600,
    strategyName: 'Gap Fill',
    entryPrice: 235.00,
    exitPrice: 278.60,
    quantity: 15,
    lotSize: 1,
    stopLoss: 220.00,
    target: 280.00,
    riskAmount: 225,
    riskRewardRatio: '1:2.9',
    profitLoss: 654,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Gap down filled perfectly'
  },
  {
    id: '14',
    date: '2026-03-19',
    time: '11:00',
    day: 'Wednesday',
    symbol: 'NIFTY',
    optionType: 'CE',
    strikePrice: 22700,
    strategyName: 'Breakout',
    entryPrice: 172.25,
    exitPrice: 168.90,
    quantity: 50,
    lotSize: 1,
    stopLoss: 165.00,
    target: 195.00,
    riskAmount: 362.50,
    riskRewardRatio: '1:3.1',
    profitLoss: -167.50,
    tradeResult: 'Loss',
    mistakeTag: 'Fear Exit',
    emotionTag: 'Fear',
    notes: 'Exited too early in panic'
  },
  {
    id: '15',
    date: '2026-03-19',
    time: '13:30',
    day: 'Wednesday',
    symbol: 'BANKNIFTY',
    optionType: 'CE',
    strikePrice: 48100,
    strategyName: 'Reversal',
    entryPrice: 188.75,
    exitPrice: 215.50,
    quantity: 15,
    lotSize: 1,
    stopLoss: 178.00,
    target: 220.00,
    riskAmount: 161.25,
    riskRewardRatio: '1:3.9',
    profitLoss: 401.25,
    tradeResult: 'Win',
    emotionTag: 'Confident',
    notes: 'Nice reversal from oversold'
  }
];

export const performanceMetrics = {
  daily: { profit: 1301.25, trades: 3 },
  weekly: { profit: 7486.50, trades: 15 },
  monthly: { profit: 9875.75, trades: 18 },
  yearly: { profit: 42350.25, trades: 156 },
  total: { profit: 42350.25, trades: 156 },
  netProfit: 12876.25,
  grossProfit: 15420.50,
  grossLoss: -2544.25,
  winRate: 66.7,
  lossRate: 33.3,
  profitFactor: 6.06,
  expectancy: 857.08
};

export const dailyProfits = [
  { date: 'Mar 17', profit: 1690 },
  { date: 'Mar 18', profit: 654 },
  { date: 'Mar 19', profit: 233.75 },
  { date: 'Mar 20', profit: 1675 },
  { date: 'Mar 21', profit: 330.75 },
  { date: 'Mar 24', profit: 1301.25 },
  { date: 'Mar 25', profit: 1487 },
  { date: 'Mar 26', profit: 2298 },
  { date: 'Mar 27', profit: 1788.75 }
];

export const weeklyProfits = [
  { week: 'Week 1', profit: 3250 },
  { week: 'Week 2', profit: 4680 },
  { week: 'Week 3', profit: 5870 },
  { week: 'Week 4', profit: 7486.50 }
];

export const monthlyProfits = [
  { month: 'Jan', profit: 8450 },
  { month: 'Feb', profit: 12560 },
  { month: 'Mar', profit: 9875.75 }
];

export const yearlyProfits = [
  { year: '2024', profit: 28450 },
  { year: '2025', profit: 35680 },
  { year: '2026', profit: 42350.25 }
];

export const dayOfWeekProfits = [
  { day: 'Monday', profit: 4626.25, trades: 3, winRate: 66.7 },
  { day: 'Tuesday', profit: 2141 , trades: 3, winRate: 66.7 },
  { day: 'Wednesday', profit: 2932.25, trades: 4, winRate: 75 },
  { day: 'Thursday', profit: 3463.75, trades: 3, winRate: 66.7 },
  { day: 'Friday', profit: 330.75, trades: 2, winRate: 50 }
];

export const timeOfDayProfits = [
  { time: 'Morning (9:00-11:00)', profit: 8456.50, trades: 8, winRate: 75 },
  { time: 'Midday (11:00-13:00)', profit: 2865.25, trades: 4, winRate: 50 },
  { time: 'Afternoon (13:00-15:00)', profit: 1554.50, trades: 3, winRate: 33.3 }
];

export const strategyPerformance = [
  { 
    strategy: 'Breakout', 
    profit: 4531.75, 
    trades: 5, 
    winRate: 80,
    avgProfit: 906.35
  },
  { 
    strategy: 'Trend Following', 
    profit: 3931.75, 
    trades: 4, 
    winRate: 75,
    avgProfit: 982.94
  },
  { 
    strategy: 'Support Bounce', 
    profit: 1400, 
    trades: 2, 
    winRate: 50,
    avgProfit: 700
  },
  { 
    strategy: 'Reversal', 
    profit: 1886.25, 
    trades: 3, 
    winRate: 66.7,
    avgProfit: 628.75
  },
  { 
    strategy: 'Gap Fill', 
    profit: 2311.50, 
    trades: 2, 
    winRate: 100,
    avgProfit: 1155.75
  },
  { 
    strategy: 'Scalping', 
    profit: -86.25, 
    trades: 1, 
    winRate: 0,
    avgProfit: -86.25
  }
];

export const equityCurve = [
  { date: '2026-01-01', equity: 100000 },
  { date: '2026-01-15', equity: 103450 },
  { date: '2026-02-01', equity: 108560 },
  { date: '2026-02-15', equity: 112340 },
  { date: '2026-03-01', equity: 109875 },
  { date: '2026-03-10', equity: 111250 },
  { date: '2026-03-20', equity: 112876 },
  { date: '2026-03-27', equity: 112876 }
];

export const drawdownData = [
  { date: '2026-01-01', drawdown: 0 },
  { date: '2026-01-15', drawdown: -2.5 },
  { date: '2026-02-01', drawdown: -1.2 },
  { date: '2026-02-15', drawdown: 0 },
  { date: '2026-03-01', drawdown: -3.8 },
  { date: '2026-03-10', drawdown: -2.1 },
  { date: '2026-03-20', drawdown: -0.8 },
  { date: '2026-03-27', drawdown: 0 }
];

export const mistakeFrequency = [
  { mistake: 'FOMO', count: 12 },
  { mistake: 'Overtrading', count: 8 },
  { mistake: 'Late Entry', count: 6 },
  { mistake: 'Fear Exit', count: 5 },
  { mistake: 'Revenge Trade', count: 3 }
];

export const emotionAnalysis = [
  { emotion: 'Confident', count: 8, avgProfit: 1543.75 },
  { emotion: 'Calm', count: 4, avgProfit: 1234.50 },
  { emotion: 'Fear', count: 3, avgProfit: -265.83 },
  { emotion: 'Greed', count: 2, avgProfit: -234 }
];
