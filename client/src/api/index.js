/**
 * API Client
 * ===========
 * Helper functions for making API requests to the backend.
 * 
 * The Vite dev server is configured to proxy /api requests to localhost:3001,
 * so you can use relative URLs for all API calls.
 */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Build query string from params object
 */
function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================
// Platform Stats
// ============================================

export async function getStats() {
  return fetchAPI('/stats');
}

export async function getStatsOverview() {
  return fetchAPI('/stats/overview');
}

// ============================================
// Nodes
// ============================================

export async function getNodes(params = {}) {
  return fetchAPI(`/nodes${buildQueryString(params)}`);
}

export async function getNodeStats() {
  return fetchAPI('/nodes/stats');
}

export async function getNodeById(nodeId) {
  return fetchAPI(`/nodes/${nodeId}`);
}

// ============================================
// Stakers
// ============================================

export async function getStakers(params = {}) {
  return fetchAPI(`/stakers${buildQueryString(params)}`);
}

export async function getStakerStats() {
  return fetchAPI('/stakers/stats');
}

export async function getStakerById(stakerId) {
  return fetchAPI(`/stakers/${stakerId}`);
}

export async function getStakerByWallet(address) {
  return fetchAPI(`/stakers/wallet/${address}`);
}

// ============================================
// Health Records
// ============================================

export async function getHealthRecords(params = {}) {
  return fetchAPI(`/health-records${buildQueryString(params)}`);
}

export async function getHealthRecordStats() {
  return fetchAPI('/health-records/stats');
}

export async function getHealthRecordById(recordId) {
  return fetchAPI(`/health-records/${recordId}`);
}

export async function getDataTypes() {
  return fetchAPI('/health-records/data-types');
}

export async function getDeviceTypes() {
  return fetchAPI('/health-records/device-types');
}

// ============================================
// Epochs
// ============================================

export async function getEpochs(params = {}) {
  return fetchAPI(`/epochs${buildQueryString(params)}`);
}

export async function getCurrentEpoch() {
  return fetchAPI('/epochs/current');
}

export async function getEpochStats() {
  return fetchAPI('/epochs/stats');
}

export async function getEpochByNumber(epochNumber) {
  return fetchAPI(`/epochs/${epochNumber}`);
}

// ============================================
// Transactions
// ============================================

export async function getTransactions(params = {}) {
  return fetchAPI(`/transactions${buildQueryString(params)}`);
}

export async function getTransactionStats() {
  return fetchAPI('/transactions/stats');
}

export async function getTransactionTypes() {
  return fetchAPI('/transactions/types');
}

export async function getTransactionByHash(txHash) {
  return fetchAPI(`/transactions/${txHash}`);
}

