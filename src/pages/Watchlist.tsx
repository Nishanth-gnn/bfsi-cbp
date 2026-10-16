import { useState } from 'react';
import { sampleStocks } from '../data/sampleData';
import { Search, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK']);
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchResults = searchTerm 
    ? sampleStocks.filter(s => 
        (s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
         s.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !watchlist.includes(s.symbol)
      )
    : [];

  const watchlistStocks = watchlist.map(symbol => sampleStocks.find(s => s.symbol === symbol)).filter(Boolean) as typeof sampleStocks;

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Watchlist</h1>
        <p className="text-textSecondary text-sm mt-1">Track your favorite stocks locally.</p>
      </div>

      <div className="card p-5 relative z-10">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input 
            type="text" 
            placeholder="Search to add to watchlist..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-lg"
          />
        </div>

        {searchTerm && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto z-50">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-textSecondary text-sm">No new stocks found</div>
            ) : (
              searchResults.map(stock => (
                <button
                  key={stock.symbol}
                  onClick={() => toggleWatchlist(stock.symbol)}
                  className="w-full flex items-center justify-between p-3 hover:bg-surfaceHover text-left transition-colors border-b border-border last:border-0"
                >
                  <div>
                    <span className="font-semibold text-white block">{stock.symbol}</span>
                    <span className="text-xs text-textSecondary">{stock.name}</span>
                  </div>
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {watchlistStocks.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 bg-surfaceHover rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-textSecondary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Your watchlist is empty</h3>
            <p className="text-textSecondary text-sm max-w-xs mx-auto">
              Search for companies above to add them to your watchlist and track their performance.
            </p>
          </div>
        ) : (
          watchlistStocks.map(stock => {
            const isPos = stock.dailyChange >= 0;
            return (
              <div key={stock.symbol} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/50 transition-colors">
                <div className="flex-1">
                  <Link to="/technical" className="hover:underline decoration-primary underline-offset-4">
                    <h3 className="text-lg font-bold text-white">{stock.symbol}</h3>
                  </Link>
                  <span className="text-sm text-textSecondary">{stock.name}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className={clsx(
                      "text-sm font-medium flex items-center justify-end gap-1",
                      isPos ? "text-success" : "text-danger"
                    )}>
                      {isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPos ? '+' : ''}{stock.dailyChange}%
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleWatchlist(stock.symbol)}
                    className="p-2 text-textSecondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
