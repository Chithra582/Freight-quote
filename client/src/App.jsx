import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardRouter from './pages/DashboardRouter'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CustomsDashboard from './pages/CustomsDashboard'
import AgentOperationsDashboard from './pages/AgentOperationsDashboard'
import AnalyticsManagementDashboard from './pages/AnalyticsManagementDashboard'
import NewShipmentEnquiry from './pages/NewShipmentEnquiry'
import Shipments from './pages/Shipments'
import MasterData from './pages/MasterData'
import RouteIntelligence from './pages/RouteIntelligence'
import QuoteCalculatorPage from './pages/QuoteCalculatorPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Unified Smart Dashboard Router */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/calculator" element={<QuoteCalculatorPage />} />
        <Route path="/calculator" element={<Navigate to="/dashboard/calculator" replace />} />
        
        {/* 5 Explicit Workspace Routes (Section 16 Spec) */}
        <Route path="/user/dashboard" element={<CustomerDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/customs/dashboard" element={<CustomsDashboard />} />
        <Route path="/agents/dashboard" element={<AgentOperationsDashboard />} />
        <Route path="/analytics/dashboard" element={<AnalyticsManagementDashboard />} />
        
        {/* Module Pages */}
        <Route path="/dashboard/new-shipment" element={<NewShipmentEnquiry />} />
        <Route path="/ship" element={<Navigate to="/dashboard/new-shipment" replace />} />
        <Route path="/dashboard/shipments" element={<Shipments />} />
        <Route path="/dashboard/routes" element={<RouteIntelligence />} />
        <Route path="/dashboard/master-data" element={<MasterData />} />
        <Route path="/quotes" element={<Navigate to="/dashboard?tab=quotations" replace />} />
      </Routes>
    </Router>
  )
}

export default App
