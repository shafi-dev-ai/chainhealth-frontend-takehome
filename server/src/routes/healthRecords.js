/**
 * Health Records API Routes
 * ==========================
 * Endpoints for health/wellness data records
 */

const express = require('express');
const router = express.Router();
const { healthRecords } = require('../data/data');

/**
 * GET /api/health-records
 * Returns paginated list of health records with optional filtering
 * 
 * Query params:
 * - page (number): Page number, default 1
 * - limit (number): Items per page, default 20, max 100
 * - dataType (string): Filter by data type (HEART_RATE, STEPS, SLEEP, ACTIVE_MINUTES, CALORIES, BLOOD_OXYGEN, etc.)
 * - deviceType (string): Filter by device (APPLE_WATCH, FITBIT, GARMIN, OURA, WHOOP, etc.)
 * - validationStatus (string): Filter by status (VALIDATED, PENDING, REJECTED)
 * - userAddress (string): Filter by user wallet address
 * - startDate (number): Filter records after this timestamp
 * - endDate (number): Filter records before this timestamp
 * - sortBy (string): Sort field (timestamp, value)
 * - sortOrder (string): 'asc' or 'desc', default 'desc'
 */
router.get('/', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { 
      dataType, 
      deviceType, 
      validationStatus, 
      userAddress,
      startDate,
      endDate,
      sortBy = 'timestamp', 
      sortOrder = 'desc' 
    } = req.query;

    let filteredRecords = [...healthRecords];

    // Apply filters
    if (dataType) {
      filteredRecords = filteredRecords.filter(r => r.dataType === dataType.toUpperCase());
    }
    if (deviceType) {
      filteredRecords = filteredRecords.filter(r => r.deviceType === deviceType.toUpperCase());
    }
    if (validationStatus) {
      filteredRecords = filteredRecords.filter(r => r.validationStatus === validationStatus.toUpperCase());
    }
    if (userAddress) {
      filteredRecords = filteredRecords.filter(r => 
        r.userAddress.toLowerCase() === userAddress.toLowerCase()
      );
    }
    if (startDate) {
      filteredRecords = filteredRecords.filter(r => r.timestamp >= parseInt(startDate));
    }
    if (endDate) {
      filteredRecords = filteredRecords.filter(r => r.timestamp <= parseInt(endDate));
    }

    // Apply sorting
    filteredRecords.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    // Pagination
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedRecords,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

/**
 * GET /api/health-records/stats
 * Returns aggregate statistics for health records
 */
router.get('/stats', (req, res) => {
  try {
    const totalRecords = healthRecords.length;
    const validatedRecords = healthRecords.filter(r => r.validationStatus === 'VALIDATED').length;
    const pendingRecords = healthRecords.filter(r => r.validationStatus === 'PENDING').length;
    const rejectedRecords = healthRecords.filter(r => r.validationStatus === 'REJECTED').length;

    // Count by data type
    const byDataType = healthRecords.reduce((acc, r) => {
      acc[r.dataType] = (acc[r.dataType] || 0) + 1;
      return acc;
    }, {});

    // Count by device type
    const byDeviceType = healthRecords.reduce((acc, r) => {
      acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
      return acc;
    }, {});

    // Unique users
    const uniqueUsers = new Set(healthRecords.map(r => r.userAddress)).size;

    // Records by day (last 7 days simulation)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const recordsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i + 1) * dayMs;
      const dayEnd = now - i * dayMs;
      const count = healthRecords.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd).length;
      recordsByDay.push({
        date: new Date(dayEnd).toISOString().split('T')[0],
        count
      });
    }

    res.json({
      totalRecords,
      validatedRecords,
      pendingRecords,
      rejectedRecords,
      validationRate: ((validatedRecords / totalRecords) * 100).toFixed(2),
      uniqueUsers,
      byDataType,
      byDeviceType,
      recordsByDay
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health record stats' });
  }
});

/**
 * GET /api/health-records/data-types
 * Returns list of available data types
 */
router.get('/data-types', (req, res) => {
  try {
    const dataTypes = [...new Set(healthRecords.map(r => r.dataType))].sort();
    res.json(dataTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data types' });
  }
});

/**
 * GET /api/health-records/device-types
 * Returns list of available device types
 */
router.get('/device-types', (req, res) => {
  try {
    const deviceTypes = [...new Set(healthRecords.map(r => r.deviceType))].sort();
    res.json(deviceTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device types' });
  }
});

/**
 * GET /api/health-records/:recordId
 * Returns a single health record by ID
 */
router.get('/:recordId', (req, res) => {
  try {
    const record = healthRecords.find(r => r.recordId === req.params.recordId);
    if (!record) {
      return res.status(404).json({ error: 'Health record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch health record' });
  }
});

module.exports = router;

