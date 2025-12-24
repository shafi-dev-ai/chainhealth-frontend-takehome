/**
 * Stats API Routes
 * =================
 * Aggregate platform statistics endpoint
 */

const express = require('express');
const router = express.Router();
const { metadata, nodes, stakers, healthRecords, epochs, transactions } = require('../data/data');

/**
 * GET /api/stats
 * Returns overall platform statistics
 */
router.get('/', (req, res) => {
  try {
    // Node stats
    const totalNodes = nodes.length;
    const activeNodes = nodes.filter(n => n.status === 'ACTIVE').length;
    const totalNodeStake = nodes.reduce((sum, n) => sum + parseFloat(n.stakedAmount), 0);

    // Staker stats
    const totalStakers = stakers.length;
    const totalStaked = stakers.reduce((sum, s) => sum + parseFloat(s.stakedAmount), 0);
    const totalPendingRewards = stakers.reduce((sum, s) => sum + parseFloat(s.pendingRewards), 0);

    // Health records stats
    const totalHealthRecords = healthRecords.length;
    const validatedRecords = healthRecords.filter(r => r.validationStatus === 'VALIDATED').length;
    const uniqueUsers = new Set(healthRecords.map(r => r.userAddress)).size;

    // Epoch stats
    const totalEpochs = epochs.length;
    const currentEpoch = epochs.reduce((max, e) => e.epochNumber > max.epochNumber ? e : max);
    const totalRewardsDistributed = epochs.reduce((sum, e) => sum + parseFloat(e.totalRewardsPool), 0);

    // Transaction stats
    const totalTransactions = transactions.length;
    const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // Calculate network health score (0-100)
    const avgUptime = nodes.reduce((sum, n) => sum + parseFloat(n.uptime), 0) / totalNodes;
    const validationRate = (validatedRecords / totalHealthRecords) * 100;
    const activeNodeRate = (activeNodes / totalNodes) * 100;
    const networkHealth = ((avgUptime + validationRate + activeNodeRate) / 3).toFixed(1);

    res.json({
      metadata: {
        generatedAt: metadata.generatedAt,
        version: metadata.version
      },
      network: {
        totalNodes,
        activeNodes,
        totalNodeStake: totalNodeStake.toFixed(2),
        avgUptime: avgUptime.toFixed(2),
        networkHealth
      },
      staking: {
        totalStakers,
        totalStaked: totalStaked.toFixed(2),
        totalPendingRewards: totalPendingRewards.toFixed(2),
        avgStakePerUser: (totalStaked / totalStakers).toFixed(2)
      },
      healthData: {
        totalRecords: totalHealthRecords,
        validatedRecords,
        pendingRecords: healthRecords.filter(r => r.validationStatus === 'PENDING').length,
        validationRate: validationRate.toFixed(2),
        uniqueUsers
      },
      rewards: {
        totalEpochs,
        currentEpoch: currentEpoch.epochNumber,
        totalRewardsDistributed: totalRewardsDistributed.toFixed(2),
        avgRewardsPerEpoch: (totalRewardsDistributed / totalEpochs).toFixed(2)
      },
      transactions: {
        totalTransactions,
        totalVolume: totalVolume.toFixed(2),
        confirmedRate: ((transactions.filter(tx => tx.status === 'CONFIRMED').length / totalTransactions) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
});

/**
 * GET /api/stats/overview
 * Returns simplified overview for dashboard cards
 */
router.get('/overview', (req, res) => {
  try {
    const activeNodes = nodes.filter(n => n.status === 'ACTIVE').length;
    const totalStaked = stakers.reduce((sum, s) => sum + parseFloat(s.stakedAmount), 0);
    const validatedRecords = healthRecords.filter(r => r.validationStatus === 'VALIDATED').length;
    const totalRewards = epochs.reduce((sum, e) => sum + parseFloat(e.totalRewardsPool), 0);

    res.json({
      activeNodes,
      totalStaked: totalStaked.toFixed(2),
      healthRecordsValidated: validatedRecords,
      totalRewardsDistributed: totalRewards.toFixed(2),
      totalUsers: new Set(healthRecords.map(r => r.userAddress)).size,
      totalTransactions: transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

module.exports = router;

