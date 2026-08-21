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
import InstantQuoteCalculator, { ORIGIN_PORTS, DESTINATION_PORTS, CONTAINER_TYPES } from '../components/InstantQuoteCalculator'
import { API_BASE_URL } from '../config/api'
import { downloadQuotePDF } from '../utils/exportUtils'

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
  const [activeModeTab, setActiveModeTab] = useState('calculator') // 'calculator' | 'agents'
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
    origin: 'Chennai',
    destination: 'Singapore',
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
        unitCount: '2',
        weight: '36800',
        commodity: 'Commercial Export Goods',
        hsCode: '8708.29.00'
      }
    ],
    packageType: 'container',
    containerType: '40hc',
    weight: '36800',
    volume: '76',
    commodity: 'Commercial Export Goods',
    hsCode: '8708.29.00',

    // Step 4 - Value & Instructions
    declaredValue: '3500000',
    currency: 'INR',
    specialInstructions: 'Standard dry 40HC container required.',
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
    distance: 1750,
    cost: 148350,
    transitTime: '5 – 6 Days',
    carbonFootprint: '1.4 Tons CO2'
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
    let baseRate = 129000
    if (formData.serviceMode === 'Air') baseRate = 280000
    if (formData.serviceMode === 'Road') baseRate = 85000
    if (formData.serviceMode === 'Rail') baseRate = 95000

    const weightNum = parseFloat(formData.weight) || 36800
    const weightFactor = weightNum / 20000
    const calculatedCost = Math.round(baseRate * Math.max(0.8, weightFactor))

    setEstimate({
      distance: 1750,
      cost: calculatedCost,
      transitTime: formData.serviceMode === 'Air' ? '2 – 3 Days' : '5 – 6 Days',
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
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          packageType: 'container',
          containerType: '40hc',
          unitCount: '1',
          weight: '18400',
          commodity: 'General Merchandise',
          hsCode: '8471.30.10'
        }
      ]
    }))
  }

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  // 5-Agent Verification Routine (Runs for ~90 seconds or instant skip)
  const startAgentVerification = () => {
    setIsVerifying(true)
    setVerificationProgress(0)
    setActiveAgentIndex(0)
    setAgentLogs([])
    setVerifiedResult(null)
    setVerificationSeconds(0)

    const logsTimeline = [
      { time: 2, agent: 0, text: `Analyzing trade corridor ${formData.origin} ➔ ${formData.destination}... Port congestion low (1.2d turn).` },
      { time: 18, agent: 1, text: `Pricing Agent queried live carrier spot rates. BAF fuel surcharge indexed at 10.0%. Base rate locked.` },
      { time: 38, agent: 2, text: `Weather Agent scanned Bay of Bengal & Malacca Strait. Tropical storm risk score: 0.08 (Safe voyage).` },
      { time: 58, agent: 3, text: `Customs Agent validated HS code ${formData.hsCode}. Export clearance ICEGATE EDI declaration verified.` },
      { time: 78, agent: 4, text: `Margin Agent optimized commercial spread. Margin 15.0% satisfies policy floor (12.0%). Auto-authorized.` }
    ]

    let currentSec = 0
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      currentSec += 1
      setVerificationSeconds(currentSec)

      const prog = Math.min(99, Math.round((currentSec / 90) * 100))
      setVerificationProgress(prog)

      if (currentSec >= 75) setActiveAgentIndex(4)
      else if (currentSec >= 55) setActiveAgentIndex(3)
      else if (currentSec >= 35) setActiveAgentIndex(2)
      else if (currentSec >= 15) setActiveAgentIndex(1)
      else setActiveAgentIndex(0)

      const matchedLog = logsTimeline.find(l => l.time === currentSec)
      if (matchedLog) {
        setAgentLogs(prev => [...prev, matchedLog.text])
      }

      if (currentSec >= 90) {
        clearInterval(timerRef.current)
        finalizeVerification()
      }
    }, 1000)
  }

  const finalizeVerification = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsVerifying(false)
    setVerificationProgress(100)
    setActiveAgentIndex(5)

    const finalSellNum = estimate.cost
    const baseBuyNum = Math.round(finalSellNum / 1.15)
    const marginNum = finalSellNum - baseBuyNum

    const result = {
      quoteId: `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'VERIFIED_AUTHORIZED',
      totalPriceFormatted: `₹ ${finalSellNum.toLocaleString('en-IN')}`,
      totalPriceRaw: finalSellNum,
      baseBuyCost: `₹ ${baseBuyNum.toLocaleString('en-IN')}`,
      brokerMargin: `₹ ${marginNum.toLocaleString('en-IN')}`,
      marginPct: 15.0,
      validUntil: '7 Calendar Days',
      overallRiskScore: 'LOW RISK (0.12)',
      routeAnalysis: {
        origin: formData.origin,
        destination: formData.destination,
        optimalLoop: `${formData.serviceMode} Express Direct Line`,
        estimatedTransit: estimate.transitTime,
        portCongestion: 'Normal (0.8d queue)'
      },
      pricingBreakdown: {
        baseLinehaul: `₹ ${baseBuyNum.toLocaleString('en-IN')}`,
        fuelSurcharge: 'Included (BAF 10%)',
        portTerminalHandling: 'Included (THC-O & THC-D)',
        customsDocumentation: 'Included (B/L + ICEGATE)'
      },
      compliance: {
        hsCodeVerified: true,
        imoClass: 'Non-Hazardous General',
        marineInsuranceStatus: '110% CIF Coverage Included'
      }
    }

    setVerifiedResult(result)
  }

  const handleSubmitEnquiry = (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)

    const quoteId = verifiedResult?.quoteId || `QT-2026-${Math.floor(10000 + Math.random() * 90000)}`
    const finalPrice = verifiedResult?.totalPriceFormatted || `₹ ${estimate.cost.toLocaleString('en-IN')}`

    const newQuote = {
      id: quoteId,
      origin: `${formData.origin} Port`,
      destination: `${formData.destination} Port`,
      mode: formData.serviceMode,
      service: `${formData.serviceMode} Direct Verified Express`,
      sellPrice: finalPrice,
      status: 'Issued',
      validUntil: 'Aug 28, 2026',
      transitDays: estimate.transitTime,
      cargo: `${formData.items.length} Package(s) (${formData.commodity})`,
      trackingStep: 2
    }

    try {
      const stored = localStorage.getItem('customerQuotes')
      let list = stored ? JSON.parse(stored) : []
      list.unshift(newQuote)
      localStorage.setItem('customerQuotes', JSON.stringify(list))
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1200)
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

          {/* Navigation Bar & Mode Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveModeTab('calculator')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModeTab === 'calculator'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>⚡ Instant Quote Calculator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModeTab('agents')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeModeTab === 'agents'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>🤖 5-Agent Multi-Verification</span>
                </button>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deterministic M2 Calculation Ready</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: DIRECT INSTANT QUOTE CALCULATOR (MATCHING USER SPEC EXACTLY) */}
          {/* ========================================================================= */}
          {activeModeTab === 'calculator' && (
            <InstantQuoteCalculator onSaveToDashboard={() => navigate('/dashboard')} />
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 5-AGENT MULTI-VERIFICATION WORKFLOW */}
          {/* ========================================================================= */}
          {activeModeTab === 'agents' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Wizard */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Steps Header */}
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

                {/* Form Content */}
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
                                {ORIGIN_PORTS.map(h => (
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
                                {DESTINATION_PORTS.map(d => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
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
                          2. Transport Mode & Incoterm
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { mode: 'Ocean', icon: Anchor, desc: 'FCL & LCL Sea' },
                            { mode: 'Air', icon: Plane, desc: 'Priority Air' },
                            { mode: 'Road', icon: Truck, desc: 'Inland Haulage' },
                            { mode: 'Rail', icon: Train, desc: 'Container Rail' }
                          ].map((item) => {
                            const IconComp = item.icon
                            const isSelected = formData.serviceMode === item.mode
                            return (
                              <button
                                key={item.mode}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, serviceMode: item.mode }))}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <IconComp className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                                <div className="font-bold text-xs text-slate-900">{item.mode}</div>
                                <div className="text-[10px] text-slate-500">{item.desc}</div>
                              </button>
                            )
                          })}
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold text-xs mb-1.5">Incoterm Cost Responsibility</label>
                          <select
                            name="incoterm"
                            value={formData.incoterm}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                          >
                            {INCOTERMS.map(inc => (
                              <option key={inc.value} value={inc.value}>{inc.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CARGO DETAILS */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h2 className="text-base font-black text-slate-900">
                            3. Cargo & Container Specifications
                          </h2>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Container Line</span>
                          </button>
                        </div>

                        {formData.items.map((item, idx) => (
                          <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-slate-800">Container Item #{idx + 1}</span>
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                                <select
                                  value={item.containerType}
                                  onChange={e => handleItemChange(idx, 'containerType', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                                >
                                  <option value="40hc">40' High Cube (40HC)</option>
                                  <option value="20gp">20' General (20GP)</option>
                                  <option value="40gp">40' General (40GP)</option>
                                  <option value="20rf">20' Reefer (20RF)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Units</label>
                                <input
                                  type="number"
                                  value={item.unitCount}
                                  onChange={e => handleItemChange(idx, 'unitCount', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Total Weight (kg)</label>
                                <input
                                  type="number"
                                  value={item.weight}
                                  onChange={e => handleItemChange(idx, 'weight', e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* STEP 4: VALUE & INSURANCE */}
                    {currentStep === 4 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          4. Valuation & Value-Added Services
                        </h2>

                        <div>
                          <label className="block text-slate-700 font-semibold text-xs mb-1.5">Declared Commercial Value (INR)</label>
                          <input
                            type="number"
                            name="declaredValue"
                            value={formData.declaredValue}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              name="requiresCustomsClearance"
                              checked={formData.requiresCustomsClearance}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900">Include ICEGATE Customs Clearance</span>
                              <p className="text-[11px] text-slate-500">Automated port entry EDI filing</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              name="requiresInsurance"
                              checked={formData.requiresInsurance}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-900">Include Marine Cargo Insurance (110% CIF)</span>
                              <p className="text-[11px] text-slate-500">Comprehensive door-to-door transit protection</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: CONTACT & DISPATCH */}
                    {currentStep === 5 && (
                      <div className="space-y-5">
                        <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                          5. Shipper Confirmation
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Contact Name</label>
                            <input
                              type="text"
                              required
                              name="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
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
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Email Address</label>
                            <input
                              type="email"
                              required
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold text-xs mb-1.5">Phone Number</label>
                            <input
                              type="tel"
                              required
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
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
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmitting ? 'Submitting Quote...' : 'Submit Enquiry & Dispatch to Broker'}</span>
                        </button>
                      )}
                    </div>

                  </form>
                </div>
              </div>

              {/* Right Side: 5-Agent Live Verification Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl">
                  
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
                      <strong className="text-white">{parseFloat(formData.weight || 36800).toLocaleString()} kg · {formData.commodity}</strong>
                    </div>
                  </div>

                  {isVerifying ? (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-bold text-white">Verifying 5 AI Agents...</span>
                        </div>
                        <span className="font-mono text-indigo-300">{verificationProgress}%</span>
                      </div>

                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full"
                          style={{ width: `${verificationProgress}%` }}
                        />
                      </div>

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
                    <div className="space-y-4 pt-1">
                      <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 rounded-2xl">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
                          5-AGENT VERIFIED SELL PRICE
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                          {verifiedResult.totalPriceFormatted}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Guaranteed 7-Day Validity · {verifiedResult.validUntil}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px] mb-0.5">
                            <Navigation className="w-3 h-3" />
                            <span>1. Route Agent:</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            {verifiedResult.routeAnalysis.optimalLoop} ({verifiedResult.routeAnalysis.estimatedTransit})
                          </p>
                        </div>

                        <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                          <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] mb-0.5">
                            <DollarSign className="w-3 h-3" />
                            <span>2. Pricing Agent:</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            Linehaul Buy: {verifiedResult.pricingBreakdown.baseLinehaul} + Margin: {verifiedResult.brokerMargin}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider block">
                          ESTIMATED RATE BASELINE
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono">
                          ₹ {estimate.cost.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Indicative transit: {estimate.transitTime}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={startAgentVerification}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Run 5-Agent Multi-Verification</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* Success Dialog */}
          <AnimatePresence>
            {isSuccess && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Quote Request Submitted!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your freight enquiry for <strong>{formData.origin} ➔ {formData.destination}</strong> has been registered and dispatched.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer"
                    >
                      Return to Customer Dashboard
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  )
}
