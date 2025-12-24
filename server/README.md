# ChainHealth API Server

Backend API server for the ChainHealth AI platform assessment.

## ⚠️ Do Not Modify

This server is pre-built for the assessment. Please do not modify any files in this directory.

## Running the Server

```bash
npm install
npm start
```

The server will start on `http://localhost:3001`.

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and available endpoints |
| GET | `/health` | Health check |
| GET | `/api/stats` | Platform overview statistics |
| GET | `/api/stats/overview` | Simplified stats for dashboard cards |
| GET | `/api/nodes` | List DePIN nodes (paginated) |
| GET | `/api/nodes/stats` | Node aggregate statistics |
| GET | `/api/nodes/:nodeId` | Get single node |
| GET | `/api/stakers` | List stakers (paginated) |
| GET | `/api/stakers/stats` | Staker aggregate statistics |
| GET | `/api/stakers/:stakerId` | Get single staker |
| GET | `/api/stakers/wallet/:address` | Get staker by wallet |
| GET | `/api/health-records` | List health records (paginated) |
| GET | `/api/health-records/stats` | Health record statistics |
| GET | `/api/health-records/data-types` | List data types |
| GET | `/api/health-records/device-types` | List device types |
| GET | `/api/health-records/:recordId` | Get single record |
| GET | `/api/epochs` | List epochs (paginated) |
| GET | `/api/epochs/current` | Get current epoch |
| GET | `/api/epochs/stats` | Epoch statistics |
| GET | `/api/epochs/:epochNumber` | Get specific epoch |
| GET | `/api/transactions` | List transactions (paginated) |
| GET | `/api/transactions/stats` | Transaction statistics |
| GET | `/api/transactions/types` | List transaction types |
| GET | `/api/transactions/:txHash` | Get transaction by hash |

## Data Summary

The mock data includes:
- **500** DePIN nodes
- **2,000** stakers
- **50,000** health records
- **100** epochs
- **10,000** transactions

