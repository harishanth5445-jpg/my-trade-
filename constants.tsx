
import { Trade, ChartDataPoint, PLPoint } from './types';

// Helper to generate dates for current month/year
const getDay = (day: number) => {
  const date = new Date();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  const y = date.getFullYear(); // Use current year
  return `${month}/${d}/${y}`;
};

export const SETUPS = ['News Trade', 'ORB Strategy'];

export const MOCK_TRADES: Trade[] = [
  // Apex Primary Trades (acc_1)
  { id: '1', accountId: 'acc_1', date: getDay(26), symbol: 'MES', side: 'SHORT', status: 'LOSS', netPL: -300.00, contracts: 30, duration: '24m', mae: 5530.25, mfe: 5524.00, setup: 'News Trade', rating: 2 },
  { id: '2', accountId: 'acc_1', date: getDay(25), symbol: 'MNQ', side: 'LONG', status: 'WIN', netPL: 1240.50, contracts: 10, duration: '1h 12m', mae: 19820, mfe: 20150, setup: 'ORB Strategy', rating: 5 },
  { id: '3', accountId: 'acc_1', date: getDay(24), symbol: 'ES', side: 'SHORT', status: 'WIN', netPL: 450.00, contracts: 5, duration: '45m', mae: 5490, mfe: 5460, setup: 'ORB Strategy', rating: 4 },
  
  // Topstep Main Trades (acc_2)
  { id: '4', accountId: 'acc_2', date: getDay(24), symbol: 'NQ', side: 'LONG', status: 'LOSS', netPL: -180.25, contracts: 2, duration: '12m', mae: 20050, mfe: 20070, setup: 'News Trade', rating: 3 },
  { id: '5', accountId: 'acc_2', date: getDay(23), symbol: 'MES', side: 'LONG', status: 'BE', netPL: 12.00, contracts: 50, duration: '2h', mae: 5400, mfe: 5450, setup: 'ORB Strategy', rating: 1 },
  { id: '6', accountId: 'acc_2', date: getDay(15), symbol: 'ES', side: 'LONG', status: 'WIN', netPL: 800.00, contracts: 10, duration: '40m', mae: 5450, mfe: 5490, setup: 'News Trade', rating: 4 },
  
  // Personal Trades (acc_3)
  { id: '7', accountId: 'acc_3', date: getDay(10), symbol: 'NQ', side: 'SHORT', status: 'LOSS', netPL: -650.00, contracts: 5, duration: '1h', mae: 20200, mfe: 20100, setup: 'ORB Strategy', rating: 2 },
  { id: '8', accountId: 'acc_3', date: getDay(5), symbol: 'MNQ', side: 'LONG', status: 'WIN', netPL: 320.00, contracts: 2, duration: '15m', mae: 19800, mfe: 19850, setup: 'News Trade', rating: 3 },
  { id: '9', accountId: 'acc_3', date: getDay(2), symbol: 'MES', side: 'SHORT', status: 'WIN', netPL: 440.00, contracts: 20, duration: '30m', mae: 5500, mfe: 5480, setup: 'News Trade', rating: 5 },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 40 }).map((_, i) => ({
  time: `${9 + Math.floor(i / 4)}:${(i % 4) * 15}`,
  open: 5520 + Math.random() * 20,
  high: 5550 + Math.random() * 20,
  low: 5510 + Math.random() * 20,
  close: 5525 + Math.random() * 20,
  volume: Math.floor(Math.random() * 10000),
}));

export const MOCK_PL_DATA: PLPoint[] = [
  { time: '09:30', value: 1200 },
  { time: '09:35', value: 1150 },
  { time: '09:40', value: 900 },
  { time: '09:45', value: 1050 },
  { time: '09:50', value: 800 },
  { time: '09:55', value: 850 },
  { time: '10:00', value: -300 },
];

export const MISTAKES = ['hesitated', 'early entry', 'early exit', 'fomo', 'ignored risk mgt', 'impulsive', 'no volume', 'red on the day'];
export const HABITS = ['did not meditate', 'did not sleep well', 'good mood', 'meditated', 'slept well', 'stressed'];
