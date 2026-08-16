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
  MessageSquare
} from 'lucide-react'

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const activePath = location.pathname

  const [userEmail, setUserEmail] = useState('agent@freightiq.com')
  const [userName, setUserName] = useState('Agent')

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'agent@freightiq.com'
    setUserEmail(email)
    
    const name = localStorage.getItem('userName')
    if (name) {
      setUserName(name)
    } else {
      const localPart = email.split('@')[0]
      const cleanName = localPart
        .split(/[\._\-+]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
      setUserName(cleanName || 'Agent')
    }

    const currentRole = (
      localStorage.getItem('selectedAccessRole') ||
      localStorage.getItem('userRole') ||
      'broker'
    ).toLowerCase()
    setUserRole(currentRole)
  }, [])

  const [userRole, setUserRole] = useState('broker')

  let sections = []
  if (userRole === 'user' || userRole === 'customer') {
    sections = [
      {
        title: 'CUSTOMER PORTAL',
        items: [
          { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Request Quote', path: '/dashboard/new-shipment', icon: PlusCircle },
          { name: 'My Shipments', path: '/dashboard/shipments', icon: BarChart3 }
        ]
      }
    ]
  } else if (userRole === 'admin') {
    sections = [
      {
        title: 'ADMINISTRATION',
        items: [
          { name: 'Admin Console', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Master Data Management', path: '/dashboard/master-data', icon: Database },
          { name: 'System Shipments', path: '/dashboard/shipments', icon: BarChart3 },
          { name: 'Customer Feedback', path: '/dashboard?tab=feedback', icon: MessageSquare }
        ]
      }
    ]

  } else {
    // Broker Workbench
    sections = [
      {
        title: 'WORKBENCH',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Shipments', path: '/dashboard/shipments', icon: BarChart3 },
          { name: 'Quotations', path: '/dashboard?tab=quotations', icon: FileText }
        ]
      },
      {
        title: 'INTELLIGENCE',
        items: [
          { name: 'Routes', path: '/dashboard/routes', icon: MapPin }
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

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-6">
      <div>
        {/* Brand Header */}
        <div className={`px-6 flex items-center justify-between mb-6 ${isCollapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="transition-all duration-300">
                <span className="text-lg font-black tracking-tight text-slate-800">
                  PORT<span className="text-blue-600">LINE</span>
                </span>
                <p className="text-[9px] text-blue-600 font-extrabold tracking-wider uppercase">
                  Freight AI Workspace
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links grouped by Section */}
        <nav className="px-3 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-4 text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5 pt-2">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const query = location.search
                  const isActive = item.path.includes('?')
                    ? query === item.path.substring(item.path.indexOf('?'))
                    : activePath === item.path && !query
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.isMock ? '#' : item.path}
                      onClick={(e) => {
                        if (item.isMock) {
                          e.preventDefault()
                          alert(`${item.name} section is currently a placeholder for the presentation.`)
                        }
                        if (setIsMobileOpen) setIsMobileOpen(false)
                      }}
                      className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-700 transition-colors'}`} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="px-3 space-y-4">
        {/* User Account State (if not collapsed) */}
        {!isCollapsed && (
          <div className="mx-2 p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200 uppercase">
              {userName.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
              <span className="text-[10px] text-slate-500 block truncate">{userEmail}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-600 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (in-flow, never hides content) */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200 text-slate-600 z-30 shrink-0 transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 flex items-center justify-center shadow-md cursor-pointer focus:outline-none z-50 hover:text-slate-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>


      {/* Mobile Drawer (visible on mobile only, overlays content) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar drawer body */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-64 bg-white h-full flex flex-col shadow-2xl z-50 border-r border-slate-200"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  )
}
