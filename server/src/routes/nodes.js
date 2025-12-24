/**
 * Nodes API Routes
 * =================
 * Endpoints for DePIN node data
 */

const express = require('express');
const router = express.Router();
const { nodes } = require('../data/data');

/**
 * GET /api/nodes
 * Returns paginated list of nodes with optional filtering
 * 
 * Query params:
 * - page (number): Page number, default 1
 * - limit (number): Items per page, default 20, max 100
 * - status (string): Filter by status (ACTIVE, INACTIVE, PENDING, SLASHED)
 * - nodeType (string): Filter by type (VALIDATOR, LIGHT, RELAY, ARCHIVE)
 * - region (string): Filter by region
 * - sortBy (string): Sort field (stakedAmount, uptime, totalRewardsEarned, validationsPerformed)
 * - sortOrder (string): 'asc' or 'desc', default 'desc'
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { status, nodeType, region, sortBy, sortOrder = 'desc' } = req.query;

    let filteredNodes = [...nodes];

    // Apply filters
    if (status) {
      filteredNodes = filteredNodes.filter(n => n.status === status.toUpperCase());
    }
    if (nodeType) {
      filteredNodes = filteredNodes.filter(n => n.nodeType === nodeType.toUpperCase());
    }
    if (region) {
      filteredNodes = filteredNodes.filter(n => n.region === region.toUpperCase());
    }

    // Apply sorting
    if (sortBy) {
      filteredNodes.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        // Handle numeric strings
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
    const totalItems = filteredNodes.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedNodes = filteredNodes.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedNodes,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
});

/**
 * GET /api/nodes/stats
 * Returns aggregate statistics for nodes
 */
router.get('/stats', (req, res) => {
  try {
    const totalNodes = nodes.length;
    const activeNodes = nodes.filter(n => n.status === 'ACTIVE').length;
    const totalStaked = nodes.reduce((sum, n) => sum + parseFloat(n.stakedAmount), 0);
    const totalRewards = nodes.reduce((sum, n) => sum + parseFloat(n.totalRewardsEarned), 0);
    const avgUptime = nodes.reduce((sum, n) => sum + parseFloat(n.uptime), 0) / totalNodes;
    const totalValidations = nodes.reduce((sum, n) => sum + n.validationsPerformed, 0);

    // Count by type
    const byType = nodes.reduce((acc, n) => {
      acc[n.nodeType] = (acc[n.nodeType] || 0) + 1;
      return acc;
    }, {});

    // Count by status
    const byStatus = nodes.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {});

    // Count by region
    const byRegion = nodes.reduce((acc, n) => {
      acc[n.region] = (acc[n.region] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalNodes,
      activeNodes,
      totalStaked: totalStaked.toFixed(2),
      totalRewards: totalRewards.toFixed(2),
      avgUptime: avgUptime.toFixed(2),
      totalValidations,
      byType,
      byStatus,
      byRegion
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch node stats' });
  }
});

/**
 * GET /api/nodes/:nodeId
 * Returns a single node by ID
 */
router.get('/:nodeId', (req, res) => {
  try {
    const node = nodes.find(n => n.nodeId === req.params.nodeId);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.json(node);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch node' });
  }
});

module.exports = router;

