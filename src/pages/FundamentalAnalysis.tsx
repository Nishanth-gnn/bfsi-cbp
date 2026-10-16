import { useState } from 'react';
import { sampleStocks } from '../data/sampleData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown, Info } from 'lucide-react';
import clsx from 'clsx';
import { 
  calculatePE, 
  calculatePriceToBook, 
  calculateROE, 
  calculateROCE, 
  calculateDebtToEquity, 
  calculateDividendYield,
  calculatePEG,
  calculateCAGR
} from '../utils/fundamentals';
import { generateStockSummary } from '../utils/summary';
import { calculateSMA, calculateMACD, calculateRSI } from '../utils/technical';
import { detectPatterns } from '../utils/patterns';

export const FundamentalAnalysis = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(sampleStocks[0].symbol);
  const [activeTab, setActiveTab] = useState<'Valuation' | 'Profitability' | 'Growth' | 'Health'>('Valuation');
  
  const stock = sampleStocks.find(s => s.symbol === selectedSymbol) || sampleStocks[0];

  const tabs = ['Valuation', 'Profitability', 'Growth', 'Health'] as const;

  // Calculate live fundamental metrics
  const calculatedPE = calculatePE(stock.price, stock.eps) || stock.pe;
  const calculatedPB = calculatePriceToBook(stock.price, stock.bookValuePerShare);
  const calculatedROE = calculateROE(stock.netProfit, stock.equity);
  const calculatedROCE = calculateROCE(stock.ebit, stock.capitalEmployed) || stock.roce;
  const calculatedDebtToEquity = calculateDebtToEquity(stock.totalDebt, stock.equity) || stock.debtToEquity;
  const calculatedDivYield = calculateDividendYield(stock.annualDividend, stock.price);
  const calculatedPEG = calculatePEG(calculatedPE, undefined); // Earnings growth not available in dataset
  const calculatedCAGR = calculateCAGR(
    stock.previousRevenue ? stock.previousRevenue * 0.7 : undefined, // 2020 rev estimate
    stock.currentRevenue, // 2024 rev
    4 // 4 years growth
  );

  const revenueGrowth = stock.currentRevenue && stock.previousRevenue 
    ? ((stock.currentRevenue - stock.previousRevenue) / stock.previousRevenue) * 100 
    : null;
    
  const calculatedROA = stock.netProfit && stock.assets 
    ? (stock.netProfit / stock.assets) * 100 
    : null;

  // Generate explainable summary
  const sma50 = calculateSMA(stock.history, 50);
  const sma200 = calculateSMA(stock.history, 200);
  const rsi = calculateRSI(stock.history, 14);
  const macdInfo = calculateMACD(stock.history);
  const patterns = detectPatterns(stock.history);
  const summaryInsights = generateStockSummary(stock, stock.history, sma50, sma200, rsi, macdInfo, patterns);

  // Mock revenue data (can use actual if available)
  const financialData = [
    { year: '2020', revenue: (stock.previousRevenue || 100000) * 0.7, profit: (stock.netProfit || 10000) * 0.6 },
    { year: '2021', revenue: (stock.previousRevenue || 100000) * 0.8, profit: (stock.netProfit || 10000) * 0.7 },
    { year: '2022', revenue: (stock.previousRevenue || 100000) * 0.9, profit: (stock.netProfit || 10000) * 0.85 },
    { year: '2023', revenue: stock.previousRevenue || 100000, profit: (stock.netProfit || 10000) * 0.95 },
    { year: '2024', revenue: stock.currentRevenue || 120000, profit: stock.netProfit || 12000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Fundamental Analysis</h1>
          <p className="text-textSecondary text-sm mt-1">Deep dive into company financials and valuation metrics.</p>
        </div>
        
        <div className="relative">
          <select 
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-surface border border-border rounded-lg pl-4 pr-10 py-2 text-white font-medium focus:outline-none focus:border-primary appearance-none cursor-pointer shadow-sm"
          >
            {sampleStocks.map(s => (
              <option key={s.symbol} value={s.symbol}>{s.symbol} - {s.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none" />
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* TABBED METRICS PANEL */}
          <div className="card p-0 overflow-hidden">
            <div className="flex space-x-1 border-b border-border px-4 pt-2 bg-surfaceHover">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab 
                      ? "border-primary text-primary" 
                      : "border-transparent text-textSecondary hover:text-white hover:border-border"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Key Financial Ratios ({activeTab})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-border">
                    {activeTab === 'Valuation' && (
                      <>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Price to Earnings (P/E) <span title="Price per share / Earnings per share"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-white font-medium">{calculatedPE ? calculatedPE.toFixed(2) : 'N/A'}</td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Price to Book (P/B) <span title="Market Price / Book Value per share"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-white font-medium">{calculatedPB ? calculatedPB.toFixed(2) : 'N/A'}</td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Dividend Yield <span title="Annual Dividend / Share Price"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-white font-medium">{calculatedDivYield ? calculatedDivYield.toFixed(2) + '%' : 'N/A'}</td>
                        </tr>
                      </>
                    )}

                    {activeTab === 'Profitability' && (
                      <>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Return on Equity (ROE) <span title="Net Profit / Shareholders Equity"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-success font-medium">{calculatedROE ? calculatedROE.toFixed(2) + '%' : 'N/A'}</td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Return on Assets (ROA) <span title="Net Profit / Total Assets"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-success font-medium">{calculatedROA ? calculatedROA.toFixed(2) + '%' : 'N/A'}</td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Return on Cap Emp (ROCE) <span title="EBIT / Capital Employed"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-success font-medium">{calculatedROCE ? calculatedROCE.toFixed(2) + '%' : 'N/A'}</td>
                        </tr>
                      </>
                    )}

                    {activeTab === 'Growth' && (
                      <>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Revenue Growth (YoY) <span title="Year over Year Revenue Growth"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-success font-medium">{revenueGrowth ? revenueGrowth.toFixed(2) + '%' : 'N/A'}</td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">PEG Ratio <span title="P/E Ratio / Earnings Growth Rate"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-white font-medium">{calculatedPEG ? calculatedPEG.toFixed(2) : 'N/A'}</td>
                        </tr>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Revenue CAGR (4Y) <span title="Compound Annual Growth Rate"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-white font-medium">{calculatedCAGR ? calculatedCAGR.toFixed(2) + '%' : 'N/A'}</td>
                        </tr>
                      </>
                    )}

                    {activeTab === 'Health' && (
                      <>
                        <tr className="hover:bg-surfaceHover transition-colors">
                          <td className="py-3 text-textSecondary flex items-center gap-2">Debt to Equity <span title="Total Debt / Total Equity"><Info className="w-3 h-3 cursor-help text-textSecondary" /></span></td>
                          <td className="py-3 text-white font-medium">{calculatedDebtToEquity !== null ? calculatedDebtToEquity.toFixed(2) : 'N/A'}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SHARED CHART PANEL */}
          <div className="card p-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Financial Performance (Revenue vs Profit)</h2>
              <p className="text-xs text-textSecondary mb-6 mt-1">* Note: 2020-2022 figures are illustrative estimates for demonstration purposes.</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12182b', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                    itemStyle={{ color: '#f8fafc' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenue" name="Revenue (Cr)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit (Cr)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-primary/20 bg-primary/5">
            <h3 className="text-sm font-semibold text-white mb-4">Explainable Stock Summary</h3>
            <div className="space-y-4">
              {summaryInsights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className={clsx(
                    "mt-0.5 w-2 h-2 rounded-full shrink-0",
                    insight.type === 'positive' && "bg-success",
                    insight.type === 'negative' && "bg-danger",
                    insight.type === 'neutral' && "bg-amber-500",
                    insight.type === 'insufficient' && "bg-textSecondary"
                  )} />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{insight.label}</h4>
                    <p className="text-xs text-textSecondary">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">Company Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-textSecondary mb-1">Sector</div>
                <div className="text-sm font-medium text-white">{stock.sector}</div>
              </div>
              <div>
                <div className="text-xs text-textSecondary mb-1">Market Cap</div>
                <div className="text-sm font-medium text-white">{stock.marketCap}</div>
              </div>
              <div>
                <div className="text-xs text-textSecondary mb-1">Current Price</div>
                <div className="text-sm font-medium text-white">₹{stock.price.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
