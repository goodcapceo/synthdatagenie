/**
 * API Service Layer
 * Handles communication with the FastAPI backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for large generations
});

/**
 * Generate synthetic transaction data
 * @param {Object} params - Generation parameters
 * @param {number} params.num_records - Number of transactions (100-100,000)
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @param {number} params.anomaly_rate - Anomaly percentage (0-20)
 * @param {string} params.region - Geographic region
 * @returns {Promise<Object>} Generated data with transactions and metrics
 */
export const generateData = async (params) => {
  try {
    const response = await api.post('/generate', params);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Handle FastAPI validation errors (422)
      const data = error.response.data;
      if (data.detail) {
        // FastAPI validation errors come as array of objects
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map(err => {
            const field = err.loc?.slice(-1)[0] || 'field';
            return `${field}: ${err.msg}`;
          });
          throw new Error(`Validation error: ${messages.join(', ')}`);
        }
        // Simple string error
        if (typeof data.detail === 'string') {
          throw new Error(data.detail);
        }
        // Object error
        throw new Error(JSON.stringify(data.detail));
      }
      throw new Error(`Server error (${error.response.status})`);
    } else if (error.request) {
      throw new Error('Unable to connect to server. Is the backend running?');
    } else {
      throw new Error(error.message || 'Failed to generate data');
    }
  }
};

/**
 * Check API health status
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API is not available');
  }
};

/**
 * Get anomaly type definitions
 * @returns {Promise<Object>} Anomaly types with descriptions
 */
export const getAnomalyTypes = async () => {
  try {
    const response = await api.get('/anomaly-types');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch anomaly types');
  }
};

/**
 * Download data as CSV
 * @param {Array} transactions - Transaction array
 * @param {string} filename - Output filename
 */
export const downloadCSV = (transactions, filename = 'transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    console.warn('No transactions to download');
    return;
  }

  // Flatten nested objects for CSV
  const flattenTransaction = (txn) => ({
    transaction_id: txn.transaction_id,
    timestamp: txn.timestamp,
    customer_id: txn.customer_id,
    merchant_id: txn.merchant_id,
    merchant_name: txn.merchant_name,
    merchant_category: txn.merchant_category,
    mcc_code: txn.mcc_code,
    amount: txn.amount,
    currency: txn.currency,
    transaction_type: txn.transaction_type,
    card_last_4: txn.card_last_4,
    customer_city: txn.customer_location?.city,
    customer_state: txn.customer_location?.state,
    customer_zip: txn.customer_location?.zip,
    merchant_city: txn.merchant_location?.city,
    merchant_state: txn.merchant_location?.state,
    merchant_zip: txn.merchant_location?.zip,
    distance_km: txn.distance_km,
    is_online: txn.is_online,
    device_type: txn.device_type,
    is_anomaly: txn.is_anomaly,
    anomaly_type: txn.anomaly_type || '',
    risk_score: txn.risk_score,
  });

  const flatData = transactions.map(flattenTransaction);
  const headers = Object.keys(flatData[0]).join(',');
  const rows = flatData.map(t =>
    Object.values(t).map(v =>
      typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    ).join(',')
  ).join('\n');

  const csv = `${headers}\n${rows}`;
  downloadFile(csv, filename, 'text/csv');
};

/**
 * Download data as JSON
 * @param {Object} data - Data object to download
 * @param {string} filename - Output filename
 */
export const downloadJSON = (data, filename = 'transactions.json') => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

/**
 * Helper to download file
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default api;
