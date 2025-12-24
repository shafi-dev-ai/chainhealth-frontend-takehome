import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { getStakers, getStakerStats } from '../api'
import {
  formatCompactNumber,
  formatNumber,
  formatTokenAmount,
  shortenAddress,
} from '../utils/format'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Pagination from '../components/Pagination'
import SkeletonTable from '../components/SkeletonTable'
import StatCard from '../components/StatCard'
import type { Pagination as PaginationType, Staker, StakerStats } from '../types'

const SORT_FIELDS = [
  { value: 'stakedAmount', label: 'Stake' },
  { value: 'pendingRewards', label: 'Pending rewards' },
  { value: 'claimedRewards', label: 'Claimed rewards' },
  { value: 'stakingMultiplier', label: 'Multiplier' },
]

function Staking() {
  const [stakers, setStakers] = useState<Staker[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [stats, setStats] = useState<StakerStats | null>(null)
  const [filters, setFilters] = useState({
    minStake: '',
    maxStake: '',
    sortBy: 'stakedAmount',
    sortOrder: 'desc',
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = async () => {
    try {
      const statsData = await getStakerStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load staker stats', err)
    }
  }

  const loadStakers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getStakers({
        page,
        limit: 12,
        minStake: filters.minStake,
        maxStake: filters.maxStake,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      setStakers(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stakers.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadStakers()
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
      minStake: '',
      maxStake: '',
      sortBy: 'stakedAmount',
      sortOrder: 'desc',
    })
    setPage(1)
  }

  const lockData = useMemo(() => {
    if (!stats?.byLockPeriod) {
      return []
    }
    return Object.entries(stats.byLockPeriod)
      .map(([label, count]) => ({
        label,
        count,
        days: Number.parseInt(label, 10),
      }))
      .sort((a, b) => a.days - b.days)
  }, [stats])

  const maxLockCount = lockData.reduce((max, item) => Math.max(max, item.count), 0)

  const renderTable = () => {
    if (loading) {
      return <SkeletonTable rows={6} columns={7} />
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadStakers} />
    }

    if (!stakers.length) {
      return (
        <EmptyState
          title="No stakers found"
          description="Adjust stake filters or reset to view all stakers."
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
                <th>Staker ID</th>
                <th>Wallet</th>
                <th>Staked</th>
                <th>Pending Rewards</th>
                <th>Claimed Rewards</th>
                <th>Multiplier</th>
                <th>Lock Period</th>
              </tr>
            </thead>
            <tbody>
              {stakers.map((staker) => (
                <tr key={staker.stakerId}>
                  <td className="mono">{staker.stakerId}</td>
                  <td className="address-short">{shortenAddress(staker.walletAddress)}</td>
                  <td>{formatTokenAmount(staker.stakedAmount)}</td>
                  <td>{formatTokenAmount(staker.pendingRewards)}</td>
                  <td>{formatTokenAmount(staker.claimedRewards)}</td>
                  <td>{formatNumber(staker.stakingMultiplier, 2)}x</td>
                  <td>{staker.lockPeriod} days</td>
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
          <p className="page-kicker">Staking Hub</p>
          <h1 className="page-title">Staker Intelligence</h1>
          <p className="page-subtitle">
            Explore capital commitments, reward cadence, and staking lock behavior.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="grid-4 stats-grid">
          <StatCard
            label="Total Stakers"
            value={formatNumber(stats.totalStakers)}
            note={`Avg stake: ${formatTokenAmount(stats.avgStake)}`}
          />
          <StatCard
            label="Total Staked"
            value={formatTokenAmount(stats.totalStaked)}
            note={`Avg multiplier: ${formatNumber(stats.avgMultiplier, 2)}x`}
          />
          <StatCard
            label="Pending Rewards"
            value={formatTokenAmount(stats.totalPendingRewards)}
            note={`Claimed: ${formatTokenAmount(stats.totalClaimedRewards)}`}
          />
          <StatCard
            label="Top Stake"
            value={
              stats.topStakers?.length
                ? formatTokenAmount(stats.topStakers[0].stakedAmount)
                : '-'
            }
            note="Leaderboard leader"
          />
        </div>
      ) : null}

      <div className="grid-2">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Lock Period Distribution</h3>
            <span className="card-subtitle">Active staking commitments</span>
          </div>
          <div className="chart-bars compact">
            {lockData.map((item) => {
              const height = maxLockCount ? Math.max(18, (item.count / maxLockCount) * 140) : 18
              return (
                <div className="chart-bar" key={item.label} title={`${item.count} stakers`}>
                  <div className="chart-bar-fill" style={{ height: `${height}px` }} />
                  <span className="chart-bar-label">{item.label.replace(' days', 'd')}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-footnote">
            Total commitments: {formatCompactNumber(stats?.totalStakers)}
          </div>
        </div>

        <div className="card list-card">
          <div className="card-header">
            <h3>Top Stakers</h3>
            <span className="card-subtitle">Highest staked balances</span>
          </div>
          <div className="stacked-list">
            {(stats?.topStakers || []).map((staker, index) => (
              <div className="stacked-item" key={staker.stakerId}>
                <div>
                  <span className="stacked-rank">#{index + 1}</span>
                  <span className="address-short">{shortenAddress(staker.walletAddress)}</span>
                </div>
                <strong>{formatTokenAmount(staker.stakedAmount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="section-header">
          <h2>Staker Directory</h2>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            Reset filters
          </button>
        </div>
        <div className="filters">
          <input
            type="number"
            name="minStake"
            value={filters.minStake}
            onChange={handleFilterChange}
            placeholder="Min stake"
          />
          <input
            type="number"
            name="maxStake"
            value={filters.maxStake}
            onChange={handleFilterChange}
            placeholder="Max stake"
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

export default Staking
