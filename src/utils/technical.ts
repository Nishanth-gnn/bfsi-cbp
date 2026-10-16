export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const calculateSMA = (data: OHLCV[], period: number): (number | null)[] => {
  const sma: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push(sum / period);
    }
  }
  return sma;
};

export const calculateEMA = (data: (number | null)[], period: number): (number | null)[] => {
  const ema: (number | null)[] = [];
  const k = 2 / (period + 1);
  let previousEma: number | null = null;
  
  // Find first valid data point
  let firstValidIndex = -1;
  let sum = 0;
  let count = 0;
  
  for (let i = 0; i < data.length; i++) {
    const val = data[i];
    if (val !== null) {
      sum += val;
      count++;
      if (count === period) {
        firstValidIndex = i;
        previousEma = sum / period; // SMA initialization for EMA
        break;
      }
    }
  }

  for (let i = 0; i < data.length; i++) {
    if (i < firstValidIndex || previousEma === null) {
      ema.push(null);
    } else if (i === firstValidIndex) {
      ema.push(previousEma);
    } else {
      const val = data[i];
      if (val !== null) {
        const currentEma = (val - previousEma) * k + previousEma;
        ema.push(currentEma);
        previousEma = currentEma;
      } else {
        ema.push(null);
      }
    }
  }
  return ema;
};

export const calculateMACD = (data: OHLCV[]) => {
  const closePrices = data.map(d => d.close);
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  
  const macdLine = data.map((_, i) => {
    if (ema12[i] !== null && ema26[i] !== null) {
      return ema12[i]! - ema26[i]!;
    }
    return null;
  });

  const signalLine = calculateEMA(macdLine, 9);
  
  const histogram = data.map((_, i) => {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      return macdLine[i]! - signalLine[i]!;
    }
    return null;
  });

  return { macdLine, signalLine, histogram };
};

export const calculateRSI = (data: OHLCV[], period: number = 14): (number | null)[] => {
  const rsi: (number | null)[] = [];
  if (data.length <= period) {
    return Array(data.length).fill(null);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  
  avgGain /= period;
  avgLoss /= period;

  rsi.push(...Array(period).fill(null));

  for (let i = period; i < data.length; i++) {
    if (i > period) {
      const change = data[i].close - data[i - 1].close;
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  return rsi;
};
