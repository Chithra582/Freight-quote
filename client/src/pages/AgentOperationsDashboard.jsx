import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, 
  Truck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Send, 
  Edit3, 
  X, 
  Check, 
  Eye, 
  FileSearch, 
  Bell, 
  User, 
  Filter, 
  Search, 
  Layers, 
  Percent, 
  Sparkles,
  Scale,
  Calendar,
  Download
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { downloadQuotePDF } from '../utils/exportUtils'

// Initial quote queue for Freight Agent review (includes Page 9 test data)
const INITIAL_AGENT_QUOTES = [
  {
    id: 'QT-2026-1001',
    shipmentId: 'SHP-1001',
    customer: 'ABC Electronics Pvt Ltd',
    customerEmail: 'customer@apexgl.com',
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
    finalPrice: 86000,
    weatherRisk: '30/100 — Moderate',
    customsRisk: '40/100 — Medium',
    routeRisk: '20/100 — Low',
    overallRisk: 'MEDIUM',
    status: 'PENDING_REVIEW', // Waiting for agent review (Page 9)
    validUntil: 'Sep 18, 2026',
    carrier: 'Maersk Line Direct Service',
    highRisk: false,
    auditHistory: [
      { action: 'AI Orchestrator Execution', time: '10m ago', user: 'AI Orchestrator', note: 'Combined rule price, ML prediction, and composite risk' }
    ]
  },
  {
    id: 'QT-2026-00940',
    shipmentId: 'SHP-1005',
    customer: 'Zenith Chemical Corp',
    customerEmail: 'ops@zenithchem.com',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Antwerp (BEANR)',
    mode: 'Sea',
    container: '20OT',
    cargo: 'Industrial Solvents (Class 3 Flammable, 14,000 KG)',
    distanceKm: 9200,
    transitDays: '26 Days',
    rulePrice: 245000,
    aiPrice: 260000,
    recommendedPrice: 255000,
    finalPrice: 255000,
    weatherRisk: '65/100 — High Alert',
    customsRisk: '80/100 — Critical Flag',
    routeRisk: '45/100 — Moderate',
    overallRisk: 'HIGH',
    status: 'PENDING_REVIEW',
    validUntil: 'Aug 30, 2026',
    carrier: 'Hapag-Lloyd Express',
    highRisk: true,
    auditHistory: [
      { action: 'High Risk Alert Triggered', time: '20m ago', user: 'Risk Agent M3', note: 'HazMat IMO Class 3 documentation required' }
    ]
  },
  {
    id: 'QT-2026-00933',
    shipmentId: 'SHP-1006',
    customer: 'Nordic Imports AB',
    customerEmail: 'contact@nordicimp.se',
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Rotterdam (NLRTM)',
    mode: 'Sea',
    container: '40HC',
    cargo: 'Automotive Assemblies (12,500 KG)',
    distanceKm: 8950,
    transitDays: '25 Days',
    rulePrice: 215000,
    aiPrice: 210000,
    recommendedPrice: 212000,
    finalPrice: 212000,
    weatherRisk: '20/100 — Low',
    customsRisk: '15/100 — Low',
    routeRisk: '15/100 — Low',
    overallRisk: 'LOW',
    status: 'SENT',
    validUntil: 'Sep 05, 2026',
    carrier: 'MSC Mediterranean Shipping',
    highRisk: false,
    auditHistory: [
      { action: 'Quote Approved & Sent', time: '1h ago', user: 'Sarah Jenkins (Agent)', note: 'Commercially approved without revision' }
    ]
  }
]

export default function AgentOperationsDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [quotes, setQuotes] = useState(() => {
    const stored = localStorage.getItem('agentQuotesQueue')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    return INITIAL_AGENT_QUOTES
  })

  const [userName, setUserName] = useState('Sarah Jenkins')
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false)
  const [modifyForm, setModifyForm] = useState({
    newPrice: '',
    reason: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'overview'

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Sarah Jenkins'
    setUserName(name)
  }, [])

  useEffect(() => {
    localStorage.setItem('agentQuotesQueue', JSON.stringify(quotes))
  }, [quotes])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Open modify price modal (Scenario 9)
  const handleOpenModify = (q) => {
    setSelectedQuote(q)
    setModifyForm({
      newPrice: q.finalPrice || q.recommendedPrice,
      reason: ''
    })
    setIsModifyModalOpen(true)
  }

  // Save modified price with reason & audit record (Scenario 9)
  const handleSavePriceModification = (e) => {
    e.preventDefault()
    if (!modifyForm.newPrice || !modifyForm.reason.trim()) {
      alert('Please provide both the new price and an operational audit reason.')
      return
    }

    const updatedPrice = parseFloat(modifyForm.newPrice)
    const auditRecord = {
      action: 'Price Modified by Agent',
      user: `${userName} (Freight Agent)`,
      time: 'Just now',
      note: `Revised from ₹${selectedQuote.finalPrice?.toLocaleString()} to ₹${updatedPrice.toLocaleString()}. Reason: ${modifyForm.reason}`
    }

    const updatedQuotes = quotes.map(q => {
      if (q.id === selectedQuote.id) {
        return {
          ...q,
          finalPrice: updatedPrice,
          auditHistory: [auditRecord, ...(q.auditHistory || [])]
        }
      }
      return q
    })

    setQuotes(updatedQuotes)
    setIsModifyModalOpen(false)
    showToast(`Quote ${selectedQuote.id} price updated to ₹${updatedPrice.toLocaleString()} with audit record logged.`)
  }

  // Approve quote and send to customer (Scenario 10)
  const handleApproveAndSend = (quoteId) => {
    const auditRecord = {
      action: 'Final Quote Dispatched',
      user: `${userName} (Freight Agent)`,
      time: 'Just now',
      note: 'Commercial validation complete. Approved and sent to customer.'
    }

    const updated = quotes.map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          status: 'SENT',
          auditHistory: [auditRecord, ...(q.auditHistory || [])]
        }
      }
      return q
    })

    setQuotes(updated)

    // Sync to Customer quotes in localStorage so customer sees it immediately
    try {
      const storedCustomer = localStorage.getItem('customerQuotes')
      if (storedCustomer) {
        const parsedCust = JSON.parse(storedCustomer)
        const updatedCust = parsedCust.map(cq => {
          if (cq.id === quoteId) {
            return { ...cq, status: 'SENT' }
          }
          return cq
        })
        localStorage.setItem('customerQuotes', JSON.stringify(updatedCust))
      }
    } catch {}

    showToast(`Quotation ${quoteId} has been APPROVED and sent to customer!`)
  }

  // Dashboard KPI Cards matching Page 7: New Requests, Pending Reviews, High Risk Shipments, Quotes Sent Today
  const newRequestsCount = quotes.filter(q => q.status === 'DRAFT' || q.status === 'SUBMITTED' || q.status === 'PENDING_REVIEW').length
  const pendingReviewsCount = quotes.filter(q => q.status === 'PENDING_REVIEW').length
  const highRiskCount = quotes.filter(q => q.overallRisk === 'HIGH' || q.highRisk).length
  const quotesSentTodayCount = quotes.filter(q => q.status === 'SENT' || q.status === 'ACCEPTED').length

  const filteredQuotes = quotes.filter(q => {
    if (!searchQuery) return true
    const qStr = searchQuery.toLowerCase()
    return (
      q.id.toLowerCase().includes(qStr) ||
      (q.shipmentId && q.shipmentId.toLowerCase().includes(qStr)) ||
      q.customer.toLowerCase().includes(qStr) ||
      q.origin.toLowerCase().includes(qStr) ||
      q.destination.toLowerCase().includes(qStr)
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

          {/* Toast Notification */}
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

          {/* Scenario 9: Price Modification Modal */}
          {isModifyModalOpen && selectedQuote && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Modify Quote Price
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      {selectedQuote.id} · {selectedQuote.shipmentId}
                    </span>
                  </div>
                  <button onClick={() => setIsModifyModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-4 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rule-Based Price (M1):</span>
                    <span className="font-mono font-bold">₹{selectedQuote.rulePrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI ML Predicted (M2):</span>
                    <span className="font-mono font-bold text-indigo-600">₹{selectedQuote.aiPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AI Recommended:</span>
                    <span className="font-mono font-bold text-emerald-600">₹{selectedQuote.recommendedPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleSavePriceModification} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      NEW QUOTED AMOUNT (INR ₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={modifyForm.newPrice}
                      onChange={(e) => setModifyForm({ ...modifyForm, newPrice: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      OPERATIONAL MODIFICATION REASON (SCENARIO 9 AUDIT RECORD)
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Volume discount for long-term customer lane, fuel surcharge adjustment"
                      value={modifyForm.reason}
                      onChange={(e) => setModifyForm({ ...modifyForm, reason: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModifyModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                    >
                      Save & Log Audit Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Freight Agent Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-xs font-semibold text-amber-300 mb-3">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Freight Agent / Operations Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Commercial Quote Review Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Reviews shipment requests and AI analysis, validates commercial margins, modifies when required with audit logging, and approves final quotes for clients.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/dashboard/calculator"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Calculate New Quote</span>
              </Link>
              <Link
                to="/dashboard/shipments"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>All Shipments</span>
              </Link>
            </div>
          </div>

          {/* Page 7 Required KPI Cards: New Requests, Pending Reviews, High Risk Shipments, Quotes Sent Today */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="NEW REQUESTS"
              value={newRequestsCount.toString()}
              change="+2 incoming inquiries"
              isPositive={true}
              icon={Clock}
              color="blue"
            />
            <DashboardCard
              title="PENDING REVIEWS"
              value={pendingReviewsCount.toString()}
              change="Requires agent sign-off"
              isPositive={false}
              icon={FileText}
              color="amber"
            />
            <DashboardCard
              title="HIGH RISK SHIPMENTS"
              value={highRiskCount.toString()}
              change="HazMat / Extreme Weather"
              isPositive={false}
              icon={AlertTriangle}
              color="rose"
            />
            <DashboardCard
              title="QUOTES SENT TODAY"
              value={quotesSentTodayCount.toString()}
              change="Dispatched to customers"
              isPositive={true}
              icon={CheckCircle2}
              color="emerald"
            />
          </div>

          {/* Search & Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Link
                to="/agents/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'overview' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Quote Review Desk ({quotes.length})
              </Link>
              <Link
                to="/agents/dashboard?tab=shipment-requests"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'shipment-requests' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Shipment Requests
              </Link>
              <Link
                to="/agents/dashboard?tab=pricing-analysis"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'pricing-analysis' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                AI Pricing Analysis (M2)
              </Link>
              <Link
                to="/agents/dashboard?tab=risk-analysis"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'risk-analysis' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Risk Analysis (M3)
              </Link>
            </div>

            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shipment, shipper, lane..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tab: AI Pricing Analysis (M2) */}
          {activeTab === 'pricing-analysis' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">M2 · AI/ML Pricing Intelligence Comparison</h3>
                  <p className="text-xs text-slate-500">Historical pattern regression vs deterministic rule pricing.</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-bold rounded-full">
                  LightGBM v3.2 Model Active
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Shipment</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Rule Price (M1)</th>
                      <th className="p-3">AI ML Predicted (M2)</th>
                      <th className="p-3">Recommended</th>
                      <th className="p-3">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotes.map(q => {
                      const diff = (q.aiPrice || 0) - (q.rulePrice || 0)
                      return (
                        <tr key={q.id}>
                          <td className="p-3 font-bold">{q.id} ({q.shipmentId})</td>
                          <td className="p-3">{q.origin} → {q.destination}</td>
                          <td className="p-3 font-mono font-bold">₹{q.rulePrice?.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-indigo-600">₹{q.aiPrice?.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">₹{q.recommendedPrice?.toLocaleString()}</td>
                          <td className="p-3 font-mono font-bold">
                            <span className={diff < 0 ? 'text-emerald-600' : 'text-amber-600'}>
                              {diff < 0 ? '-' : '+'}₹{Math.abs(diff).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Risk Analysis (M3) */}
          {activeTab === 'risk-analysis' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">M3 · Composite Risk Intelligence Engine</h3>
                <p className="text-xs text-slate-500">Weather radar, customs document verification, and maritime corridor congestion.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-sky-600 uppercase">Weather Intelligence Agent</span>
                  <div className="text-xl font-black text-sky-950 mt-1">NOAA Radar Active</div>
                  <p className="text-xs text-sky-800 mt-1">Monitors tropical depressions, wave heights & typhoons across key trade loops.</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Customs Intelligence Agent</span>
                  <div className="text-xl font-black text-emerald-950 mt-1">HS Code Matching</div>
                  <p className="text-xs text-emerald-800 mt-1">Cross-references tariff regulations, dual-use restrictions & export clearances.</p>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Route Risk Agent</span>
                  <div className="text-xl font-black text-indigo-950 mt-1">Chokepoint Telemetry</div>
                  <p className="text-xs text-indigo-800 mt-1">Real-time Suez/Bab-el-Mandeb & Malacca strait transit latency evaluation.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Generated / Dispatched Quotes */}
          {activeTab === 'generated-quotes' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Commercial Generated Quotes & Dispatches</h3>
                  <p className="text-xs text-slate-500">Quotes commercially cleared, priced, and issued to customer portals.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                  {quotes.filter(q => q.status === 'SENT' || q.status === 'ACCEPTED').length} Quotes Dispatched
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Quote Ref</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Corridor</th>
                      <th className="p-3">Final Dispatched Price</th>
                      <th className="p-3">Client Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotes.filter(q => q.status === 'SENT' || q.status === 'ACCEPTED').map(q => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-amber-700">{q.id}</td>
                        <td className="p-3 font-bold text-slate-900">{q.customer}</td>
                        <td className="p-3">{q.origin} → {q.destination}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">₹{q.finalPrice?.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            q.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {q.status === 'ACCEPTED' ? 'BOOKED BY SHIPPER' : 'SENT TO CLIENT'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Customer Directory */}
          {activeTab === 'customers' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Freight Agent Shipper Directory</h3>
                  <p className="text-xs text-slate-500">Assigned commercial shippers, tier status, and credit profile.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'ABC Electronics Pvt Ltd', contact: 'Alex Shipper', email: 'customer@apexgl.com', volume: '14 TEU / month', tier: 'TIER 1 STRATEGIC' },
                  { name: 'Zenith Chemical Corp', contact: 'Vikram Mehta', email: 'ops@zenithchem.com', volume: '22 TEU / month', tier: 'HAZMAT VERIFIED' },
                  { name: 'Nordic Imports AB', contact: 'Lars Lindqvist', email: 'contact@nordicimp.se', volume: '8 TEU / month', tier: 'STANDARD CORPORATE' }
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{c.name}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                        {c.tier}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">Contact: {c.contact} ({c.email})</div>
                    <div className="text-[11px] font-mono text-slate-500">Booking Volume: {c.volume}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Documents Review Desk */}
          {activeTab === 'documents' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Commercial Shipping Documents Desk</h3>
                  <p className="text-xs text-slate-500">Bills of Lading, Commercial Invoices & Carrier contracts under review.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Commercial Invoice — SHP-1001', customer: 'ABC Electronics Pvt Ltd', status: 'Approved for Carriage', time: '15m ago' },
                  { name: 'Packing List — SHP-1002', customer: 'Apex Global Logistics', status: 'Approved for Carriage', time: '1h ago' },
                  { name: 'Dangerous Goods MSDS — SHP-1005', customer: 'Zenith Chemical Corp', status: 'Customs Officer Verification Required', time: '2h ago' }
                ].map((d, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{d.name}</span>
                      <span className="text-[11px] text-slate-500">Shipper: {d.customer} · {d.time}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Agent Operational Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Operational Desk Broadcasts</h3>
                  <p className="text-xs text-slate-500">Live system events and dispatch confirmations.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { title: 'New Quote Request Submitted: SHP-1001', time: 'Just now', note: '5-Agent multi-verification complete. Awaiting commercial sign-off.' },
                  { title: 'Carrier Bunker Surcharge Update', time: '1h ago', note: 'Maersk BAF adjusted +1.5% across Asia-Europe routes.' },
                  { title: 'Quote QT-2026-00930 Accepted by Shipper', time: '3h ago', note: 'ABC Electronics accepted quote terms. Shipment status set to Confirmed.' }
                ].map((n, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{n.title}</span>
                      <span className="text-[11px] text-slate-600 mt-0.5">{n.note}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Agent Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Freight Agent Desk Profile</h3>
                  <p className="text-xs text-slate-500">Commercial agent license details and margin discretionary limits.</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
                  Licensed Freight Broker
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Broker Full Name</span>
                  <div className="text-sm font-black text-slate-900">{userName}</div>
                  <span className="text-xs text-slate-500">Senior Commercial Quote Reviewer</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">License / ID</span>
                  <div className="text-sm font-black font-mono text-slate-900">FMC-OTI-029481 / MTO-IND-492</div>
                  <span className="text-xs text-emerald-600 font-semibold">Authorized Signatory</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Discretionary Price Limit</span>
                  <div className="text-sm font-black text-slate-900">Up to ₹50,00,000 per Quotation</div>
                  <span className="text-xs text-slate-500">Audit Logging Required for all modifications</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Hub Operations</span>
                  <div className="text-sm font-black text-slate-900">JNPT (INNSA), Chennai (INMAA), Mundra (INMUN)</div>
                  <span className="text-xs text-slate-500">Indian Subcontinent & Global Outbound</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Review Desk (Overview & Tab Default) */}
          {(activeTab === 'overview' || activeTab === 'shipment-requests' || activeTab === 'quote-requests' || activeTab === 'quote-review' || !['pricing-analysis', 'risk-analysis', 'generated-quotes', 'customers', 'documents', 'notifications', 'profile'].includes(activeTab)) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Shipment Requests & Quote Validation Queue
                  </h2>
                  <p className="text-xs text-slate-500">
                    Human review step (Page 4 Step 10). Modify prices with audit justification and dispatch finalized quotes.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {filteredQuotes.length} Enquiries in Queue
                </span>
              </div>

              <div className="space-y-4">
                {filteredQuotes.map((q) => {
                  const isSent = q.status === 'SENT' || q.status === 'ACCEPTED'
                  const isPending = q.status === 'PENDING_REVIEW'

                  return (
                    <div
                      key={q.id}
                      className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all ${
                        q.shipmentId === 'SHP-1001' ? 'border-amber-300 ring-2 ring-amber-500/10' : 'border-slate-200'
                      }`}
                    >
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs border border-amber-200">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">{q.id}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-mono font-bold">
                                {q.shipmentId}
                              </span>
                              {q.shipmentId === 'SHP-1001' && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                                  Page 9 Test Shipment
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              Customer: <strong className="text-slate-800">{q.customer}</strong> ({q.customerEmail})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                            isSent
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {q.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Route & Cargo Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROUTE CORRIDOR</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.origin}</span>
                          <span className="text-slate-500 text-[11px]">→ {q.destination}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COMMODITY & CONTAINER</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.cargo}</span>
                          <span className="text-slate-500 text-[11px]">{q.container} · {q.mode}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DISTANCE & ETA</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{q.distanceKm?.toLocaleString()} KM</span>
                          <span className="text-slate-500 text-[11px]">{q.transitDays}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FINAL APPROVED PRICE</span>
                          <span className="text-lg font-black text-slate-900 block mt-0.5">
                            ₹{q.finalPrice?.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-[10px]">{q.carrier}</span>
                        </div>
                      </div>

                      {/* AI Pricing & Risk Breakdown Matrix (Page 9 Output Alignment) */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Rule-Based Price (M1)</span>
                          <span className="font-mono font-bold text-slate-700">₹{q.rulePrice?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">AI ML Predicted (M2)</span>
                          <span className="font-mono font-bold text-indigo-600">₹{q.aiPrice?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Recommended Rate</span>
                          <span className="font-mono font-bold text-emerald-600">₹{q.recommendedPrice?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Weather & Customs</span>
                          <span className="text-slate-700 font-semibold">{q.weatherRisk}</span>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase block">Composite Risk (M3)</span>
                          <span className={`font-bold font-mono ${
                            q.overallRisk === 'HIGH' ? 'text-rose-600' : q.overallRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {q.overallRisk}
                          </span>
                        </div>
                      </div>

                      {/* Audit History (Scenario 9 Audit Trail) */}
                      {q.auditHistory && q.auditHistory.length > 0 && (
                        <div className="mb-4 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-[11px] space-y-1">
                          <span className="font-bold text-amber-900 block text-[10px] uppercase tracking-wider">Audit Trail (Scenario 9):</span>
                          {q.auditHistory.map((ah, i) => (
                            <div key={i} className="flex items-center justify-between text-slate-600">
                              <span><strong>{ah.action}</strong>: {ah.note}</span>
                              <span className="font-mono text-[10px] text-slate-400 ml-2">{ah.time}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Agent Action Buttons (Scenario 9 & 10) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-slate-500">
                          {isSent ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Quote approved and delivered to client portal.
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">
                              Pending human approval. You may modify the pricing or dispatch immediately.
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModify(q)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Modify Price (Scenario 9)</span>
                          </button>

                          {isPending && (
                            <button
                              onClick={() => handleApproveAndSend(q.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Approve & Send Quote (Scenario 10)</span>
                            </button>
                          )}

                          <button
                            onClick={() => downloadQuotePDF(q)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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
