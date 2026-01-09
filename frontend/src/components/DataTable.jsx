/**
 * DataTable Component
 * Transaction list with anomaly highlighting
 * Deep Ocean Intelligence design system
 */

import { useState, useMemo } from 'react';
import {
  Globe,
  Zap,
  DollarSign,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

const ANOMALY_CONFIG = {
  geographic: { icon: Globe, label: 'Geo Jump', emoji: '🌍' },
  velocity: { icon: Zap, label: 'High Velocity', emoji: '⚡' },
  amount: { icon: DollarSign, label: 'Unusual Amount', emoji: '💰' },
  category: { icon: Tag, label: 'New Category', emoji: '🏷️' },
  temporal: { icon: Clock, label: 'Odd Hour', emoji: '🕐' },
  merchant_risk: { icon: AlertTriangle, label: 'High Risk', emoji: '⚠️' },
};

const AnomalyBadge = ({ type }) => {
  const config = ANOMALY_CONFIG[type] || { icon: AlertTriangle, label: type, emoji: '❓' };
  const Icon = config.icon;

  return (
    <span className="badge-anomaly">
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
};

const NormalBadge = () => (
  <span className="badge-normal">
    <CheckCircle className="w-3 h-3" />
    Normal
  </span>
);

const DataTable = ({ transactions }) => {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnomalies, setFilterAnomalies] = useState('all'); // 'all', 'anomalies', 'normal'

  // Filter and paginate transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter(txn => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        txn.merchant_name.toLowerCase().includes(searchLower) ||
        txn.merchant_category.toLowerCase().includes(searchLower) ||
        txn.transaction_id.toLowerCase().includes(searchLower) ||
        txn.customer_id.toLowerCase().includes(searchLower);

      // Anomaly filter
      const matchesFilter =
        filterAnomalies === 'all' ||
        (filterAnomalies === 'anomalies' && txn.is_anomaly) ||
        (filterAnomalies === 'normal' && !txn.is_anomaly);

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchTerm, filterAnomalies]);

  const paginatedTransactions = useMemo(() => {
    const start = page * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">No transactions to display</p>
        <p className="text-slate-500 text-sm mt-2">
          Generate data to see the transaction table
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="input-field pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex bg-slate-800 rounded-lg p-1">
            {['all', 'anomalies', 'normal'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setFilterAnomalies(filter);
                  setPage(0);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterAnomalies === filter
                    ? 'bg-slate-700 text-slate-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'anomalies' ? 'Anomalies' : 'Normal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing {paginatedTransactions.length} of {filteredTransactions.length.toLocaleString()} transactions
        {filterAnomalies !== 'all' && ` (filtered: ${filterAnomalies})`}
      </p>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Transaction</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
                <th className="px-4 py-3 text-left font-medium">Merchant</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Distance</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedTransactions.map((txn) => (
                <tr
                  key={txn.transaction_id}
                  className="h-12 hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-slate-300 truncate max-w-[140px]">
                      {txn.transaction_id.replace('TXN_', '')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm ${txn.anomaly_type === 'temporal' ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
                      {formatTimestamp(txn.timestamp)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm truncate max-w-[180px] ${
                      txn.anomaly_type === 'merchant_risk' ? 'text-rose-400 font-medium' : 'text-slate-200'
                    }`}>
                      {txn.merchant_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm ${
                      txn.anomaly_type === 'category' ? 'text-rose-400 font-medium' : 'text-slate-400'
                    }`}>
                      {txn.merchant_category}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono tabular-nums text-sm ${
                      txn.anomaly_type === 'amount' ? 'text-rose-400 font-bold' : 'text-slate-200'
                    }`}>
                      {formatAmount(txn.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono tabular-nums text-sm ${
                      txn.anomaly_type === 'geographic' ? 'text-rose-400 font-bold' : 'text-slate-400'
                    }`}>
                      {txn.is_online ? 'Online' : `${txn.distance_km.toFixed(1)} km`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {txn.is_anomaly ? (
                      <AnomalyBadge type={txn.anomaly_type} />
                    ) : (
                      <NormalBadge />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/50">
            <p className="text-sm text-slate-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
