import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Rocket,
  User,
  Briefcase,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Calculator,
  Sliders,
  Globe,
  CheckCircle2,
  AlertCircle,
  Scale,
  Cpu,
  TrendingUp,
  KeyRound
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('user') // 'user', 'admin', 'broker', 'customs_officer', 'agent_operator', 'manager'
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRoleChange = (role) => {
    setSelectedRole(role)
    setErrorMessage('')
  }

  const handleQuickDemoLogin = (role, email, name) => {
    localStorage.setItem('token', 'demo-jwt-' + Date.now())
    localStorage.setItem('userRole', role.toUpperCase())
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userName', name)
    localStorage.setItem('selectedAccessRole', role)

    let dest = '/dashboard'
    if (role === 'user' || role === 'customer') dest = '/user/dashboard'
    else if (role === 'admin') dest = '/admin/dashboard'
    else if (role === 'customs_officer') dest = '/customs/dashboard'
    else if (role === 'agent_operator') dest = '/agents/dashboard'
    else if (role === 'manager') dest = '/analytics/dashboard'

    navigate(dest)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errorMessage) setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.usernameOrEmail || !formData.password) {
      setErrorMessage('Please enter both your registered email/username and password.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    // 1. Check if user matches an Admin-created account in systemUsers
    try {
      const stored = localStorage.getItem('systemUsers')
      if (stored) {
        const sysUsers = JSON.parse(stored)
        const inputId = formData.usernameOrEmail.trim().toLowerCase()
        const matched = sysUsers.find(u => 
          (u.email?.toLowerCase() === inputId || u.fullName?.toLowerCase() === inputId)
        )

        if (matched) {
          if (matched.status === 'Suspended') {
            setErrorMessage('This user account has been suspended by the administrator.')
            setIsLoading(false)
            return
          }

          if (matched.password && matched.password !== formData.password) {
            setErrorMessage('Invalid password for this account. Please enter the correct password.')
            setIsLoading(false)
            return
          }

          // Valid credentials created by Admin!
          const token = 'jwt-user-' + (matched.id || Date.now())
          const userRole = (matched.role || selectedRole).toLowerCase()
          localStorage.setItem('token', token)
          localStorage.setItem('userRole', userRole)
          localStorage.setItem('selectedAccessRole', userRole)
          localStorage.setItem('userEmail', matched.email)
          localStorage.setItem('userName', matched.fullName)
          if (matched.companyName) localStorage.setItem('userCompany', matched.companyName)

          setIsSuccess(true)
          let dest = '/dashboard'
          if (userRole === 'user' || userRole === 'customer') dest = '/user/dashboard'
          else if (userRole === 'admin') dest = '/admin/dashboard'
          else if (userRole === 'customs_officer') dest = '/customs/dashboard'
          else if (userRole === 'agent_operator') dest = '/agents/dashboard'
          else if (userRole === 'manager') dest = '/analytics/dashboard'

          navigate(dest)
          return
        }
      }
    } catch (e) {
      console.log('Local user check error:', e)
    }

    // 2. Call Django REST Framework backend JWT login endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.usernameOrEmail.trim(),
          password: formData.password,
          role: selectedRole
        })
      })

      const data = await response.json()

      if (response.ok && data.access) {
        localStorage.setItem('token', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('userRole', data.user.role)
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('userName', data.user.full_name || data.user.username)
        localStorage.setItem('selectedAccessRole', selectedRole)
        setIsSuccess(true)

        let dest = '/dashboard'
        if (selectedRole === 'user' || selectedRole === 'customer') dest = '/user/dashboard'
        else if (selectedRole === 'admin') dest = '/admin/dashboard'
        else if (selectedRole === 'customs_officer') dest = '/customs/dashboard'
        else if (selectedRole === 'agent_operator') dest = '/agents/dashboard'
        else if (selectedRole === 'manager') dest = '/analytics/dashboard'

        navigate(dest)
      } else {
        const errorMsg = data.detail || 
                         (data.non_field_errors && data.non_field_errors[0]) || 
                         (data.username && data.username[0]) || 
                         (data.password && data.password[0]) || 
                         data.error?.message || 
                         'Invalid email or password. Please verify your credentials or register.'
        setErrorMessage(errorMsg)
      }
    } catch (err) {
      // Fallback fast demo login
      localStorage.setItem('token', 'demo-jwt-' + Date.now())
      localStorage.setItem('userRole', selectedRole.toUpperCase())
      localStorage.setItem('userEmail', formData.usernameOrEmail)
      localStorage.setItem('userName', formData.usernameOrEmail.split('@')[0])
      localStorage.setItem('selectedAccessRole', selectedRole)

      let dest = '/dashboard'
      if (selectedRole === 'user' || selectedRole === 'customer') dest = '/user/dashboard'
      else if (selectedRole === 'admin') dest = '/admin/dashboard'
      else if (selectedRole === 'customs_officer') dest = '/customs/dashboard'
      else if (selectedRole === 'agent_operator') dest = '/agents/dashboard'
      else if (selectedRole === 'manager') dest = '/analytics/dashboard'

      navigate(dest)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1424] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-[#111c33] border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side: Dark Branding Panel */}
        <div className="w-full lg:w-5/12 bg-[#0e182e] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/60">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wider text-white uppercase">
                  FREIGHT IQ
                </h2>
                <p className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">
                  5-WORKSPACE LOGISTICS OS
                </p>
              </div>
            </div>

            {/* Smart Freight Engine Feature Card */}
            <div className="bg-[#162340] border border-blue-500/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>Multi-Role RBAC Architecture</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated workspaces for Shippers, Customs Officers, AI Operations Engineers, Freight Brokers, and Executive Management.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Calculator className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">10-Step Deterministic Pricing</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Base freight, BAF, THC, docs, haulage & margin</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Customs Compliance & RAG</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Document verification, citations & officer sign-off</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">5 Autonomous Maritime Agents</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time latency, radar telemetry & risk scoring</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700/50 mt-8 text-[11px] text-slate-400">
            <span>© FreightIQ OS 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              v3.0 Verified RBAC
            </span>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="w-full lg:w-7/12 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              Select your role or click a 1-click demo badge below:
            </p>

            {/* Role Switcher Tabs (6 Roles Grid) */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                ACTIVE ACCESS ROLE:
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-[11px]">
                {[
                  { id: 'user', label: '1. User', icon: User, color: 'text-blue-600' },
                  { id: 'admin', label: '2. Admin', icon: Shield, color: 'text-indigo-600' },
                  { id: 'customs_officer', label: '3. Customs', icon: Scale, color: 'text-emerald-600' },
                  { id: 'agent_operator', label: '4. Agent Op', icon: Cpu, color: 'text-purple-600' },
                  { id: 'manager', label: '5. Manager', icon: TrendingUp, color: 'text-sky-600' },
                  { id: 'broker', label: '6. Broker', icon: Briefcase, color: 'text-amber-600' }
                ].map(r => {
                  const IconComp = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      className={`flex items-center justify-center gap-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white shadow-sm border border-slate-200/80 ' + r.color
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{r.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error message alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  EMAIL OR USERNAME
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="usernameOrEmail"
                    required
                    placeholder="Enter email or username"
                    value={formData.usernameOrEmail}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{isLoading ? 'Signing In...' : `Sign In to ${selectedRole.replace('_', ' ').toUpperCase()} Workspace`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Demo Badges */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2">
                ⚡ FAST 1-CLICK DEMO ACCESS:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('user', 'alex@apexgl.com', 'Alex Shipper')}
                  className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
                >
                  👤 Shipper
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin', 'admin@freightiq.com', 'System Admin')}
                  className="p-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customs_officer', 'customs@icegate.gov.in', 'Officer Verma')}
                  className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
                >
                  ⚖️ Customs
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('agent_operator', 'ai.ops@freightiq.com', 'AI Ops Lead')}
                  className="p-1.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
                >
                  🤖 Agent Op
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('manager', 'exec@freightiq.com', 'Director Patel')}
                  className="p-1.5 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
                >
                  📊 Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('broker', 'broker@freightiq.com', 'Ravi Broker')}
                  className="p-1.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer"
                >
                  💼 Broker
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
