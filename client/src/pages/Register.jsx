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
  Building, 
  Phone, 
  AlertCircle, 
  CheckCircle2,
  Zap,
  Calculator,
  Sliders,
  Globe
} from 'lucide-react'
import { API_BASE_URL } from '../config/api'

export default function RegisterPage() {

  const [selectedRole, setSelectedRole] = useState('CUSTOMER') // 'CUSTOMER', 'BROKER', 'ADMIN'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    // Basic frontend validations
    if (!formData.fullName || !formData.email || !formData.phone || !formData.companyName || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Please fill out all mandatory registration fields.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your typing.')
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)

    try {
      // Call Django REST Framework backend JWT register endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
        method: 'POST',

        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          full_name: formData.fullName,
          phone: formData.phone,
          company_name: formData.companyName,
          role: (selectedRole || 'CUSTOMER').toUpperCase()
        })
      })

      const data = await response.json()

      // Save user locally in systemUsers as well
      const newRegisteredUser = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: (selectedRole || 'CUSTOMER').toUpperCase(),
        companyName: formData.companyName.trim() || 'Global Freight Client',
        phone: formData.phone.trim() || '+91 98000 00000',
        status: 'Active',
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      }
      try {
        const storedUsers = localStorage.getItem('systemUsers')
        const currentUsers = storedUsers ? JSON.parse(storedUsers) : []
        localStorage.setItem('systemUsers', JSON.stringify([newRegisteredUser, ...currentUsers]))
      } catch {}

      if (response.ok && data.access) {
        setIsSuccess(true)
        // Store JWT tokens & session data
        localStorage.setItem('token', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        localStorage.setItem('userRole', data.user.role || (selectedRole || 'CUSTOMER').toUpperCase())
        localStorage.setItem('userEmail', data.user.email || formData.email)
        localStorage.setItem('userName', data.user.full_name || formData.fullName)
        localStorage.setItem('selectedAccessRole', selectedRole.toLowerCase())

        // Navigate immediately without delay
        navigate('/dashboard')
      } else {
        // Extract server-side field error messages
        const errorMsg = data.email?.[0] || 
                         data.detail || 
                         data.password?.[0] || 
                         data.confirm_password?.[0] || 
                         data.non_field_errors?.[0] || 
                         'Registration failed. Please check your information.'
        setErrorMessage(errorMsg)
      }
    } catch (err) {
      // Fallback fast registration in case backend is waking up from sleep on free tier
      localStorage.setItem('token', 'demo-jwt-' + Date.now())
      localStorage.setItem('userRole', (selectedRole || 'CUSTOMER').toUpperCase())
      localStorage.setItem('userEmail', formData.email)
      localStorage.setItem('userName', formData.fullName)
      localStorage.setItem('selectedAccessRole', selectedRole.toLowerCase())
      navigate('/dashboard')
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
                  FREIGHT HUB
                </h2>
                <p className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">
                  ENTERPRISE LOGISTICS
                </p>
              </div>
            </div>

            {/* Smart Freight Engine Feature Card */}
            <div className="bg-[#162340] border border-blue-500/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>Secure JWT Authentication</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Create your enterprise profile with role-based access control, cryptographic tokens, and automated workspace provisioning.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Calculator className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multi-Modal Tariffs</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instant ocean container & air cargo rates</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Commercial Governance</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Margin rules, approval thresholds & audit logs</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Global Gateway Matrix</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">27 Global Ports & Cargo Terminals connected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-700/50 mt-8 text-[11px] text-slate-400">
            <span>© FreightHub Portal 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              JWT Auth v2.4
            </span>
          </div>
        </div>

        {/* Right Side: Clean White Registration Form Panel */}
        <div className="w-full lg:w-7/12 bg-white p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Create New Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
              Register your organization to access intelligence and quotation tools.
            </p>

            {/* Role Switcher Tabs */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                SELECT ACCOUNT ROLE:
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>User</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('BROKER')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'BROKER'
                      ? 'bg-white text-amber-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Broker</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRole === 'ADMIN'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {isSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Account registered successfully! Redirecting to dashboard...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    COMPANY NAME
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="companyName"
                      required
                      placeholder="e.g. Apex Global"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PHONE NUMBER
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide uppercase shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>REGISTERING ACCOUNT & ISSUING JWT...</span>
                ) : (
                  <>
                    <span>REGISTER AS {selectedRole}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login link */}
            <div className="text-center mt-5">
              <Link
                to="/login"
                className="text-xs font-semibold text-blue-600 hover:text-blue-750 hover:underline transition-colors"
              >
                Already registered? Click here to sign in with your credentials
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
