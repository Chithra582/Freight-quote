import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Sparkles
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import InstantQuoteCalculator from '../components/InstantQuoteCalculator'
import { downloadQuotePDF } from '../utils/exportUtils'
import { API_BASE_URL } from '../config/api'

const CUSTOMER_QUOTES = [
  {
    id: 'QT-2026-00930',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Jebel Ali (AEJEA)',
    mode: 'Ocean',
    service: 'Maersk Line Direct Express',
    sellPrice: '₹3,84,500',
    status: 'Issued',
    validUntil: 'Aug 22, 2026',
    transitDays: '6 - 8 Days',
    cargo: '1 x 40HC Container (Textiles, 18,400 kg)',
    trackingStep: 2
  },
  {
    id: 'QT-2026-00812',
    origin: 'Bengaluru (INBLR)',
    destination: 'Frankfurt (DEFRA)',
    mode: 'Air',
    service: 'Lufthansa Cargo Priority',
    sellPrice: '₹2,15,000',
    status: 'Booked',
    validUntil: 'Aug 18, 2026',
    transitDays: '2 - 3 Days',
    cargo: '12 Cartons (Electronics, 450 kg)',
    trackingStep: 3
  },
  {
    id: 'QT-2026-00744',
    origin: 'Chennai (INMAA)',
    destination: 'Singapore (SGSIN)',
    mode: 'Ocean',
    service: 'ONE Alliance Loop',
    sellPrice: '₹1,48,350',
    status: 'Issued',
    validUntil: 'Aug 28, 2026',
    transitDays: '5 Days',
    cargo: '2 x 40HC Containers (Automotive Parts)',
    trackingStep: 2
  }
]

export default function CustomerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [quotes, setQuotes] = useState(CUSTOMER_QUOTES)
  const [userName, setUserName] = useState('Alex Shipper')
  const [userEmail, setUserEmail] = useState('user@freighthub.com')
  const [acceptedQuotes, setAcceptedQuotes] = useState({})
  const [activeShipmentCount, setActiveShipmentCount] = useState(3)
  const [activeTab, setActiveTab] = useState('quotes') // 'quotes' | 'calculator'
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
    }
    const name = localStorage.getItem('userName') || 'Alex Shipper'
    const email = localStorage.getItem('userEmail') || 'user@freighthub.com'
    setUserName(name)
    setUserEmail(email)

    // Load any newly requested quotes
    const stored = localStorage.getItem('customerQuotes')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(p => p.id))
          const remaining = CUSTOMER_QUOTES.filter(q => !existingIds.has(q.id))
          setQuotes([...parsed, ...remaining])
        }
      } catch (err) {
        console.error(err)
      }
    }

    // Load active shipments count
    const storedShipments = localStorage.getItem('allShipments')
    if (storedShipments) {
      try {
        const parsedShips = JSON.parse(storedShipments)
        if (Array.isArray(parsedShips) && parsedShips.length > 0) {
          setActiveShipmentCount(parsedShips.length)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }, [navigate])

  const handleAcceptQuote = (quoteId) => {
    setAcceptedQuotes(prev => ({ ...prev, [quoteId]: true }))
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Booked' } : q))
    alert(`Quotation ${quoteId} has been successfully ACCEPTED! Booking reference generated.`)
  }

  const handleDeclineQuote = (quoteId) => {
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Declined' } : q))
    alert(`Quotation ${quoteId} declined.`)
  }

  const handleSavedQuoteFromCalc = (newQuote) => {
    setQuotes(prev => [newQuote, ...prev])
    setActiveTab('quotes')
  }

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'air':
      case 'air cargo priority': return <Plane className="w-4 h-4 text-sky-500" />
      case 'ocean':
      case 'sea':
      case 'ocean fcl':
      case 'ocean lcl': return <Anchor className="w-4 h-4 text-blue-600" />
      case 'rail': return <Train className="w-4 h-4 text-purple-600" />
      default: return <Truck className="w-4 h-4 text-indigo-500" />
    }
  }

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

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-200 mb-3">
                <Shield className="w-3.5 h-3.5 text-blue-300" />
                <span>Verified Customer Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
                Track active shipments, test live freight calculations (Base Freight, BAF, THC, Docs & Margin), and issue verified quotes.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'calculator' ? 'bg-emerald-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>⚡ Quote Calculator</span>
              </button>

              <Link
                to="/dashboard/new-shipment"
                className="px-4 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>5-Agent Verification</span>
              </Link>
            </div>

            {/* Background glowing circles */}
            <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="ACTIVE SHIPMENTS"
              value={activeShipmentCount.toString()}
              change="+1 this week"
              isPositive={true}
              icon={Truck}
              color="blue"
            />
            <DashboardCard
              title="PENDING QUOTATIONS"
              value={quotes.length.toString()}
              change="Active proposals"
              isPositive={true}
              icon={FileText}
              color="amber"
            />
            <DashboardCard
              title="BOOKED FREIGHT"
              value="₹7,94,500"
              change="Total spend (YTD)"
              isPositive={true}
              icon={TrendingUp}
              color="emerald"
            />
            <DashboardCard
              title="AVERAGE TRANSIT"
              value="4.8 Days"
              change="99.2% on-time SLA"
              isPositive={true}
              icon={Clock}
              color="indigo"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'quotes'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Active Quotations ({quotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Quote Calculator (Chennai → Singapore)</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: QUOTATIONS LIST */}
          {/* ========================================================================= */}
          {activeTab === 'quotes' && (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Your Active Quotations & Enquiries
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review commercial proposals with guaranteed validity timers and transparent pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <span>⚡ Open Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quote Cards */}
              <div className="space-y-4 mt-6">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="bg-slate-50 hover:bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Route & Cargo details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800">
                            {quote.id}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/80 text-[11px] font-semibold text-slate-700">
                            {getModeIcon(quote.mode)}
                            <span>{quote.mode}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            quote.dispatchedStatus === 'Dispatched to Client' || quote.status === 'Dispatched to Client' || quote.status === 'Dispatched' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            quote.status === 'Issued' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            quote.status === 'Booked' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            quote.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {quote.dispatchedStatus || quote.status}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            Valid until: <strong className="text-slate-600">{quote.validUntil}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-800 pt-1">
                          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{quote.origin}</span>
                          <span className="text-slate-400 font-normal">➔</span>
                          <span>{quote.destination}</span>
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                          Carrier Service: <span className="text-slate-800 font-semibold">{quote.service}</span> • Estimated Transit: <span className="text-slate-800 font-semibold">{quote.transitDays}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          Cargo: {quote.cargo}
                        </p>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            TOTAL ALL-IN SELL RATE
                          </span>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {quote.sellPrice}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {quote.status === 'Issued' && (
                            <>
                              <button
                                onClick={() => handleAcceptQuote(quote.id)}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Quote</span>
                              </button>

                              <button
                                onClick={() => handleDeclineQuote(quote.id)}
                                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                              >
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => downloadQuotePDF(quote)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Download Quote PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INSTANT QUOTE CALCULATOR */}
          {/* ========================================================================= */}
          {activeTab === 'calculator' && (
            <InstantQuoteCalculator onSaveToDashboard={handleSavedQuoteFromCalc} />
          )}

        </main>
      </div>
    </div>
  )
}
