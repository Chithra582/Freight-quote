import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Truck, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Plane, 
  Anchor, 
  Train, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Calendar,
  Layers,
  CircleDot,
  Calculator,
  User,
  Building,
  Mail,
  Phone,
  Info,
  RotateCcw,
  ArrowRight,
  Search,
  Eye,
  Download,
  Edit3,
  Sliders,
  DollarSign,
  CheckCircle2,
  FileText,
  X,
  Check
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { downloadQuotePDF, exportQuotesCSV } from '../utils/exportUtils'

const INITIAL_QUOTES = [
  {
    id: 'QT-2026-00934',
    customer: 'Sharma Textiles',
    customerCity: 'Mumbai',
    carrier: 'Maersk Line Direct Service',
    originCode: 'INNSA',
    destCode: 'AEJEA',
    originName: 'Mumbai',
    destName: 'Dubai',
    lane: 'INNSA → AEJEA',
    laneDesc: 'Mumbai → Dubai',
    mode: 'Ocean FCL',
    basis: '2 × 40HC',
    transit: '6–10 d',
    cost: '₹ 4,25,156',
    baseCost: 388346,
    brokerMargin: 36810,
    marginPct: 9.5,
    status: 'Dispatched to Client',
    created: '2 min ago',
    weight: '18,400 kg'
  },
  {
    id: 'QT-2026-00933',
    customer: 'Nordic Imports AB',
    customerCity: 'Gothenburg',
    carrier: 'MSC Mediterranean Shipping',
    originCode: 'INNSA',
    destCode: 'NLRTM',
    originName: 'Mumbai',
    destName: 'Rotterdam',
    lane: 'INNSA → NLRTM',
    laneDesc: 'Mumbai → Rotterdam',
    mode: 'Ocean FCL',
    basis: '1 × 20GP',
    transit: '24–28 d',
    cost: '₹ 2,15,800',
    baseCost: 194414,
    brokerMargin: 21386,
    marginPct: 11.0,
    status: 'Issued',
    created: '1 hour ago',
    weight: '12,500 kg'
  },
  {
    id: 'QT-2026-00932',
    customer: 'Gulf Machinery LLC',
    customerCity: 'Dubai',
    carrier: 'Emirates SkyCargo Priority',
    originCode: 'BOM',
    destCode: 'DXB',
    originName: 'Mumbai',
    destName: 'Dubai',
    lane: 'BOM → DXB',
    laneDesc: 'Mumbai → Dubai',
    mode: 'Air Freight',
    basis: '250 kg ch.',
    transit: '5–7 d',
    cost: '₹ 64,300',
    baseCost: 56890,
    brokerMargin: 7410,
    marginPct: 13.0,
    status: 'Issued',
    created: '3 hours ago',
    weight: '250 kg'
  },
  {
    id: 'QT-2026-00931',
    customer: 'Sharma Textiles',
    customerCity: 'Mumbai',
    carrier: 'ONE Ocean Network Express',
    originCode: 'INNSA',
    destCode: 'SGSIN',
    originName: 'Mumbai',
    destName: 'Singapore',
    lane: 'INNSA → SGSIN',
    laneDesc: 'Mumbai → Singapore',
    mode: 'Ocean LCL',
    basis: '4.2 R/T',
    transit: '11–16 d',
    cost: '₹ 88,400',
    baseCost: 79200,
    brokerMargin: 9200,
    marginPct: 11.6,
    status: 'Draft',
    created: 'Yesterday',
    weight: '3,200 kg'
  }
]

export default function BrokerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [quotes, setQuotes] = useState(INITIAL_QUOTES)
  const [searchQuery, setSearchQuery] = useState('')
  const [laneFilter, setLaneFilter] = useState('All lanes')
  const [modeFilter, setModeFilter] = useState('All modes')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [userName, setUserName] = useState('Freight Broker')

  // Adjust Quote Modal State
  const [adjustingQuote, setAdjustingQuote] = useState(null)
  const [adjBaseRate, setAdjBaseRate] = useState(0)
  const [adjMarginPct, setAdjMarginPct] = useState(10)
  const [adjFuelSurcharge, setAdjFuelSurcharge] = useState(0)
  const [adjAncillaries, setAdjAncillaries] = useState(0)

  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const selectedQuoteId = queryParams.get('quoteId')

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
    }
    const name = localStorage.getItem('userName') || 'Freight Broker'
    setUserName(name)

    const storedQuotes = localStorage.getItem('brokerQuotes')
    if (storedQuotes) {
      try {
        const parsed = JSON.parse(storedQuotes)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map(q => q.id))
          const remaining = INITIAL_QUOTES.filter(q => !ids.has(q.id))
          setQuotes([...parsed, ...remaining])
        }
      } catch (err) {
        console.error(err)
      }
    }
  }, [])

  const handleOpenAdjustModal = (q) => {
    setAdjustingQuote(q)
    const base = q.baseCost || 350000
    setAdjBaseRate(base)
    setAdjMarginPct(q.marginPct || 10)
    setAdjFuelSurcharge(Math.round(base * 0.085))
    setAdjAncillaries(28500)
  }

  const handleSaveAdjustment = () => {
    if (!adjustingQuote) return
    const subtotal = adjBaseRate + adjFuelSurcharge + adjAncillaries
    const marginAmount = Math.round(subtotal * (adjMarginPct / 100))
    const totalInvoiced = subtotal + marginAmount

    // 1. Update broker quotes list
    const updated = quotes.map(q => {
      if (q.id === adjustingQuote.id) {
        return {
          ...q,
          cost: `₹ ${totalInvoiced.toLocaleString('en-IN')}`,
          baseCost: subtotal,
          brokerMargin: marginAmount,
          marginPct: adjMarginPct,
          status: 'Dispatched to Client'
        }
      }
      return q
    })

    setQuotes(updated)
    localStorage.setItem('brokerQuotes', JSON.stringify(updated))

    // 2. Synchronize to customer quotes list
    try {
      const storedCust = localStorage.getItem('customerQuotes')
      let custList = storedCust ? JSON.parse(storedCust) : []
      let foundInCust = false
      custList = custList.map(cq => {
        if (cq.id === adjustingQuote.id || cq.customer === adjustingQuote.customer) {
          foundInCust = true
          return {
            ...cq,
            sellPrice: `₹ ${totalInvoiced.toLocaleString('en-IN')}`,
            status: 'Issued',
            dispatchedStatus: 'Dispatched to Client',
            service: adjustingQuote.carrier || cq.service || 'Maersk Line Direct Service',
            trackingStep: 2
          }
        }
        return cq
      })
      if (!foundInCust) {
        custList.unshift({
          id: adjustingQuote.id,
          origin: adjustingQuote.originName || 'Nhava Sheva (INNSA)',
          destination: adjustingQuote.destName || 'Jebel Ali (AEJEA)',
          mode: adjustingQuote.mode?.includes('Air') ? 'Air' : 'Ocean',
          service: adjustingQuote.carrier || 'Maersk Line Direct Express',
          sellPrice: `₹ ${totalInvoiced.toLocaleString('en-IN')}`,
          status: 'Issued',
          dispatchedStatus: 'Dispatched to Client',
          validUntil: 'Aug 24, 2026',
          transitDays: adjustingQuote.transit || '6 - 8 Days',
          cargo: `${adjustingQuote.basis || '1 x 40HC'} (${adjustingQuote.weight || '18,400 kg'})`,
          trackingStep: 2
        })
      }
      localStorage.setItem('customerQuotes', JSON.stringify(custList))
    } catch (err) {
      console.error('Customer quotes sync error:', err)
    }

    // 3. Update allShipments status from 'Pending Pickup' to 'Vessel Dispatched'
    try {
      const storedShipments = localStorage.getItem('allShipments')
      let shipList = storedShipments ? JSON.parse(storedShipments) : []
      if (shipList.length > 0) {
        shipList = shipList.map(s => {
          if (s.id === adjustingQuote.id || s.status === 'Pending Pickup' || s.status === 'Pending Booking') {
            return {
              ...s,
              status: 'Vessel Dispatched',
              shippingMethod: adjustingQuote.mode?.includes('Air') ? 'AIR' : 'FCL',
              declaredValue: totalInvoiced.toString()
            }
          }
          return s
        })
      } else {
        shipList = [
          {
            id: 'SH-4021',
            origin: adjustingQuote.originName || 'Maharashtra',
            destination: adjustingQuote.destName || 'Gujarat',
            mode: adjustingQuote.mode?.includes('Air') ? 'Air' : 'Ocean',
            status: 'Vessel Dispatched',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            shippingMethod: 'FCL',
            items: [
              { id: 1, packageType: 'container', containerType: '40hc', unitCount: '1', weight: '18400', commodity: 'Commercial Export Cargo', hsCode: '6109.10' }
            ],
            declaredValue: totalInvoiced.toString(),
            currency: 'INR',
            specialInstructions: 'Commercial quote approved and dispatched by Broker.'
          }
        ]
      }
      localStorage.setItem('allShipments', JSON.stringify(shipList))
    } catch (err) {
      console.error('Shipments sync error:', err)
    }

    setAdjustingQuote(null)
    alert(`Quotation ${adjustingQuote.id} dispatched! Customer portal and My Shipments statuses updated to "Vessel Dispatched / Issued".`)
  }

  const handleBrokerAcceptQuote = (q) => {
    const updated = quotes.map(item => item.id === q.id ? { ...item, status: 'Dispatched to Client' } : item)
    setQuotes(updated)
    localStorage.setItem('brokerQuotes', JSON.stringify(updated))

    try {
      const storedCust = localStorage.getItem('customerQuotes')
      let custList = storedCust ? JSON.parse(storedCust) : []
      custList = custList.map(cq => cq.id === q.id ? { ...cq, status: 'Issued', dispatchedStatus: 'Dispatched to Client' } : cq)
      localStorage.setItem('customerQuotes', JSON.stringify(custList))
    } catch (err) {
      console.error(err)
    }

    try {
      const storedShipments = localStorage.getItem('allShipments')
      let shipList = storedShipments ? JSON.parse(storedShipments) : []
      shipList = shipList.map(s => s.id === q.id ? { ...s, status: 'Vessel Dispatched' } : s)
      localStorage.setItem('allShipments', JSON.stringify(shipList))
    } catch (err) {
      console.error(err)
    }

    alert(`Quotation ${q.id} accepted & dispatched to customer!`)
  }

  const handleBrokerDeclineQuote = (q) => {
    const updated = quotes.map(item => item.id === q.id ? { ...item, status: 'Declined' } : item)
    setQuotes(updated)
    localStorage.setItem('brokerQuotes', JSON.stringify(updated))

    try {
      const storedCust = localStorage.getItem('customerQuotes')
      let custList = storedCust ? JSON.parse(storedCust) : []
      custList = custList.map(cq => cq.id === q.id ? { ...cq, status: 'Declined', dispatchedStatus: 'Declined by Broker' } : cq)
      localStorage.setItem('customerQuotes', JSON.stringify(custList))
    } catch (err) {
      console.error(err)
    }

    alert(`Quotation ${q.id} declined.`)
  }



  const getModeTag = (mode) => {
    const isAir = mode?.toLowerCase().includes('air')
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
        isAir ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
      }`}>
        {isAir ? <Plane className="w-3 h-3" /> : <Anchor className="w-3 h-3" />}
        <span>{mode}</span>
      </span>
    )
  }

  const getStatusBadge = (status) => {
    if (status === 'Dispatched to Client') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Dispatched</span>
        </span>
      )
    }
    if (status === 'Issued') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Issued
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Draft
      </span>
    )
  }

  const currentQuote = quotes.find(q => q.id === selectedQuoteId) || quotes[0]

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.lane && q.lane.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (modeFilter !== 'All modes' && !q.mode.toLowerCase().includes(modeFilter.toLowerCase().replace('ocean ', ''))) return false
    if (statusFilter !== 'All statuses' && q.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    return matchesSearch
  })

  // Quotation Detail view (Screen 3)
  const renderQuotationDetail = () => (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
          >
            ← Back to Client Quotes
          </button>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{currentQuote.id}</span>
            <span className="text-sm font-bold text-slate-400">· {currentQuote.customer}</span>
            {getStatusBadge(currentQuote.status)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdjustModal(currentQuote)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Adjust Rate & Margin
          </button>
          <button
            onClick={() => downloadQuotePDF(currentQuote)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* Detail Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Commercial Freight Build-Up</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Main Carrier Linehaul Base Cost</span>
              <span className="font-bold text-slate-800 font-mono">₹ {(currentQuote.baseCost || 388346).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Broker Markup & Spread Margin ({currentQuote.marginPct || 9.5}%)</span>
              <span className="font-bold text-emerald-600 font-mono">+ ₹ {(currentQuote.brokerMargin || 36810).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-slate-800 text-sm">
              <span className="font-black text-slate-900">Total Client Invoiced Price</span>
              <span className="font-black text-blue-600 font-mono text-base">{currentQuote.cost}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-100">Routing & Assignment</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Trade Corridor</span>
              <div className="font-bold text-white text-sm mt-0.5">{currentQuote.lane}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Carrier</span>
              <div className="font-bold text-cyan-400 mt-0.5">{currentQuote.carrier || 'Maersk Line Direct'}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Transit</span>
              <div className="font-bold text-white mt-0.5">{currentQuote.transit} (96% On-Time)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#f3f5f8] text-slate-800 font-sans antialiased overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-5 md:p-6 space-y-4 max-w-7xl w-full mx-auto">
          
          {selectedQuoteId ? (
            renderQuotationDetail()
          ) : (
            <>
              {/* Top Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Broker Console</div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Quotations & Margin Workbench</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => exportQuotesCSV(quotes, 'freightiq_quotations.csv')}
                    className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                  <button
                    onClick={() => handleOpenAdjustModal(quotes[0])}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Adjust Quote
                  </button>
                </div>
              </div>

              {/* KPIs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">Quotes this month</div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">248</div>
                  <div className="text-[11px] font-bold text-emerald-600">↑ 12% vs last month</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">Avg quote turnaround</div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">42s</div>
                  <div className="text-[11px] font-bold text-emerald-600">↓ target &lt; 60s</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">Routes analysed</div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">1,284</div>
                  <div className="text-[11px] font-semibold text-slate-500">3.2 avg per enquiry</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-400 font-semibold tracking-wide">Lanes with no service</div>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight my-1">6</div>
                  <div className="text-[11px] font-bold text-rose-600">needs master data</div>
                </div>
              </div>

              {/* Quotations Table Card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                
                {/* Filter Bar */}
                <div className="p-3.5 border-b border-slate-100 flex flex-wrap gap-2.5 items-center">
                  <div className="relative flex-1 min-w-[200px] max-w-[280px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Quote no, customer, lane…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={laneFilter}
                    onChange={e => setLaneFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    <option>All lanes</option>
                    <option>Asia–Europe</option>
                    <option>Middle East</option>
                  </select>

                  <select
                    value={modeFilter}
                    onChange={e => setModeFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    <option>All modes</option>
                    <option>Ocean FCL</option>
                    <option>Ocean LCL</option>
                    <option>Air</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-medium cursor-pointer"
                  >
                    <option>All statuses</option>
                    <option>Draft</option>
                    <option>Issued</option>
                    <option>Dispatched to Client</option>
                  </select>

                  <button 
                    onClick={() => { setSearchQuery(''); setLaneFilter('All lanes'); setModeFilter('All modes'); setStatusFilter('All statuses'); }}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Clear
                  </button>

                  <span className="ml-auto text-xs text-slate-400 font-medium">{filteredQuotes.length} results</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10.5px] uppercase font-bold text-slate-600 tracking-wider">
                      <tr>
                        <th className="text-left px-4 py-3">Quote no</th>
                        <th className="text-left px-4 py-3">Customer</th>
                        <th className="text-left px-4 py-3">Lane</th>
                        <th className="text-left px-3 py-3">Mode</th>
                        <th className="text-left px-3 py-3">Basis</th>
                        <th className="text-left px-3 py-3">Transit</th>
                        <th className="text-left px-4 py-3">Indicative total</th>
                        <th className="text-left px-3 py-3">Status</th>
                        <th className="text-left px-3 py-3">Created</th>
                        <th className="text-right px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                          
                          {/* Quote ID */}
                          <td className="px-4 py-3.5 font-mono font-bold text-blue-600">
                            {q.id}
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-800">{q.customer}</div>
                            <div className="text-[10.5px] text-slate-400">{q.customerCity || 'Mumbai'}</div>
                          </td>

                          {/* Lane */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono text-slate-800 font-semibold">{q.lane}</div>
                            <div className="text-[10.5px] text-slate-400">{q.laneDesc || 'Direct Corridor'}</div>
                          </td>

                          {/* Mode */}
                          <td className="px-3 py-3.5">
                            {getModeTag(q.mode)}
                          </td>

                          {/* Basis */}
                          <td className="px-3 py-3.5 font-mono text-slate-700">
                            {q.basis || '2 × 40HC'}
                          </td>

                          {/* Transit */}
                          <td className="px-3 py-3.5 font-medium text-slate-700">
                            {q.transit || '6–10 d'}
                          </td>

                          {/* Cost + Margin */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-slate-900">{q.cost}</div>
                            {q.brokerMargin && (
                              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                                + ₹ {q.brokerMargin.toLocaleString('en-IN')} margin
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3.5">
                            {getStatusBadge(q.status)}
                          </td>

                          {/* Created */}
                          <td className="px-3 py-3.5 text-slate-400 text-[11px]">
                            {q.created || '2 min ago'}
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Adjust Button */}
                              <button
                                onClick={() => handleOpenAdjustModal(q)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Adjust linehaul rates and margin"
                              >
                                <Edit3 className="w-3 h-3 text-amber-700" />
                                <span>Adjust</span>
                              </button>

                              {/* Broker Accept & Dispatch */}
                              {q.status !== 'Dispatched to Client' && q.status !== 'Declined' && (
                                <button
                                  onClick={() => handleBrokerAcceptQuote(q)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Accept and dispatch quote to customer"
                                >
                                  <Check className="w-3 h-3 text-emerald-700" />
                                  <span>Accept</span>
                                </button>
                              )}

                              {/* Broker Decline */}
                              {q.status !== 'Declined' && (
                                <button
                                  onClick={() => handleBrokerDeclineQuote(q)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Decline quotation enquiry"
                                >
                                  <X className="w-3 h-3 text-rose-600" />
                                  <span>Decline</span>
                                </button>
                              )}

                              {/* Open Detail */}
                              <button
                                onClick={() => navigate(`/dashboard?tab=quotations&quoteId=${q.id}`)}
                                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                              >
                                Open
                              </button>

                              {/* Download PDF */}
                              <button
                                onClick={() => downloadQuotePDF(q)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Download PDF Quote"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>


                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                  <span className="text-slate-400">Showing 1–{filteredQuotes.length} of {quotes.length}</span>
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-100 cursor-pointer">← Prev</button>
                    <button className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-100 cursor-pointer">Next →</button>
                  </div>
                </div>

              </div>
            </>
          )}

        </main>
      </div>

      {/* Interactive Rate & Margin Adjustment Modal */}
      {adjustingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
                  COMMERCIAL MARGIN WORKBENCH
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Adjust Quotation {adjustingQuote.id}
                </h3>
                <p className="text-xs text-slate-400">{adjustingQuote.customer} · {adjustingQuote.lane}</p>
              </div>
              <button
                onClick={() => setAdjustingQuote(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Linehaul Carrier Base Rate (INR)
                </label>
                <input
                  type="number"
                  value={adjBaseRate}
                  onChange={e => setAdjBaseRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  <span>Broker Profit Margin Markup</span>
                  <span className="text-indigo-600 font-bold">{adjMarginPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="0.5"
                  value={adjMarginPct}
                  onChange={e => setAdjMarginPct(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                    Fuel Surcharge (BAF)
                  </label>
                  <input
                    type="number"
                    value={adjFuelSurcharge}
                    onChange={e => setAdjFuelSurcharge(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                    Ancillaries & Port Handling
                  </label>
                  <input
                    type="number"
                    value={adjAncillaries}
                    onChange={e => setAdjAncillaries(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Calculated Summary Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Net Carrier Cost:</span>
                  <span className="font-mono font-bold text-slate-800">₹ {(adjBaseRate + adjFuelSurcharge + adjAncillaries).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Your Broker Margin ({adjMarginPct}%):</span>
                  <span className="font-mono">+ ₹ {Math.round((adjBaseRate + adjFuelSurcharge + adjAncillaries) * (adjMarginPct / 100)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-blue-700 font-black text-sm pt-2 border-t border-slate-200">
                  <span>Final Client Invoiced Total:</span>
                  <span className="font-mono text-base">
                    ₹ {(Math.round((adjBaseRate + adjFuelSurcharge + adjAncillaries) * (1 + adjMarginPct / 100))).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAdjustingQuote(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save & Dispatch to Client</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
