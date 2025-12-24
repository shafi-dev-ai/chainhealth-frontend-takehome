import { useEffect, useMemo, useState } from 'react'
import { getHealthRecordStats, getStats, getStatsOverview } from '../api'
import {
  formatCompactNumber,
  formatNumber,
  formatPercent,
  formatTokenAmount,
} from '../utils/format'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'
import type { HealthRecordStats, PlatformStats, StatsOverview } from '../types'

function Dashboard() {
  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [recordStats, setRecordStats] = useState<HealthRecordStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [overviewData, statsData, recordStatsData] = await Promise.all([
        getStatsOverview(),
        getStats(),
        getHealthRecordStats(),
      ])
      setOverview(overviewData)
      setStats(statsData)
      setRecordStats(recordStatsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const activity = recordStats?.recordsByDay || []
  const maxCount = useMemo(() => {
    return activity.reduce((max, item) => Math.max(max, item.count), 0)
  }, [activity])

  if (loading) {
    return <LoadingState label="Loading dashboard..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />
  }

  if (!overview || !stats || !recordStats) {
    return (
      <EmptyState
        title="No dashboard data yet"
        description="Refresh to load the latest network metrics."
        actionLabel="Refresh"
        onAction={loadDashboard}
      />
    )
  }

  const healthScore = Number.parseFloat(stats.network.networkHealth || 0)
  const healthScoreSafe = Number.isFinite(healthScore) ? healthScore : 0

  const statCards = [
    {
      label: 'Active Nodes',
      value: formatNumber(overview.activeNodes),
      note: `${formatNumber(stats.network.totalNodes)} total nodes`,
    },
    {
      label: 'Total Staked',
      value: formatTokenAmount(overview.totalStaked),
      note: `${formatNumber(stats.staking.totalStakers)} stakers`,
    },
    {
      label: 'Records Validated',
      value: formatNumber(overview.healthRecordsValidated),
      note: `${formatPercent(stats.healthData.validationRate)} validation rate`,
    },
    {
      label: 'Rewards Distributed',
      value: formatTokenAmount(overview.totalRewardsDistributed),
      note: `Epoch ${stats.rewards.currentEpoch}`,
    },
  ]

  const snapshotItems = [
    {
      label: 'Avg node uptime',
      value: formatPercent(stats.network.avgUptime),
    },
    {
      label: 'Unique users',
      value: formatNumber(stats.healthData.uniqueUsers),
    },
    {
      label: 'Pending records',
      value: formatNumber(stats.healthData.pendingRecords),
    },
    {
      label: 'Tx confirmed',
      value: formatPercent(stats.transactions.confirmedRate),
    },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">ChainHealth AI</p>
          <h1 className="page-title">Network Dashboard</h1>
          <p className="page-subtitle">
            Live validation, staking, and DePIN performance signals across the network.
          </p>
        </div>
      </div>

      <div className="grid-4 stats-grid">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            note={card.note}
          />
        ))}
      </div>

      <div className="grid-2 dashboard-grid">
        <div className="card health-card">
          <div className="card-header">
            <h3>Network Health</h3>
            <span className="health-score">{healthScoreSafe.toFixed(1)}%</span>
          </div>
          <div className="health-meter">
            <div
              className="health-meter-fill"
              style={{ width: `${healthScoreSafe}%` }}
            />
          </div>
          <div className="health-meta">
            <div>
              <span>Avg uptime</span>
              <strong>{formatPercent(stats.network.avgUptime)}</strong>
            </div>
            <div>
              <span>Active node rate</span>
              <strong>
                {formatPercent(
                  (stats.network.activeNodes / stats.network.totalNodes) * 100,
                )}
              </strong>
            </div>
            <div>
              <span>Validation rate</span>
              <strong>{formatPercent(stats.healthData.validationRate)}</strong>
            </div>
          </div>
        </div>

        <div className="card activity-card">
          <div className="card-header">
            <h3>Validation Pulse</h3>
            <span className="card-subtitle">Last 7 days</span>
          </div>
          <div className="chart-bars">
            {activity.map((item) => {
              const height = maxCount ? Math.max(18, (item.count / maxCount) * 160) : 18
              return (
                <div key={item.date} className="chart-bar" title={`${item.count} records`}>
                  <div className="chart-bar-fill" style={{ height: `${height}px` }} />
                  <span className="chart-bar-label">{item.date.slice(5)}</span>
                </div>
              )
            })}
          </div>
          <div className="chart-footnote">
            Total records: {formatCompactNumber(recordStats.totalRecords)}
          </div>
        </div>
      </div>

      <div className="card snapshot-card">
        <div className="card-header">
          <h3>Network Snapshot</h3>
          <span className="card-subtitle">Key signals at a glance</span>
        </div>
        <div className="snapshot-grid">
          {snapshotItems.map((item) => (
            <div key={item.label} className="snapshot-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
