import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { MarketOverview } from './pages/MarketOverview';
import { StockScreener } from './pages/StockScreener';
import { TechnicalAnalysis } from './pages/TechnicalAnalysis';
import { FundamentalAnalysis } from './pages/FundamentalAnalysis';
import { PatternScanner } from './pages/PatternScanner';
import { Watchlist } from './pages/Watchlist';
import { About } from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<MarketOverview />} />
          <Route path="screener" element={<StockScreener />} />
          <Route path="technical" element={<TechnicalAnalysis />} />
          <Route path="fundamental" element={<FundamentalAnalysis />} />
          <Route path="patterns" element={<PatternScanner />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
