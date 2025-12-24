/**
 * Epochs API Routes
 * ==================
 * Endpoints for network epoch/rewards data
 */

const express = require('express');
const router = express.Router();
const { epochs } = require('../data/data');

/**
 * GET /api/epochs
 * Returns paginated list of epochs
 * 
 * Query params:
 * - page (number): Page number, default 1
 * - limit (number): Items per page, default 20, max 100
 * - sortOrder (string): 'asc' or 'desc', default 'desc' (newest first)
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { sortOrder = 'desc' } = req.query;

    let sortedEpochs = [...epochs].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.epochNumber - b.epochNumber;
      }
      return b.epochNumber - a.epochNumber;
    });

    // Pagination
    const totalItems = sortedEpochs.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    
    // Return simplified epoch data (without large nodeRewards array)
    const paginatedEpochs = sortedEpochs.slice(startIndex, startIndex + limit).map(e => ({
      epochNumber: e.epochNumber,
      startTime: e.startTime,
      endTime: e.endTime,
      totalRewardsPool: e.totalRewardsPool,
      totalValidations: e.totalValidations,
      activeNodes: e.activeNodes,
      activeStakers: e.activeStakers,
      topNodeRewardsCount: e.nodeRewards ? e.nodeRewards.length : 0
    }));

    res.json({
      data: paginatedEpochs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch epochs' });
  }
});

/**
 * GET /api/epochs/current
 * Returns the most recent epoch
 */
router.get('/current', (req, res) => {
  try {
    const currentEpoch = epochs.reduce((max, e) => 
      e.epochNumber > max.epochNumber ? e : max
    );
    
    res.json({
      epochNumber: currentEpoch.epochNumber,
      startTime: currentEpoch.startTime,
      endTime: currentEpoch.endTime,
      totalRewardsPool: currentEpoch.totalRewardsPool,
      totalValidations: currentEpoch.totalValidations,
      activeNodes: currentEpoch.activeNodes,
      activeStakers: currentEpoch.activeStakers,
      topRewards: currentEpoch.nodeRewards ? currentEpoch.nodeRewards.slice(0, 10) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current epoch' });
  }
});

/**
 * GET /api/epochs/stats
 * Returns aggregate statistics across epochs
 */
router.get('/stats', (req, res) => {
  try {
    const totalEpochs = epochs.length;
    const totalRewardsDistributed = epochs.reduce((sum, e) => 
      sum + parseFloat(e.totalRewardsPool), 0
    );
    const totalValidationsAllTime = epochs.reduce((sum, e) => 
      sum + e.totalValidations, 0
    );
    const avgRewardsPerEpoch = totalRewardsDistributed / totalEpochs;
    const avgValidationsPerEpoch = totalValidationsAllTime / totalEpochs;
    const avgActiveNodes = epochs.reduce((sum, e) => sum + e.activeNodes, 0) / totalEpochs;
    const avgActiveStakers = epochs.reduce((sum, e) => sum + e.activeStakers, 0) / totalEpochs;

    // Rewards trend (last 10 epochs)
    const recentEpochs = [...epochs]
      .sort((a, b) => b.epochNumber - a.epochNumber)
      .slice(0, 10)
      .reverse();
    
    const rewardsTrend = recentEpochs.map(e => ({
      epoch: e.epochNumber,
      rewards: parseFloat(e.totalRewardsPool).toFixed(2),
      validations: e.totalValidations,
      activeNodes: e.activeNodes
    }));

    res.json({
      totalEpochs,
      totalRewardsDistributed: totalRewardsDistributed.toFixed(2),
      totalValidationsAllTime,
      avgRewardsPerEpoch: avgRewardsPerEpoch.toFixed(2),
      avgValidationsPerEpoch: Math.round(avgValidationsPerEpoch),
      avgActiveNodes: Math.round(avgActiveNodes),
      avgActiveStakers: Math.round(avgActiveStakers),
      rewardsTrend
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch epoch stats' });
  }
});

/**
 * GET /api/epochs/:epochNumber
 * Returns a specific epoch by number
 */
router.get('/:epochNumber', (req, res) => {
  try {
    const epochNum = parseInt(req.params.epochNumber);
    const epoch = epochs.find(e => e.epochNumber === epochNum);
    
    if (!epoch) {
      return res.status(404).json({ error: 'Epoch not found' });
    }

    res.json({
      ...epoch,
      nodeRewards: epoch.nodeRewards ? epoch.nodeRewards.slice(0, 50) : [] // Limit node rewards returned
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch epoch' });
  }
});

module.exports = router;

