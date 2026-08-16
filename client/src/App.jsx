import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardRouter from './pages/DashboardRouter'
import NewShipmentEnquiry from './pages/NewShipmentEnquiry'
import Shipments from './pages/Shipments'
import MasterData from './pages/MasterData'
import RouteIntelligence from './pages/RouteIntelligence'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
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

