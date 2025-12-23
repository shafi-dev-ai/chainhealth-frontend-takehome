import { useEffect, useState, type ChangeEvent } from 'react'
import { getNodes, getNodeStats } from '../api'
import {
  formatNumber,
  formatPercent,
  formatTokenAmount,
  getStatusClass,
} from '../utils/format'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Pagination from '../components/Pagination'
import SkeletonTable from '../components/SkeletonTable'
import StatCard from '../components/StatCard'
import type { Node, NodeStats, Pagination as PaginationType } from '../types'

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'PENDING', 'SLASHED']
const NODE_TYPES = ['VALIDATOR', 'LIGHT', 'RELAY', 'ARCHIVE']
const SORT_FIELDS = [
  { value: 'stakedAmount', label: 'Stake' },
  { value: 'uptime', label: 'Uptime' },
  { value: 'totalRewardsEarned', label: 'Rewards' },
  { value: 'validationsPerformed', label: 'Validations' },
]

function Nodes() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [stats, setStats] = useState<NodeStats | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    nodeType: '',
    region: '',
    sortBy: 'stakedAmount',
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = async () => {
    try {
      const statsData = await getNodeStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load node stats', err)
    }
  }

  const loadNodes = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getNodes({
        page,
        limit: 12,
        status: filters.status,
        nodeType: filters.nodeType,
        region: filters.region,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      setNodes(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError(err?.message || 'Failed to load nodes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadNodes()
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
      status: '',
      nodeType: '',
      region: '',
      sortBy: 'stakedAmount',
      sortOrder: 'desc',
    })
    setPage(1)
  }

  const regionOptions = stats ? Object.keys(stats.byRegion).sort() : []

  const renderTable = () => {
    if (loading) {
      return <SkeletonTable rows={6} columns={7} />
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadNodes} />
    }

    if (!nodes.length) {
      return (
        <EmptyState
          title="No nodes matched"
          description="Try different filters or clear the current selections."
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
                <th>Node ID</th>
                <th>Type</th>
                <th>Region</th>
                <th>Status</th>
                <th>Uptime</th>
                <th>Stake</th>
                <th>Validations</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.nodeId}>
                  <td className="mono">{node.nodeId}</td>
                  <td>{node.nodeType.replace(/_/g, ' ')}</td>
                  <td>{node.region.replace(/-/g, ' ')}</td>
                  <td>
                    <span className={`badge ${getStatusClass(node.status)}`}>
                      {node.status}
                    </span>
                  </td>
                  <td>{formatPercent(node.uptime)}</td>
                  <td>{formatTokenAmount(node.stakedAmount)}</td>
                  <td>{formatNumber(node.validationsPerformed)}</td>
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
          <p className="page-kicker">DePIN Network</p>
          <h1 className="page-title">Node Operations</h1>
          <p className="page-subtitle">
            Monitor validator activity, uptime, and stake distribution across regions.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="grid-4 stats-grid">
          <StatCard
            label="Total Nodes"
            value={formatNumber(stats.totalNodes)}
            note={`Active: ${formatNumber(stats.activeNodes)}`}
          />
          <StatCard
            label="Total Staked"
            value={formatTokenAmount(stats.totalStaked)}
            note={`Rewards: ${formatTokenAmount(stats.totalRewards)}`}
          />
          <StatCard
            label="Avg Uptime"
            value={formatPercent(stats.avgUptime)}
            note="Network average"
          />
          <StatCard
            label="Validations"
            value={formatNumber(stats.totalValidations)}
            note="All time"
          />
        </div>
      ) : null}

      <div className="card table-card">
        <div className="section-header">
          <h2>Node Directory</h2>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            Reset filters
          </button>
        </div>
        <div className="filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="nodeType" value={filters.nodeType} onChange={handleFilterChange}>
            <option value="">All node types</option>
            {NODE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select name="region" value={filters.region} onChange={handleFilterChange}>
            <option value="">All regions</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region.replace(/-/g, ' ')}
              </option>
            ))}
          </select>
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

export default Nodes
