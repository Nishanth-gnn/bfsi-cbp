import { useState, useMemo } from 'react';
import { sampleStocks } from '../data/sampleData';
import { Search, Filter, RotateCcw, ArrowUpDown, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

type SortConfig = { key: keyof typeof sampleStocks[0] | null, direction: 'asc' | 'desc' };

export const StockScreener = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [marketCapFilter, setMarketCapFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [peFilter, setPeFilter] = useState('All');
  const [roceFilter, setRoceFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const sectors = ['All', ...Array.from(new Set(sampleStocks.map(s => s.sector))).sort()];
  const marketCaps = ['All', 'Large Cap', 'Mid Cap', 'Small Cap'];

  const filteredAndSortedStocks = useMemo(() => {
    let result = sampleStocks.filter(stock => {
      const matchSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMarketCap = marketCapFilter === 'All' || stock.marketCap === marketCapFilter;
      const matchSector = sectorFilter === 'All' || stock.sector === sectorFilter;
      
      let matchPe = true;
      if (stock.pe !== undefined) {
        if (peFilter === '< 20') matchPe = stock.pe < 20;
        else if (peFilter === '20 - 40') matchPe = stock.pe >= 20 && stock.pe <= 40;
        else if (peFilter === '> 40') matchPe = stock.pe > 40;
      } else if (peFilter !== 'All') {
        matchPe = false;
      }

      let matchRoce = true;
      if (stock.roce !== undefined) {
        if (roceFilter === '> 15%') matchRoce = stock.roce > 15;
        else if (roceFilter === '> 25%') matchRoce = stock.roce > 25;
      } else if (roceFilter !== 'All') {
        matchRoce = false;
      }

      return matchSearch && matchMarketCap && matchSector && matchPe && matchRoce;
    });

    if (sortConfig.key) {
      const key = sortConfig.key;
      result.sort((a, b) => {
        const aVal = a[key] as any;
        const bVal = b[key] as any;
        if (aVal === undefined || bVal === undefined) return 0;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, marketCapFilter, sectorFilter, peFilter, roceFilter, sortConfig]);

  const requestSort = (key: keyof typeof sampleStocks[0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMarketCapFilter('All');
    setSectorFilter('All');
    setPeFilter('All');
    setRoceFilter('All');
    setSortConfig({ key: null, direction: 'asc' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stock Screener</h1>
          <p className="text-textSecondary text-sm mt-1">Filter and discover opportunities based on technical and fundamental criteria.</p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-white font-semibold">Screening Filters</h2>
          <button 
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-xs text-textSecondary hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input 
              type="text" 
              placeholder="Search company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="relative">
            <select 
              value={sectorFilter} 
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="All">All Sectors</option>
              {sectors.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={marketCapFilter} 
              onChange={(e) => setMarketCapFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="All">All Market Caps</option>
              {marketCaps.filter(m => m !== 'All').map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={peFilter} 
              onChange={(e) => setPeFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="All">Any P/E</option>
              <option value="< 20">&lt; 20</option>
              <option value="20 - 40">20 - 40</option>
              <option value="> 40">&gt; 40</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={roceFilter} 
              onChange={(e) => setRoceFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="All">Any ROCE</option>
              <option value="> 15%">&gt; 15%</option>
              <option value="> 25%">&gt; 25%</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-surfaceHover flex justify-between items-center">
          <span className="text-sm font-medium text-white">{filteredAndSortedStocks.length} Results Found</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-textSecondary uppercase bg-background/50">
                {(['symbol', 'name', 'sector', 'price', 'dailyChange', 'pe', 'roce', 'debtToEquity'] as const).map((key) => (
                  <th 
                    key={key} 
                    className="p-4 font-medium cursor-pointer hover:text-white transition-colors whitespace-nowrap"
                    onClick={() => requestSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {key === 'dailyChange' ? 'Change %' : key === 'debtToEquity' ? 'D/E' : key.toUpperCase()}
                      <ArrowUpDown className={clsx("w-3 h-3", sortConfig.key === key ? "text-primary" : "opacity-50")} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-textSecondary">
                    No stocks match your criteria. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-surfaceHover/50 transition-colors">
                    <td className="p-4 font-semibold text-primary">{stock.symbol}</td>
                    <td className="p-4 text-white font-medium whitespace-nowrap">{stock.name}</td>
                    <td className="p-4 text-textSecondary text-sm whitespace-nowrap">{stock.sector}</td>
                    <td className="p-4 text-white">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className={clsx("p-4 font-medium", stock.dailyChange >= 0 ? "text-success" : "text-danger")}>
                      {stock.dailyChange > 0 ? '+' : ''}{stock.dailyChange}%
                    </td>
                    <td className="p-4 text-white">{stock.pe.toFixed(1)}</td>
                    <td className="p-4 text-white">{stock.roce.toFixed(1)}%</td>
                    <td className="p-4 text-white">{stock.debtToEquity.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
