import { Menu, Search, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Market Overview',
  '/screener': 'Stock Screener',
  '/technical': 'Technical Analysis',
  '/fundamental': 'Fundamental Analysis',
  '/patterns': 'Pattern Scanner',
  '/watchlist': 'Watchlist',
  '/about': 'About / Methodology'
};

export const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Bullseye';

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-textSecondary hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-white hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input 
            type="text" 
            placeholder="Search symbols..." 
            className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20">
            DEMO DATA
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
};
