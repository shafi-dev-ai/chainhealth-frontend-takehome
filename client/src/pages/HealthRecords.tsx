import { useEffect, useState, type ChangeEvent } from 'react'
import {
  getDataTypes,
  getDeviceTypes,
  getHealthRecordStats,
  getHealthRecords,
} from '../api'
import {
  formatDateTime,
  formatNumber,
  shortenAddress,
  getStatusClass,
} from '../utils/format'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Pagination from '../components/Pagination'
import SkeletonTable from '../components/SkeletonTable'
import StatCard from '../components/StatCard'
import type { HealthRecord, HealthRecordStats, Pagination as PaginationType } from '../types'

const VALIDATION_STATUSES = ['VALIDATED', 'PENDING', 'REJECTED']

function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [dataTypes, setDataTypes] = useState<string[]>([])
  const [deviceTypes, setDeviceTypes] = useState<string[]>([])
  const [stats, setStats] = useState<HealthRecordStats | null>(null)
  const [filters, setFilters] = useState({
    dataType: '',
    deviceType: '',
    validationStatus: '',
    userAddress: '',
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFilters = async () => {
    try {
      const [dataTypeOptions, deviceTypeOptions] = await Promise.all([
        getDataTypes(),
        getDeviceTypes(),
      ])
      setDataTypes(dataTypeOptions)
      setDeviceTypes(deviceTypeOptions)
    } catch (err) {
      console.error('Failed to load filter options', err)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getHealthRecordStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load health record stats', err)
    }
  }

  const loadRecords = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getHealthRecords({
        page,
        limit: 12,
        sortBy: 'timestamp',
        sortOrder: 'desc',
        ...filters,
      })
      setRecords(response.data)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load health records.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFilters()
    loadStats()
  }, [])

  useEffect(() => {
    loadRecords()
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
      dataType: '',
      deviceType: '',
      validationStatus: '',
      userAddress: '',
    })
    setPage(1)
  }

  const renderTable = () => {
    if (loading) {
      return <SkeletonTable rows={6} columns={7} />
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadRecords} />
    }

    if (!records.length) {
      return (
        <EmptyState
          title="No records found"
          description="Adjust the filters to see more health data."
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
                <th>Record ID</th>
                <th>User</th>
                <th>Data Type</th>
                <th>Value</th>
                <th>Device</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.recordId}>
                  <td className="mono">{record.recordId}</td>
                  <td className="address-short">{shortenAddress(record.userAddress)}</td>
                  <td>{record.dataType.replace(/_/g, ' ')}</td>
                  <td>
                    {formatNumber(record.value, record.dataType === 'BLOOD_OXYGEN' ? 1 : 0)}{' '}
                    {record.unit}
                  </td>
                  <td>{record.deviceType.replace(/_/g, ' ')}</td>
                  <td>
                    <span className={`badge ${getStatusClass(record.validationStatus)}`}>
                      {record.validationStatus}
                    </span>
                  </td>
                  <td>{formatDateTime(record.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </>
    )
  }

  const topDevice = stats
    ? Object.entries(stats.byDeviceType || {}).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Health Intelligence</p>
          <h1 className="page-title">Health Records</h1>
          <p className="page-subtitle">
            Browse validated wellness data streamed from connected devices.
          </p>
        </div>
      </div>

      {stats ? (
        <div className="grid-4 stats-grid">
          <StatCard
            label="Total Records"
            value={formatNumber(stats.totalRecords)}
            note={`Unique users: ${formatNumber(stats.uniqueUsers)}`}
          />
          <StatCard
            label="Validated"
            value={formatNumber(stats.validatedRecords)}
            note={`Rate: ${stats.validationRate}%`}
          />
          <StatCard
            label="Pending Review"
            value={formatNumber(stats.pendingRecords)}
            note={`Rejected: ${formatNumber(stats.rejectedRecords)}`}
          />
          <StatCard
            label="Top Device"
            value={topDevice || '-'}
            note="Most active source"
          />
        </div>
      ) : null}

      <div className="card table-card">
        <div className="section-header">
          <h2>Record Feed</h2>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            Reset filters
          </button>
        </div>
        <div className="filters">
          <select name="dataType" value={filters.dataType} onChange={handleFilterChange}>
            <option value="">All data types</option>
            {dataTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select name="deviceType" value={filters.deviceType} onChange={handleFilterChange}>
            <option value="">All devices</option>
            {deviceTypes.map((device) => (
              <option key={device} value={device}>
                {device.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            name="validationStatus"
            value={filters.validationStatus}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            {VALIDATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="userAddress"
            value={filters.userAddress}
            onChange={handleFilterChange}
            placeholder="Search by user address"
          />
        </div>
        {renderTable()}
      </div>
    </div>
  )
}

export default HealthRecords
