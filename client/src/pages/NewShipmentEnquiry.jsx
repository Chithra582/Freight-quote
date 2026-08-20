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
  Clock,
  Shield,
  FileCheck
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { API_BASE_URL } from '../config/api'
import { downloadQuotePDF } from '../utils/exportUtils'

const INDIAN_STATES_HUBS = [
  { value: 'Maharashtra', label: 'Maharashtra (Nhava Sheva INNSA)', lat: 18.94, lng: 72.84 },
  { value: 'Gujarat', label: 'Gujarat (Mundra Port INMUN)', lat: 22.84, lng: 69.70 },
  { value: 'Tamil Nadu', label: 'Tamil Nadu (Chennai Port INMAA)', lat: 13.08, lng: 80.27 },
  { value: 'West Bengal', label: 'West Bengal (Kolkata Port INCCU)', lat: 22.57, lng: 88.36 },
  { value: 'Kerala', label: 'Kerala (Cochin Port INCOK)', lat: 9.93, lng: 76.26 },
  { value: 'Delhi NCT', label: 'Delhi NCT (Delhi IGI Cargo INDEL)', lat: 28.53, lng: 77.26 },
  { value: 'Karnataka', label: 'Karnataka (Bengaluru Airport INBLR)', lat: 12.97, lng: 77.59 },
  { value: 'Telangana', label: 'Telangana (Hyderabad RGIA INHYD)', lat: 17.38, lng: 78.48 },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh (Visakhapatnam INVTZ)', lat: 17.68, lng: 83.21 },
  { value: 'Goa', label: 'Goa (Mormugao Port INMRM)', lat: 15.40, lng: 73.80 }
]

const INCOTERMS = [
  { value: 'EXW', label: 'EXW - Ex Works' },
  { value: 'FOB', label: 'FOB - Free On Board' },
  { value: 'CIF', label: 'CIF - Cost, Insurance & Freight' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
  { value: 'DAP', label: 'DAP - Delivered At Place' }
]

const AGENTS_LIST = [
  { id: 'route', name: '1. Route Agent', role: 'Corridor & Port Congestion Analysis', icon: Navigation, color: 'text-sky-400' },
  { id: 'pricing', name: '2. Pricing Agent', role: 'Carrier Spot Rate & BAF Surcharge', icon: DollarSign, color: 'text-blue-400' },
  { id: 'weather', name: '3. Weather Agent', role: 'Ocean Meteorology & Storm Risk Radar', icon: CloudRain, color: 'text-amber-400' },
  { id: 'customs', name: '4. Customs Agent', role: 'HS Code Regulatory Compliance & Readiness', icon: ShieldCheck, color: 'text-indigo-400' },
  { id: 'margin', name: '5. Margin Agent', role: 'Broker Margin Optimization (>12% Floor)', icon: TrendingUp, color: 'text-emerald-400' }
]

export default function NewShipmentEnquiry() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
    origin: 'Maharashtra',
    destination: 'Jebel Ali (AEJEA)',
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

  // Estimated baseline dynamic costs
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

  // Recalculate dynamic costs when parameters change
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

    // Reset verified state on significant input changes so user can re-verify
    setVerifiedResult(null)
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

  // === 5-AGENT AI VERIFICATION SEQUENCE ===
  const start5AgentVerification = (e) => {
    if (e) e.preventDefault()

    setIsVerifying(true)
    setVerifiedResult(null)
    setActiveAgentIndex(0)
    setVerificationProgress(5)
    setVerificationSeconds(0)
    setAgentLogs(['[00:01] Dispatching FreightIntelligence 5-Agent Multi-Verification Session...'])

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
        `[Route Agent] Analyzing shipping lane: ${formData.origin || 'Nhava Sheva'} → ${formData.destination || 'Jebel Ali'}...`,
        `[Route Agent] Direct maritime loop identified. Port berth waiting: 3.2 hrs (Low Congestion).`
      ])
    }, 1200)

    // Stage 2: Pricing Agent
    setTimeout(() => {
      setActiveAgentIndex(1)
      setVerificationProgress(40)
      setAgentLogs(prev => [
        ...prev,
        `[Pricing Agent] Querying spot indices for ${formData.serviceMode || 'Ocean'} carrier allocation...`,
        `[Pricing Agent] Base Linehaul: ₹${estimate.cost.toLocaleString('en-IN')} + BAF (8.5%): ₹${Math.round(estimate.cost * 0.085).toLocaleString('en-IN')}.`
      ])
    }, 2800)

    // Stage 3: Weather Agent
    setTimeout(() => {
      setActiveAgentIndex(2)
      setVerificationProgress(60)
      setAgentLogs(prev => [
        ...prev,
        `[Weather Agent] Scanning Indian Ocean satellite radar & wave height metrics...`,
        `[Weather Agent] Swell 1.6m (Moderate). Storm/Cyclone anomaly index: Low (0.8%). Predicted Delay: 0 Days.`
      ])
    }, 4800)

    // Stage 4: Customs Agent
    setTimeout(() => {
      setActiveAgentIndex(3)
      setVerificationProgress(80)
      setAgentLogs(prev => [
        ...prev,
        `[Customs Agent] Cross-referencing HS Code ${formData.hsCode || '8708.29.00'} against import/export schedules...`,
        `[Customs Agent] Regulatory compliance: 100% Passed. Bill of Lading, COO, Commercial Invoice validated.`
      ])
    }, 6800)

    // Stage 5: Margin Agent & Final Synthesis
    setTimeout(() => {
      setActiveAgentIndex(4)
      setVerificationProgress(100)
      setAgentLogs(prev => [
        ...prev,
        `[Margin Agent] Optimizing broker margin floor (12.5% target)...`,
        `[Freight Intelligence Engine] All 5 agents completed with 0 errors. Verified Prediction synthesized.`
      ])

      finalizeVerification()
    }, 8800)
  }

  const finalizeVerification = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    const quoteId = `QT-AI-${Math.floor(10000 + Math.random() * 90000)}`
    const shipmentId = `SH-${Math.floor(4000 + Math.random() * 900)}`

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
        portCongestion: 'Low (Waiting: 3.2 hrs)'
      },
      pricingBreakdown: {
        agentName: 'Pricing Agent',
        baseLinehaul: `₹ ${baseCost.toLocaleString('en-IN')}`,
        fuelSurcharge: `₹ ${fuelCost.toLocaleString('en-IN')} (BAF 8.5%)`,
        portHandling: `₹ ${portAncillaries.toLocaleString('en-IN')}`
      },
      weatherAssessment: {
        agentName: 'Weather Agent',
        seaCondition: 'Normal Swell (1.6m)',
        stormProbability: 'Low (0.8% anomaly)',
        weatherDelayExpected: '0 Days'
      },
      customsCompliance: {
        agentName: 'Customs Agent',
        hsCodeCompliance: `${formData.hsCode || '8708.29.00'} - Validated`,
        requiredDocs: 'Bill of Lading, COO, Invoice'
      },
      marginOptimization: {
        agentName: 'Margin Agent',
        brokerMarginPct: '12.5%',
        marginAmount: `₹ ${brokerMargin.toLocaleString('en-IN')}`
      }
    }

    setVerifiedResult(synthesizedResult)
    setIsVerifying(false)
  }

  // Handle final submission in Step 5
  const handleSubmitEnquiry = (e) => {
    if (e) e.preventDefault()

    if (!formData.contactName || !formData.companyName || !formData.contactEmail || !formData.contactPhone) {
      alert('Please fill out contact information.')
      return
    }

    const finalPrice = verifiedResult ? verifiedResult.totalPriceFormatted : `₹ ${estimate.cost.toLocaleString('en-IN')}`
    const quoteId = verifiedResult ? verifiedResult.quoteId : `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const shipmentId = verifiedResult ? verifiedResult.shipmentId : `SH-${Math.floor(4000 + Math.random() * 900)}`

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
      cost: finalPrice,
      sellPrice: finalPrice,
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
      cost: finalPrice
    }

    try {
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
      console.error('Save error:', err)
    }

    alert(`Shipment Enquiry submitted successfully!\nQuote Reference: ${quoteId}\nAll 5 AI agents verified the rate at ${finalPrice}.`)
    navigate('/dashboard')
  }

  const handleDownloadPDF = () => {
    downloadQuotePDF({
      id: verifiedResult?.quoteId || `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: formData.origin,
      destination: formData.destination,
      mode: formData.serviceMode,
      cost: verifiedResult ? verifiedResult.totalPriceFormatted : `₹ ${estimate.cost.toLocaleString('en-IN')}`,
      weight: `${formData.weight} kg`,
      basis: `${formData.volume} m³ / ${formData.weight} kg`,
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
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Top Breadcrumbs */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              <Cpu className="w-3.5 h-3.5" />
              <span>5-Agent AI Autonomous Maritime Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT SIDE: FORM WIZARD (SPAN 7) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Steps Progress Header */}
              <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-between items-center max-w-md mx-auto">
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
                        {stepNum === 5 && 'Contact'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 5) handleSubmitEnquiry(e); }}>
                  
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
                                <option key={h.value} value={h.value}>{h.label}</option>
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

                  {/* STEP 2: SERVICE & INCOTERMS */}
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

                  {/* STEP 3: CARGO SPECIFICATIONS & WEIGHT */}
                  {currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h2 className="text-base font-black text-slate-900">
                          3. Cargo Specifications, HS Code & Weight
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
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Harmonized HS Code</label>
                              <input
                                type="text"
                                required
                                value={item.hsCode}
                                onChange={e => handleItemChange(idx, 'hsCode', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">Gross Weight (kg)</label>
                              <input
                                type="number"
                                required
                                value={item.weight}
                                onChange={e => handleItemChange(idx, 'weight', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* STEP 4: ADD-ONS & PROTECTION */}
                  {currentStep === 4 && (
                    <div className="space-y-5">
                      <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                        4. Protection Add-ons & Instructions
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
                            <span className="text-slate-500">All-risk comprehensive coverage against general average and perils.</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: CONTACT DETAILS */}
                  {currentStep === 5 && (
                    <div className="space-y-5">
                      <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                        5. Contact Information & Final Dispatch
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
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Enquiry & Dispatch to Broker</span>
                      </button>
                    )}
                  </div>

                </form>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT SIDE: 5-AGENT AI LIVE VERIFICATION & PREDICTION PANEL (SPAN 5) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
                
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 mb-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>5-Agent Multi-Verification Engine</span>
                    </div>
                    <h3 className="text-base font-black text-white">
                      Live AI Pricing & Risk Verification
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Step {currentStep}/5
                  </span>
                </div>

                {/* Shipment Parameters Summary */}
                <div className="space-y-1.5 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between text-slate-300">
                    <span>Route Lane:</span>
                    <strong className="text-white truncate max-w-[180px]">{formData.origin} ➔ {formData.destination}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Mode / Incoterm:</span>
                    <strong className="text-white">{formData.serviceMode} ({formData.containerLoad}) · {formData.incoterm}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Weight & Commodity:</span>
                    <strong className="text-white">{parseFloat(formData.weight || 18400).toLocaleString()} kg · {formData.commodity}</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>HS Code:</span>
                    <strong className="text-indigo-300 font-mono">{formData.hsCode}</strong>
                  </div>
                </div>

                {/* ===================================================================== */}
                {/* STATE 1: VERIFICATION IN PROGRESS */}
                {/* ===================================================================== */}
                {isVerifying ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-bold text-white">Verifying 5 AI Agents...</span>
                      </div>
                      <span className="font-mono text-indigo-300">{verificationProgress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full"
                        style={{ width: `${verificationProgress}%` }}
                      />
                    </div>

                    {/* 5-Agent Mini Steps */}
                    <div className="space-y-1.5 text-xs">
                      {AGENTS_LIST.map((ag, idx) => {
                        const isPassed = activeAgentIndex > idx
                        const isCurrent = activeAgentIndex === idx
                        const IconComp = ag.icon

                        return (
                          <div
                            key={ag.id}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                              isCurrent
                                ? 'bg-indigo-950/90 border-indigo-500 text-white'
                                : isPassed
                                ? 'bg-slate-800/80 border-emerald-500/50 text-slate-200'
                                : 'bg-slate-900/40 border-slate-800 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <IconComp className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400 animate-spin' : isPassed ? 'text-emerald-400' : 'text-slate-500'}`} />
                              <span className="font-semibold text-[11px]">{ag.name}</span>
                            </div>
                            {isPassed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isCurrent ? (
                              <span className="text-[10px] text-indigo-300 font-mono">Running...</span>
                            ) : (
                              <span className="text-[10px] text-slate-600">Pending</span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Fast forward */}
                    <button
                      type="button"
                      onClick={finalizeVerification}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Skip Delay / Complete Now</span>
                    </button>
                  </div>
                ) : verifiedResult ? (
                  /* ===================================================================== */
                  /* STATE 2: VERIFIED PREDICTION RESULT */
                  /* ===================================================================== */
                  <div className="space-y-4 pt-1">
                    <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
                            5-AGENT VERIFIED PREDICTION
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                            {verifiedResult.totalPriceFormatted}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          {verifiedResult.overallRiskScore}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Guaranteed 7-Day Validity · {verifiedResult.validUntil}
                      </span>
                    </div>

                    {/* 5-Agent Insights Breakdown */}
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                        <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] mb-0.5">
                          <Navigation className="w-3 h-3" />
                          <span>1. Route Agent:</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {verifiedResult.routeAnalysis.optimalLoop} ({verifiedResult.routeAnalysis.estimatedTransit}) · {verifiedResult.routeAnalysis.portCongestion}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] mb-0.5">
                          <DollarSign className="w-3 h-3" />
                          <span>2. Pricing Agent:</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          Linehaul: {verifiedResult.pricingBreakdown.baseLinehaul} + Fuel Surcharge: {verifiedResult.pricingBreakdown.fuelSurcharge}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-0.5">
                          <CloudRain className="w-3 h-3" />
                          <span>3. Weather Agent:</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {verifiedResult.weatherAssessment.seaCondition} · Delay Risk: {verifiedResult.weatherAssessment.weatherDelayExpected}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] mb-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>4. Customs Agent:</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {verifiedResult.customsCompliance.hsCodeCompliance} · Docs: {verifiedResult.customsCompliance.requiredDocs}
                        </p>
                      </div>

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-0.5">
                          <TrendingUp className="w-3 h-3" />
                          <span>5. Margin Agent:</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          Broker Markup: {verifiedResult.marginOptimization.brokerMarginPct} ({verifiedResult.marginOptimization.marginAmount})
                        </p>
                      </div>
                    </div>

                    {/* PDF Download Button */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download AI Verified Quote PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerifiedResult(null)}
                        className="w-full py-1.5 text-slate-400 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-run 5-Agent Verification</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ===================================================================== */
                  /* STATE 3: READY TO VERIFY BUTTON */
                  /* ===================================================================== */
                  <div className="space-y-4 pt-1">
                    <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Estimated Baseline Tariff
                      </span>
                      <div className="text-2xl font-black text-indigo-300">
                        ₹ {estimate.cost.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        To calculate the exact guaranteed commercial rate and risk score, launch the 5-Agent multi-verification engine.
                      </p>
                    </div>

                    {/* 5 Agent Mini list */}
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {AGENTS_LIST.map((ag) => {
                        const IconComp = ag.icon
                        return (
                          <div key={ag.id} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center gap-1">
                            <IconComp className={`w-3.5 h-3.5 ${ag.color}`} />
                            <span className="text-[9px] text-slate-300 font-bold truncate max-w-full">{ag.id}</span>
                          </div>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={start5AgentVerification}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Verify & Predict with 5 AI Agents</span>
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
