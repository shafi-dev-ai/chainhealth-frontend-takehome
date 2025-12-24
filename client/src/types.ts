export type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasMore: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: Pagination
}

export type StatsOverview = {
  activeNodes: number
  totalStaked: string
  healthRecordsValidated: number
  totalRewardsDistributed: string
  totalUsers: number
  totalTransactions: number
}

export type PlatformStats = {
  metadata?: {
    generatedAt: string
    version: string
  }
  network: {
    totalNodes: number
    activeNodes: number
    totalNodeStake: string
    avgUptime: string
    networkHealth: string
  }
  staking: {
    totalStakers: number
    totalStaked: string
    totalPendingRewards: string
    avgStakePerUser: string
  }
  healthData: {
    totalRecords: number
    validatedRecords: number
    pendingRecords: number
    validationRate: string
    uniqueUsers: number
  }
  rewards: {
    totalEpochs: number
    currentEpoch: number
    totalRewardsDistributed: string
    avgRewardsPerEpoch: string
  }
  transactions: {
    totalTransactions: number
    totalVolume: string
    confirmedRate: string
  }
}

export type HealthRecord = {
  recordId: string
  userAddress: string
  dataType: string
  value: number
  unit: string
  deviceType: string
  timestamp: number
  validationStatus: string
}

export type HealthRecordStats = {
  totalRecords: number
  validatedRecords: number
  pendingRecords: number
  rejectedRecords: number
  validationRate: string
  uniqueUsers: number
  byDataType: Record<string, number>
  byDeviceType: Record<string, number>
  recordsByDay: Array<{ date: string; count: number }>
}

export type Node = {
  nodeId: string
  operatorAddress?: string
  nodeType: string
  region: string
  status: string
  uptime: string
  stakedAmount: string
  totalRewardsEarned?: string
  validationsPerformed: number
  validationsSuccessful?: number
  validationsFailed?: number
  slashingEvents?: number
  registeredAt?: number
  lastHeartbeat?: number
  metadata?: {
    version?: string
    hardware?: string
    bandwidth?: number
  }
}

export type NodeStats = {
  totalNodes: number
  activeNodes: number
  totalStaked: string
  totalRewards: string
  avgUptime: string
  totalValidations: number
  byType: Record<string, number>
  byStatus: Record<string, number>
  byRegion: Record<string, number>
}

export type Staker = {
  stakerId: string
  walletAddress: string
  stakedAmount: string
  pendingRewards: string
  claimedRewards: string
  stakingMultiplier: number
  lockPeriod: number
}

export type StakerStats = {
  totalStakers: number
  totalStaked: string
  totalPendingRewards: string
  totalClaimedRewards: string
  avgStake: string
  avgMultiplier: string
  byLockPeriod: Record<string, number>
  topStakers: Array<{
    stakerId: string
    walletAddress: string
    stakedAmount: string
    delegatedTo?: string
  }>
}

export type Transaction = {
  txHash: string
  txType: string
  from: string
  to: string
  amount: string
  gasUsed: number
  gasPrice: number
  timestamp: number
  status: string
}

export type TransactionStats = {
  totalTransactions: number
  confirmedTxs: number
  pendingTxs: number
  failedTxs: number
  successRate: string
  totalVolume: string
  totalGasUsed: number
  avgGasPrice: string
  byType: Record<string, number>
  volumeByType: Record<string, string>
  recentTxs: Array<{
    txHash: string
    txType: string
    amount: string
    timestamp: number
    status: string
  }>
}
