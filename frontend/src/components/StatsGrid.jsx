/**
 * StatsGrid Component
 * Bento grid layout for displaying key statistics
 * Deep Ocean Intelligence design system
 */

import { Database, Store, AlertTriangle, Clock, Users, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subvalue, accent = 'indigo', special = false }) => {
  const accentColors = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    teal: 'bg-teal-500/10 text-teal-400',
    rose: 'bg-rose-500/10 text-rose-400',
    slate: 'bg-slate-700/50 text-slate-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className={`card relative overflow-hidden ${special ? 'border-rose-900/30 hover:border-rose-900/50' : ''}`}>
      {/* Special decoration for anomaly card */}
      {special && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/5 rounded-full" />
      )}

      <div className="relative">
        <div className={`w-10 h-10 rounded-lg ${accentColors[accent]} flex items-center justify-center mb-4`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-50 font-mono tabular-nums">
            {value}
          </p>
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          {subvalue && (
            <p className="text-sm text-slate-400 mt-2">
              {subvalue}
            </p>
          )}
        </div>

        {special && (
          <div className="mt-3">
            <span className="badge-anomaly">
              <AlertTriangle className="w-3 h-3" />
              Fraud Patterns
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsGrid = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="w-10 h-10 bg-slate-700 rounded-lg mb-4" />
            <div className="h-8 bg-slate-700 rounded w-24 mb-2" />
            <div className="h-4 bg-slate-700 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Total Transactions"
          value={formatNumber(metrics.total_transactions)}
          subvalue={`${metrics.date_range?.start} to ${metrics.date_range?.end}`}
          accent="indigo"
        />

        <StatCard
          icon={Store}
          label="Unique Merchants"
          value={formatNumber(metrics.unique_merchants)}
          subvalue={`${metrics.unique_customers?.toLocaleString()} customers`}
          accent="teal"
        />

        <StatCard
          icon={AlertTriangle}
          label="Anomaly Rate"
          value={`${metrics.anomaly_breakdown?.anomaly_rate?.toFixed(1) || 0}%`}
          subvalue={`${metrics.anomaly_breakdown?.total_anomalies?.toLocaleString() || 0} anomalies detected`}
          accent="rose"
          special={true}
        />

        <StatCard
          icon={Clock}
          label="Generation Time"
          value={`${metrics.generation_time?.toFixed(2) || 0}s`}
          subvalue={`${Math.round(metrics.total_transactions / (metrics.generation_time || 1)).toLocaleString()} txn/sec`}
          accent="slate"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Average Amount"
          value={formatCurrency(metrics.amount_stats?.mean || 0)}
          subvalue={`Median: ${formatCurrency(metrics.amount_stats?.median || 0)}`}
          accent="amber"
        />

        <StatCard
          icon={Clock}
          label="Peak Activity"
          value={metrics.temporal_patterns?.peak_hour || 'N/A'}
          subvalue={`${metrics.temporal_patterns?.business_hours_pct || 0}% during business hours`}
          accent="indigo"
        />

        <StatCard
          icon={Users}
          label="Customer Consistency"
          value={`${((metrics.customer_behavior?.consistency_score || 0) * 100).toFixed(0)}%`}
          subvalue={`${metrics.customer_behavior?.avg_transactions_per_customer?.toFixed(1) || 0} avg txn/customer`}
          accent="teal"
        />
      </div>

      {/* Amount Distribution Summary */}
      {metrics.amount_stats && (
        <div className="card">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Amount Distribution
          </h3>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-slate-50 font-mono tabular-nums">
                {formatCurrency(metrics.amount_stats.min)}
              </p>
              <p className="text-xs text-slate-500">Min</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-50 font-mono tabular-nums">
                {formatCurrency(metrics.amount_stats.percentiles?.['25'] || 0)}
              </p>
              <p className="text-xs text-slate-500">25th %ile</p>
            </div>
            <div>
              <p className="text-lg font-bold text-teal-400 font-mono tabular-nums">
                {formatCurrency(metrics.amount_stats.median)}
              </p>
              <p className="text-xs text-slate-500">Median</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-50 font-mono tabular-nums">
                {formatCurrency(metrics.amount_stats.percentiles?.['75'] || 0)}
              </p>
              <p className="text-xs text-slate-500">75th %ile</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-50 font-mono tabular-nums">
                {formatCurrency(metrics.amount_stats.max)}
              </p>
              <p className="text-xs text-slate-500">Max</p>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Breakdown */}
      {metrics.anomaly_breakdown?.by_type && Object.keys(metrics.anomaly_breakdown.by_type).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
            Anomaly Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(metrics.anomaly_breakdown.by_type).map(([type, count]) => (
              <div key={type} className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-rose-400 font-mono tabular-nums">
                  {count.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {type.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsGrid;
