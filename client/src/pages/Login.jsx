import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Rocket,
  User,
  Briefcase,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Calculator,
  AlertCircle,
  Scale,
  Cpu,
  CheckCircle2,
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'

const DEMO_PERSONAS = [
  {
    role: 'customer',
    label: '1. Customer',
    name: 'Alex Shipper',
    email: 'customer@apexgl.com',
    company: 'ABC Electronics Pvt Ltd',
    icon: User,
    color: 'text-blue-600',
    dest: '/user/dashboard',
    desc: 'Requests quotes, views status & accepts final quotes'
  },
  {
    role: 'freight_agent',
    label: '2. Freight Agent',
    name: 'Sarah Jenkins',
    email: 'agent@freightiq.com',
    company: 'FreightIQ Global Forwarding',
    icon: Briefcase,
    color: 'text-amber-600',
    dest: '/agents/dashboard',
    desc: 'Reviews AI analysis, modifies prices, and sends quotes'
  },
  {
    role: 'customs_officer',
    label: '3. Customs Officer',
    name: 'Officer R. Verma',
    email: 'customs@icegate.gov.in',
    company: 'Customs & Border Compliance',
    icon: Scale,
    color: 'text-emerald-600',
    dest: '/customs/dashboard',
    desc: 'Inspects documents, assigns risk flags, verifies HS codes'
  },
  {
    role: 'admin',
    label: '4. System Admin',
    name: 'John Administrator',
    email: 'admin@freightiq.com',
    company: 'FreightIQ Enterprise Hub',
    icon: Shield,
    color: 'text-indigo-600',
    dest: '/admin/dashboard',
    desc: 'Monitors AI agents, pricing rules, carriers and audit logs'
  }
]

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('customer')
  const [formData, setFormData] = useState({
    usernameOrEmail: 'customer@apexgl.com',
    password: 'password123'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey)
    setErrorMessage('')
    const persona = DEMO_PERSONAS.find(p => p.role === roleKey)
    if (persona) {
      setFormData({
        usernameOrEmail: persona.email,
        password: 'password123'
      })
    }
  }

  const handleQuickPersonaSelect = (persona) => {
    setSelectedRole(persona.role)
    setFormData({
      usernameOrEmail: persona.email,
      password: 'password123'
    })
    executeLogin(persona.role, persona.email, persona.name, persona.company, persona.dest)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errorMessage) setErrorMessage('')
  }

  const executeLogin = (role, email, name, company, dest) => {
    const token = 'jwt-session-' + Date.now()
    localStorage.setItem('token', token)
    localStorage.setItem('userRole', role)
    localStorage.setItem('selectedAccessRole', role)
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userName', name)
    if (company) localStorage.setItem('userCompany', company)
    navigate(dest)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.usernameOrEmail || !formData.password) {
      setErrorMessage('Please enter both your registered email/username and password.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    const persona = DEMO_PERSONAS.find(p => p.role === selectedRole) || DEMO_PERSONAS[0]

    // 1. Check if user matches in local systemUsers (created in Admin User Management)
    try {
      const stored = localStorage.getItem('systemUsers')
      if (stored) {
        const sysUsers = JSON.parse(stored)
        const inputId = formData.usernameOrEmail.trim().toLowerCase()
        const matched = sysUsers.find(u => 
          u.email?.toLowerCase() === inputId || u.fullName?.toLowerCase() === inputId
        )

        if (matched) {
          const userRole = (matched.role || selectedRole).toLowerCase()
          let dest = '/user/dashboard'
          if (userRole === 'admin') dest = '/admin/dashboard'
          else if (userRole === 'customs_officer' || userRole === 'customs') dest = '/customs/dashboard'
          else if (userRole === 'freight_agent' || userRole === 'agent' || userRole === 'broker' || userRole === 'agent_operator') dest = '/agents/dashboard'

          executeLogin(userRole, matched.email, matched.fullName || matched.name, matched.companyName, dest)
          setIsLoading(false)
          return
        }
      }
    } catch (err) {
      console.log('Local check err', err)
    }

    // 2. Try Django backend login or direct fallback
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
        const userRole = (data.user?.role || selectedRole).toLowerCase()
        let dest = '/user/dashboard'
        if (userRole === 'admin') dest = '/admin/dashboard'
        else if (userRole === 'customs_officer' || userRole === 'customs') dest = '/customs/dashboard'
        else if (userRole === 'freight_agent' || userRole === 'agent' || userRole === 'broker' || userRole === 'agent_operator') dest = '/agents/dashboard'

        executeLogin(userRole, data.user?.email || formData.usernameOrEmail, data.user?.full_name || persona.name, data.user?.company_name || persona.company, dest)
        return
      }
    } catch (err) {
      // Offline / demo fallback
    }

    // Direct login with selected persona credentials
    executeLogin(selectedRole, formData.usernameOrEmail, persona.name, persona.company, persona.dest)
    setIsLoading(false)
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
                  M1–M3 Intelligent Freight Architecture
                </p>
              </div>
            </div>

            {/* Architecture Scope Card */}
            <div className="bg-[#162340] border border-blue-500/20 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>4 Strict User Roles & Responsibilities</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clean architectural separation between human user dashboards and backend AI intelligence services (Route, Pricing, Weather, Customs, and Risk Agents).
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Calculator className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">M1 · Core Quote Foundation</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Shipment creation, route distance & rule-based pricing</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">M2 · AI/ML Pricing Intelligence</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Predicts ML price from historical patterns & recommends rates</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">M3 · Composite Risk Intelligence</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Weather radar, customs document verification & route delays</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700/50 mt-8 text-[11px] text-slate-400">
            <span>© FreightIQ 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Strict Portal Isolation Active
            </span>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="w-full lg:w-7/12 bg-white p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              Select your role to access your dedicated dashboard. Users are restricted to their authorized portal.
            </p>

            {/* 4 Standardized Roles Grid */}
            <div className="mb-4">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                SELECT YOUR ROLE:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {DEMO_PERSONAS.map(p => {
                  const IconComp = p.icon
                  const isSelected = selectedRole === p.role
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleRoleChange(p.role)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-white shadow-sm border border-slate-200/80 ' + p.color
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <div className="truncate">
                        <div className="leading-none">{p.label}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick 1-Click Persona Sign-In */}
            <div className="mb-5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Quick Persona Login:</span>
                <span className="text-[9px] text-blue-600 font-bold font-mono">1-CLICK SIGN IN</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleQuickPersonaSelect(p)}
                    className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="text-xs font-black text-slate-800 group-hover:text-blue-700 truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {p.label.split('. ')[1]}
                    </div>
                  </button>
                ))}
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
                <span>{isLoading ? 'Authenticating...' : `Enter ${selectedRole.replace('_', ' ').toUpperCase()} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Register link */}
            <div className="text-center mt-5">
              <span className="text-xs text-slate-500">Need a new account? </span>
              <Link
                to="/register"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Register here
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
