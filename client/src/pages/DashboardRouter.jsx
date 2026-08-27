import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerDashboard from './CustomerDashboard'
import BrokerDashboard from './BrokerDashboard'
import AdminDashboard from './AdminDashboard'
import CustomsDashboard from './CustomsDashboard'
import AgentOperationsDashboard from './AgentOperationsDashboard'
import AnalyticsManagementDashboard from './AnalyticsManagementDashboard'

export default function DashboardRouter() {
  const [role, setRole] = useState(() => {
    return (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'customer'
    ).toLowerCase()
  })
  const navigate = useNavigate()

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
      localStorage.setItem('userEmail', 'alex@apexgl.com')
      localStorage.setItem('userName', 'Alex Shipper')
      localStorage.setItem('userRole', 'customer')
      localStorage.setItem('selectedAccessRole', 'customer')
      setRole('customer')
      return
    }

    const storedRole = (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'customer'
    ).toLowerCase()

    setRole(storedRole)
  }, [navigate])

  if (role === 'user' || role === 'customer') {
    return <CustomerDashboard />
  }

  if (role === 'admin') {
    return <AdminDashboard />
  }

  if (role === 'customs' || role === 'customs_officer') {
    return <CustomsDashboard />
  }

  if (role === 'agents' || role === 'agent_operator' || role === 'agent_op') {
    return <AgentOperationsDashboard />
  }

  if (role === 'analytics' || role === 'manager') {
    return <AnalyticsManagementDashboard />
  }

  // Default to Broker Dashboard for broker
  return <BrokerDashboard />
}
