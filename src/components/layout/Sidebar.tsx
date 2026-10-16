import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  LineChart, 
  BarChart2, 
  Eye, 
  Bookmark, 
  Info,
  Target
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Market Overview', path: '/', icon: LayoutDashboard },
  { name: 'Stock Screener', path: '/screener', icon: Search },
  { name: 'Technical Analysis', path: '/technical', icon: LineChart },
  { name: 'Fundamental Analysis', path: '/fundamental', icon: BarChart2 },
  { name: 'Pattern Scanner', path: '/patterns', icon: Eye },
  { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
  { name: 'About / Methodology', path: '/about', icon: Info },
];

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">Bullseye</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={clsx(
                  "nav-link",
                  isActive && "active"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-primary" : "text-textSecondary")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="text-xs text-textSecondary text-center">
            Educational Demo
          </div>
        </div>
      </aside>
    </>
  );
};
