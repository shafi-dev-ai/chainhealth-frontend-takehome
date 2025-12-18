/**
 * ChainHealth AI - Backend API Server
 * ====================================
 * This server provides REST API endpoints for the ChainHealth platform.
 * All endpoints are read-only and return mock data for the assessment.
 */

const express = require('express');
const cors = require('cors');

const nodesRouter = require('./routes/nodes');
const stakersRouter = require('./routes/stakers');
const healthRecordsRouter = require('./routes/healthRecords');
const epochsRouter = require('./routes/epochs');
const transactionsRouter = require('./routes/transactions');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/nodes', nodesRouter);
app.use('/api/stakers', stakersRouter);
app.use('/api/health-records', healthRecordsRouter);
app.use('/api/epochs', epochsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/stats', statsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ChainHealth AI API',
    version: '1.0.0',
    description: 'Backend API for the ChainHealth wellness platform',
    endpoints: {
      nodes: '/api/nodes',
      stakers: '/api/stakers',
      healthRecords: '/api/health-records',
      epochs: '/api/epochs',
      transactions: '/api/transactions',
      stats: '/api/stats'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         ChainHealth AI API Server                         ║
║         Running on http://localhost:${PORT}                  ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

