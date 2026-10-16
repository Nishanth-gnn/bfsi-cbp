import { ShieldAlert, BookOpen, Layers, TerminalSquare } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <TerminalSquare className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">About Bullseye</h1>
        <p className="text-lg text-textSecondary max-w-2xl mx-auto">
          Intelligent Equity Analysis Platform — Phase 1 Demonstration
        </p>
      </div>

      <div className="card p-6 border-amber-500/20 bg-amber-500/5 flex gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h3 className="font-semibold text-amber-500 mb-1">Important Disclaimer</h3>
          <p className="text-sm text-textSecondary leading-relaxed">
            Bullseye is strictly an educational demonstration created for academic/portfolio purposes. 
            All financial data, charts, and metrics shown within this application are entirely simulated 
            and illustrative. It does not connect to live market data feeds and must not be used for 
            actual financial decision-making or trading. Not investment advice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surfaceHover rounded-lg">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-white">Project Scope</h2>
          </div>
          <p className="text-sm text-textSecondary leading-relaxed">
            Phase 1 focuses exclusively on establishing a premium, robust frontend architecture. 
            The goal is to deliver a highly polished user interface with responsive design, 
            client-side routing, state management, and mock data integration before implementing 
            complex backend services or AI features.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surfaceHover rounded-lg">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-white">Methodology</h2>
          </div>
          <ul className="text-sm text-textSecondary space-y-2 list-disc list-inside marker:text-border">
            <li>Built with React, Vite, and TypeScript.</li>
            <li>Styling implemented via Tailwind CSS.</li>
            <li>Charts rendered using Recharts.</li>
            <li>Icons provided by Lucide React.</li>
            <li>No external API dependencies in Phase 1.</li>
          </ul>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Future Implementation (Phase 2)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-surfaceHover rounded-lg border border-border">
            <h4 className="font-medium text-white mb-2 text-sm">Live Data</h4>
            <p className="text-xs text-textSecondary">Integration with market data providers for real-time quotes.</p>
          </div>
          <div className="p-4 bg-surfaceHover rounded-lg border border-border">
            <h4 className="font-medium text-white mb-2 text-sm">AI Analysis</h4>
            <p className="text-xs text-textSecondary">Automated insights on fundamental metrics and chart patterns.</p>
          </div>
          <div className="p-4 bg-surfaceHover rounded-lg border border-border">
            <h4 className="font-medium text-white mb-2 text-sm">Custom Indicators</h4>
            <p className="text-xs text-textSecondary">Real calculation of SMA, RSI, MACD, and Bollinger Bands.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
