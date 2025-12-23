/**
 * API Client
 * ===========
 * Helper functions for making API requests to the backend.
 * 
 * The Vite dev server is configured to proxy /api requests to localhost:3001,
 * so you can use relative URLs for all API calls.
 */

import type {
  HealthRecord,
  HealthRecordStats,
  Node,
  NodeStats,
  PaginatedResponse,
  PlatformStats,
  Staker,
  StakerStats,
  StatsOverview,
  Transaction,
  TransactionStats,
} from '../types'

const API_BASE = '/api'

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  
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
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return (await response.json()) as T
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

/**
 * Build query string from params object
 */
function buildQueryString(params: Record<string, string | number | null | undefined>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// ============================================
// Platform Stats
// ============================================

export async function getStats(): Promise<PlatformStats> {
  return fetchAPI('/stats')
}

export async function getStatsOverview(): Promise<StatsOverview> {
  return fetchAPI('/stats/overview')
}

// ============================================
// Nodes
// ============================================

export async function getNodes(params: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<Node>> {
  return fetchAPI(`/nodes${buildQueryString(params)}`)
}

export async function getNodeStats(): Promise<NodeStats> {
  return fetchAPI('/nodes/stats')
}

export async function getNodeById(nodeId: string): Promise<Node> {
  return fetchAPI(`/nodes/${nodeId}`)
}

// ============================================
// Stakers
// ============================================

export async function getStakers(
  params: Record<string, string | number | undefined> = {},
): Promise<PaginatedResponse<Staker>> {
  return fetchAPI(`/stakers${buildQueryString(params)}`)
}

export async function getStakerStats(): Promise<StakerStats> {
  return fetchAPI('/stakers/stats')
}

export async function getStakerById(stakerId: string): Promise<Staker> {
  return fetchAPI(`/stakers/${stakerId}`)
}

export async function getStakerByWallet(address: string): Promise<Staker> {
  return fetchAPI(`/stakers/wallet/${address}`)
}

// ============================================
// Health Records
// ============================================

export async function getHealthRecords(
  params: Record<string, string | number | undefined> = {},
): Promise<PaginatedResponse<HealthRecord>> {
  return fetchAPI(`/health-records${buildQueryString(params)}`)
}

export async function getHealthRecordStats(): Promise<HealthRecordStats> {
  return fetchAPI('/health-records/stats')
}

export async function getHealthRecordById(recordId: string): Promise<HealthRecord> {
  return fetchAPI(`/health-records/${recordId}`)
}

export async function getDataTypes(): Promise<string[]> {
  return fetchAPI('/health-records/data-types')
}

export async function getDeviceTypes(): Promise<string[]> {
  return fetchAPI('/health-records/device-types')
}

// ============================================
// Epochs
// ============================================

export async function getEpochs(params: Record<string, string | number | undefined> = {}): Promise<unknown> {
  return fetchAPI(`/epochs${buildQueryString(params)}`)
}

export async function getCurrentEpoch(): Promise<unknown> {
  return fetchAPI('/epochs/current')
}

export async function getEpochStats(): Promise<unknown> {
  return fetchAPI('/epochs/stats')
}

export async function getEpochByNumber(epochNumber: number): Promise<unknown> {
  return fetchAPI(`/epochs/${epochNumber}`)
}

// ============================================
// Transactions
// ============================================

export async function getTransactions(
  params: Record<string, string | number | undefined> = {},
): Promise<PaginatedResponse<Transaction>> {
  return fetchAPI(`/transactions${buildQueryString(params)}`)
}

export async function getTransactionStats(): Promise<TransactionStats> {
  return fetchAPI('/transactions/stats')
}

export async function getTransactionTypes(): Promise<string[]> {
  return fetchAPI('/transactions/types')
}

export async function getTransactionByHash(txHash: string): Promise<Transaction> {
  return fetchAPI(`/transactions/${txHash}`)
}
