import type { OHLCV } from './technical';
import type { PatternResult } from './patterns';

export interface SummaryInsight {
  type: 'positive' | 'negative' | 'neutral' | 'insufficient';
  label: string;
  description: string;
}

export const generateStockSummary = (
  stock: any, 
  data: OHLCV[], 
  sma50: (number | null)[], 
  sma200: (number | null)[], 
  rsi: (number | null)[], 
  macdInfo: { macdLine: (number | null)[], signalLine: (number | null)[] },
  patterns: PatternResult[]
): SummaryInsight[] => {
  const insights: SummaryInsight[] = [];
  
  if (data.length === 0) {
    return [{ type: 'insufficient', label: 'No Data', description: 'Insufficient data available for analysis.' }];
  }

  const currentPrice = data[data.length - 1].close;

  // Fundamental Rules
  if (stock.pe) {
    if (stock.pe < 15) {
      insights.push({ type: 'positive', label: 'Valuation', description: `Attractive P/E ratio (${stock.pe.toFixed(1)}), suggesting potential undervaluation.` });
    } else if (stock.pe > 40) {
      insights.push({ type: 'negative', label: 'Valuation', description: `High P/E ratio (${stock.pe.toFixed(1)}), suggesting a premium valuation.` });
    }
  }

  if (stock.roce) {
    if (stock.roce > 20) {
      insights.push({ type: 'positive', label: 'Profitability', description: `Strong Return on Capital Employed (${stock.roce.toFixed(1)}%), indicating efficient capital use.` });
    } else if (stock.roce < 10) {
      insights.push({ type: 'negative', label: 'Profitability', description: `Low Return on Capital Employed (${stock.roce.toFixed(1)}%), indicating poor capital efficiency.` });
    }
  }

  // Technical Rules
  const lastSma50 = sma50[sma50.length - 1];
  const lastSma200 = sma200[sma200.length - 1];

  if (lastSma50 !== null && lastSma200 !== null) {
    if (lastSma50 > lastSma200 && currentPrice > lastSma50) {
      insights.push({ type: 'positive', label: 'Trend', description: 'Price is above SMA 50 and SMA 50 > SMA 200, indicating a strong uptrend.' });
    } else if (lastSma50 < lastSma200 && currentPrice < lastSma50) {
      insights.push({ type: 'negative', label: 'Trend', description: 'Price is below SMA 50 and SMA 50 < SMA 200, indicating a strong downtrend.' });
    } else {
      insights.push({ type: 'neutral', label: 'Trend', description: 'Mixed moving average signals.' });
    }
  } else {
    insights.push({ type: 'insufficient', label: 'Trend', description: 'Insufficient data for long-term moving average analysis.' });
  }

  const lastRsi = rsi[rsi.length - 1];
  if (lastRsi !== null) {
    if (lastRsi > 70) {
      insights.push({ type: 'negative', label: 'Momentum', description: `RSI is ${lastRsi.toFixed(1)}, indicating overbought conditions.` });
    } else if (lastRsi < 30) {
      insights.push({ type: 'positive', label: 'Momentum', description: `RSI is ${lastRsi.toFixed(1)}, indicating oversold conditions.` });
    } else {
      insights.push({ type: 'neutral', label: 'Momentum', description: `RSI is ${lastRsi.toFixed(1)} (Neutral momentum).` });
    }
  }

  const lastMacd = macdInfo.macdLine[macdInfo.macdLine.length - 1];
  const lastSignal = macdInfo.signalLine[macdInfo.signalLine.length - 1];
  if (lastMacd !== null && lastSignal !== null) {
    if (lastMacd > lastSignal && lastMacd > 0) {
      insights.push({ type: 'positive', label: 'MACD', description: 'MACD line is above the signal line and positive, showing bullish momentum.' });
    } else if (lastMacd < lastSignal && lastMacd < 0) {
      insights.push({ type: 'negative', label: 'MACD', description: 'MACD line is below the signal line and negative, showing bearish momentum.' });
    }
  }

  // Patterns Rule
  const recentPatterns = patterns.filter(p => data.findIndex(d => d.date === p.date) >= data.length - 5);
  if (recentPatterns.length > 0) {
    const latestPattern = recentPatterns[recentPatterns.length - 1];
    insights.push({
      type: latestPattern.sentiment === 'Bullish' ? 'positive' : latestPattern.sentiment === 'Bearish' ? 'negative' : 'neutral',
      label: 'Pattern Detected',
      description: `Recent ${latestPattern.name} detected on ${latestPattern.date} (${latestPattern.sentiment}).`
    });
  }

  return insights;
};
