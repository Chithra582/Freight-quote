import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerDashboard from './CustomerDashboard'
import BrokerDashboard from './BrokerDashboard'
import AdminDashboard from './AdminDashboard'

export default function DashboardRouter() {
  const [role, setRole] = useState(() => {
    return (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'broker'
    ).toLowerCase()
  })
  const navigate = useNavigate()

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
      localStorage.setItem('userEmail', 'broker@freighthub.com')
      localStorage.setItem('userName', 'Ravi S.')
      localStorage.setItem('userRole', 'broker')
      localStorage.setItem('selectedAccessRole', 'broker')
      setRole('broker')
      return
    }

    const storedRole = (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'broker'
    ).toLowerCase()

    setRole(storedRole)
  }, [navigate])

  if (role === 'user' || role === 'customer') {
    return <CustomerDashboard />
  }

  if (role === 'admin') {
    return <AdminDashboard />
  }

  // Default to Broker Dashboard for broker / senior broker
  return <BrokerDashboard />
}

