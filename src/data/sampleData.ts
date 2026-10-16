import type { OHLCV } from '../utils/technical';

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  marketCap: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  price: number;
  dailyChange: number;
  pe: number;
  roce: number;
  debtToEquity: number;
  
  // New fundamental fields
  eps?: number;
  bookValuePerShare?: number;
  netProfit?: number; // In Crores
  shares?: number; // In Crores
  equity?: number; // In Crores
  assets?: number; // In Crores
  ebit?: number; // In Crores
  capitalEmployed?: number; // In Crores
  totalDebt?: number; // In Crores
  currentRevenue?: number; // In Crores
  previousRevenue?: number; // In Crores
  annualDividend?: number;
  history: OHLCV[];
}

// Generate realistic OHLCV
export const generateOHLCV = (points: number, startPrice: number, volatility: number): OHLCV[] => {
  let currentPrice = startPrice;
  const data: OHLCV[] = [];
  const now = new Date();
  
  // Ensure we go back enough days (business days approx)
  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Skip weekends for more realistic look
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    let change = (Math.random() - 0.5) * volatility;
    
    // Allow small gaps occasionally
    const gap = (Math.random() - 0.5) * volatility * 0.1;
    let open = currentPrice * (1 + gap);
    let close = open * (1 + change);
    
    let high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
    let low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
    
    // --- INJECT VARIETY ---
    const rand = Math.random();
    if (rand < 0.03) { 
      // 3% chance Doji
      close = open * (1 + (Math.random() - 0.5) * 0.0005); // near zero body
      high = open * (1 + volatility * 0.8); // big upper wick
      low = open * (1 - volatility * 0.8);  // big lower wick
    } else if (rand < 0.06) { 
      // 3% chance Hammer / Hanging Man
      close = open * (1 + (Math.random() > 0.5 ? 1 : -1) * volatility * 0.3); // small body
      high = Math.max(open, close) * 1.0005; // tiny upper wick
      low = Math.min(open, close) * (1 - volatility * 1.5); // long lower wick
    } else if (rand < 0.09) { 
      // 3% chance Shooting Star / Inverted Hammer
      close = open * (1 + (Math.random() > 0.5 ? 1 : -1) * volatility * 0.3); // small body
      low = Math.min(open, close) * 0.9995; // tiny lower wick
      high = Math.max(open, close) * (1 + volatility * 1.5); // long upper wick
    } else if (rand < 0.12) {
      // 3% chance Strong Bull/Bear (Marubozu)
      const isBull = Math.random() > 0.5;
      close = open * (1 + (isBull ? 1 : -1) * volatility * 1.5); // large body
      high = Math.max(open, close) * 1.001; // tiny wicks
      low = Math.min(open, close) * 0.999;
    } else {
      // Normal candle - prevent accidental Dojis by forcing body to be at least 5% of range
      const body = Math.abs(open - close);
      const range = high - low;
      if (range > 0 && (body / range) < 0.05) {
        close = open * (1 + (change > 0 ? 1 : -1) * volatility * 0.6); // force larger body
        high = Math.max(open, close) * (1 + Math.random() * volatility * 0.2);
        low = Math.min(open, close) * (1 - Math.random() * volatility * 0.2);
      }
    }

    const volume = Math.floor(Math.random() * 5000000) + 1000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });
    
    currentPrice = close;
  }
  return data;
};

export const sampleStocks: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', marketCap: 'Large Cap', price: 2950.55, dailyChange: 1.25, pe: 28.5, roce: 9.8, debtToEquity: 0.4, eps: 103.5, bookValuePerShare: 1150, netProfit: 70000, shares: 676, equity: 778000, assets: 1600000, ebit: 110000, capitalEmployed: 1120000, totalDebt: 310000, currentRevenue: 900000, previousRevenue: 850000, annualDividend: 10, history: generateOHLCV(300, 2500, 0.02) },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Information Technology', marketCap: 'Large Cap', price: 3890.10, dailyChange: -0.45, pe: 32.1, roce: 55.4, debtToEquity: 0.0, eps: 121.2, bookValuePerShare: 245, netProfit: 45000, shares: 366, equity: 90000, assets: 140000, ebit: 60000, capitalEmployed: 108000, totalDebt: 0, currentRevenue: 230000, previousRevenue: 195000, annualDividend: 73, history: generateOHLCV(300, 3500, 0.015) },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', marketCap: 'Large Cap', price: 1645.20, dailyChange: 0.85, pe: 16.8, roce: 6.5, debtToEquity: 7.2, eps: 97.9, bookValuePerShare: 375, netProfit: 46000, shares: 759, equity: 280000, assets: 2500000, ebit: 65000, capitalEmployed: 2300000, totalDebt: 2000000, currentRevenue: 170000, previousRevenue: 150000, annualDividend: 19, history: generateOHLCV(300, 1500, 0.018) },
  { symbol: 'INFY', name: 'Infosys', sector: 'Information Technology', marketCap: 'Large Cap', price: 1485.60, dailyChange: -1.10, pe: 24.5, roce: 40.2, debtToEquity: 0.0, eps: 60.6, bookValuePerShare: 180, netProfit: 25000, shares: 415, equity: 75000, assets: 125000, ebit: 35000, capitalEmployed: 87000, totalDebt: 0, currentRevenue: 150000, previousRevenue: 125000, annualDividend: 34, history: generateOHLCV(300, 1400, 0.015) },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', marketCap: 'Large Cap', price: 1085.40, dailyChange: 2.10, pe: 18.2, roce: 7.1, debtToEquity: 6.8, eps: 59.6, bookValuePerShare: 290, netProfit: 34000, shares: 700, equity: 205000, assets: 1600000, ebit: 45000, capitalEmployed: 1550000, totalDebt: 1400000, currentRevenue: 120000, previousRevenue: 105000, annualDividend: 8, history: generateOHLCV(300, 950, 0.02) },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'FMCG', marketCap: 'Large Cap', price: 435.25, dailyChange: 1.80, pe: 26.5, roce: 35.2, debtToEquity: 0.0, eps: 16.4, bookValuePerShare: 55, netProfit: 20000, shares: 1245, equity: 68000, assets: 85000, ebit: 26000, capitalEmployed: 74000, totalDebt: 0, currentRevenue: 70000, previousRevenue: 60000, annualDividend: 15.5, history: generateOHLCV(300, 380, 0.012) },
];

export const sampleSectors = [
  { name: 'Information Technology', change: 1.2 },
  { name: 'Banking', change: 0.8 },
  { name: 'Financial Services', change: 0.5 },
  { name: 'Pharmaceuticals', change: -0.4 },
  { name: 'Automobile', change: 1.5 },
  { name: 'FMCG', change: 0.2 },
  { name: 'Energy', change: -1.1 },
  { name: 'Metals', change: -0.8 },
  { name: 'Realty', change: 2.1 },
  { name: 'Healthcare', change: 0.3 },
  { name: 'Consumer Durables', change: 0.6 },
  { name: 'Media', change: -1.5 },
];

export const indexData = [
  { name: 'NIFTY 50', value: 22450.30, change: 0.85, isPositive: true },
  { name: 'NIFTY BANK', value: 48560.80, change: 1.20, isPositive: true },
  { name: 'BSE SENSEX', value: 73850.45, change: 0.75, isPositive: true },
  { name: 'INDIA VIX', value: 12.45, change: -2.30, isPositive: false },
];

// Generate fake chart data (backward compatibility for MarketOverview)
export const generateChartData = (points: number, startValue: number, volatility: number) => {
  let currentValue = startValue;
  const data = [];
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(currentValue.toFixed(2))
    });
  }
  return data;
};
