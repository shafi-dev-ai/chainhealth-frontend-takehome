import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import HealthRecords from './pages/HealthRecords'
import Nodes from './pages/Nodes'
import Staking from './pages/Staking'
import Transactions from './pages/Transactions'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <img src="/vite.svg" alt="ChainHealth" />
          <span>ChainHealth</span>
        </div>
        
        <nav className="nav">
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
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/health-records" element={<HealthRecords />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
