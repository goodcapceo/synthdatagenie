/**
 * Synthetic Data Genie
 * Main Application Component
 * Split-View Console Layout with Deep Ocean Intelligence Design
 */

import { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Table,
  BarChart3,
  FileJson,
  FileSpreadsheet,
  Sparkles,
  Trash2
} from 'lucide-react';

import ConfigSidebar from './components/ConfigSidebar';
import StatsGrid from './components/StatsGrid';
import DataTable from './components/DataTable';
import Charts from './components/Charts';
import LoadingState from './components/LoadingState';
import { generateData, downloadCSV, downloadJSON } from './services/api';

// Tab configuration
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'preview', label: 'Data Preview', icon: Table },
  { id: 'charts', label: 'Visualizations', icon: BarChart3 },
];

// Default config values
const DEFAULT_CONFIG = {
  num_records: 10000,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  anomaly_rate: 5.0,
  region: 'US_MAJOR_CITIES',
};

function App() {
  // Configuration state
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Validate config before generation
  const validateConfig = () => {
    const errors = [];

    if (!config.num_records || config.num_records < 100 || config.num_records > 100000) {
      errors.push('Number of records must be between 100 and 100,000');
    }

    if (!config.start_date) {
      errors.push('Start date is required');
    }

    if (!config.end_date) {
      errors.push('End date is required');
    }

    if (config.start_date && config.end_date && config.start_date > config.end_date) {
      errors.push('Start date must be before end date');
    }

    if (config.anomaly_rate < 0 || config.anomaly_rate > 20) {
      errors.push('Anomaly rate must be between 0 and 20');
    }

    return errors;
  };

  // Generate handler
  const handleGenerate = useCallback(async () => {
    // Validate first
    const validationErrors = validateConfig();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        // Faster initial progress, slower as it approaches completion
        const increment = Math.max(1, (90 - prev) / 10);
        return Math.min(90, prev + increment);
      });
    }, 200);

    try {
      // Ensure num_records is an integer
      const requestConfig = {
        ...config,
        num_records: Math.floor(config.num_records),
      };

      const response = await generateData(requestConfig);

      clearInterval(progressInterval);
      setProgress(100);

      // Small delay before hiding loader for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      setTransactions(response.transactions);
      setMetrics(response.metrics);
      setActiveTab('dashboard');
    } catch (err) {
      setError(err.message);
      clearInterval(progressInterval);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [config]);

  // Clear/Reset handler
  const handleClear = useCallback(() => {
    setTransactions([]);
    setMetrics(null);
    setError(null);
    setActiveTab('dashboard');
  }, []);

  // Download handlers
  const handleDownloadCSV = () => {
    if (transactions.length > 0) {
      downloadCSV(transactions, `synthetic_transactions_${Date.now()}.csv`);
    }
  };

  const handleDownloadJSON = () => {
    if (transactions.length > 0) {
      downloadJSON(
        { transactions, metrics, config },
        `synthetic_data_${Date.now()}.json`
      );
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    if (!metrics && !loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl opacity-20">📊</div>
            <h3 className="text-xl font-medium text-slate-300">No Data Yet</h3>
            <p className="text-slate-500">
              Configure parameters in the sidebar and click{' '}
              <span className="text-indigo-400 font-medium">Generate</span> to
              create your synthetic dataset.
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 text-xs text-slate-600">
                <Sparkles className="w-4 h-4" />
                Powered by realistic statistical models
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <StatsGrid metrics={metrics} />;
      case 'preview':
        return <DataTable transactions={transactions} />;
      case 'charts':
        return <Charts transactions={transactions} metrics={metrics} />;
      default:
        return <StatsGrid metrics={metrics} />;
    }
  };

  const hasData = transactions.length > 0;

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Left: Fixed Config Sidebar */}
      <ConfigSidebar
        config={config}
        setConfig={setConfig}
        onGenerate={handleGenerate}
        loading={loading}
      />

      {/* Right: Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Tabs and Download Buttons */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
          {/* Tab Navigation */}
          <nav className="flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn flex items-center gap-2 ${
                    isActive ? 'tab-btn-active' : 'tab-btn-inactive'
                  }`}
                  disabled={!metrics && !loading}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Clear Button */}
            {hasData && (
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-rose-400 hover:text-rose-300
                           bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                title="Clear current dataset"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            {/* Download Buttons */}
            <button
              onClick={handleDownloadCSV}
              disabled={!hasData}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200
                         bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              disabled={!hasData}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200
                         bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start justify-between">
            <div>
              <p className="text-rose-400 text-sm">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-rose-400/70 text-xs mt-1">
                Check your configuration and try again.
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-300 text-sm ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {renderContent()}
        </div>

        {/* Footer Stats (when data exists) */}
        {metrics && (
          <footer className="h-10 border-t border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 text-xs text-slate-500">
            <span>
              {metrics.total_transactions.toLocaleString()} transactions •{' '}
              {metrics.unique_customers.toLocaleString()} customers •{' '}
              {metrics.unique_merchants.toLocaleString()} merchants
            </span>
            <span className="font-mono tabular-nums">
              Generated in {metrics.generation_time?.toFixed(2)}s
            </span>
          </footer>
        )}
      </main>

      {/* Loading Overlay */}
      {loading && <LoadingState progress={progress} />}
    </div>
  );
}

export default App;
