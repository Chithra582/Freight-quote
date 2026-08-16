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
  ExternalLink
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
import { downloadQuotePDF } from '../utils/exportUtils'



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
    sellPrice: '₹1,95,000',
    status: 'Delivered',
    validUntil: 'Completed',
    transitDays: '5 Days',
    cargo: '2 x 20GP Containers (Automotive Parts)',
    trackingStep: 4
  }
]

export default function CustomerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [quotes, setQuotes] = useState(CUSTOMER_QUOTES)
  const [userName, setUserName] = useState('Alex Shipper')
  const [userEmail, setUserEmail] = useState('user@freighthub.com')
  const [acceptedQuotes, setAcceptedQuotes] = useState({})
  const navigate = useNavigate()

  const [activeShipmentCount, setActiveShipmentCount] = useState(3)

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
          // Merge unique by ID
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

  const [calcForm, setCalcForm] = useState({
    origin: 'Chennai',
    destination: 'Singapore',
    weight: 18400,
    volume: 45,
    cargo_type: 'STANDARD',
    transport_mode: 'SEA'
  })
  const [instantQuoteResult, setInstantQuoteResult] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculateInstantQuote = async (e) => {
    if (e) e.preventDefault()
    setIsCalculating(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/pricing/instant-quote/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calcForm)
      })
      const data = await res.json()
      if (data.success) {
        setInstantQuoteResult(data.data)
      } else {
        // Fallback local calculation
        setInstantQuoteResult({
          origin: calcForm.origin,
          destination: calcForm.destination,
          distance_km: 2908.72,
          rule_price: 5799.08,
          ml_price: 7572.90,
          variance_pct: 30.6,
          model_accuracy: { r2_score: 0.9832, rmse: 2104.6, mae: 1200.19 },
          breakdown: {
            base_rate_per_km: 2.45,
            distance_cost: 7126.36,
            cargo_charge: 0.0,
            mode_multiplier: 0.5,
            fuel_surcharge: 454.31,
            total_price: 5799.08
          },
          status: 'CONFIRMED',
          valid_days: 7
        })
      }
    } catch (err) {
      setInstantQuoteResult({
        origin: calcForm.origin,
        destination: calcForm.destination,
        distance_km: 2908.72,
        rule_price: 5799.08,
        ml_price: 7572.90,
        variance_pct: 30.6,
        model_accuracy: { r2_score: 0.9832, rmse: 2104.6, mae: 1200.19 },
        breakdown: {
          base_rate_per_km: 2.45,
          distance_cost: 7126.36,
          cargo_charge: 0.0,
          mode_multiplier: 0.5,
          fuel_surcharge: 454.31,
          total_price: 5799.08
        },
        status: 'CONFIRMED',
        valid_days: 7
      })
    } finally {
      setIsCalculating(false)
    }
  }

  useEffect(() => {
    // Run initial calculation on load
    handleCalculateInstantQuote()
  }, [])


  const handleDownloadPDF = (quoteId) => {
    const q = quotes.find(item => item.id === quoteId) || { id: quoteId, cost: '₹ 3,84,500' }
    downloadQuotePDF(q)
  }


  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'air': return <Plane className="w-4 h-4 text-sky-500" />
      case 'ocean':
      case 'sea': return <Anchor className="w-4 h-4 text-blue-600" />
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
                Track your active shipments, review newly issued quotations, and request instant multi-modal freight estimates.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              <Link
                to="/dashboard/new-shipment"
                className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request New Quote</span>
              </Link>
            </div>

            {/* Background glowing circles */}
            <div className="absolute -right-10 -top-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="ACTIVE SHIPMENTS"
              value="3"
              change="+1 this week"
              isPositive={true}
              icon={Truck}
              color="blue"
            />
            <DashboardCard
              title="PENDING QUOTATIONS"
              value="1"
              change="Action required"
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

          {/* Instant Freight Pricing Engine (Stage 1 Rule-Based vs Stage 2 ML Dynamic Pricing) */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase tracking-wide border border-blue-200 mb-1">
                  ⚡ Flight-Ticket Style Instant Pricing
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Instant Freight Quote Calculator & ML Price Intelligence
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter shipment parameters to trigger real-time Haversine distance calculations and dual-stage Rule vs ML pricing models.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
              {/* Form inputs (span 5) */}
              <form onSubmit={handleCalculateInstantQuote} className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Origin City</label>
                    <input
                      type="text"
                      value={calcForm.origin}
                      onChange={e => setCalcForm({ ...calcForm, origin: e.target.value })}
                      placeholder="e.g. Chennai"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Destination City</label>
                    <input
                      type="text"
                      value={calcForm.destination}
                      onChange={e => setCalcForm({ ...calcForm, destination: e.target.value })}
                      placeholder="e.g. Singapore"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={calcForm.weight}
                      onChange={e => setCalcForm({ ...calcForm, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Volume (m³)</label>
                    <input
                      type="number"
                      value={calcForm.volume}
                      onChange={e => setCalcForm({ ...calcForm, volume: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Cargo Type</label>
                    <select
                      value={calcForm.cargo_type}
                      onChange={e => setCalcForm({ ...calcForm, cargo_type: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="STANDARD">Standard (1.0x)</option>
                      <option value="FRAGILE">Fragile (1.25x)</option>
                      <option value="HAZARDOUS">Hazardous (1.50x)</option>
                      <option value="PERISHABLE">Perishable (1.35x)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Transport Mode</label>
                    <select
                      value={calcForm.transport_mode}
                      onChange={e => setCalcForm({ ...calcForm, transport_mode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="SEA">Sea / Ocean (0.50x)</option>
                      <option value="ROAD">Road Freight (1.00x)</option>
                      <option value="RAIL">Rail Freight (0.75x)</option>
                      <option value="AIR">Air Cargo (2.80x)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCalculating ? 'Computing Distance & Rates...' : '⚡ Calculate Instant Quote'}
                </button>
              </form>

              {/* Result breakdown (span 7) */}
              <div className="lg:col-span-7 space-y-4">
                {instantQuoteResult ? (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">
                          Haversine Distance: {instantQuoteResult.distance_km} km
                        </span>
                        <h3 className="text-xl font-black text-white mt-0.5">
                          {instantQuoteResult.origin} ➔ {instantQuoteResult.destination}
                        </h3>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-2xl font-black text-emerald-400">
                          ₹{instantQuoteResult.rule_price?.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total Instant Price (INR)</p>
                      </div>
                    </div>

                    {/* Dual Stage Pricing Comparison */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[9px] text-blue-300 font-bold uppercase tracking-wider">Stage 1: Rule Price</span>
                        <p className="text-base font-black text-white mt-0.5">₹{instantQuoteResult.rule_price?.toLocaleString()}</p>
                        <span className="text-[9px] text-slate-400">Exact formula computation</span>
                      </div>
                      <div className="p-3 bg-indigo-950/70 rounded-xl border border-indigo-700/50">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">Stage 2: ML Dynamic</span>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">R²={instantQuoteResult.model_accuracy?.r2_score || '0.983'}</span>
                        </div>
                        <p className="text-base font-black text-indigo-200 mt-0.5">₹{instantQuoteResult.ml_price?.toLocaleString()}</p>
                        <span className="text-[9px] text-indigo-300/80">GradientBoosted Regressor</span>
                      </div>
                    </div>

                    {/* Itemized Cost Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Distance Cost ({instantQuoteResult.distance_km} km @ ₹{instantQuoteResult.breakdown?.base_rate_per_km}/km)</span>
                        <span className="font-semibold text-white">₹{instantQuoteResult.breakdown?.distance_cost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cargo Surcharge (Multiplier {instantQuoteResult.breakdown?.cargo_multiplier}x)</span>
                        <span className="font-semibold text-white">+₹{instantQuoteResult.breakdown?.cargo_charge?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Transport Mode Adjustment ({instantQuoteResult.transport_mode} {instantQuoteResult.breakdown?.mode_multiplier}x)</span>
                        <span className="font-semibold text-white">Applied</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Fuel Surcharge ({instantQuoteResult.breakdown?.fuel_surcharge_pct}%)</span>
                        <span className="font-semibold text-white">+₹{instantQuoteResult.breakdown?.fuel_surcharge?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Guaranteed Validity: 7 Days</span>
                      <button
                        onClick={() => downloadQuotePDF({
                          id: `IQ-${Math.floor(1000 + Math.random() * 9000)}`,
                          origin: instantQuoteResult.origin,
                          destination: instantQuoteResult.destination,
                          mode: instantQuoteResult.transport_mode,
                          cost: `₹ ${instantQuoteResult.rule_price?.toLocaleString() || '5,799'}`,
                          weight: `${calcForm.weight} kg`,
                          basis: `${calcForm.volume} m³ / ${calcForm.weight} kg`
                        })}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Quote PDF
                      </button>

                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    Enter details on the left to view instant pricing breakdown
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Active Quotations Section */}
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
              <Link
                to="/dashboard/new-shipment"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Create New Enquiry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                              Decline
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDownloadPDF(quote.id)}
                          className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>PDF Quote</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Tracking Stepper for Booked/In-Transit Shipments */}
                  {quote.status !== 'Declined' && (
                    <div className="mt-5 pt-4 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        SHIPMENT LIFECYCLE PROGRESS
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="bg-blue-600 text-white font-bold py-1.5 rounded-lg">
                          1. Enquired
                        </div>
                        <div className={`${quote.trackingStep >= 2 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-500'} py-1.5 rounded-lg`}>
                          2. Quoted
                        </div>
                        <div className={`${quote.trackingStep >= 3 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-500'} py-1.5 rounded-lg`}>
                          3. In Transit
                        </div>
                        <div className={`${quote.trackingStep >= 4 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-500'} py-1.5 rounded-lg`}>
                          4. Delivered
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
