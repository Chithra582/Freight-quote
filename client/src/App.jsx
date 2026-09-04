import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardRouter from './pages/DashboardRouter'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CustomsDashboard from './pages/CustomsDashboard'
import AgentOperationsDashboard from './pages/AgentOperationsDashboard'
import NewShipmentEnquiry from './pages/NewShipmentEnquiry'
import Shipments from './pages/Shipments'
import MasterData from './pages/MasterData'
import RouteIntelligence from './pages/RouteIntelligence'
import QuoteCalculatorPage from './pages/QuoteCalculatorPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Unified Smart Dashboard Router (Redirects to authenticated role's isolated dashboard) */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/calculator" element={<QuoteCalculatorPage />} />
        <Route path="/calculator" element={<Navigate to="/dashboard/calculator" replace />} />
        
        {/* 4 Isolated Portal Routes with Strict Role-Based Access Guards */}
        {/* 1. Customer Portal */}
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['customer', 'user']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/customer/dashboard" element={<Navigate to="/user/dashboard" replace />} />

        {/* 2. Freight Agent Portal */}
        <Route 
          path="/agents/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['freight_agent', 'agent', 'agent_operator', 'broker']}>
              <AgentOperationsDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/agent/dashboard" element={<Navigate to="/agents/dashboard" replace />} />

        {/* 3. Customs Officer Portal */}
        <Route 
          path="/customs/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['customs_officer', 'customs']}>
              <CustomsDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 4. Admin Portal */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Module Pages */}
        <Route path="/dashboard/new-shipment" element={<NewShipmentEnquiry />} />
        <Route path="/ship" element={<Navigate to="/dashboard/new-shipment" replace />} />
        <Route path="/dashboard/shipments" element={<Shipments />} />
        <Route 
          path="/dashboard/routes" 
          element={
            <ProtectedRoute allowedRoles={['freight_agent', 'agent', 'agent_operator', 'broker', 'admin']}>
              <RouteIntelligence />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/master-data" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MasterData />
            </ProtectedRoute>
          } 
        />
        <Route path="/quotes" element={<Navigate to="/dashboard?tab=quotes" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
