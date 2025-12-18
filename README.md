# ChainHealth AI - Frontend Take-Home Assessment

Welcome to the ChainHealth AI frontend engineering assessment! This take-home project is designed to evaluate your skills in building modern, responsive web applications with React.

## 🏢 About ChainHealth AI

ChainHealth AI combines cutting-edge artificial intelligence with blockchain technology to empower people's wellness. Our platform collects data from wearables and fitness apps, analyzes it with machine learning, and rewards users for healthy behavior through our decentralized network (DePIN).

## 📋 Assessment Overview

**Estimated Time:** 1-2 hours

You will be building a dashboard interface for the ChainHealth platform. The backend API is fully implemented and provides endpoints for:

- **DePIN Nodes**: Network nodes that validate health data
- **Stakers**: Users who stake tokens in the network
- **Health Records**: Wellness data from wearables (heart rate, steps, sleep, etc.)
- **Epochs**: Network reward epochs and distribution data
- **Transactions**: Blockchain transactions (transfers, staking, rewards)

## 🎯 Requirements

### Core Requirements (Must Complete)

1. **Dashboard Page** (`/`)
   - Display overview statistics cards (active nodes, total staked, health records validated, etc.)
   - Show a network health indicator or score
   - Include recent activity or key metrics visualization

2. **Health Records Page** (`/health-records`)
   - Display a paginated table/list of health records
   - Implement at least 2 filters (e.g., data type, device type, validation status)
   - Show appropriate loading and empty states

3. **One Additional Page** (choose one):
   - **DePIN Nodes** (`/nodes`): Node list with status indicators and filtering
   - **Staking** (`/staking`): Staker list with stats overview
   - **Transactions** (`/transactions`): Transaction history with filters

### Technical Requirements

- Use React with functional components and hooks
- Implement proper state management for API data
- Handle loading, error, and empty states gracefully
- Write clean, maintainable, and well-organized code
- Ensure the UI is responsive (works on desktop and tablet)

### Bonus Points (Optional)

- **Web3 Wallet Connection**: Implement a mock or real wallet connection (MetaMask)
- **Data Visualization**: Add charts/graphs (you may use any charting library)
- **Additional Pages**: Complete more than the required pages
- **Enhanced UX**: Animations, transitions, skeleton loaders
- **TypeScript**: Convert to TypeScript
- **Testing**: Add unit tests for components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies for both server and client:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Start the API Server:**
```bash
cd server
npm start
```
The API will be available at `http://localhost:3001`

**Terminal 2 - Start the Frontend:**
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

The backend provides the following endpoints. All responses follow a consistent format with pagination where applicable.

### Base URL
`http://localhost:3001/api`

### Endpoints

#### Platform Stats
- `GET /stats` - Overall platform statistics
- `GET /stats/overview` - Simplified overview for dashboard cards

#### Nodes
- `GET /nodes` - List nodes (supports pagination, filtering, sorting)
  - Query params: `page`, `limit`, `status`, `nodeType`, `region`, `sortBy`, `sortOrder`
- `GET /nodes/stats` - Aggregate node statistics
- `GET /nodes/:nodeId` - Get single node by ID

#### Stakers
- `GET /stakers` - List stakers (supports pagination, filtering, sorting)
  - Query params: `page`, `limit`, `minStake`, `maxStake`, `sortBy`, `sortOrder`
- `GET /stakers/stats` - Aggregate staker statistics
- `GET /stakers/:stakerId` - Get single staker by ID
- `GET /stakers/wallet/:address` - Get staker by wallet address

#### Health Records
- `GET /health-records` - List health records (supports pagination, filtering)
  - Query params: `page`, `limit`, `dataType`, `deviceType`, `validationStatus`, `userAddress`, `startDate`, `endDate`, `sortBy`, `sortOrder`
- `GET /health-records/stats` - Aggregate health record statistics
- `GET /health-records/data-types` - List available data types
- `GET /health-records/device-types` - List available device types
- `GET /health-records/:recordId` - Get single record by ID

#### Epochs
- `GET /epochs` - List epochs (supports pagination)
  - Query params: `page`, `limit`, `sortOrder`
- `GET /epochs/current` - Get current/latest epoch
- `GET /epochs/stats` - Aggregate epoch statistics
- `GET /epochs/:epochNumber` - Get specific epoch

#### Transactions
- `GET /transactions` - List transactions (supports pagination, filtering)
  - Query params: `page`, `limit`, `txType`, `status`, `address`, `startDate`, `endDate`, `sortBy`, `sortOrder`
- `GET /transactions/stats` - Aggregate transaction statistics
- `GET /transactions/types` - List transaction types
- `GET /transactions/:txHash` - Get transaction by hash

### Response Format

Paginated endpoints return:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 500,
    "totalPages": 25,
    "hasMore": true
  }
}
```

## 📁 Project Structure

```
chainhealth-frontend-takehome/
├── server/                    # Backend API (DO NOT MODIFY)
│   ├── src/
│   │   ├── data/
│   │   │   └── data.js       # Mock data
│   │   ├── routes/           # API route handlers
│   │   └── index.js          # Express server
│   └── package.json
│
├── client/                    # Frontend (YOUR WORK GOES HERE)
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js      # API client helpers (provided)
│   │   ├── utils/
│   │   │   └── format.js     # Formatting utilities (provided)
│   │   ├── pages/            # Create your page components here
│   │   ├── components/       # Create reusable components here
│   │   ├── hooks/            # Create custom hooks here (optional)
│   │   ├── App.jsx           # Main app with routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Base styles and CSS variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md                  # This file
```

## 🎨 Provided Resources

### API Client (`client/src/api/index.js`)
Pre-built functions for all API endpoints. Example usage:
```javascript
import { getNodes, getHealthRecords, getStatsOverview } from '../api';

// Fetch nodes with filters
const { data, pagination } = await getNodes({ 
  page: 1, 
  limit: 20, 
  status: 'ACTIVE' 
});

// Fetch health records
const records = await getHealthRecords({ 
  dataType: 'HEART_RATE', 
  validationStatus: 'VALIDATED' 
});
```

### Formatting Utilities (`client/src/utils/format.js`)
Helper functions for displaying data:
```javascript
import { 
  formatNumber, 
  formatTokenAmount, 
  shortenAddress, 
  formatDateTime,
  getStatusClass 
} from '../utils/format';

formatNumber(1234567, 2)      // "1,234,567.00"
formatTokenAmount(1000)       // "1,000.00 HEALTH"
shortenAddress("0x1234...5678") // "0x1234...5678"
formatDateTime(1703894400000) // "Dec 30, 2023, 12:00 AM"
```

### CSS Variables & Utility Classes (`client/src/index.css`)
Pre-defined design tokens and utility classes. Feel free to customize!

## 📝 Submission Guidelines

1. Complete the assessment within the timeframe discussed
2. Push your code to a GitHub repository (or zip if preferred)
3. Include a brief `NOTES.md` file with:
   - Time spent on the assessment
   - Any assumptions you made
   - What you would improve with more time
   - Any challenges you faced

## 🤔 Evaluation Criteria

We will evaluate your submission based on:

1. **Functionality** (40%): Does it work? Are the requirements met?
2. **Code Quality** (25%): Clean, readable, maintainable code
3. **UI/UX** (20%): Visual design, responsiveness, user experience
4. **Technical Decisions** (15%): State management, component structure, error handling

## ❓ Questions?

If you have any questions about the requirements or encounter technical issues, please reach out to your hiring contact.

---

Good luck! We're excited to see what you build. 🚀

