import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Cpu,
  CloudRain,
  ShieldCheck,
  DollarSign,
  Navigation,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle,
  FileCheck
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'
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
    sellPrice: '₹1,95,000',
    status: 'Delivered',
    validUntil: 'Completed',
    transitDays: '5 Days',
    cargo: '2 x 20GP Containers (Automotive Parts)',
    trackingStep: 4
  }
]

const AGENTS_LIST = [
  {
    id: 'route',
    name: '1. Route Agent',
    role: 'Optimal Corridor & Congestion Analysis',
    icon: Navigation,
    color: 'text-sky-500 bg-sky-50 border-sky-200'
  },
  {
    id: 'pricing',
    name: '2. Pricing Agent',
    role: 'Carrier Spot Rate & Bunker Fuel Surcharge',
    icon: DollarSign,
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  {
    id: 'weather',
    name: '3. Weather Agent',
    role: 'Ocean Meteorology & Storm Risk Radar',
    icon: CloudRain,
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  {
    id: 'customs',
    name: '4. Customs Agent',
    role: 'HS Code Regulatory Compliance & Readiness',
    icon: ShieldCheck,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  },
  {
    id: 'margin',
    name: '5. Margin Agent',
    role: 'Profitability & Broker Margin Optimization',
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
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
  const navigate = useNavigate()

  // 5-Agent AI Verification Pipeline States
  const [verifyForm, setVerifyForm] = useState({
    origin: 'Nhava Sheva (INNSA)',
    destination: 'Jebel Ali (AEJEA)',
    mode: 'Ocean FCL',
    weight: 18400,
    volume: 45,
    commodity: 'Automotive Spare Parts',
    hsCode: '8708.29.00',
    incoterm: 'CIF'
  })

  const [isVerifying, setIsVerifying] = useState(false)
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1) // 0 to 4
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [agentLogs, setAgentLogs] = useState([])
  const [verifiedResult, setVerifiedResult] = useState(null)
  const [verificationSeconds, setVerificationSeconds] = useState(0)
  const timerRef = useRef(null)

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

  // === 5-AGENT AI VERIFICATION SEQUENCE ===
  const startAgentVerification = () => {
    setIsVerifying(true)
    setVerifiedResult(null)
    setActiveAgentIndex(0)
    setVerificationProgress(5)
    setVerificationSeconds(0)
    setAgentLogs(['[00:01] Initializing FreightIntelligence Engine multi-agent session...'])

    // Start timer ticker
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setVerificationSeconds(prev => prev + 1)
    }, 1000)

    // Stage 1: Route Agent
    setTimeout(() => {
      setActiveAgentIndex(0)
      setVerificationProgress(20)
      setAgentLogs(prev => [
        ...prev,
        '[Route Agent] Scanning maritime corridors between ' + verifyForm.origin + ' and ' + verifyForm.destination + '...',
        '[Route Agent] Evaluating Arabian Sea shipping lane: Optimal loop identified. Port berth waiting: 3.2 hrs (Congestion: Low).'
      ])
    }, 1500)

    // Stage 2: Pricing Agent
    setTimeout(() => {
      setActiveAgentIndex(1)
      setVerificationProgress(40)
      setAgentLogs(prev => [
        ...prev,
        '[Pricing Agent] Querying spot indices for ' + verifyForm.mode + ' carrier allocation...',
        '[Pricing Agent] Calculated Base Linehaul: ₹3,15,000 + Bunker Adjustment Factor (BAF 8.5%): ₹26,775.'
      ])
    }, 3800)

    // Stage 3: Weather Agent
    setTimeout(() => {
      setActiveAgentIndex(2)
      setVerificationProgress(60)
      setAgentLogs(prev => [
        ...prev,
        '[Weather Agent] Analyzing oceanic satellite radar & significant wave height metrics...',
        '[Weather Agent] Wave height 1.6m (Moderate). Storm/Cyclone anomaly index: Low (0.8%). Expected Weather Delay: 0 Days.'
      ])
    }, 6200)

    // Stage 4: Customs Agent
    setTimeout(() => {
      setActiveAgentIndex(3)
      setVerificationProgress(80)
      setAgentLogs(prev => [
        ...prev,
        '[Customs Agent] Cross-referencing HS Code ' + verifyForm.hsCode + ' against import/export tariff regulatory schedules...',
        '[Customs Agent] Regulatory compliance verified: 100% Passed. Mandatory documentation: Bill of Lading, Certificate of Origin, Commercial Invoice.'
      ])
    }, 8500)

    // Stage 5: Margin Agent & Synthesis
    setTimeout(() => {
      setActiveAgentIndex(4)
      setVerificationProgress(100)
      setAgentLogs(prev => [
        ...prev,
        '[Margin Agent] Optimizing brokerage profitability floor (Target Margin: 12.5%)...',
        '[Freight Intelligence Engine] All 5 agents completed with 0 exceptions. Synthesizing final prediction result.'
      ])

      finalizeVerification()
    }, 11000)
  }

  const finalizeVerification = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    // Dynamic price based on weight/mode
    const baseCost = verifyForm.mode.includes('Air') ? 580000 : 315000
    const fuelCost = Math.round(baseCost * 0.085)
    const portAncillaries = 12500
    const subtotal = baseCost + fuelCost + portAncillaries
    const brokerMargin = Math.round(subtotal * 0.125)
    const totalQuotePrice = subtotal + brokerMargin

    const synthesizedResult = {
      quoteId: `QT-AI-${Math.floor(10000 + Math.random() * 90000)}`,
      origin: verifyForm.origin,
      destination: verifyForm.destination,
      mode: verifyForm.mode,
      commodity: verifyForm.commodity,
      hsCode: verifyForm.hsCode,
      weight: `${verifyForm.weight} kg`,
      volume: `${verifyForm.volume} m³`,
      incoterm: verifyForm.incoterm,
      totalPriceFormatted: `₹ ${totalQuotePrice.toLocaleString('en-IN')}`,
      totalPriceRaw: totalQuotePrice,
      validUntil: '7 Days (Guaranteed Validity)',
      overallRiskScore: '98.5% (High Reliability / Low Risk)',

      // Agent-specific predictions
      routeAnalysis: {
        agentName: 'Route Agent',
        optimalLoop: 'Direct Sea Express via Colombo Loop',
        estimatedTransit: verifyForm.mode.includes('Air') ? '2 – 3 Days' : '6 – 8 Days',
        portCongestion: 'Low (Average waiting: 3.2 hrs)',
        carrierOptions: 'Maersk Line / MSC Spot Matrix'
      },
      pricingBreakdown: {
        agentName: 'Pricing Agent',
        baseLinehaul: `₹ ${baseCost.toLocaleString('en-IN')}`,
        fuelSurcharge: `₹ ${fuelCost.toLocaleString('en-IN')} (BAF 8.5%)`,
        portHandling: `₹ ${portAncillaries.toLocaleString('en-IN')}`,
        dynamicPricingModel: 'Rule Formula & LightGBM Regressor Verified'
      },
      weatherAssessment: {
        agentName: 'Weather Agent',
        seaCondition: 'Normal / Moderate Swell (1.6m)',
        stormProbability: 'Low (0.8% anomaly index)',
        weatherDelayExpected: '0 Days (Clear corridor)'
      },
      customsCompliance: {
        agentName: 'Customs Agent',
        hsCodeCompliance: `${verifyForm.hsCode} - 100% Validated`,
        requiredDocs: 'Bill of Lading, Certificate of Origin (COO), Commercial Invoice & Packing List',
        status: 'Cleared for Export'
      },
      marginOptimization: {
        agentName: 'Margin Agent',
        brokerMarginPct: '12.5%',
        marginAmount: `₹ ${brokerMargin.toLocaleString('en-IN')}`,
        commercialRate: `₹ ${totalQuotePrice.toLocaleString('en-IN')}`
      }
    }

    setVerifiedResult(synthesizedResult)
    setIsVerifying(false)
  }

  const handleInstantCompleteDemo = () => {
    finalizeVerification()
  }

  const handleSaveVerifiedQuoteToActive = () => {
    if (!verifiedResult) return

    const newQuoteItem = {
      id: verifiedResult.quoteId,
      origin: verifiedResult.origin,
      destination: verifiedResult.destination,
      mode: verifiedResult.mode.includes('Air') ? 'Air' : 'Ocean',
      service: verifiedResult.routeAnalysis.carrierOptions,
      sellPrice: verifiedResult.totalPriceFormatted,
      status: 'Issued',
      dispatchedStatus: 'Verified by 5 AI Agents',
      validUntil: 'Aug 27, 2026',
      transitDays: verifiedResult.routeAnalysis.estimatedTransit,
      cargo: `${verifiedResult.commodity} (${verifiedResult.weight})`,
      trackingStep: 2
    }

    const updated = [newQuoteItem, ...quotes]
    setQuotes(updated)
    localStorage.setItem('customerQuotes', JSON.stringify(updated))
    alert(`Quotation ${verifiedResult.quoteId} has been added to your Active Quotations! You can accept it or download the official PDF.`)
  }

  const handleDownloadAIVerifiedPDF = () => {
    if (!verifiedResult) return
    downloadQuotePDF({
      id: verifiedResult.quoteId,
      origin: verifiedResult.origin,
      destination: verifiedResult.destination,
      mode: verifiedResult.mode,
      cost: verifiedResult.totalPriceFormatted,
      weight: verifiedResult.weight,
      basis: `${verifiedResult.volume} / ${verifiedResult.weight}`,
      customer: userName
    })
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
                Deploy the 5-Agent AI Maritime Brokerage Network to evaluate optimal corridors, weather risks, customs regulations, and transparent commercial quotes.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap gap-3">
              <Link
                to="/dashboard/new-shipment"
                className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request Custom Quote</span>
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
              change="Verified proposals"
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

          {/* ========================================================================= */}
          {/* SECTION: 5-AGENT AI MARITIME BROKERAGE & VERIFICATION ENGINE */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold uppercase tracking-wide border border-indigo-200 mb-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>5-Agent Autonomous Maritime Brokerage Network</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Agentic Freight Quotation & Multi-Agent Verification
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
                  Collaborative verification across <strong>Route Agent</strong>, <strong>Pricing Agent</strong>, <strong>Weather Agent</strong>, <strong>Customs Agent</strong>, and <strong>Margin Agent</strong>.
                </p>
              </div>

              {/* 5-Agent Mini Status Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {AGENTS_LIST.map((ag) => (
                  <span
                    key={ag.id}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${ag.color}`}
                  >
                    {ag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Input Form (Visible when not verifying or to adjust parameters) */}
            {!isVerifying && !verifiedResult && (
              <div className="space-y-4 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Origin Hub / Port</label>
                    <select
                      value={verifyForm.origin}
                      onChange={e => setVerifyForm({ ...verifyForm, origin: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Nhava Sheva (INNSA)">Nhava Sheva (INNSA)</option>
                      <option value="Chennai Port (INMAA)">Chennai Port (INMAA)</option>
                      <option value="Mundra Port (INMUN)">Mundra Port (INMUN)</option>
                      <option value="Bengaluru Airport (INBLR)">Bengaluru Airport (INBLR)</option>
                      <option value="Delhi IGI Airport (INDEL)">Delhi IGI Airport (INDEL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Destination Hub / Port</label>
                    <select
                      value={verifyForm.destination}
                      onChange={e => setVerifyForm({ ...verifyForm, destination: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Jebel Ali (AEJEA)">Jebel Ali (AEJEA)</option>
                      <option value="Singapore Port (SGSIN)">Singapore Port (SGSIN)</option>
                      <option value="Rotterdam (NLRTM)">Rotterdam (NLRTM)</option>
                      <option value="Frankfurt Cargo Hub (DEFRA)">Frankfurt Cargo Hub (DEFRA)</option>
                      <option value="Shanghai Port (CNSHA)">Shanghai Port (CNSHA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Transport Mode</label>
                    <select
                      value={verifyForm.mode}
                      onChange={e => setVerifyForm({ ...verifyForm, mode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Ocean FCL">Ocean FCL (Full Container)</option>
                      <option value="Ocean LCL">Ocean LCL (Less than Container)</option>
                      <option value="Air Cargo Priority">Air Cargo Priority Express</option>
                      <option value="Multi-Modal Rail/Road">Multi-Modal Rail / Road</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Incoterm</label>
                    <select
                      value={verifyForm.incoterm}
                      onChange={e => setVerifyForm({ ...verifyForm, incoterm: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="DAP">DAP (Delivered at Place)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Cargo Commodity Description</label>
                    <input
                      type="text"
                      value={verifyForm.commodity}
                      onChange={e => setVerifyForm({ ...verifyForm, commodity: e.target.value })}
                      placeholder="e.g. Automotive Spare Parts"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Harmonized HS Code</label>
                    <input
                      type="text"
                      value={verifyForm.hsCode}
                      onChange={e => setVerifyForm({ ...verifyForm, hsCode: e.target.value })}
                      placeholder="e.g. 8708.29.00"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Gross Weight (kg)</label>
                      <input
                        type="number"
                        value={verifyForm.weight}
                        onChange={e => setVerifyForm({ ...verifyForm, weight: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Volume (m³)</label>
                      <input
                        type="number"
                        value={verifyForm.volume}
                        onChange={e => setVerifyForm({ ...verifyForm, volume: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    AI verification analyzes real-time route congestion, weather satellite radar, tariff matrices, and customs readiness.
                  </span>
                  <button
                    onClick={startAgentVerification}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Launch 5-Agent Multi-Verification</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VERIFICATION IN PROGRESS (ANIMATED AGENT PIPELINE) */}
            {/* ========================================================================= */}
            {isVerifying && (
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                
                {/* Progress Bar & Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h3 className="text-lg font-black text-white">
                        5-Agent Maritime Brokerage Verification in Session
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Elapsed: {verificationSeconds}s · Orchestrating autonomous decision nodes for route, pricing, weather, customs, and margin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleInstantCompleteDemo}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Skip Delay / Complete Now</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${verificationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Agent Steps Carousel / Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {AGENTS_LIST.map((ag, idx) => {
                    const isPassed = activeAgentIndex > idx
                    const isCurrent = activeAgentIndex === idx
                    const isPending = activeAgentIndex < idx

                    const IconComp = ag.icon

                    return (
                      <div
                        key={ag.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                            : isPassed
                            ? 'bg-slate-800/80 border-emerald-500/60'
                            : 'bg-slate-900/50 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-1.5 rounded-lg ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Q-{idx + 1}</span>
                          )}
                        </div>
                        <div className="font-bold text-xs text-white truncate">{ag.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{ag.role}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Real-time Agentic Logs Console */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold pb-1 border-b border-slate-800/80">
                    Live Telemetry Stream
                  </div>
                  {agentLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-indigo-400 select-none">›</span>
                      <span className={log.includes('Verified') || log.includes('Optimal') ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SYNTHESIZED VERIFICATION RESULT (PREDICTION CALCULATION + PDF) */}
            {/* ========================================================================= */}
            {verifiedResult && (
              <div className="space-y-6">
                
                {/* Result Card Top Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 shadow-xl space-y-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-800">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Freight Intelligence Synthesis Complete · {verifiedResult.overallRiskScore}</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {verifiedResult.origin} ➔ {verifiedResult.destination}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Quote Ref: <span className="font-mono text-indigo-300 font-bold">{verifiedResult.quoteId}</span> · Method: <span className="text-white font-semibold">{verifiedResult.mode}</span> · Commodity: <span className="text-white font-semibold">{verifiedResult.commodity}</span>
                      </p>
                    </div>

                    <div className="text-left lg:text-right bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-700 shrink-0">
                      <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wider block">
                        FINAL GUARANTEED QUOTE PRICE
                      </span>
                      <span className="text-3xl font-black text-emerald-400 tracking-tight block my-0.5">
                        {verifiedResult.totalPriceFormatted}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Guaranteed for {verifiedResult.validUntil}
                      </span>
                    </div>
                  </div>

                  {/* 5-Agent Detailed Deep Insights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* 1. Route Agent */}
                    <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-sky-400">
                        <Navigation className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">1. Route Agent</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div><strong className="text-white">Corridor:</strong> {verifiedResult.routeAnalysis.optimalLoop}</div>
                        <div><strong className="text-white">Estimated Transit:</strong> <span className="text-sky-300 font-bold">{verifiedResult.routeAnalysis.estimatedTransit}</span></div>
                        <div><strong className="text-white">Port Congestion:</strong> {verifiedResult.routeAnalysis.portCongestion}</div>
                      </div>
                    </div>

                    {/* 2. Pricing Agent */}
                    <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-blue-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">2. Pricing Agent</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div><strong className="text-white">Linehaul Base:</strong> {verifiedResult.pricingBreakdown.baseLinehaul}</div>
                        <div><strong className="text-white">Bunker Surcharge:</strong> {verifiedResult.pricingBreakdown.fuelSurcharge}</div>
                        <div><strong className="text-white">Port Ancillaries:</strong> {verifiedResult.pricingBreakdown.portHandling}</div>
                      </div>
                    </div>

                    {/* 3. Weather Agent */}
                    <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400">
                        <CloudRain className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">3. Weather Agent</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div><strong className="text-white">Maritime Sea State:</strong> {verifiedResult.weatherAssessment.seaCondition}</div>
                        <div><strong className="text-white">Storm Anomaly:</strong> {verifiedResult.weatherAssessment.stormProbability}</div>
                        <div><strong className="text-white">Predicted Delays:</strong> <span className="text-emerald-400 font-bold">{verifiedResult.weatherAssessment.weatherDelayExpected}</span></div>
                      </div>
                    </div>

                    {/* 4. Customs Agent */}
                    <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">4. Customs Agent</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div><strong className="text-white">HS Code Status:</strong> {verifiedResult.customsCompliance.hsCodeCompliance}</div>
                        <div><strong className="text-white">Readiness:</strong> <span className="text-emerald-400 font-bold">{verifiedResult.customsCompliance.status}</span></div>
                        <div className="text-[11px] text-slate-400">Required: {verifiedResult.customsCompliance.requiredDocs}</div>
                      </div>
                    </div>

                    {/* 5. Margin Agent */}
                    <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">5. Margin Agent</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <div><strong className="text-white">Broker Markup:</strong> {verifiedResult.marginOptimization.brokerMarginPct} ({verifiedResult.marginOptimization.marginAmount})</div>
                        <div><strong className="text-white">Profitability SLA:</strong> Enforced &gt; 12.0% Floor</div>
                        <div><strong className="text-white">Commercial Total:</strong> {verifiedResult.marginOptimization.commercialRate}</div>
                      </div>
                    </div>

                    {/* Action Hub Card */}
                    <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-700/50 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-indigo-300 font-bold uppercase">Actions</span>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">
                          Download official proposal or add to active bookings.
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={handleDownloadAIVerifiedPDF}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download AI Quote PDF</span>
                        </button>

                        <button
                          onClick={handleSaveVerifiedQuoteToActive}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm & Add to Active Quotes</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Reset / New Verification */}
                  <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                    <span>Generated by FreightQuote AI Autonomous Maritime Engine</span>
                    <button
                      onClick={() => setVerifiedResult(null)}
                      className="text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Verify Another Shipment</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ACTIVE QUOTATIONS & ENQUIRIES SECTION */}
          {/* ========================================================================= */}
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
                <span>Create Custom Enquiry</span>
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

        </main>
      </div>
    </div>
  )
}
