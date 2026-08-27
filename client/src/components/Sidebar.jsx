import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Truck,
  FileText,
  MapPin,
  Activity,
  Users,
  Database,
  Anchor,
  MessageSquare,
  Calculator,
  ShieldCheck,
  Percent,
  ListChecks,
  Scale,
  Cpu,
  TrendingUp,
  UserCheck,
  Briefcase
} from 'lucide-react'

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const activePath = location.pathname

  const [userEmail, setUserEmail] = useState('alex@apexgl.com')
  const [userName, setUserName] = useState('Alex Shipper')
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'alex@apexgl.com'
    setUserEmail(email)
    
    const name = localStorage.getItem('userName') || 'Alex Shipper'
    setUserName(name)

    const currentRole = (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'user'
    ).toLowerCase()
    setUserRole(currentRole)
  }, [location.pathname])

  const handleRoleSwitch = (newRole) => {
    setUserRole(newRole.toLowerCase())
    localStorage.setItem('selectedAccessRole', newRole.toLowerCase())
    localStorage.setItem('userRole', newRole.toLowerCase())

    let dest = '/dashboard'
    if (newRole === 'user' || newRole === 'customer') dest = '/user/dashboard'
    else if (newRole === 'admin') dest = '/admin/dashboard'
    else if (newRole === 'customs_officer') dest = '/customs/dashboard'
    else if (newRole === 'agent_operator') dest = '/agents/dashboard'
    else if (newRole === 'manager') dest = '/analytics/dashboard'
    else if (newRole === 'broker') dest = '/dashboard'

    navigate(dest)
  }

  let sections = []
  if (userRole === 'user' || userRole === 'customer') {
    sections = [
      {
        title: 'USER WORKSPACE',
        items: [
          { name: 'User Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
          { name: '⚡ Quote Calculator', path: '/dashboard/calculator', icon: Calculator },
          { name: 'Create Shipment', path: '/dashboard/new-shipment', icon: PlusCircle },
          { name: 'My Shipments & Tracking', path: '/dashboard/shipments', icon: BarChart3 }
        ]
      }
    ]
  } else if (userRole === 'admin') {
    sections = [
      {
        title: 'ADMIN WORKSPACE',
        items: [
          { name: 'Admin Console', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: '⚡ Quote Calculator', path: '/dashboard/calculator', icon: Calculator },
          { name: 'User Management', path: '/admin/dashboard?tab=users', icon: Users },
          { name: 'Margin Policies', path: '/admin/dashboard?tab=margin-policy', icon: Percent },
          { name: 'Approval Rules', path: '/admin/dashboard?tab=approval-rules', icon: ListChecks },
          { name: 'Master Data & Ports', path: '/dashboard/master-data', icon: Database },
          { name: 'Customer Feedback', path: '/admin/dashboard?tab=feedback', icon: MessageSquare }
        ]
      }
    ]
  } else if (userRole === 'customs_officer' || userRole === 'customs') {
    sections = [
      {
        title: 'CUSTOMS COMPLIANCE',
        items: [
          { name: 'Customs Workspace', path: '/customs/dashboard', icon: Scale },
          { name: 'Pending Reviews', path: '/customs/dashboard', icon: ShieldCheck },
          { name: '⚡ Quote Calculator', path: '/dashboard/calculator', icon: Calculator }
        ]
      }
    ]
  } else if (userRole === 'agent_operator' || userRole === 'agents' || userRole === 'agent_op') {
    sections = [
      {
        title: 'AI AGENT OPERATIONS',
        items: [
          { name: 'Agent Operations Center', path: '/agents/dashboard', icon: Cpu },
          { name: 'Route Intelligence', path: '/dashboard/routes', icon: MapPin },
          { name: '⚡ Quote Calculator', path: '/dashboard/calculator', icon: Calculator }
        ]
      }
    ]
  } else if (userRole === 'manager' || userRole === 'analytics') {
    sections = [
      {
        title: 'ANALYTICS & MANAGEMENT',
        items: [
          { name: 'Analytics Command Center', path: '/analytics/dashboard', icon: TrendingUp },
          { name: 'Margin Yield & Telemetry', path: '/analytics/dashboard', icon: BarChart3 },
          { name: '⚡ Quote Calculator', path: '/dashboard/calculator', icon: Calculator }
        ]
      }
    ]
  } else {
    // Broker Control Desk
    sections = [
      {
        title: 'BROKER WORKBENCH',
        items: [
          { name: 'Broker Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: '⚡ Quote Calculator', path: '/dashboard/calculator', icon: Calculator },
          { name: 'Approvals Queue', path: '/dashboard?tab=approvals', icon: ShieldCheck },
          { name: 'Shipments', path: '/dashboard/shipments', icon: BarChart3 },
          { name: 'Routes Intelligence', path: '/dashboard/routes', icon: MapPin }
        ]
      }
    ]
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    navigate('/')
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Freight<span className="text-blue-600">IQ</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  5-Workspace Engine
                </span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Role / Workspace Switcher */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-1">
            <label className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Active Workspace Role (RBAC)
            </label>
            <select
              value={userRole}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-inner"
            >
              <option value="user">1. USER (Customer / Shipper)</option>
              <option value="admin">2. ADMIN (System Owner)</option>
              <option value="customs_officer">3. CUSTOMS (Compliance)</option>
              <option value="agent_operator">4. AGENT OP (AI Ops Center)</option>
              <option value="manager">5. MANAGER (Analytics / Mgmt)</option>
              <option value="broker">6. BROKER (Commercial Desk)</option>
            </select>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && section.title && (
                <div className="px-3 mb-2 text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon
                const isSelected = activePath === item.path || (item.path.includes('?') && location.search.includes(item.path.split('?')[1]))

                return (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all relative group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-extrabold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}

                    {isSelected && (
                      <motion.div 
                        layoutId="activePill"
                        className="absolute right-2 w-1.5 h-4 rounded-full bg-blue-600" 
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        {/* User Info / Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className={`flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">{userName}</span>
                  <span className="text-[10px] text-indigo-600 truncate uppercase font-extrabold">{userRole.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  )
}
