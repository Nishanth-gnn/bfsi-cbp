import type { OHLCV } from './technical';

export type PatternResult = {
  name: string;
  index: number;
  date: string;
  description: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
};

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * True Doji: body ≤ 1.5 % of the candle's range AND both the upper wick AND
 * the lower wick each comprise at least 10 % of the range.
 *
 * This excludes:
 *  - zero-range candles (flat ticks in synthetic data)
 *  - tiny-range candles whose ratio is artificially small
 *  - one-sided candles such as Dragonfly / Gravestone Doji, which are treated
 *    separately as Hammer / Shooting Star variants
 */
const isDoji = (candle: OHLCV): boolean => {
  const body = Math.abs(candle.open - candle.close);
  const range = candle.high - candle.low;

  if (range === 0) return false;                        // zero-range → not a Doji
  if (range < candle.close * 0.001) return false;       // < 0.1 % of price → synthetic noise

  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  const upperWick = candle.high - Math.max(candle.open, candle.close);

  // Both wicks must be meaningful (each ≥ 10 % of range).
  // A candle with only one long wick is a Hammer / Shooting Star, not a Doji.
  if (lowerWick < range * 0.10) return false;
  if (upperWick < range * 0.10) return false;

  return body / range <= 0.015;                         // ≤ 1.5 % → true Doji
};

/**
 * Simple trend using a 5-bar close comparison.
 * Returns 'Sideways' when there is insufficient history.
 */
const getTrend = (
  data: OHLCV[],
  idx: number,
  period = 5
): 'Uptrend' | 'Downtrend' | 'Sideways' => {
  if (idx < period) return 'Sideways';
  const now  = data[idx].close;
  const then = data[idx - period].close;
  if (now > then * 1.01) return 'Uptrend';
  if (now < then * 0.99) return 'Downtrend';
  return 'Sideways';
};

// ─── main detector ────────────────────────────────────────────────────────────

/**
 * Detect candlestick patterns in an OHLCV series.
 *
 * Supported patterns:
 *   Doji · Hammer · Hanging Man · Shooting Star · Inverted Hammer ·
 *   Bullish Engulfing · Bearish Engulfing ·
 *   Strong Bull Day · Strong Bear Day · Rising Window
 *
 * Results are in chronological order (oldest first).
 * Reverse in the UI to show newest first.
 */
export const detectPatterns = (data: OHLCV[]): PatternResult[] => {
  const results: PatternResult[] = [];

  for (let i = 1; i < data.length; i++) {
    const c    = data[i];
    const prev = data[i - 1];

    const body      = Math.abs(c.open - c.close);
    const range     = c.high - c.low;
    const lowerWick = Math.min(c.open, c.close) - c.low;
    const upperWick = c.high - Math.max(c.open, c.close);
    const isGreen   = c.close >= c.open;

    const trend = getTrend(data, i);

    // ── 1. Doji ─────────────────────────────────────────────────────────────
    // Must be checked first. A Doji cannot simultaneously be any
    // other single-candle shape pattern.
    if (isDoji(c)) {
      results.push({
        name: 'Doji',
        index: i,
        date: c.date,
        description:
          'Open and close are nearly equal with meaningful wicks on both sides — buyers and sellers reached a standoff.',
        sentiment: 'Neutral',
      });
      continue;
    }

    // Skip zero-range or zero-body candles for all remaining checks
    if (range === 0 || body === 0) continue;

    // ── 2. Hammer  /  Hanging Man ────────────────────────────────────────────
    // Long lower wick (≥ 2 × body), small upper wick (≤ 30 % of body)
    if (lowerWick >= body * 2 && upperWick <= body * 0.3) {
      if (trend === 'Downtrend') {
        results.push({
          name: 'Hammer',
          index: i,
          date: c.date,
          description:
            'Long lower wick after a downtrend — sellers drove price lower but buyers pushed it back up, signalling potential reversal.',
          sentiment: 'Bullish',
        });
      } else if (trend === 'Uptrend') {
        results.push({
          name: 'Hanging Man',
          index: i,
          date: c.date,
          description:
            'Long lower wick in an uptrend — sellers briefly overwhelmed buyers. A bearish confirmation candle next session strengthens the signal.',
          sentiment: 'Bearish',
        });
      }
      continue;
    }

    // ── 3. Shooting Star  /  Inverted Hammer ─────────────────────────────────
    // Long upper wick (≥ 2 × body), small lower wick (≤ 30 % of body)
    if (upperWick >= body * 2 && lowerWick <= body * 0.3) {
      if (trend === 'Uptrend') {
        results.push({
          name: 'Shooting Star',
          index: i,
          date: c.date,
          description:
            'Long upper wick in an uptrend — buyers attempted new highs but sellers forced a sharp retreat, warning of a potential top.',
          sentiment: 'Bearish',
        });
      } else if (trend === 'Downtrend') {
        results.push({
          name: 'Inverted Hammer',
          index: i,
          date: c.date,
          description:
            'Long upper wick after a downtrend — buyers pushed prices up before sellers pulled back. A bullish confirmation next session would strengthen the signal.',
          sentiment: 'Bullish',
        });
      }
      continue;
    }

    // ── 4. Engulfing patterns ────────────────────────────────────────────────
    // Trend evaluated at i-1 (the candle being engulfed IS the prior context)
    const prevBody     = Math.abs(prev.open - prev.close);
    const trendAtPrev  = getTrend(data, i - 1);

    if (body > prevBody && prevBody > 0) {
      const prevRed   = prev.close < prev.open;
      const prevGreen = prev.close > prev.open;
      const curGreen  = c.close > c.open;
      const curRed    = c.close < c.open;

      if (
        trendAtPrev === 'Downtrend' &&
        prevRed && curGreen &&
        c.close > prev.open && c.open < prev.close
      ) {
        results.push({
          name: 'Bullish Engulfing',
          index: i,
          date: c.date,
          description:
            'A green candle completely absorbs the prior red candle in a downtrend — buyers have decisively overpowered sellers.',
          sentiment: 'Bullish',
        });
        continue;
      }

      if (
        trendAtPrev === 'Uptrend' &&
        prevGreen && curRed &&
        c.close < prev.open && c.open > prev.close
      ) {
        results.push({
          name: 'Bearish Engulfing',
          index: i,
          date: c.date,
          description:
            'A red candle completely absorbs the prior green candle in an uptrend — sellers have decisively overpowered buyers.',
          sentiment: 'Bearish',
        });
        continue;
      }
    }

    // ── 5. Strong Bull Day / Strong Bear Day (Marubozu-like) ─────────────────
    // Body covers ≥ 80 % of the session's range AND body ≥ 0.8 % of close price.
    // These fire when nearly the entire range IS the body (tiny wicks) and the
    // move is meaningful in absolute terms.
    const bodyRatio  = body / range;
    const minAbsBody = c.close * 0.008; // 0.8 % of close price

    if (bodyRatio >= 0.80 && body >= minAbsBody) {
      if (isGreen && trend !== 'Downtrend') {
        results.push({
          name: 'Strong Bull Day',
          index: i,
          date: c.date,
          description:
            'Wide green body with minimal wicks — buyers controlled the session from open to close with almost no resistance.',
          sentiment: 'Bullish',
        });
        continue;
      }
      if (!isGreen && trend !== 'Uptrend') {
        results.push({
          name: 'Strong Bear Day',
          index: i,
          date: c.date,
          description:
            'Wide red body with minimal wicks — sellers controlled the session from open to close with almost no support.',
          sentiment: 'Bearish',
        });
        continue;
      }
    }

    // ── 6. Rising Window (gap-up) ────────────────────────────────────────────
    // Current low must be strictly above the prior high — a genuine price gap.
    if (c.low > prev.high) {
      results.push({
        name: 'Rising Window',
        index: i,
        date: c.date,
        description:
          'A gap between the prior high and today\'s low — strong demand left a visible void in the price chart.',
        sentiment: 'Bullish',
      });
    }
  }

  return results;
};
