/**
 * Charts Component
 * Data visualizations using Recharts
 * Deep Ocean Intelligence design system
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

// Chart colors matching design system
const COLORS = {
  primary: '#6366F1',   // Indigo
  secondary: '#2DD4BF', // Teal
  accent: '#F43F5E',    // Rose
  grid: '#334155',      // Slate-700
  text: '#94A3B8',      // Slate-400
  background: '#1E293B', // Slate-800
};

const ANOMALY_COLORS = {
  geographic: '#3B82F6',    // Blue
  velocity: '#8B5CF6',      // Purple
  amount: '#F59E0B',        // Amber
  category: '#10B981',      // Emerald
  temporal: '#6366F1',      // Indigo
  merchant_risk: '#F43F5E', // Rose
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-slate-400 text-xs">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-slate-50 font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Amount Distribution Histogram
const AmountHistogram = ({ transactions }) => {
  const data = useMemo(() => {
    if (!transactions?.length) return [];

    const bins = [
      { range: '$0-50', min: 0, max: 50, count: 0 },
      { range: '$50-100', min: 50, max: 100, count: 0 },
      { range: '$100-250', min: 100, max: 250, count: 0 },
      { range: '$250-500', min: 250, max: 500, count: 0 },
      { range: '$500-1K', min: 500, max: 1000, count: 0 },
      { range: '$1K+', min: 1000, max: Infinity, count: 0 },
    ];

    transactions.forEach(txn => {
      const bin = bins.find(b => txn.amount >= b.min && txn.amount < b.max);
      if (bin) bin.count++;
    });

    return bins;
  }, [transactions]);

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Amount Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: COLORS.text, fontSize: 12 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
            />
            <YAxis
              tick={{ fill: COLORS.text, fontSize: 12 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              name="Transactions"
              fill={COLORS.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Hourly Distribution Chart
const HourlyDistribution = ({ metrics }) => {
  const data = useMemo(() => {
    if (!metrics?.temporal_patterns?.hourly_distribution) return [];

    return metrics.temporal_patterns.hourly_distribution.map(item => ({
      hour: `${item.hour}:00`,
      count: item.count,
    }));
  }, [metrics]);

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Hourly Activity Pattern
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: COLORS.text, fontSize: 10 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              interval={3}
            />
            <YAxis
              tick={{ fill: COLORS.text, fontSize: 12 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="count"
              name="Transactions"
              stroke={COLORS.secondary}
              strokeWidth={2}
              fill="url(#hourlyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Anomaly Breakdown Pie Chart
const AnomalyPieChart = ({ metrics }) => {
  const data = useMemo(() => {
    if (!metrics?.anomaly_breakdown?.by_type) return [];

    return Object.entries(metrics.anomaly_breakdown.by_type).map(([type, count]) => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      type,
    }));
  }, [metrics]);

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Anomaly Types
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-500">No anomalies generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Anomaly Types
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: COLORS.text }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={ANOMALY_COLORS[entry.type] || COLORS.primary}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// City Distribution Chart
const CityDistribution = ({ transactions }) => {
  const data = useMemo(() => {
    if (!transactions?.length) return [];

    // Count transactions by city (using customer location)
    // Exclude anomalous transactions as they may have injected locations
    const cityCounts = {};
    transactions.forEach(txn => {
      // Skip geographic anomalies as they have fake locations for "impossible travel"
      if (txn.is_anomaly && txn.anomaly_type === 'geographic') return;

      const city = txn.customer_location?.city;
      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const cityArray = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities

    return cityArray;
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Transaction Locations
        </h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-500">No location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Top Cities by Transactions
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: COLORS.text, fontSize: 12 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="city"
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              name="Transactions"
              fill={COLORS.primary}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Category Distribution Chart
const CategoryDistribution = ({ metrics }) => {
  const data = useMemo(() => {
    if (!metrics?.category_distribution) return [];
    return metrics.category_distribution.slice(0, 8);
  }, [metrics]);

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Top Categories
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: COLORS.text, fontSize: 12 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={{ stroke: COLORS.grid }}
              tickLine={{ stroke: COLORS.grid }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              name="Transactions"
              fill={COLORS.secondary}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Main Charts Component
const Charts = ({ transactions, metrics }) => {
  if (!metrics || !transactions?.length) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">No data to visualize</p>
        <p className="text-slate-500 text-sm mt-2">
          Generate data to see the charts
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AmountHistogram transactions={transactions} />
      <HourlyDistribution metrics={metrics} />
      <AnomalyPieChart metrics={metrics} />
      <CityDistribution transactions={transactions} />
      <div className="lg:col-span-2">
        <CategoryDistribution metrics={metrics} />
      </div>
    </div>
  );
};

export default Charts;
