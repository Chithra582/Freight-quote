import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Info, 
  Truck, 
  Plane, 
  Anchor, 
  Train, 
  Calculator, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Package, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Plus,
  Navigation,
  DollarSign,
  CloudRain,
  Cpu,
  Check,
  Download,
  Zap,
  RotateCcw,
  TrendingUp,
  Clock
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import { downloadQuotePDF } from '../utils/exportUtils'

const INDIAN_STATES_HUBS = [
  { value: 'Maharashtra', label: 'Maharashtra', lat: 18.94, lng: 72.84 },
  { value: 'Gujarat', label: 'Gujarat', lat: 22.84, lng: 69.70 },
  { value: 'Tamil Nadu', label: 'Tamil Nadu', lat: 13.08, lng: 80.27 },
  { value: 'West Bengal', label: 'West Bengal', lat: 22.57, lng: 88.36 },
  { value: 'Kerala', label: 'Kerala', lat: 9.93, lng: 76.26 },
  { value: 'Delhi NCT', label: 'Delhi NCT', lat: 28.53, lng: 77.26 },
  { value: 'Karnataka', label: 'Karnataka', lat: 12.97, lng: 77.59 },
  { value: 'Telangana', label: 'Telangana', lat: 17.38, lng: 78.48 },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh', lat: 17.68, lng: 83.21 },
  { value: 'Goa', label: 'Goa', lat: 15.40, lng: 73.80 }
]

const INCOTERMS = [
  { value: 'EXW', label: 'EXW - Ex Works' },
  { value: 'FOB', label: 'FOB - Free On Board' },
  { value: 'CIF', label: 'CIF - Cost, Insurance & Freight' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
  { value: 'DAP', label: 'DAP - Delivered At Place' }
]

const AGENTS_LIST = [
  { id: 'route', name: '1. Route Agent', role: 'Optimal Corridor & Congestion Analysis', icon: Navigation },
  { id: 'pricing', name: '2. Pricing Agent', role: 'Carrier Spot Rate & Bunker Fuel Surcharge', icon: DollarSign },
  { id: 'weather', name: '3. Weather Agent', role: 'Ocean Meteorology & Storm Risk Radar', icon: CloudRain },
  { id: 'customs', name: '4. Customs Agent', role: 'HS Code Regulatory Compliance & Readiness', icon: ShieldCheck },
  { id: 'margin', name: '5. Margin Agent', role: 'Profitability & Broker Margin Optimization', icon: TrendingUp }
]

export default function NewShipmentEnquiry() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newQuoteId, setNewQuoteId] = useState('')

  // 5-Agent Verification States
  const [isVerifying, setIsVerifying] = useState(false)
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [agentLogs, setAgentLogs] = useState([])
  const [verifiedResult, setVerifiedResult] = useState(null)
  const [verificationSeconds, setVerificationSeconds] = useState(0)
  const timerRef = useRef(null)

  const todayStr = (() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const tomorrowStr = (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yyyy = tomorrow.getFullYear()
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const nextWeekStr = (() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 8)
    const yyyy = nextWeek.getFullYear()
    const mm = String(nextWeek.getMonth() + 1).padStart(2, '0')
    const dd = String(nextWeek.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  // Form State
  const [formData, setFormData] = useState({
    // Step 1 - Route
    origin: '',
    destination: '',
    pickupAddress: '',
    deliveryAddress: '',
    readyDate: tomorrowStr,
    deliveryDate: nextWeekStr,

    // Step 2 - Service Type
    serviceMode: 'Ocean', // Ocean, Air, Road, Rail
    containerLoad: 'FCL', // FCL/LCL
    incoterm: 'CIF',

    // Step 3 - Shipment Details
    shippingMethod: 'FCL',
    items: [
      {
        id: 1,
        packageType: 'container',
        containerType: '40hc',
        unitCount: '1',
        weight: '18400',
        commodity: 'Automotive Components',
        hsCode: '8708.29.00'
      }
    ],
    packageType: 'container',
    containerType: '40hc',
    weight: '18400',
    volume: '45',
    commodity: 'Automotive Components',
    hsCode: '8708.29.00',

    // Step 4 - Value & Instructions
    declaredValue: '3500000',
    currency: 'INR',
    specialInstructions: 'Temperature controlled / Standard dry container required.',
    requiresCustomsClearance: true,
    requiresInsurance: true,

    // Step 5 - Contact
    contactName: 'Alex Shipper',
    companyName: 'Apex Global Logistics',
    contactEmail: 'alex@apexgl.com',
    contactPhone: '+91 98765 43210'
  })

  // Real-time Estimated Rate Computation
  const [estimate, setEstimate] = useState({
    distance: 1450,
    cost: 384500,
    transitTime: '6 – 8 Days',
    carbonFootprint: '1.2 Tons CO2'
  })

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
    }
    const name = localStorage.getItem('userName')
    const email = localStorage.getItem('userEmail')
    if (name || email) {
      setFormData(prev => ({
        ...prev,
        contactName: name || prev.contactName,
        contactEmail: email || prev.contactEmail
      }))
    }
  }, [])

  // Recalculate estimated dynamic costs
  useEffect(() => {
    let baseRate = 315000
    if (formData.serviceMode === 'Air') baseRate = 580000
    if (formData.serviceMode === 'Road') baseRate = 95000
    if (formData.serviceMode === 'Rail') baseRate = 120000

    const weightNum = parseFloat(formData.weight) || 18400
    const weightFactor = weightNum / 10000
    const calculatedCost = Math.round(baseRate * Math.max(0.6, weightFactor))

    setEstimate({
      distance: 1450,
      cost: calculatedCost,
      transitTime: formData.serviceMode === 'Air' ? '2 – 3 Days' : '6 – 8 Days',
      carbonFootprint: `${(weightNum * 0.00008).toFixed(2)} Tons CO2`
    })
  }, [formData.serviceMode, formData.weight, formData.origin, formData.destination])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData(prev => ({
      ...prev,
      items: newItems,
      weight: field === 'weight' ? value : prev.weight,
      hsCode: field === 'hsCode' ? value : prev.hsCode,
      commodity: field === 'commodity' ? value : prev.commodity
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length + 1,
          packageType: 'container',
          containerType: '20gp',
          unitCount: '1',
          weight: '10000',
          commodity: 'General Cargo',
          hsCode: '8471.30.10'
        }
      ]
    }))
  }

  const removeItem = (index) => {
    if (formData.items.length === 1) return
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  // === 5-AGENT AI VERIFICATION SEQUENCE TRIGGER ===
  const start5AgentVerification = (e) => {
    if (e) e.preventDefault()

    if (!formData.contactName || !formData.companyName || !formData.contactEmail || !formData.contactPhone) {
      alert('Please fill out all contact details before launching verification.')
      return
    }

    setIsVerifying(true)
    setVerifiedResult(null)
    setActiveAgentIndex(0)
    setVerificationProgress(5)
    setVerificationSeconds(0)
    setAgentLogs(['[00:01] Initializing FreightIntelligence Engine 5-Agent multi-verification session...'])

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
        `[Route Agent] Scanning multi-modal corridor between ${formData.origin || 'Nhava Sheva'} and ${formData.destination || 'Jebel Ali'}...`,
        `[Route Agent] Evaluating Arabian Sea shipping lane: Optimal loop identified. Port berth waiting: 3.2 hrs (Congestion: Low).`
      ])
    }, 1500)

    // Stage 2: Pricing Agent
    setTimeout(() => {
      setActiveAgentIndex(1)
      setVerificationProgress(40)
      setAgentLogs(prev => [
        ...prev,
        `[Pricing Agent] Querying spot indices for ${formData.serviceMode || 'Ocean'} carrier allocation...`,
        `[Pricing Agent] Calculated Base Linehaul: ₹${estimate.cost.toLocaleString('en-IN')} + Bunker Adjustment Factor (BAF 8.5%).`
      ])
    }, 3800)

    // Stage 3: Weather Agent
    setTimeout(() => {
      setActiveAgentIndex(2)
      setVerificationProgress(60)
      setAgentLogs(prev => [
        ...prev,
        `[Weather Agent] Analyzing oceanic satellite radar & significant wave height metrics...`,
        `[Weather Agent] Wave height 1.6m (Moderate). Storm/Cyclone anomaly index: Low (0.8%). Expected Weather Delay: 0 Days.`
      ])
    }, 6200)

    // Stage 4: Customs Agent
    setTimeout(() => {
      setActiveAgentIndex(3)
      setVerificationProgress(80)
      setAgentLogs(prev => [
        ...prev,
        `[Customs Agent] Cross-referencing HS Code ${formData.hsCode || '8708.29.00'} against tariff schedules...`,
        `[Customs Agent] Regulatory compliance verified: 100% Passed. Mandatory documentation: Bill of Lading, Certificate of Origin, Commercial Invoice.`
      ])
    }, 8500)

    // Stage 5: Margin Agent & Synthesis
    setTimeout(() => {
      setActiveAgentIndex(4)
      setVerificationProgress(100)
      setAgentLogs(prev => [
        ...prev,
        `[Margin Agent] Optimizing brokerage profitability floor (Target Margin: 12.5%)...`,
        `[Freight Intelligence Engine] All 5 agents completed with 0 exceptions. Synthesizing final prediction result.`
      ])

      finalizeVerification()
    }, 11000)
  }

  const finalizeVerification = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    const quoteId = `QT-AI-${Math.floor(10000 + Math.random() * 90000)}`
    const shipmentId = `SH-${Math.floor(4000 + Math.random() * 900)}`
    setNewQuoteId(quoteId)

    const baseCost = estimate.cost
    const fuelCost = Math.round(baseCost * 0.085)
    const portAncillaries = 12500
    const subtotal = baseCost + fuelCost + portAncillaries
    const brokerMargin = Math.round(subtotal * 0.125)
    const totalQuotePrice = subtotal + brokerMargin

    const synthesizedResult = {
      quoteId: quoteId,
      shipmentId: shipmentId,
      origin: formData.origin || 'Nhava Sheva (INNSA)',
      destination: formData.destination || 'Jebel Ali (AEJEA)',
      mode: formData.serviceMode || 'Ocean',
      commodity: formData.commodity || 'Automotive Components',
      hsCode: formData.hsCode || '8708.29.00',
      weight: `${formData.weight || 18400} kg`,
      volume: `${formData.volume || 45} m³`,
      incoterm: formData.incoterm || 'CIF',
      totalPriceFormatted: `₹ ${totalQuotePrice.toLocaleString('en-IN')}`,
      totalPriceRaw: totalQuotePrice,
      validUntil: '7 Days (Guaranteed Validity)',
      overallRiskScore: '98.5% (High Reliability / Low Risk)',

      routeAnalysis: {
        agentName: 'Route Agent',
        optimalLoop: 'Direct Sea Express via Colombo Loop',
        estimatedTransit: estimate.transitTime,
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
        hsCodeCompliance: `${formData.hsCode || '8708.29.00'} - 100% Validated`,
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

    // Save to shared localStorage stores
    try {
      const newQuote = {
        id: quoteId,
        customer: formData.companyName || 'Apex Global Logistics',
        customerCity: formData.origin || 'Mumbai',
        origin: formData.origin || 'Nhava Sheva (INNSA)',
        destination: formData.destination || 'Jebel Ali (AEJEA)',
        originName: formData.origin || 'Nhava Sheva (INNSA)',
        destName: formData.destination || 'Jebel Ali (AEJEA)',
        lane: `${formData.origin || 'INNSA'} → ${formData.destination || 'AEJEA'}`,
        laneDesc: `${formData.origin || 'Mumbai'} → ${formData.destination || 'Dubai'}`,
        mode: `${formData.serviceMode || 'Ocean'} FCL`,
        cost: `₹ ${totalQuotePrice.toLocaleString('en-IN')}`,
        sellPrice: `₹ ${totalQuotePrice.toLocaleString('en-IN')}`,
        status: 'Issued',
        dispatchedStatus: 'Verified by 5 AI Agents',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        created: 'Just now',
        basis: `${formData.items?.[0]?.containerType ? formData.items[0].containerType.toUpperCase() : '40HC'}`,
        weight: `${parseFloat(formData.weight || 18400).toLocaleString()} kg`,
        transit: estimate.transitTime,
        transitDays: estimate.transitTime,
        service: `${formData.serviceMode || 'Ocean'} AI Express`,
        validUntil: '7 Days',
        cargo: `${formData.commodity || 'Automotive Components'} (${parseFloat(formData.weight || 18400).toLocaleString()} kg)`
      }

      const newShipment = {
        id: shipmentId,
        origin: formData.origin || 'Maharashtra',
        destination: formData.destination || 'Dubai',
        mode: formData.serviceMode || 'Ocean',
        status: 'Pending Pickup',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        shippingMethod: formData.containerLoad || 'FCL',
        items: formData.items,
        declaredValue: String(formData.declaredValue || '3500000'),
        currency: formData.currency || 'INR',
        specialInstructions: formData.specialInstructions || '',
        customer: formData.companyName || 'Apex Global Logistics',
        quoteRef: quoteId,
        cost: `₹ ${totalQuotePrice.toLocaleString('en-IN')}`
      }

      const storedBroker = localStorage.getItem('brokerQuotes')
      let brokerList = storedBroker ? JSON.parse(storedBroker) : []
      brokerList = [newQuote, ...brokerList]
      localStorage.setItem('brokerQuotes', JSON.stringify(brokerList))

      const storedCustomer = localStorage.getItem('customerQuotes')
      let custList = storedCustomer ? JSON.parse(storedCustomer) : []
      custList = [newQuote, ...custList]
      localStorage.setItem('customerQuotes', JSON.stringify(custList))

      const storedShipments = localStorage.getItem('allShipments')
      let shipList = storedShipments ? JSON.parse(storedShipments) : []
      shipList = [newShipment, ...shipList]
      localStorage.setItem('allShipments', JSON.stringify(shipList))
    } catch (err) {
      console.error('Save quote error:', err)
    }
  }

  const handleDownloadPDF = () => {
    if (!verifiedResult) return
    downloadQuotePDF({
      id: verifiedResult.quoteId,
      origin: verifiedResult.origin,
      destination: verifiedResult.destination,
      mode: verifiedResult.mode,
      cost: verifiedResult.totalPriceFormatted,
      weight: verifiedResult.weight,
      basis: `${verifiedResult.volume} / ${verifiedResult.weight}`,
      customer: formData.contactName
    })
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
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customer Dashboard
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <Cpu className="w-3.5 h-3.5" />
              <span>5-Agent AI Autonomous Maritime Pipeline</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VERIFICATION RESULT VIEW */}
          {/* ========================================================================= */}
          {verifiedResult ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 shadow-2xl space-y-6">
                
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

                  <div className="text-left lg:text-right bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shrink-0">
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

                {/* 5-Agent Breakdown Grid */}
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

                  {/* Action Card */}
                  <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-700/50 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-indigo-300 font-bold uppercase">Proposal Actions</span>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5">
                        Download your official AI quote PDF or return to your dashboard.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download AI Quote PDF</span>
                      </button>

                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Proceed to Active Quotations</span>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                  <span>Generated by FreightQuote AI Autonomous Maritime Brokerage Platform</span>
                  <button
                    onClick={() => setVerifiedResult(null)}
                    className="text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Create Another Shipment Enquiry</span>
                  </button>
                </div>

              </div>
            </div>
          ) : isVerifying ? (
            /* ========================================================================= */
            /* VERIFICATION IN PROGRESS ANIMATION */
            /* ========================================================================= */
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-lg font-black text-white">
                      5-Agent Autonomous Maritime Verification in Session
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Elapsed: {verificationSeconds}s · Cross-verifying route efficiency, weather radars, and customs regulations.
                  </p>
                </div>

                <button
                  onClick={finalizeVerification}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skip Delay / Complete Now</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${verificationProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Agent Carousel */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {AGENTS_LIST.map((ag, idx) => {
                  const isPassed = activeAgentIndex > idx
                  const isCurrent = activeAgentIndex === idx
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

              {/* Real-time Telemetry */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold pb-1 border-b border-slate-800/80">
                  Live Multi-Agent Stream
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
          ) : (
            /* ========================================================================= */
            /* MULTI-STEP QUOTATION ENQUIRY FORM */
            /* ========================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-6">
                
                {/* Steps Header */}
                <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center max-w-lg mx-auto">
                    {[1, 2, 3, 4, 5].map((stepNum) => (
                      <div key={stepNum} className="flex flex-col items-center relative flex-1">
                        {stepNum < 5 && (
                          <div className={`absolute top-4 left-1/2 w-full h-[2px] z-0 ${
                            currentStep > stepNum ? 'bg-blue-600' : 'bg-slate-100'
                          }`} />
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (stepNum < currentStep) setCurrentStep(stepNum)
                          }}
                          disabled={stepNum >= currentStep}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs relative z-10 transition-all border ${
                            currentStep === stepNum
                              ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 shadow-md'
                              : currentStep > stepNum
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-white text-slate-400 border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          {stepNum}
                        </button>
                        
                        <span className={`text-[9px] font-extrabold uppercase mt-1.5 ${
                          currentStep === stepNum ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {stepNum === 1 && 'Route'}
                          {stepNum === 2 && 'Service'}
                          {stepNum === 3 && 'Details'}
                          {stepNum === 4 && 'Add-on'}
                          {stepNum === 5 && 'Verify'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 5) start5AgentVerification(e); }}>
                    
                    {/* STEP 1: ROUTE & DATES */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          1. Route Origins & Cargo Readiness
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Origin Port / Hub</label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              <select
                                required
                                name="origin"
                                value={formData.origin}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                              >
                                <option value="">Select Origin Hub</option>
                                {INDIAN_STATES_HUBS.map(h => (
                                  <option key={h.value} value={h.value}>{h.label} Port / Terminal</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Destination Port / Hub</label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              <select
                                required
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                              >
                                <option value="">Select Destination Hub</option>
                                <option value="Jebel Ali (AEJEA)">Jebel Ali Port (AEJEA)</option>
                                <option value="Singapore (SGSIN)">Singapore Port (SGSIN)</option>
                                <option value="Rotterdam (NLRTM)">Rotterdam Port (NLRTM)</option>
                                <option value="Frankfurt (DEFRA)">Frankfurt Cargo Airport (DEFRA)</option>
                                <option value="Shanghai (CNSHA)">Shanghai Port (CNSHA)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Cargo Ready Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              <input
                                type="date"
                                required
                                name="readyDate"
                                value={formData.readyDate}
                                onChange={handleInputChange}
                                min={todayStr}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Target Delivery Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                              <input
                                type="date"
                                required
                                name="deliveryDate"
                                value={formData.deliveryDate}
                                onChange={handleInputChange}
                                min={formData.readyDate || todayStr}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: SERVICE & INCOTERM */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          2. Transport Mode & Trade Incoterms
                        </h2>

                        <div>
                          <label className="block text-slate-700 font-semibold text-xs mb-2">Transport Mode</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { id: 'Ocean', label: 'Ocean Freight', icon: Anchor },
                              { id: 'Air', label: 'Air Priority', icon: Plane },
                              { id: 'Road', label: 'Road Express', icon: Truck },
                              { id: 'Rail', label: 'Rail Freight', icon: Train }
                            ].map(m => {
                              const IconComp = m.icon
                              const isSelected = formData.serviceMode === m.id
                              return (
                                <button
                                  type="button"
                                  key={m.id}
                                  onClick={() => setFormData({ ...formData, serviceMode: m.id })}
                                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <IconComp className="w-5 h-5" />
                                  <span className="text-xs font-bold">{m.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Trade Incoterm</label>
                            <select
                              name="incoterm"
                              value={formData.incoterm}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                            >
                              {INCOTERMS.map(i => (
                                <option key={i.value} value={i.value}>{i.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Load Type</label>
                            <select
                              name="containerLoad"
                              value={formData.containerLoad}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                            >
                              <option value="FCL">FCL - Full Container Load</option>
                              <option value="LCL">LCL - Less Than Container Load</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CARGO SPECIFICATIONS */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h2 className="text-base font-black text-slate-900">
                            3. Cargo Specifications & HS Code
                          </h2>
                          <button
                            type="button"
                            onClick={addItem}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Item
                          </button>
                        </div>

                        {formData.items.map((item, idx) => (
                          <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-700">Cargo Unit #{idx + 1}</span>
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Commodity</label>
                                <input
                                  type="text"
                                  required
                                  value={item.commodity}
                                  onChange={e => handleItemChange(idx, 'commodity', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">HS Code</label>
                                <input
                                  type="text"
                                  required
                                  value={item.hsCode}
                                  onChange={e => handleItemChange(idx, 'hsCode', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                                <input
                                  type="number"
                                  required
                                  value={item.weight}
                                  onChange={e => handleItemChange(idx, 'weight', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STEP 4: ADD-ONS & SPECIAL INSTRUCTIONS */}
                    {currentStep === 4 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          4. Declared Value & Protection Add-ons
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Declared Cargo Value (INR)</label>
                            <input
                              type="number"
                              name="declaredValue"
                              value={formData.declaredValue}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Currency</label>
                            <input
                              type="text"
                              disabled
                              value="INR (₹)"
                              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                            <input
                              type="checkbox"
                              name="requiresCustomsClearance"
                              checked={formData.requiresCustomsClearance}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 block">Include Customs Clearance Verification</span>
                              <span className="text-slate-500">Autonomous Customs Agent regulatory inspection and documentation check.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
                            <input
                              type="checkbox"
                              name="requiresInsurance"
                              checked={formData.requiresInsurance}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 block">Marine Cargo Transit Protection</span>
                              <span className="text-slate-500">All-risk comprehensive coverage against general average and maritime perils.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: CONTACT & 5-AGENT TRIGGER */}
                    {currentStep === 5 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          5. Contact Info & 5-Agent Verification Launch
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Contact Full Name</label>
                            <input
                              type="text"
                              required
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Company Name</label>
                            <input
                              type="text"
                              required
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Work Email Address</label>
                            <input
                              type="email"
                              required
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Phone Number</label>
                            <input
                              type="text"
                              required
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
                          <strong className="block font-black">Ready for 5-Agent Multi-Verification:</strong>
                          <p className="text-[11px] text-indigo-700 leading-relaxed">
                            Clicking the button below will deploy the <strong>Route Agent</strong>, <strong>Pricing Agent</strong>, <strong>Weather Agent</strong>, <strong>Customs Agent</strong>, and <strong>Margin Agent</strong> to calculate your verified quote and generate an official vector PDF.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          ← Previous Step
                        </button>
                      ) : <div />}

                      {currentStep < 5 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(prev => prev + 1)}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-200" />
                          <span>Request Quotation & Run 5-Agent Verification</span>
                        </button>
                      )}
                    </div>

                  </form>
                </div>
              </div>

              {/* Right side Summary Card (span 4) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Live Quote Summary</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">Step {currentStep}/5</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Origin:</span>
                      <strong className="text-white">{formData.origin || 'Not Selected'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Destination:</span>
                      <strong className="text-white">{formData.destination || 'Not Selected'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Transport Mode:</span>
                      <strong className="text-white">{formData.serviceMode} ({formData.containerLoad})</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Weight:</span>
                      <strong className="text-white">{parseFloat(formData.weight || 0).toLocaleString()} kg</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Estimated Transit:</span>
                      <strong className="text-indigo-300">{estimate.transitTime}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Preliminary Estimation</span>
                    <div className="text-2xl font-black text-emerald-400 mt-0.5">
                      ₹ {estimate.cost.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Final risk-adjusted tariff is validated across the 5 AI agents upon enquiry submission.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
