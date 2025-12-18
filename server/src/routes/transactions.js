/**
 * Transactions API Routes
 * ========================
 * Endpoints for blockchain transaction data
 */

const express = require('express');
const router = express.Router();
const { transactions } = require('../data/data');

/**
 * GET /api/transactions
 * Returns paginated list of transactions with optional filtering
 * 
 * Query params:
 * - page (number): Page number, default 1
 * - limit (number): Items per page, default 20, max 100
 * - txType (string): Filter by type (TRANSFER, STAKE, UNSTAKE, CLAIM_REWARD, DELEGATE, SLASH)
 * - status (string): Filter by status (CONFIRMED, PENDING, FAILED)
 * - address (string): Filter by from or to address
 * - startDate (number): Filter transactions after this timestamp
 * - endDate (number): Filter transactions before this timestamp
 * - sortBy (string): Sort field (timestamp, amount, gasUsed)
 * - sortOrder (string): 'asc' or 'desc', default 'desc'
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { 
      txType, 
      status, 
      address,
      startDate,
      endDate,
      sortBy = 'timestamp', 
      sortOrder = 'desc' 
    } = req.query;

    let filteredTxs = [...transactions];

    // Apply filters
    if (txType) {
      filteredTxs = filteredTxs.filter(tx => tx.txType === txType.toUpperCase());
    }
    if (status) {
      filteredTxs = filteredTxs.filter(tx => tx.status === status.toUpperCase());
    }
    if (address) {
      const addr = address.toLowerCase();
      filteredTxs = filteredTxs.filter(tx => 
        tx.from.toLowerCase() === addr || tx.to.toLowerCase() === addr
      );
    }
    if (startDate) {
      filteredTxs = filteredTxs.filter(tx => tx.timestamp >= parseInt(startDate));
    }
    if (endDate) {
      filteredTxs = filteredTxs.filter(tx => tx.timestamp <= parseInt(endDate));
    }

    // Apply sorting
    filteredTxs.sort((a, b) => {
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

    // Pagination
    const totalItems = filteredTxs.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedTxs = filteredTxs.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedTxs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/stats
 * Returns aggregate statistics for transactions
 */
router.get('/stats', (req, res) => {
  try {
    const totalTransactions = transactions.length;
    const confirmedTxs = transactions.filter(tx => tx.status === 'CONFIRMED').length;
    const pendingTxs = transactions.filter(tx => tx.status === 'PENDING').length;
    const failedTxs = transactions.filter(tx => tx.status === 'FAILED').length;
    
    const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const totalGasUsed = transactions.reduce((sum, tx) => sum + tx.gasUsed, 0);
    const avgGasPrice = transactions.reduce((sum, tx) => sum + tx.gasPrice, 0) / totalTransactions;

    // Count by type
    const byType = transactions.reduce((acc, tx) => {
      acc[tx.txType] = (acc[tx.txType] || 0) + 1;
      return acc;
    }, {});

    // Volume by type
    const volumeByType = transactions.reduce((acc, tx) => {
      acc[tx.txType] = (acc[tx.txType] || 0) + parseFloat(tx.amount);
      return acc;
    }, {});
    Object.keys(volumeByType).forEach(k => {
      volumeByType[k] = volumeByType[k].toFixed(2);
    });

    // Recent activity (last 10 transactions)
    const recentTxs = [...transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(tx => ({
        txHash: tx.txHash,
        txType: tx.txType,
        amount: tx.amount,
        timestamp: tx.timestamp,
        status: tx.status
      }));

    res.json({
      totalTransactions,
      confirmedTxs,
      pendingTxs,
      failedTxs,
      successRate: ((confirmedTxs / totalTransactions) * 100).toFixed(2),
      totalVolume: totalVolume.toFixed(2),
      totalGasUsed,
      avgGasPrice: avgGasPrice.toFixed(2),
      byType,
      volumeByType,
      recentTxs
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction stats' });
  }
});

/**
 * GET /api/transactions/types
 * Returns list of transaction types
 */
router.get('/types', (req, res) => {
  try {
    const types = [...new Set(transactions.map(tx => tx.txType))].sort();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction types' });
  }
});

/**
 * GET /api/transactions/:txHash
 * Returns a specific transaction by hash
 */
router.get('/:txHash', (req, res) => {
  try {
    const tx = transactions.find(t => t.txHash === req.params.txHash);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(tx);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;

