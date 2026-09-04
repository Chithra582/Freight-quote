import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Plane, 
  Anchor, 
  Train, 
  FileText, 
  Download, 
  ArrowRight, 
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  Shield,
  ExternalLink,
  Calculator,
  Sparkles,
  Check,
  X,
  ShieldAlert,
  Bell,
  FileCheck,
  User as UserIcon,
  Search,
  Eye
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import InstantQuoteCalculator from '../components/InstantQuoteCalculator'
import { downloadQuotePDF } from '../utils/exportUtils'

// Page 9 Test Shipment Data seeded directly into customer quotes
const DEFAULT_CUSTOMER_QUOTES = [
  {
    id: 'QT-2026-1001',
    shipmentId: 'SHP-1001',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Chennai, India (INMAA)',
    destination: 'Rotterdam, Netherlands (NLRTM)',
    mode: 'Sea',
    container: '40FT',
    cargo: 'Electronics (5,000 KG · 12 CBM)',
    distanceKm: 8950,
    transitDays: '24 Days',
    rulePrice: 87000,
    aiPrice: 85500,
    recommendedPrice: 86000,
    sellPrice: '₹86,000',
    weatherRisk: '30/100 (Moderate)',
    customsRisk: '40/100 (Medium)',
    routeRisk: '20/100 (Low)',
    compositeRisk: 'MEDIUM',
    status: 'SENT', // Ready for customer decision (Page 4 Step 11/12)
    validUntil: 'Sep 18, 2026',
    carrier: 'Maersk Line Direct Service',
    ownerEmail: 'customer@apexgl.com'
  },
  {
    id: 'QT-2026-00930',
    shipmentId: 'SHP-1002',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Jebel Ali (AEJEA)',
    mode: 'Sea',
    container: '40HC',
    cargo: 'Telecom Switchgear (18,400 KG)',
    distanceKm: 2400,
    transitDays: '7 Days',
    rulePrice: 395000,
    aiPrice: 382000,
    recommendedPrice: 384500,
    sellPrice: '₹3,84,500',
    weatherRisk: '15/100 (Low)',
    customsRisk: '10/100 (Low)',
    routeRisk: '12/100 (Low)',
    compositeRisk: 'LOW',
    status: 'ACCEPTED',
    validUntil: 'Aug 22, 2026',
    carrier: 'MSC Mediterranean Shipping',
    ownerEmail: 'customer@apexgl.com'
  },
  {
    id: 'QT-2026-00812',
    shipmentId: 'SHP-1003',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Bengaluru (INBLR)',
    destination: 'Frankfurt (DEFRA)',
    mode: 'Air',
    container: 'Air Pallet',
    cargo: 'Microcontrollers (450 KG)',
    distanceKm: 7600,
    transitDays: '2 Days',
    rulePrice: 220000,
    aiPrice: 212000,
    recommendedPrice: 215000,
    sellPrice: '₹2,15,000',
    weatherRisk: '20/100 (Low)',
    customsRisk: '25/100 (Low)',
    routeRisk: '18/100 (Low)',
    compositeRisk: 'LOW',
    status: 'ACCEPTED',
    validUntil: 'Aug 18, 2026',
    carrier: 'Lufthansa Cargo Priority',
    ownerEmail: 'customer@apexgl.com'
  },
  {
    id: 'QT-2026-00744',
    shipmentId: 'SHP-1004',
    customer: 'ABC Electronics Pvt Ltd',
    origin: 'Chennai (INMAA)',
    destination: 'Singapore (SGSIN)',
    mode: 'Sea',
    container: '20GP',
    cargo: 'Semiconductor Wafers (3,200 KG)',
    distanceKm: 3100,
    transitDays: '5 Days',
    rulePrice: 152000,
    aiPrice: 146000,
    recommendedPrice: 148350,
    sellPrice: '₹1,48,350',
    weatherRisk: '35/100 (Moderate)',
    customsRisk: '20/100 (Low)',
    routeRisk: '22/100 (Low)',
    compositeRisk: 'LOW',
    status: 'PENDING_REVIEW',
    validUntil: 'Aug 28, 2026',
    carrier: 'ONE Ocean Network Express',
    ownerEmail: 'customer@apexgl.com'
  }
]

export default function CustomerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [quotes, setQuotes] = useState(() => {
    const stored = localStorage.getItem('customerQuotes')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    return DEFAULT_CUSTOMER_QUOTES
  })

  const [userName, setUserName] = useState('Alex Shipper')
  const [userEmail, setUserEmail] = useState('customer@apexgl.com')
  const [searchQuery, setSearchQuery] = useState('')
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  // Read active tab from URL query params (Section 6 Side Navigation)
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Alex Shipper'
    const email = localStorage.getItem('userEmail') || 'customer@apexgl.com'
    setUserName(name)
    setUserEmail(email)
  }, [])

  // Save quotes changes to localStorage
  useEffect(() => {
    localStorage.setItem('customerQuotes', JSON.stringify(quotes))
  }, [quotes])

  const showNotification = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Scenario 12: Customer accepts quote -> status updated to ACCEPTED
  const handleAcceptQuote = (quoteId) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'ACCEPTED' }
      }
      return q
    }))
    showNotification(`Quotation ${quoteId} has been ACCEPTED! Booking reference confirmed.`)
  }

  const handleRejectQuote = (quoteId) => {
    setQuotes(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status: 'REJECTED' }
      }
      return q
    }))
    showNotification(`Quotation ${quoteId} has been REJECTED.`)
  }

  // Scenario 11: Customer accesses another quote -> Access Denied
  const handleSimulateCrossQuoteAccess = () => {
    setUnauthorizedAttempt({
      quoteId: 'QT-EXT-99882',
      owner: 'Pacific Worldwide Logistics Ltd',
      reason: 'Cross-Tenant Access Policy: Shippers may only inspect quotes belonging to their registered corporate account.'
    })
  }

  // Dashboard KPI Cards matching Page 7: Total Shipments, Active Requests, Pending Quotes, Accepted Quotes, Recent Activity
  const totalShipments = quotes.length
  const activeRequests = quotes.filter(q => q.status === 'SUBMITTED' || q.status === 'PROCESSING' || q.status === 'PENDING_REVIEW' || q.status === 'SENT').length
  const pendingQuotes = quotes.filter(q => q.status === 'PENDING_REVIEW' || q.status === 'SENT').length
  const acceptedQuotesCount = quotes.filter(q => q.status === 'ACCEPTED').length
  const recentActivityText = `Quote ${quotes[0]?.id || 'SHP-1001'} status: ${quotes[0]?.status || 'SENT'}`

  const filteredQuotes = quotes.filter(q => {
    if (!searchQuery) return true
    const qStr = searchQuery.toLowerCase()
    return (
      q.id.toLowerCase().includes(qStr) ||
      (q.shipmentId && q.shipmentId.toLowerCase().includes(qStr)) ||
      q.origin.toLowerCase().includes(qStr) ||
      q.destination.toLowerCase().includes(qStr) ||
      q.cargo.toLowerCase().includes(qStr)
    )
  })

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* Toast Alert */}
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage('')} className="p-1 hover:bg-emerald-700 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Scenario 11 Access Denied Modal */}
          {unauthorizedAttempt && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-mono font-bold uppercase inline-block mb-2">
                  Test Scenario 11 · Access Denied
                </span>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Access Restricted
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Attempted to access external quotation <strong className="text-rose-600">{unauthorizedAttempt.quoteId}</strong> belonging to <strong>{unauthorizedAttempt.owner}</strong>.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 mb-5">
                  <span className="font-bold block text-slate-800 mb-1">Enforced Security Check:</span>
                  {unauthorizedAttempt.reason}
                </div>
                <button
                  onClick={() => setUnauthorizedAttempt(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Close & Return to My Quotes
                </button>
              </div>
            </div>
          )}

          {/* Customer Portal Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 mb-3">
                <Shield className="w-3.5 h-3.5 text-blue-300" />
                <span>Customer Portal · ABC Electronics Pvt Ltd</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
                Submit shipment requests, track AI/ML price calculations, inspect risk flags, and accept finalized freight quotations.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2.5">
              <Link
                to="/dashboard/calculator"
                className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow flex items-center gap-2 transition-all"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Request Quote</span>
              </Link>
              <Link
                to="/dashboard/shipments"
                className="px-4 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-all"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>My Shipments</span>
              </Link>
              <button
                onClick={handleSimulateCrossQuoteAccess}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Verify Scenario 11 security isolation"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Scenario 11</span>
              </button>
            </div>

            <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          </div>

          {/* Section 6 (Page 7) Required KPI Cards: Total Shipments, Active Requests, Pending Quotes, Accepted Quotes, Recent Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <DashboardCard
              title="TOTAL SHIPMENTS"
              value={totalShipments.toString()}
              change="All booked & quoting"
              isPositive={true}
              icon={Truck}
              color="blue"
            />
            <DashboardCard
              title="ACTIVE REQUESTS"
              value={activeRequests.toString()}
              change="In AI & Ops pipeline"
              isPositive={true}
              icon={Clock}
              color="indigo"
            />
            <DashboardCard
              title="PENDING QUOTES"
              value={pendingQuotes.toString()}
              change="Awaiting final decision"
              isPositive={true}
              icon={FileText}
              color="amber"
            />
            <DashboardCard
              title="ACCEPTED QUOTES"
              value={acceptedQuotesCount.toString()}
              change="Confirmed bookings"
              isPositive={true}
              icon={CheckCircle2}
              color="emerald"
            />
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                RECENT ACTIVITY
              </span>
              <div className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">
                {recentActivityText}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold mt-1">Updated 2m ago</span>
            </div>
          </div>

          {/* Tab Navigation / Filter Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Link
                to="/user/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Dashboard Overview
              </Link>
              <Link
                to="/user/dashboard?tab=quotes"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'quotes' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                My Quotes ({quotes.length})
              </Link>
              <Link
                to="/user/dashboard?tab=documents"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'documents' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Documents
              </Link>
              <Link
                to="/user/dashboard?tab=notifications"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Notifications
              </Link>
            </div>

            <div className="relative w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quote ID, route..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section: Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-1">Corporate Shipping Documents</h3>
              <p className="text-xs text-slate-500 mb-5">Compliance documents uploaded for customs inspection & clearance.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Commercial Invoice (Signed)', type: 'PDF · 1.4 MB', date: 'Aug 14, 2026', verified: true },
                  { name: 'Packing List (Gross 5,000 KG)', type: 'PDF · 820 KB', date: 'Aug 14, 2026', verified: true },
                  { name: 'Certificate of Origin (Form AIFTA)', type: 'PDF · 2.1 MB', date: 'Aug 15, 2026', verified: true }
                ].map((doc, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.type} · {doc.date}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-1">Intelligence & Review Feed</h3>
              <p className="text-xs text-slate-500 mb-5">Live audit trail from AI Orchestrator and Freight Agent operations.</p>
              <div className="space-y-3">
                {[
                  { title: 'Freight Agent Approved Quote QT-2026-1001', desc: 'Commercial discount applied. Final quote dispatched to client desk.', time: '10m ago', type: 'quote' },
                  { title: 'Risk Intelligence M3 Passed', desc: 'Weather: 30/100 (Moderate), Customs: 40/100 (Medium), Route: 20/100 (Low).', time: '25m ago', type: 'risk' },
                  { title: 'AI Pricing Engine M2 Predicted ₹85,500', desc: 'Historical regression against 28,490 spot records. Recommended: ₹86,000.', time: '32m ago', type: 'pricing' }
                ].map((n, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{n.title}</span>
                      <span className="text-[11px] text-slate-500">{n.desc}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Quotations List (Page 9 Test Shipment SHP-1001 Featured) */}
          {(activeTab === 'overview' || activeTab === 'quotes') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Active Freight Quotations & Decision Desk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inspect AI pricing breakdowns, composite risk scores, and accept or reject quotes (Page 4 Step 12).
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {filteredQuotes.length} Quotes Loaded
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredQuotes.map((q) => {
                  const isAccepted = q.status === 'ACCEPTED'
                  const isRejected = q.status === 'REJECTED'
                  const isSent = q.status === 'SENT'
                  const isPending = q.status === 'PENDING_REVIEW'

                  return (
                    <div
                      key={q.id}
                      className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all ${
                        q.shipmentId === 'SHP-1001' ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200'
                      }`}
                    >
                      {/* Quote Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs border border-blue-100">
                            {q.mode === 'Air' ? <Plane className="w-5 h-5" /> : <Anchor className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">{q.id}</span>
                              {q.shipmentId && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-black font-mono">
                                  {q.shipmentId}
                                </span>
                              )}
                              {q.shipmentId === 'SHP-1001' && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold">
                                  Page 9 Test Shipment
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {q.customer} · {q.carrier}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                            isAccepted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isSent
                              ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {q.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Route & Cargo Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROUTE CORRIDOR</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.origin}</span>
                          <span className="text-slate-500 text-[11px]">→ {q.destination}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CARGO SPECIFICATION</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.cargo}</span>
                          <span className="text-slate-500 text-[11px]">{q.container} · {q.mode} Freight</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DISTANCE & TRANSIT</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.distanceKm ? `${q.distanceKm.toLocaleString()} KM` : '8,950 KM'}</span>
                          <span className="text-slate-500 text-[11px]">{q.transitDays}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FINAL PRICE</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">{q.sellPrice}</span>
                          <span className="text-slate-400 text-[10px]">Valid until: {q.validUntil}</span>
                        </div>
                      </div>

                      {/* AI Intelligence Layer (Page 9 Results) */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Rule-Based Price (M1)</span>
                          <span className="font-mono font-bold text-slate-700">₹{q.rulePrice ? q.rulePrice.toLocaleString() : '87,000'}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">AI ML Predicted (M2)</span>
                          <span className="font-mono font-bold text-indigo-600">₹{q.aiPrice ? q.aiPrice.toLocaleString() : '85,500'}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Recommended Rate</span>
                          <span className="font-mono font-bold text-emerald-600">₹{q.recommendedPrice ? q.recommendedPrice.toLocaleString() : '86,000'}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Composite Risk (M3)</span>
                          <span className={`font-bold font-mono ${
                            q.compositeRisk === 'HIGH' ? 'text-rose-600' : q.compositeRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {q.compositeRisk} · {q.weatherRisk}
                          </span>
                        </div>
                      </div>

                      {/* Customer Actions (Step 12: Accept / Reject Quote) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          {isAccepted && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Quote accepted by client. Commercial booking confirmed.
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <X className="w-3.5 h-3.5" /> Quote rejected by client. Lifecycle marked closed.
                            </span>
                          )}
                          {isSent && (
                            <span className="text-blue-600 font-medium">
                              Quote approved by Freight Agent Sarah Jenkins. Please review commercial terms.
                            </span>
                          )}
                          {isPending && (
                            <span className="text-amber-600 font-medium">
                              Under Freight Agent & Customs Officer review. Quote will be sent shortly.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {(isSent || isPending) && (
                            <>
                              <button
                                onClick={() => handleAcceptQuote(q.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept Quote</span>
                              </button>
                              <button
                                onClick={() => handleRejectQuote(q.id)}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                              >
                                <span>Decline</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => downloadQuotePDF(q)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
