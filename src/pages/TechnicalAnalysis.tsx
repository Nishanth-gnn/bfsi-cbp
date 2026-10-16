import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sampleStocks } from '../data/sampleData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { calculateSMA, calculateMACD, calculateRSI } from '../utils/technical';
import { detectPatterns } from '../utils/patterns';

export const TechnicalAnalysis = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialise from ?symbol= query param (set by PatternScanner's deep-link)
  const paramSymbol = searchParams.get('symbol');
  const validParam = sampleStocks.find(s => s.symbol === paramSymbol)?.symbol;

  const [selectedSymbol, setSelectedSymbol] = useState(validParam || sampleStocks[0].symbol);

  // Keep URL in sync when the dropdown changes
  const handleSymbolChange = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchParams({ symbol: sym }, { replace: true });
  };

  // If the URL param changes externally (e.g. browser back/forward), honour it
  useEffect(() => {
    if (validParam && validParam !== selectedSymbol) {
      setSelectedSymbol(validParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validParam]);
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y'>('6M');
  
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  const selectedStock = sampleStocks.find(s => s.symbol === selectedSymbol) || sampleStocks[0];

  const processedData = useMemo(() => {
    const history = selectedStock.history;
    const sma50 = calculateSMA(history, 50);
    const sma200 = calculateSMA(history, 200);
    const rsi = calculateRSI(history, 14);
    const macdData = calculateMACD(history);
    
    // Pattern detection
    const patterns = detectPatterns(history);

    const merged = history.map((d, i) => {
      const p = patterns.find(pat => pat.index === i);
      return {
        ...d,
        sma50: sma50[i],
        sma200: sma200[i],
        rsi: rsi[i],
        macd: macdData.macdLine[i],
        signal: macdData.signalLine[i],
        histogram: macdData.histogram[i],
        pattern: p ? p.name : null,
        patternSentiment: p ? p.sentiment : null,
      };
    });
    
    // Slice based on timeframe
    const points = timeframe === '1M' ? 30 : timeframe === '6M' ? 120 : 250;
    return merged.slice(-points);
  }, [selectedStock, timeframe]);

  const recentPattern = processedData.slice(-10).reverse().find(d => d.pattern);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Technical Analysis</h1>
          <p className="text-textSecondary text-sm mt-1">Advanced charting and technical indicators.</p>
        </div>
        
        <div className="relative">
          <select 
            value={selectedSymbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            className="bg-surface border border-border rounded-lg pl-4 pr-10 py-2 text-white font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"
          >
            {sampleStocks.map(stock => (
              <option key={stock.symbol} value={stock.symbol}>{stock.symbol} - {stock.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="card flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-surfaceHover">
              <div className="flex items-center gap-2 bg-background rounded-lg p-1 border border-border">
                {(['1M', '6M', '1Y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={clsx(
                      "px-4 py-1.5 text-xs font-medium rounded-md transition-colors",
                      timeframe === tf ? "bg-surface text-primary shadow-sm" : "text-textSecondary hover:text-white"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4 min-h-[300px]">
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#12182b] border border-[#1e293b] p-3 rounded-lg shadow-xl">
                              <p className="text-[#94a3b8] text-xs mb-2">{label}</p>
                              {payload.map((entry: any, index: number) => (
                                <p key={`item-${index}`} className="text-sm font-medium" style={{ color: entry.color }}>
                                  {entry.name}: {Number(entry.value).toFixed(2)}
                                </p>
                              ))}
                              {data.pattern && (
                                <div className="mt-2 pt-2 border-t border-[#1e293b] flex items-center gap-1.5">
                                  <AlertTriangle className={clsx("w-3.5 h-3.5", data.patternSentiment === 'Bullish' ? 'text-success' : data.patternSentiment === 'Bearish' ? 'text-danger' : 'text-amber-500')} />
                                  <span className="text-xs font-semibold text-white">{data.pattern}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      name="Price"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.pattern) {
                          const color = payload.patternSentiment === 'Bullish' ? '#10b981' : payload.patternSentiment === 'Bearish' ? '#ef4444' : '#f59e0b';
                          return <circle key={`pattern-${payload.date}`} cx={cx} cy={cy} r={4} fill={color} stroke="#12182b" strokeWidth={2} />;
                        }
                        return <g key={`empty-${props.index}`} />;
                      }}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#12182b', strokeWidth: 2 }}
                    />
                    {showSMA50 && <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1} dot={false} name="SMA 50" connectNulls={false} />}
                    {showSMA200 && <Line type="monotone" dataKey="sma200" stroke="#ec4899" strokeWidth={1} dot={false} name="SMA 200" connectNulls={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <Bar dataKey="volume" fill="#1e293b" />
                    <Tooltip 
                      cursor={{ fill: '#1e293b', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#12182b', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                      formatter={(value: any) => [Number(value).toLocaleString(), 'Volume']}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Optional Indicator Panels */}
          {showRSI && (
            <div className="card p-4 h-40">
              <h4 className="text-xs font-semibold text-textSecondary mb-2">RSI (14)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} orientation="right" ticks={[30, 70]} />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12182b', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                    formatter={(val: any) => [val?.toFixed(2), 'RSI']} 
                  />
                  <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={1.5} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {showMACD && (
            <div className="card p-4 h-40">
              <h4 className="text-xs font-semibold text-textSecondary mb-2">MACD (12, 26, 9)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} orientation="right" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12182b', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                    formatter={(val: any, name: any) => [val?.toFixed(2), name as string]} 
                  />
                  <Bar dataKey="histogram">
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(entry.histogram || 0) > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="card p-5 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{selectedStock.symbol}</h3>
            <p className="text-sm text-textSecondary">{selectedStock.name}</p>
          </div>
          
          <div className="space-y-1">
            <div className="text-3xl font-semibold text-white">₹{selectedStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div className={clsx(
              "text-sm font-medium",
              selectedStock.dailyChange >= 0 ? "text-success" : "text-danger"
            )}>
              {selectedStock.dailyChange >= 0 ? '+' : ''}{selectedStock.dailyChange}%
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Indicator Configuration</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-textSecondary cursor-pointer group">
                <input type="checkbox" checked={showSMA50} onChange={(e) => setShowSMA50(e.target.checked)} className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-surface" />
                <span className="group-hover:text-white transition-colors">SMA (50)</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-textSecondary cursor-pointer group">
                <input type="checkbox" checked={showSMA200} onChange={(e) => setShowSMA200(e.target.checked)} className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-surface" />
                <span className="group-hover:text-white transition-colors">SMA (200)</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-textSecondary cursor-pointer group">
                <input type="checkbox" checked={showRSI} onChange={(e) => setShowRSI(e.target.checked)} className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-surface" />
                <span className="group-hover:text-white transition-colors">RSI (14)</span>
              </label>
              <label className="flex items-center gap-3 text-sm text-textSecondary cursor-pointer group">
                <input type="checkbox" checked={showMACD} onChange={(e) => setShowMACD(e.target.checked)} className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-surface" />
                <span className="group-hover:text-white transition-colors">MACD (12, 26, 9)</span>
              </label>
            </div>
          </div>

          {recentPattern && (
            <div className="bg-surfaceHover border border-border p-4 rounded-lg mt-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={clsx("w-4 h-4", recentPattern.patternSentiment === 'Bullish' ? 'text-success' : recentPattern.patternSentiment === 'Bearish' ? 'text-danger' : 'text-amber-500')} />
                <h4 className="text-sm font-semibold text-white">Recent Pattern</h4>
              </div>
              <p className="text-sm font-medium text-white">{recentPattern.pattern}</p>
              <p className="text-xs text-textSecondary">Detected on {recentPattern.date}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
