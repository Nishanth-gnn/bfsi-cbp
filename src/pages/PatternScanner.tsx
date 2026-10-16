import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sampleStocks } from '../data/sampleData';
import { detectPatterns } from '../utils/patterns';
import type { PatternResult } from '../utils/patterns';

// ── Educational glossary (not tied to live detection) ────────────────────────
const glossaryPatterns = [
  {
    name: 'Doji',
    category: 'Indecision',
    sentiment: 'Neutral',
    interpretation:
      'Open and close are virtually the same, with wicks on both sides. Represents a perfect tug-of-war between buyers and sellers — no side won.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    name: 'Hammer',
    category: 'Reversal',
    sentiment: 'Bullish',
    interpretation:
      'Found at the end of a downtrend. Small body at the top with a long lower wick — sellers pushed prices down but buyers rejected the lows and closed near the high.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    name: 'Hanging Man',
    category: 'Reversal',
    sentiment: 'Bearish',
    interpretation:
      'Identical shape to a Hammer but occurs in an uptrend. The long lower wick shows sellers attempted a reversal — watch for a bearish confirmation candle.',
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    name: 'Shooting Star',
    category: 'Reversal',
    sentiment: 'Bearish',
    interpretation:
      'Found at the top of an uptrend. Small body at the bottom with a long upper wick — buyers pushed prices higher but sellers rejected the highs decisively.',
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    name: 'Inverted Hammer',
    category: 'Reversal',
    sentiment: 'Bullish',
    interpretation:
      'Identical shape to a Shooting Star but occurs in a downtrend. The long upper wick shows buyers attempted a rally. A bullish follow-through next session confirms.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    name: 'Bullish Engulfing',
    category: 'Reversal',
    sentiment: 'Bullish',
    interpretation:
      'A large green candle completely engulfs the prior red candle in a downtrend — buyers have overpowered sellers decisively.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    name: 'Bearish Engulfing',
    category: 'Reversal',
    sentiment: 'Bearish',
    interpretation:
      'A large red candle completely engulfs the prior green candle in an uptrend — sellers have overpowered buyers decisively.',
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    name: 'Strong Bull Day',
    category: 'Continuation',
    sentiment: 'Bullish',
    interpretation:
      'A wide green body covering ≥80% of the session range with minimal wicks (Marubozu-like). Buyers dominated the entire session from open to close with almost no pullback.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    name: 'Strong Bear Day',
    category: 'Continuation',
    sentiment: 'Bearish',
    interpretation:
      'A wide red body covering ≥80% of the session range with minimal wicks (Marubozu-like). Sellers dominated the entire session from open to close with almost no recovery.',
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    name: 'Rising Window',
    category: 'Continuation',
    sentiment: 'Bullish',
    interpretation:
      'A gap-up between the previous session\'s high and the current session\'s low. Strong demand leaves a visible void in price that often acts as future support.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
];

const DISPLAY_CAPS = [10, 20, 50] as const;
type DisplayCap = (typeof DISPLAY_CAPS)[number];

const sentimentColor = (s: PatternResult['sentiment']) =>
  s === 'Bullish'
    ? 'text-success'
    : s === 'Bearish'
    ? 'text-danger'
    : 'text-amber-500';

const sentimentBadge = (s: PatternResult['sentiment']) =>
  s === 'Bullish'
    ? 'bg-success/10 text-success'
    : s === 'Bearish'
    ? 'bg-danger/10 text-danger'
    : 'bg-amber-500/10 text-amber-500';

// ── Component ─────────────────────────────────────────────────────────────────
export const PatternScanner = () => {
  const navigate = useNavigate();

  const [selectedSymbol, setSelectedSymbol] = useState(sampleStocks[0].symbol);
  const [filterSentiment, setFilterSentiment] = useState<
    'All' | 'Bullish' | 'Bearish' | 'Neutral'
  >('All');
  const [displayCap, setDisplayCap] = useState<DisplayCap>(20);

  const selectedStock =
    sampleStocks.find(s => s.symbol === selectedSymbol) || sampleStocks[0];

  // All detected patterns, newest-first
  const allDetected = useMemo(() => {
    return detectPatterns(selectedStock.history).reverse();
  }, [selectedStock]);

  // Apply sentiment filter then cap display count
  const visiblePatterns = useMemo(() => {
    const filtered =
      filterSentiment === 'All'
        ? allDetected
        : allDetected.filter(p => p.sentiment === filterSentiment);
    return filtered.slice(0, displayCap);
  }, [allDetected, filterSentiment, displayCap]);

  const filteredTotal =
    filterSentiment === 'All'
      ? allDetected.length
      : allDetected.filter(p => p.sentiment === filterSentiment).length;

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pattern Scanner
          </h1>
          <p className="text-textSecondary text-sm mt-1">
            Candlestick formations detected in{' '}
            <span className="text-amber-500 font-medium">
              illustrative demo data
            </span>{' '}
            — not live market data.
          </p>
        </div>

        {/* Stock selector */}
        <div className="relative">
          <select
            id="pattern-stock-select"
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
            className="bg-surface border border-border rounded-lg pl-4 pr-10 py-2 text-white font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"
          >
            {sampleStocks.map(stock => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.symbol} — {stock.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
        </div>
      </div>

      {/* ── Detection controls ───────────────────────────────────────── */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        {/* Sentiment filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-textSecondary font-medium uppercase tracking-wider">
            Filter:
          </span>
          {(['All', 'Bullish', 'Bearish', 'Neutral'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterSentiment(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterSentiment === s
                  ? s === 'All'
                    ? 'bg-primary/20 text-primary'
                    : s === 'Bullish'
                    ? 'bg-success/20 text-success'
                    : s === 'Bearish'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-amber-500/20 text-amber-500'
                  : 'bg-surface text-textSecondary hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Display cap */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-textSecondary font-medium uppercase tracking-wider">
            Show:
          </span>
          {DISPLAY_CAPS.map(cap => (
            <button
              key={cap}
              onClick={() => setDisplayCap(cap)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                displayCap === cap
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surface text-textSecondary hover:text-white'
              }`}
            >
              {cap}
            </button>
          ))}
        </div>

        {/* Summary count */}
        <span className="text-xs text-textSecondary">
          {visiblePatterns.length} of {filteredTotal} detected
          {filterSentiment !== 'All' ? ` (${filterSentiment})` : ''}
        </span>
      </div>

      {/* ── Detected pattern cards ───────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            Detected Patterns — {selectedStock.symbol}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium flex items-center gap-1">
            <Info className="w-3 h-3" /> Demo Data
          </span>
        </div>

        {visiblePatterns.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-border bg-background">
            <AlertTriangle className="w-8 h-8 text-textSecondary mx-auto mb-3" />
            <p className="text-textSecondary">
              No{filterSentiment !== 'All' ? ` ${filterSentiment.toLowerCase()}` : ''} patterns
              detected for{' '}
              <span className="text-white font-medium">{selectedStock.symbol}</span>
              {' '}in the available history.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visiblePatterns.map((pattern, idx) => (
              <div
                key={`${pattern.name}-${pattern.index}-${idx}`}
                className="card p-5 flex flex-col h-full border-primary/20 bg-primary/5 hover:border-primary/40 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{pattern.name}</h3>
                    <span className="text-xs text-textSecondary">
                      {selectedStock.symbol} — {selectedStock.name}
                    </span>
                  </div>
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${sentimentColor(pattern.sentiment)}`}
                  />
                </div>

                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${sentimentBadge(
                      pattern.sentiment
                    )}`}
                  >
                    {pattern.sentiment}
                  </span>
                  <span className="text-xs text-textSecondary font-medium">
                    {pattern.date || `Candle ${pattern.index}`}
                  </span>
                </div>

                <div className="flex-1 mb-4">
                  <p className="text-sm text-textSecondary leading-relaxed">
                    {pattern.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTotal > displayCap && (
          <p className="text-xs text-textSecondary text-center pt-2">
            Showing {displayCap} of {filteredTotal} detections. Increase the
            "Show" cap above to see more.
          </p>
        )}
      </div>

      {/* ── Educational Glossary ─────────────────────────────────────── */}
      <div className="pt-6 border-t border-border mt-8">
        <h2 className="text-lg font-semibold text-white mb-1">
          Educational Glossary
        </h2>
        <p className="text-xs text-textSecondary mb-4">
          Reference definitions — these entries are independent of the detection
          results above.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {glossaryPatterns.map(pattern => (
            <div
              key={pattern.name}
              className="card p-5 flex flex-col h-full group hover:border-border transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-white">{pattern.name}</h3>
                  <span className="text-xs text-textSecondary">
                    {pattern.category}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${pattern.bg} ${pattern.color}`}
                >
                  {pattern.sentiment}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-sm text-textSecondary leading-relaxed">
                  {pattern.interpretation}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <button className="text-sm text-primary hover:text-primaryHover font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
