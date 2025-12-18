/**
 * Stakers API Routes
 * ===================
 * Endpoints for staker/user data
 */

const express = require('express');
const router = express.Router();
const { stakers, nodes } = require('../data/data');

/**
 * GET /api/stakers
 * Returns paginated list of stakers with optional filtering
 * 
 * Query params:
 * - page (number): Page number, default 1
 * - limit (number): Items per page, default 20, max 100
 * - minStake (number): Minimum staked amount filter
 * - maxStake (number): Maximum staked amount filter
 * - sortBy (string): Sort field (stakedAmount, pendingRewards, claimedRewards, stakingMultiplier)
 * - sortOrder (string): 'asc' or 'desc', default 'desc'
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { minStake, maxStake, sortBy, sortOrder = 'desc' } = req.query;

    let filteredStakers = [...stakers];

    // Apply filters
    if (minStake) {
      filteredStakers = filteredStakers.filter(s => parseFloat(s.stakedAmount) >= parseFloat(minStake));
    }
    if (maxStake) {
      filteredStakers = filteredStakers.filter(s => parseFloat(s.stakedAmount) <= parseFloat(maxStake));
    }

    // Apply sorting
    if (sortBy) {
      filteredStakers.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    // Pagination
    const totalItems = filteredStakers.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedStakers = filteredStakers.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedStakers,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stakers' });
  }
});

/**
 * GET /api/stakers/stats
 * Returns aggregate statistics for stakers
 */
router.get('/stats', (req, res) => {
  try {
    const totalStakers = stakers.length;
    const totalStaked = stakers.reduce((sum, s) => sum + parseFloat(s.stakedAmount), 0);
    const totalPendingRewards = stakers.reduce((sum, s) => sum + parseFloat(s.pendingRewards), 0);
    const totalClaimedRewards = stakers.reduce((sum, s) => sum + parseFloat(s.claimedRewards), 0);
    const avgStake = totalStaked / totalStakers;
    const avgMultiplier = stakers.reduce((sum, s) => sum + s.stakingMultiplier, 0) / totalStakers;

    // Lock period distribution
    const byLockPeriod = stakers.reduce((acc, s) => {
      const period = `${s.lockPeriod} days`;
      acc[period] = (acc[period] || 0) + 1;
      return acc;
    }, {});

    // Top stakers
    const topStakers = [...stakers]
      .sort((a, b) => parseFloat(b.stakedAmount) - parseFloat(a.stakedAmount))
      .slice(0, 10)
      .map(s => ({
        stakerId: s.stakerId,
        walletAddress: s.walletAddress,
        stakedAmount: s.stakedAmount,
        delegatedTo: s.delegatedTo
      }));

    res.json({
      totalStakers,
      totalStaked: totalStaked.toFixed(2),
      totalPendingRewards: totalPendingRewards.toFixed(2),
      totalClaimedRewards: totalClaimedRewards.toFixed(2),
      avgStake: avgStake.toFixed(2),
      avgMultiplier: avgMultiplier.toFixed(4),
      byLockPeriod,
      topStakers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staker stats' });
  }
});

/**
 * GET /api/stakers/:stakerId
 * Returns a single staker by ID
 */
router.get('/:stakerId', (req, res) => {
  try {
    const staker = stakers.find(s => s.stakerId === req.params.stakerId);
    if (!staker) {
      return res.status(404).json({ error: 'Staker not found' });
    }

    // Include delegated node info if available
    let delegatedNode = null;
    if (staker.delegatedTo) {
      delegatedNode = nodes.find(n => n.nodeId === staker.delegatedTo);
      if (delegatedNode) {
        delegatedNode = {
          nodeId: delegatedNode.nodeId,
          nodeType: delegatedNode.nodeType,
          status: delegatedNode.status,
          uptime: delegatedNode.uptime
        };
      }
    }

    res.json({
      ...staker,
      delegatedNode
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staker' });
  }
});

/**
 * GET /api/stakers/wallet/:address
 * Returns a staker by wallet address
 */
router.get('/wallet/:address', (req, res) => {
  try {
    const staker = stakers.find(s => 
      s.walletAddress.toLowerCase() === req.params.address.toLowerCase()
    );
    if (!staker) {
      return res.status(404).json({ error: 'Staker not found' });
    }
    res.json(staker);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staker' });
  }
});

module.exports = router;

