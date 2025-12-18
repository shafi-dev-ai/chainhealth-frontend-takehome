import { Routes, Route, NavLink } from 'react-router-dom'

// TODO: Import your page components here
// import Dashboard from './pages/Dashboard'
// import HealthRecords from './pages/HealthRecords'
// import Nodes from './pages/Nodes'
// import Staking from './pages/Staking'
// import Transactions from './pages/Transactions'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <img src="/vite.svg" alt="ChainHealth" />
          <span>ChainHealth</span>
        </div>
        
        <nav className="nav">
          {/* TODO: Add navigation links using NavLink from react-router-dom */}
          {/* Example: */}
          {/* <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink> */}
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/health-records" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Health Records
          </NavLink>
          <NavLink to="/nodes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            DePIN Nodes
          </NavLink>
          <NavLink to="/staking" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Staking
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Transactions
          </NavLink>
        </nav>

        {/* TODO (Bonus): Add wallet connection button here */}
        <div className="wallet-section">
          <button className="connect-wallet-btn">
            Connect Wallet
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          {/* TODO: Add your routes here */}
          {/* Example: */}
          {/* <Route path="/" element={<Dashboard />} /> */}
          <Route path="/" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/health-records" element={<PlaceholderPage title="Health Records" />} />
          <Route path="/nodes" element={<PlaceholderPage title="DePIN Nodes" />} />
          <Route path="/staking" element={<PlaceholderPage title="Staking" />} />
          <Route path="/transactions" element={<PlaceholderPage title="Transactions" />} />
        </Routes>
      </main>
    </div>
  )
}

// Placeholder component - replace with your implementations
function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>TODO: Implement this page</p>
      <div className="placeholder-hint">
        <h3>Suggested Features:</h3>
        {title === 'Dashboard' && (
          <ul>
            <li>Overview stats cards (active nodes, total staked, health records, etc.)</li>
            <li>Network health indicator</li>
            <li>Recent activity feed</li>
            <li>Charts showing rewards trend or validation metrics</li>
          </ul>
        )}
        {title === 'Health Records' && (
          <ul>
            <li>Table/list of health records with pagination</li>
            <li>Filters by data type, device type, validation status</li>
            <li>Search by user address</li>
            <li>Record detail view</li>
          </ul>
        )}
        {title === 'DePIN Nodes' && (
          <ul>
            <li>Node list with status indicators</li>
            <li>Filter by status, type, region</li>
            <li>Sort by staked amount, uptime, validations</li>
            <li>Node statistics summary</li>
          </ul>
        )}
        {title === 'Staking' && (
          <ul>
            <li>Staking overview stats</li>
            <li>Top stakers leaderboard</li>
            <li>Staker list with pagination</li>
            <li>Lock period distribution chart</li>
          </ul>
        )}
        {title === 'Transactions' && (
          <ul>
            <li>Transaction list with pagination</li>
            <li>Filter by type, status</li>
            <li>Transaction volume by type chart</li>
            <li>Recent transactions feed</li>
          </ul>
        )}
      </div>
    </div>
  )
}

export default App

