import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  getTransactionStats,
  getTransactionTypes,
  getTransactions,
} from '../api'
import {
  formatDateTime,
  formatCompactNumber,
  formatNumber,
  formatTokenAmount,
  getStatusClass,
  shortenAddress,
  shortenHash,
} from '../utils/format'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Pagination from '../components/Pagination'
import SkeletonTable from '../components/SkeletonTable'
import StatCard from '../components/StatCard'
import type { Pagination as PaginationType, Transaction, TransactionStats } from '../types'

const STATUS_OPTIONS = ['CONFIRMED', 'PENDING', 'FAILED']
const SORT_FIELDS = [
  { value: 'timestamp', label: 'Timestamp' },
  { value: 'amount', label: 'Amount' },
  { value: 'gasUsed', label: 'Gas used' },
]

function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [types, setTypes] = useState<string[]>([])
  const [filters, setFilters] = useState({
    txType: '',
    status: '',
    address: '',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMeta = async () => {
    try {
      const [statsData, typesData] = await Promise.all([
        getTransactionStats(),
        getTransactionTypes(),
      ])
      setStats(statsData)
      setTypes(typesData)
    } catch (err) {
      console.error('Failed to load transaction metadata', err)
    }
  }

  const loadTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getTransactions({
        page,
        limit: 12,
        txType: filters.txType,
        status: filters.status,
        address: filters.address,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      setTransactions(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError(err?.message || 'Failed to load transactions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeta()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [page, filters])

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPage(1)
  }

  const handleReset = () => {
    setFilters({
      txType: '',
      status: '',
      address: '',
      sortBy: 'timestamp',
      sortOrder: 'desc',
    })
    setPage(1)
  }

  const typeChart = useMemo(() => {
    if (!stats?.byType) {
      return []
    }
    return Object.entries(stats.byType)
      .map(([label, count]) => ({
        label,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [stats])

  const maxTypeCount = typeChart.reduce((max, item) => Math.max(max, item.count), 0)

  const renderTable = () => {
    if (loading) {
      return <SkeletonTable rows={6} columns={8} />
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadTransactions} />
    }

    if (!transactions.length) {
      return (
        <EmptyState
          title="No transactions matched"
          description="Update filters or reset to view the full ledger."
          actionLabel="Clear filters"
          onAction={handleReset}
        />
      )
    }

    return (
      <>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Gas Used</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.txHash}>
                  <td className="mono">{shortenHash(tx.txHash)}</td>
                  <td>{tx.txType.replace(/_/g, ' ')}</td>
                  <td className="address-short">{shortenAddress(tx.from)}</td>
                  <td className="address-short">{shortenAddress(tx.to)}</td>
                  <td>{formatTokenAmount(tx.amount)}</td>
                  <td>{formatNumber(tx.gasUsed)}</td>
                  <td>
                    <span className={`badge ${getStatusClass(tx.status)}`}>{tx.status}</span>
                  </td>
                  <td>{formatDateTime(tx.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Ledger Flow</p>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            Track staking, reward, and transfer activity across the ChainHealth network.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="grid-4 stats-grid">
          <StatCard
            label="Total Transactions"
            value={formatNumber(stats.totalTransactions)}
            note={`Success rate: ${stats.successRate}%`}
          />
          <StatCard
            label="Total Volume"
            value={formatTokenAmount(stats.totalVolume)}
            note={`Avg gas price: ${formatNumber(stats.avgGasPrice)} gwei`}
          />
          <StatCard
            label="Pending"
            value={formatNumber(stats.pendingTxs)}
            note={`Failed: ${formatNumber(stats.failedTxs)}`}
          />
          <StatCard
            label="Gas Used"
            value={formatCompactNumber(stats.totalGasUsed)}
            note="Total network cost"
          />
        </div>
      ) : null}

      <div className="grid-2">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Transaction Mix</h3>
            <span className="card-subtitle">Count by type</span>
          </div>
          <div className="chart-bars compact">
            {typeChart.map((item) => {
              const height = maxTypeCount ? Math.max(18, (item.count / maxTypeCount) * 140) : 18
              return (
                <div className="chart-bar" key={item.label} title={`${item.count} txs`}>
                  <div className="chart-bar-fill" style={{ height: `${height}px` }} />
                  <span className="chart-bar-label">{item.label.replace(/_/g, ' ')}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-footnote">
            Most active type: {typeChart[0]?.label?.replace(/_/g, ' ') || '-'}
          </div>
        </div>

        <div className="card list-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <span className="card-subtitle">Latest 10 transactions</span>
          </div>
          <div className="stacked-list">
            {(stats?.recentTxs || []).map((tx) => (
              <div className="stacked-item" key={tx.txHash}>
                <div>
                  <span className="stacked-label">{tx.txType.replace(/_/g, ' ')}</span>
                  <span className="address-short">{shortenHash(tx.txHash)}</span>
                </div>
                <div className="stacked-meta">
                  <span>{formatTokenAmount(tx.amount)}</span>
                  <span className={`badge ${getStatusClass(tx.status)}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="section-header">
          <h2>Transaction Ledger</h2>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            Reset filters
          </button>
        </div>
        <div className="filters">
          <select name="txType" value={filters.txType} onChange={handleFilterChange}>
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="address"
            value={filters.address}
            onChange={handleFilterChange}
            placeholder="Search wallet address"
          />
          <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
            {SORT_FIELDS.map((field) => (
              <option key={field.value} value={field.value}>
                Sort by {field.label}
              </option>
            ))}
          </select>
          <select name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        {renderTable()}
      </div>
    </div>
  )
}

export default Transactions
