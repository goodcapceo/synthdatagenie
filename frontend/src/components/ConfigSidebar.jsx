/**
 * ConfigSidebar Component
 * Left panel with generation configuration controls
 * Deep Ocean Intelligence design system
 */

import { useState } from 'react';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  Globe,
  Zap,
  DollarSign,
  Tag,
  Clock,
  ShieldAlert
} from 'lucide-react';

// Anomaly type definitions with icons and explanations
const ANOMALY_TYPES = [
  {
    id: 'geographic',
    icon: Globe,
    label: 'Geographic Jump',
    emoji: '🌍',
    description: 'Transaction in NYC at 2pm, then LA at 3pm — physically impossible travel.',
    example: 'Customer buys coffee in Boston, then 30 min later purchases in Miami.'
  },
  {
    id: 'velocity',
    icon: Zap,
    label: 'High Velocity',
    emoji: '⚡',
    description: '10+ transactions in 5 minutes across different merchants.',
    example: 'Card used at 12 different stores within a 3-minute window.'
  },
  {
    id: 'amount',
    icon: DollarSign,
    label: 'Unusual Amount',
    emoji: '💰',
    description: 'Spending far outside the customer\'s normal range.',
    example: 'Customer normally spends $20-50, suddenly charges $5,000.'
  },
  {
    id: 'category',
    icon: Tag,
    label: 'New Category',
    emoji: '🏷️',
    description: 'First-ever transaction in an unusual merchant category.',
    example: 'Customer never used card for gambling, suddenly visits casino.'
  },
  {
    id: 'temporal',
    icon: Clock,
    label: 'Odd Hours',
    emoji: '🕐',
    description: 'Transaction at unusual time for this customer\'s pattern.',
    example: 'Daytime-only customer suddenly makes purchase at 3am.'
  },
  {
    id: 'merchant_risk',
    icon: ShieldAlert,
    label: 'High-Risk Merchant',
    emoji: '⚠️',
    description: 'Transaction at merchants associated with fraud patterns.',
    example: 'Crypto ATM, offshore gambling site, wire transfer service.'
  }
];

// Available regions with descriptions
const REGIONS = [
  {
    value: 'US_MAJOR_CITIES',
    label: 'US Major Cities',
    description: '20 metropolitan areas (NYC, LA, Chicago, etc.)'
  },
  {
    value: 'US_NORTHEAST',
    label: 'US Northeast',
    description: 'Boston, NYC, Philadelphia, DC corridor'
  },
  {
    value: 'US_WEST_COAST',
    label: 'US West Coast',
    description: 'Seattle, Portland, SF, LA, San Diego'
  },
  {
    value: 'US_MIDWEST',
    label: 'US Midwest',
    description: 'Chicago, Detroit, Minneapolis, Denver'
  },
  {
    value: 'US_SOUTH',
    label: 'US South',
    description: 'Atlanta, Miami, Houston, Dallas, Austin'
  }
];

const ConfigSidebar = ({ config, setConfig, onGenerate, loading }) => {
  const [showAnomalyInfo, setShowAnomalyInfo] = useState(false);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const selectedRegion = REGIONS.find(r => r.value === config.region) || REGIONS[0];

  return (
    <aside className="w-[300px] min-w-[300px] bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-50">Data Genie</h1>
            <p className="text-xs text-slate-500">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Record Count */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            Number of Records
          </label>
          <input
            type="number"
            min="100"
            max="100000"
            value={config.num_records}
            onChange={(e) => handleChange('num_records', parseInt(e.target.value) || 100)}
            className="input-field font-mono"
            disabled={loading}
          />
          <p className="text-xs text-slate-500">
            {formatNumber(config.num_records)} transactions
          </p>
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Date Range
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs text-slate-500">Start Date</label>
              <input
                type="date"
                value={config.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-slate-500">End Date</label>
              <input
                type="date"
                value={config.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            Region
          </label>
          <select
            value={config.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="input-field"
            disabled={loading}
          >
            {REGIONS.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            {selectedRegion.description}
          </p>
        </div>

        {/* Anomaly Rate */}
        <div className="space-y-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Anomaly Rate
            </div>
            <span className="text-lg font-bold text-rose-400 font-mono tabular-nums">
              {config.anomaly_rate.toFixed(1)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={config.anomaly_rate}
            onChange={(e) => handleChange('anomaly_rate', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-rose-500
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:transition-transform
                       [&::-webkit-slider-thumb]:hover:scale-110"
            disabled={loading}
          />

          <div className="flex justify-between text-xs text-slate-500">
            <span>0% (None)</span>
            <span>20% (High)</span>
          </div>

          {/* Anomaly Info Toggle */}
          <button
            onClick={() => setShowAnomalyInfo(!showAnomalyInfo)}
            className="w-full flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-2 py-1"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              What are anomalies?
            </span>
            {showAnomalyInfo ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Anomaly Types Explanation */}
          {showAnomalyInfo && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                Anomalies simulate suspicious patterns that fraud detection models should catch:
              </p>
              {ANOMALY_TYPES.map((anomaly) => {
                const Icon = anomaly.icon;
                return (
                  <div key={anomaly.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{anomaly.emoji}</span>
                      <span className="text-xs font-medium text-slate-300">
                        {anomaly.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6">
                      {anomaly.description}
                    </p>
                    <p className="text-xs text-slate-600 pl-6 italic">
                      e.g., {anomaly.example}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Generate Button - Sticky at bottom */}
      <div className="p-6 border-t border-slate-800 bg-slate-900">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="btn-generate w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Data
            </>
          )}
        </button>

        {!loading && (
          <p className="text-xs text-slate-500 text-center mt-3">
            ~{Math.ceil(config.num_records / 10000)} seconds for {formatNumber(config.num_records)} records
          </p>
        )}
      </div>
    </aside>
  );
};

export default ConfigSidebar;
