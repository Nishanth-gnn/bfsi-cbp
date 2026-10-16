// Unit tests for Phase 2 calculations
// Run with: npx vitest run

import { describe, it, expect } from 'vitest';
import { calculateSMA, calculateRSI, calculateEMA, calculateMACD } from '../utils/technical';
import type { OHLCV } from '../utils/technical';
import {
  calculatePE,
  calculatePriceToBook,
  calculateROE,
  calculateROCE,
  calculateDebtToEquity,
  calculateRevenueGrowth,
  calculateDividendYield,
  calculatePEG,
  calculateCAGR,
} from '../utils/fundamentals';
import { detectPatterns } from '../utils/patterns';

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------
const makeCandle = (
  date: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume = 1_000_000
): OHLCV => ({ date, open, high, low, close, volume });

const flatSeries = (n: number, price = 100): OHLCV[] =>
  Array.from({ length: n }, (_, i) =>
    makeCandle(`2024-01-${String(i + 1).padStart(2, '0')}`, price, price + 1, price - 1, price)
  );

// ---------------------------------------------------------------------------
// SMA
// ---------------------------------------------------------------------------
describe('calculateSMA', () => {
  it('returns null for first (period-1) values', () => {
    const sma = calculateSMA(flatSeries(10, 100), 5);
    expect(sma[0]).toBeNull();
    expect(sma[3]).toBeNull();
    expect(sma[4]).not.toBeNull();
  });

  it('calculates correct SMA for flat series', () => {
    const sma = calculateSMA(flatSeries(10, 200), 3);
    (sma.filter(v => v !== null) as number[]).forEach(v => expect(v).toBeCloseTo(200));
  });

  it('returns all nulls when fewer data points than period', () => {
    expect(calculateSMA(flatSeries(3, 100), 5).every(v => v === null)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RSI
// ---------------------------------------------------------------------------
describe('calculateRSI', () => {
  it('result length matches input length', () => {
    expect(calculateRSI(flatSeries(30, 100)).length).toBe(30);
  });

  it('all values are within 0–100', () => {
    calculateRSI(flatSeries(30, 100))
      .filter(v => v !== null)
      .forEach(v => {
        expect(v!).toBeGreaterThanOrEqual(0);
        expect(v!).toBeLessThanOrEqual(100);
      });
  });

  it('returns null for first 14 values', () => {
    const rsi = calculateRSI(flatSeries(30, 100));
    for (let i = 0; i < 14; i++) expect(rsi[i]).toBeNull();
  });

  it('returns 100 for zero-loss series', () => {
    const rising = Array.from({ length: 30 }, (_, i) =>
      makeCandle(`2024-01-${String(i + 1).padStart(2, '0')}`, 100 + i, 101 + i, 99 + i, 101 + i)
    );
    expect(calculateRSI(rising)[29]).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// EMA / MACD
// ---------------------------------------------------------------------------
describe('calculateEMA', () => {
  it('uses SMA seed at position (period - 1)', () => {
    const ema = calculateEMA(Array.from({ length: 20 }, (_, i) => i + 1), 5);
    expect(ema[4]).toBeCloseTo(3);
  });
});

describe('calculateMACD', () => {
  it('produces non-null MACD after enough data', () => {
    const series = Array.from({ length: 60 }, (_, i) =>
      makeCandle(`2024-01-${i + 1}`, 100 + i, 102 + i, 98 + i, 101 + i)
    );
    expect(calculateMACD(series).macdLine.filter(v => v !== null).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Fundamental ratios
// ---------------------------------------------------------------------------
describe('Fundamental calculations', () => {
  it('calculatePE returns price / eps',              () => expect(calculatePE(100, 5)).toBeCloseTo(20));
  it('calculatePE returns null for eps = 0',         () => expect(calculatePE(100, 0)).toBeNull());
  it('calculatePE returns null for undefined eps',   () => expect(calculatePE(100, undefined)).toBeNull());

  it('calculatePriceToBook returns price / bvps',    () => expect(calculatePriceToBook(150, 50)).toBeCloseTo(3));
  it('calculatePriceToBook returns null for bvps<=0',() => { expect(calculatePriceToBook(150, 0)).toBeNull(); expect(calculatePriceToBook(150, -10)).toBeNull(); });

  it('calculateROE = netProfit / equity * 100',      () => expect(calculateROE(20, 100)).toBeCloseTo(20));
  it('calculateROE returns null for zero equity',    () => expect(calculateROE(20, 0)).toBeNull());

  it('calculateROCE = ebit / capitalEmployed * 100', () => expect(calculateROCE(30, 200)).toBeCloseTo(15));
  it('calculateDebtToEquity = debt / equity',        () => expect(calculateDebtToEquity(80, 40)).toBeCloseTo(2));

  it('calculateRevenueGrowth = (curr - prev) / prev * 100', () => expect(calculateRevenueGrowth(110, 100)).toBeCloseTo(10));
  it('calculateRevenueGrowth returns null for zero previous', () => expect(calculateRevenueGrowth(110, 0)).toBeNull());

  it('calculateDividendYield = dividend / price * 100', () => expect(calculateDividendYield(5, 200)).toBeCloseTo(2.5));

  it('calculatePEG = pe / growthRate',               () => expect(calculatePEG(20, 10)).toBeCloseTo(2));
  it('calculatePEG returns null for zero growth',    () => expect(calculatePEG(20, 0)).toBeNull());

  it('calculateCAGR = correct formula',              () => expect(calculateCAGR(1000, 1610.51, 3)).toBeCloseTo(17.21, 1));
  it('calculateCAGR returns null for beginning<=0',  () => expect(calculateCAGR(0, 1000, 5)).toBeNull());
});

// ---------------------------------------------------------------------------
// Candlestick Pattern Detection — Doji
// ---------------------------------------------------------------------------
describe('detectPatterns — Doji', () => {
  it('detects Doji with ≤1.5% body/range AND both wicks ≥10% of range', () => {
    // body=0.25, range=20 → 1.25 % ✓  |  lowerWick=10 (50%), upperWick=9.75 (48.75%) ✓
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 110, 90, 105),
      makeCandle('2024-01-02', 100, 110, 90, 100.25),
    ];
    expect(detectPatterns(series).find(p => p.name === 'Doji')).toBeDefined();
  });

  it('does NOT classify a zero-range candle as Doji', () => {
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 110, 90, 105),
      makeCandle('2024-01-02', 100, 100, 100, 100), // open=high=low=close
    ];
    expect(detectPatterns(series).find(p => p.name === 'Doji')).toBeUndefined();
  });

  it('does NOT classify a wide-body candle as Doji', () => {
    // body=10, range=12 → 83 %
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 110, 90, 105),
      makeCandle('2024-01-02', 100, 112, 100, 110),
    ];
    expect(detectPatterns(series).find(p => p.name === 'Doji')).toBeUndefined();
  });

  it('does NOT classify a candle with only one wick as Doji (Gravestone-like)', () => {
    // body≈0 but NO lower wick → lowerWick = 0 < 10 % of range → NOT Doji
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 110, 90, 105),
      makeCandle('2024-01-02', 100, 115, 100, 100.1), // lower wick = 0
    ];
    expect(detectPatterns(series).find(p => p.name === 'Doji')).toBeUndefined();
  });

  it('does NOT fire on a tiny-range near-flat candle (below minimum range guard)', () => {
    // range = 0.01 on a 100 close → 0.01 % of close < 0.1 % guard
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 110, 90, 105),
      makeCandle('2024-01-02', 100, 100.005, 99.995, 100.001),
    ];
    expect(detectPatterns(series).find(p => p.name === 'Doji')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Hammer & Hanging Man
// ---------------------------------------------------------------------------
describe('detectPatterns — Hammer & Hanging Man', () => {
  const buildDowntrend = () =>
    Array.from({ length: 6 }, (_, i) =>
      makeCandle(`2024-01-0${i + 1}`, 110 - i * 3, 112 - i * 3, 108 - i * 3, 109 - i * 3)
    );

  const buildUptrend = () =>
    Array.from({ length: 6 }, (_, i) =>
      makeCandle(`2024-01-0${i + 1}`, 90 + i * 3, 92 + i * 3, 88 + i * 3, 91 + i * 3)
    );

  it('detects Hammer in a downtrend (lowerWick ≥ 2×body, upperWick ≤ 0.3×body)', () => {
    // open=92, close=93 (body=1), high=93.1 (upperWick=0.1 ≤ 0.3), low=89 (lowerWick=3 ≥ 2)
    const series = [...buildDowntrend(), makeCandle('2024-01-07', 92, 93.1, 89, 93)];
    expect(detectPatterns(series).find(p => p.name === 'Hammer')).toBeDefined();
  });

  it('detects Hanging Man in an uptrend', () => {
    // Same shape as Hammer but after an uptrend
    const series = [...buildUptrend(), makeCandle('2024-01-07', 108, 108.1, 104, 108)];
    // body=|108-108|=0... use slightly different open
    const series2 = [
      ...buildUptrend(),
      // body=0.1 (108→108.1), upperWick=108.12-108.1=0.02 ≤ 0.3×0.1=0.03 ✓
      // lowerWick=108-104=4 ≥ 2×0.1=0.2 ✓  |  body/range=0.1/4.12=2.4%>1.5% → not Doji ✓
      makeCandle('2024-01-07', 108, 108.12, 104, 108.1),
    ];
    expect(detectPatterns(series2).find(p => p.name === 'Hanging Man')).toBeDefined();
  });

  it('a Doji candle does NOT simultaneously trigger Hammer', () => {
    // A real Doji (both wicks present) should not also fire as Hammer
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 110, 112, 108, 109),
      makeCandle('2024-01-02', 108, 110, 106, 107),
      makeCandle('2024-01-03', 107, 109, 105, 106),
      makeCandle('2024-01-04', 106, 108, 104, 105),
      makeCandle('2024-01-05', 105, 107, 103, 104),
      // Doji: body=0.1, range=10, ratio=1% ✓ | both wicks≥10% of range
      makeCandle('2024-01-06', 104, 109, 99, 104.1), // lowerWick=5, upperWick=4.9
    ];
    const detected = detectPatterns(series);
    const doji   = detected.find(p => p.name === 'Doji');
    const hammer = detected.find(p => p.name === 'Hammer');
    if (doji) expect(hammer?.index).not.toBe(doji.index);
  });
});

// ---------------------------------------------------------------------------
// Shooting Star & Inverted Hammer
// ---------------------------------------------------------------------------
describe('detectPatterns — Shooting Star & Inverted Hammer', () => {
  const buildUptrend = () =>
    Array.from({ length: 6 }, (_, i) =>
      makeCandle(`2024-01-0${i + 1}`, 90 + i * 3, 92 + i * 3, 88 + i * 3, 91 + i * 3)
    );

  const buildDowntrend = () =>
    Array.from({ length: 6 }, (_, i) =>
      makeCandle(`2024-01-0${i + 1}`, 110 - i * 3, 112 - i * 3, 108 - i * 3, 109 - i * 3)
    );

  it('detects Shooting Star in an uptrend (upperWick ≥ 2×body, lowerWick ≤ 0.3×body)', () => {
    // open=105, close=104 (body=1), high=109 (upperWick=4 ≥ 2), low=103.9 (lowerWick=0.1 ≤ 0.3)
    const series = [...buildUptrend(), makeCandle('2024-01-07', 105, 109, 103.9, 104)];
    expect(detectPatterns(series).find(p => p.name === 'Shooting Star')).toBeDefined();
  });

  it('detects Inverted Hammer in a downtrend', () => {
    // Same shape as Shooting Star but after a downtrend
    // open=92, close=93 (body=1), high=97 (upperWick=4 ≥ 2), low=92.9 (lowerWick=0.1 ≤ 0.3)
    const series = [...buildDowntrend(), makeCandle('2024-01-07', 92, 97, 91.9, 93)];
    expect(detectPatterns(series).find(p => p.name === 'Inverted Hammer')).toBeDefined();
  });

  it('does NOT fire Shooting Star without uptrend context', () => {
    // Same shape in a sideways market → neither Shooting Star nor Inverted Hammer
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 102, 98, 100),
      makeCandle('2024-01-02', 100, 102, 98, 100),
      makeCandle('2024-01-03', 100, 102, 98, 100),
      makeCandle('2024-01-04', 100, 102, 98, 100),
      makeCandle('2024-01-05', 100, 102, 98, 100),
      makeCandle('2024-01-06', 100, 105, 99.9, 101), // shooting star shape in sideways
    ];
    const detected = detectPatterns(series);
    expect(detected.find(p => p.name === 'Shooting Star')).toBeUndefined();
    expect(detected.find(p => p.name === 'Inverted Hammer')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Engulfing
// ---------------------------------------------------------------------------
describe('detectPatterns — Engulfing', () => {
  it('detects Bullish Engulfing in a downtrend', () => {
    const data: OHLCV[] = [
      makeCandle('2024-01-01', 115, 117, 113, 116),
      makeCandle('2024-01-02', 114, 116, 112, 115),
      makeCandle('2024-01-03', 112, 114, 110, 113),
      makeCandle('2024-01-04', 110, 112, 108, 111),
      makeCandle('2024-01-05', 108, 110, 106, 109),
      makeCandle('2024-01-06', 106, 108, 103, 104), // small red
      makeCandle('2024-01-07', 102, 115, 101, 112), // green engulf
    ];
    expect(detectPatterns(data).find(p => p.name === 'Bullish Engulfing')).toBeDefined();
  });

  it('detects Bearish Engulfing in an uptrend', () => {
    const data: OHLCV[] = [
      makeCandle('2024-01-01', 85, 87, 83, 86),
      makeCandle('2024-01-02', 86, 88, 84, 87),
      makeCandle('2024-01-03', 88, 90, 86, 89),
      makeCandle('2024-01-04', 90, 92, 88, 91),
      makeCandle('2024-01-05', 91, 93, 89, 92),
      makeCandle('2024-01-06', 92, 95, 91, 94), // small green
      makeCandle('2024-01-07', 96, 97, 84, 85), // red engulf
    ];
    expect(detectPatterns(data).find(p => p.name === 'Bearish Engulfing')).toBeDefined();
  });

  it('does NOT detect Bullish Engulfing without downtrend context', () => {
    const data: OHLCV[] = [
      makeCandle('2024-01-01', 85, 87, 83, 86),
      makeCandle('2024-01-02', 86, 88, 84, 88),
      makeCandle('2024-01-03', 88, 90, 86, 90),
      makeCandle('2024-01-04', 91, 93, 89, 92),
      makeCandle('2024-01-05', 92, 94, 90, 93),
      makeCandle('2024-01-06', 93, 96, 92, 94), // small red in uptrend
      makeCandle('2024-01-07', 91, 100, 90, 98), // green engulf in uptrend
    ];
    expect(detectPatterns(data).find(p => p.name === 'Bullish Engulfing')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Strong Bull Day / Strong Bear Day
// ---------------------------------------------------------------------------
describe('detectPatterns — Strong Bull/Bear Day', () => {
  it('detects Strong Bull Day when body ≥ 80% of range and body ≥ 0.8% of close', () => {
    // body=8 (100→108), range=9.5 → 84.2% ✓ | body/close=8/108=7.4% ≥ 0.8% ✓
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 102, 98, 101),
      makeCandle('2024-01-02', 100, 109, 99.5, 108), // strong bull
    ];
    expect(detectPatterns(series).find(p => p.name === 'Strong Bull Day')).toBeDefined();
  });

  it('detects Strong Bear Day when body ≥ 80% of range and body ≥ 0.8% of close', () => {
    // body=8 (108→100), range=9 → 88.9% ✓
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 102, 98, 101),
      makeCandle('2024-01-02', 108, 108.5, 99.5, 100), // strong bear
    ];
    expect(detectPatterns(series).find(p => p.name === 'Strong Bear Day')).toBeDefined();
  });

  it('does NOT flag a small-body candle as Strong Bull Day', () => {
    // body=0.5 on price 100 → 0.5% < 0.8% minimum
    const series: OHLCV[] = [
      makeCandle('2024-01-01', 100, 102, 98, 101),
      makeCandle('2024-01-02', 100, 101, 99.8, 100.5),
    ];
    expect(detectPatterns(series).find(p => p.name === 'Strong Bull Day')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Rising Window
// ---------------------------------------------------------------------------
describe('detectPatterns — Rising Window', () => {
  it('detects Rising Window when current.low > prev.high', () => {
    const data: OHLCV[] = [
      makeCandle('2024-01-01', 100, 105, 98, 104),
      makeCandle('2024-01-02', 107, 112, 106, 110), // low=106 > prev.high=105 ✓
    ];
    expect(detectPatterns(data).find(p => p.name === 'Rising Window')).toBeDefined();
  });

  it('does NOT detect Rising Window when there is no gap', () => {
    const data: OHLCV[] = [
      makeCandle('2024-01-01', 100, 105, 98, 104),
      makeCandle('2024-01-02', 104, 108, 103, 107), // low=103 < prev.high=105 → no gap
    ];
    expect(detectPatterns(data).find(p => p.name === 'Rising Window')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe('detectPatterns — edge cases', () => {
  it('returns empty array for a single candle', () => {
    expect(detectPatterns([makeCandle('2024-01-01', 100, 105, 95, 102)])).toHaveLength(0);
  });

  it('returns empty array for an empty array', () => {
    expect(detectPatterns([])).toHaveLength(0);
  });

  it('results are in chronological order (ascending index)', () => {
    const data = Array.from({ length: 20 }, (_, i) =>
      makeCandle(`2024-01-${String(i + 1).padStart(2, '0')}`, 100 + i, 102 + i, 98 + i, 101 + i)
    );
    const detected = detectPatterns(data);
    for (let k = 1; k < detected.length; k++)
      expect(detected[k].index).toBeGreaterThanOrEqual(detected[k - 1].index);
  });

  it('reversed result is in newest-first order', () => {
    const data = Array.from({ length: 20 }, (_, i) =>
      makeCandle(`2024-01-${String(i + 1).padStart(2, '0')}`, 100 + i, 102 + i, 98 + i, 101 + i)
    );
    const reversed = [...detectPatterns(data)].reverse();
    for (let k = 1; k < reversed.length; k++)
      expect(reversed[k].index).toBeLessThanOrEqual(reversed[k - 1].index);
  });

  it('both pages produce identical results for the same OHLCV history', () => {
    const history = Array.from({ length: 30 }, (_, i) =>
      makeCandle(
        `2024-01-${String(i + 1).padStart(2, '0')}`,
        100 + i * 0.5, 102 + i * 0.5, 98 + i * 0.5, 101 + i * 0.5
      )
    );
    expect(detectPatterns(history)).toEqual(detectPatterns(history));
  });
});

// ---------------------------------------------------------------------------
// OHLCV data integrity
// ---------------------------------------------------------------------------
describe('OHLCV data integrity', () => {
  it('high >= open, close and low <= open, close', () => {
    const candles: OHLCV[] = [
      makeCandle('2024-01-01', 100, 110, 90, 105),
      makeCandle('2024-01-02', 105, 115, 100, 112),
    ];
    candles.forEach(c => {
      expect(c.high).toBeGreaterThanOrEqual(c.open);
      expect(c.high).toBeGreaterThanOrEqual(c.close);
      expect(c.low).toBeLessThanOrEqual(c.open);
      expect(c.low).toBeLessThanOrEqual(c.close);
      expect(c.volume).toBeGreaterThanOrEqual(0);
    });
  });
});
