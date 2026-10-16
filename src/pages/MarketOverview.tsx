import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Info, Search, Activity, BarChart3, Eye } from 'lucide-react';
import { indexData, generateChartData, sampleSectors } from '../data/sampleData';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const MarketOverview = () => {
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | '6M' | '1Y'>('1M');
  
  const chartData = useMemo(() => {
    const points = chartRange === '1D' ? 24 : chartRange === '1W' ? 7 : chartRange === '1M' ? 30 : chartRange === '6M' ? 180 : 365;
    return generateChartData(points, 22000, 0.02);
  }, [chartRange]);

  const strongestSector = [...sampleSectors].sort((a, b) => b.change - a.change)[0];
  const weakestSector = [...sampleSectors].sort((a, b) => a.change - b.change)[0];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Market Intelligence</h1>
        <p className="text-textSecondary text-lg max-w-2xl">
          Explore market movements, evaluate company fundamentals, and discover technical patterns.
        </p>
        <div className="flex items-center gap-2 text-xs text-textSecondary bg-surface inline-block px-3 py-1.5 rounded-full border border-border mt-4">
          <Info className="w-4 h-4" />
          <span>Educational demo · Illustrative data · Not investment advice</span>
        </div>
      </div>

      {/* Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indexData.map((idx) => (
          <div key={idx.name} className="card p-5 group hover:border-primary/50 transition-colors">
            <h3 className="text-textSecondary font-medium text-sm mb-2">{idx.name}</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-semibold text-white">{idx.value.toLocaleString('en-IN')}</span>
              <div className={clsx(
                "flex items-center gap-1 text-sm font-medium",
                idx.isPositive ? "text-success" : "text-danger"
              )}>
                {idx.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(idx.change)}%
              </div>
            </div>
            <div className="h-10 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateChartData(10, idx.value, 0.01)}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={idx.isPositive ? '#10b981' : '#ef4444'} 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="card p-6 lg:col-span-2 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-white">NIFTY 50 Performance</h2>
            <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
              {(['1D', '1W', '1M', '6M', '1Y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setChartRange(range)}
                  className={clsx(
                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                    chartRange === range ? "bg-surface text-primary" : "text-textSecondary hover:text-white"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.toLocaleString('en-IN')}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12182b', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Highlights */}
        <div className="card p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Market Highlights</h2>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <div className="text-sm text-textSecondary flex items-center justify-between">
                <span>Strongest Sector</span>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{strongestSector.name}</span>
                <span className="text-success font-semibold">+{strongestSector.change}%</span>
              </div>
            </div>
            
            <div className="h-px bg-border w-full" />
            
            <div className="space-y-2">
              <div className="text-sm text-textSecondary flex items-center justify-between">
                <span>Weakest Sector</span>
                <TrendingDown className="w-4 h-4 text-danger" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{weakestSector.name}</span>
                <span className="text-danger font-semibold">{weakestSector.change}%</span>
              </div>
            </div>

            <div className="h-px bg-border w-full" />
            
            <div className="space-y-2">
              <div className="text-sm text-textSecondary flex items-center justify-between">
                <span>Market Breadth</span>
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Advances / Declines</span>
                <span className="text-white font-semibold">28 / 22</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 mt-2 flex overflow-hidden">
                <div className="bg-success h-full" style={{ width: '56%' }} />
                <div className="bg-danger h-full" style={{ width: '44%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Heatmap */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Sector Performance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {sampleSectors.map((sector) => {
            const isPos = sector.change >= 0;
            return (
              <div 
                key={sector.name} 
                className={clsx(
                  "p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-pointer",
                  isPos ? "bg-success/10 border-success/20 hover:bg-success/20" : "bg-danger/10 border-danger/20 hover:bg-danger/20"
                )}
                title={`${sector.name}: ${sector.change > 0 ? '+' : ''}${sector.change}%`}
              >
                <span className="text-xs font-medium text-textSecondary mb-1 line-clamp-1">{sector.name}</span>
                <span className={clsx(
                  "text-lg font-bold",
                  isPos ? "text-success" : "text-danger"
                )}>
                  {isPos ? '+' : ''}{sector.change}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/screener" className="card p-5 group hover:border-primary transition-colors flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Screen Stocks</h3>
              <p className="text-sm text-textSecondary">Filter companies by market cap, sector, and financials.</p>
            </div>
          </Link>
          <Link to="/fundamental" className="card p-5 group hover:border-primary transition-colors flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Analyze a Company</h3>
              <p className="text-sm text-textSecondary">Deep dive into profitability, valuation, and growth.</p>
            </div>
          </Link>
          <Link to="/patterns" className="card p-5 group hover:border-primary transition-colors flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Explore Patterns</h3>
              <p className="text-sm text-textSecondary">Learn and identify key technical candlestick formations.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
