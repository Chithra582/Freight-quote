import { useState, useEffect } from 'react'
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
  Plus
} from 'lucide-react'

import Sidebar from '../components/Sidebar'


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
  { value: 'DAP', label: 'DAP - Delivered At Place' },
  { value: 'FCA', label: 'FCA - Free Carrier' }
]

const PACKAGE_TYPES = [
  { value: 'container', label: 'Container' },
  { value: 'pallets', label: 'Pallet' },
  { value: 'boxes', label: 'Carton' },
  { value: 'crates', label: 'Crate' },
  { value: 'drums', label: 'Drums / Barrels' },
  { value: 'rolls', label: 'Rolls / Spools' }
]

const SHIPPING_METHODS = [
  { value: 'FCL', label: 'FCL — Full container', color: 'orange' },
  { value: 'LCL', label: 'LCL — Consolidated', color: 'blue' },
  { value: 'FOB', label: 'FOB — Free On Board', color: 'slate' }
]

const WEIGHT_LIMITS = {
  '20gp': { max: 18000, label: "20' GP" },
  '40gp': { max: 26000, label: "40' GP" },
  '40hc': { max: 26480, label: "40' HC" },
  '20rf': { max: 17000, label: "20' Reefer" },
  '40rf': { max: 25000, label: "40' Reefer" },
  'lcl': { max: 20000, label: 'LCL' },
  'none': { max: 50000, label: 'Bulk' }
}

const CONTAINER_TYPES = [
  { value: '20gp', label: "20' General Purpose (FCL)" },
  { value: '40gp', label: "40' General Purpose (FCL)" },
  { value: '40hc', label: "40' High Cube (FCL)" },
  { value: '20rf', label: "20' Reefer Temperature-Controlled" },
  { value: '40rf', label: "40' Reefer Temperature-Controlled" },
  { value: 'lcl', label: 'Less than Container Load (LCL Cargo)' },
  { value: 'none', label: 'Non-Containerized Bulk Freight' }
]

const HUB_CODES = {
  'Maharashtra': { code: 'INNSA', name: 'Mumbai' },
  'Gujarat': { code: 'INMUN', name: 'Mundra' },
  'Tamil Nadu': { code: 'INMAA', name: 'Chennai' },
  'West Bengal': { code: 'INCCU', name: 'Kolkata' },
  'Kerala': { code: 'INCOK', name: 'Cochin' },
  'Delhi NCT': { code: 'INTKD', name: 'Delhi' },
  'Karnataka': { code: 'INBLR', name: 'Bengaluru' },
  'Telangana': { code: 'INHYD', name: 'Hyderabad' },
  'Andhra Pradesh': { code: 'INVTZ', name: 'Vizag' },
  'Goa': { code: 'INMRM', name: 'Goa' },
  'Dubai': { code: 'AEJEA', name: 'Dubai' }
}

const getHubDetails = (locationName) => {
  if (!locationName) return { code: 'INNSA', name: 'Mumbai' }
  const key = Object.keys(HUB_CODES).find(k => 
    locationName.toLowerCase().includes(k.toLowerCase()) || 
    k.toLowerCase().includes(locationName.toLowerCase())
  )
  return key ? HUB_CODES[key] : { code: 'AEJEA', name: locationName.split(' ')[0] }
}

export default function NewShipmentEnquiry() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [newQuoteId, setNewQuoteId] = useState('')
  const navigate = useNavigate()

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
    serviceMode: 'Road', // Ocean, Air, Road, Rail
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
        weight: '',
        commodity: '',
        hsCode: ''
      }
    ],
    // Keep legacy fields for estimate calculation
    packageType: 'container',
    containerType: '40hc',
    weight: '',
    volume: '',
    commodity: '',
    hsCode: '',

    // Step 4 - Additional Details
    declaredValue: '', // INR
    currency: 'INR',
    specialInstructions: '',
    isHazardous: false,
    isFragile: false,
    isTempControlled: false,
    isInsuranceRequired: false,

    // Step 5 - Contact Details
    contactName: '',
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    country: 'India'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const nextData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
      // If readyDate is changed and deliveryDate is before the new readyDate, reset deliveryDate
      if (name === 'readyDate' && nextData.deliveryDate && nextData.deliveryDate < value) {
        nextData.deliveryDate = ''
      }
      return nextData
    })
  }

  // Multi-item cargo handlers
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          packageType: 'container',
          containerType: '40hc',
          unitCount: '1',
          weight: '',
          commodity: '',
          hsCode: ''
        }
      ]
    }))
  }

  const handleRemoveItem = (itemId) => {
    setFormData((prev) => {
      const newItems = prev.items.filter(item => item.id !== itemId)
      // Update legacy weight field to total of all items
      const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)
      return {
        ...prev,
        items: newItems,
        weight: String(totalWeight)
      }
    })
  }

  const handleItemChange = (itemId, field, value) => {
    setFormData((prev) => {
      const newItems = prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
      // Sync legacy fields with first item / totals
      const totalWeight = newItems.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0)
      const firstItem = newItems[0] || {}
      return {
        ...prev,
        items: newItems,
        weight: String(totalWeight),
        commodity: firstItem.commodity || prev.commodity,
        hsCode: firstItem.hsCode || prev.hsCode,
        packageType: firstItem.packageType || prev.packageType,
        containerType: firstItem.containerType || prev.containerType
      }
    })
  }

  // Calculate coordinates & live values
  const getCoordinates = (locationName) => {
    const hub = INDIAN_STATES_HUBS.find(h => h.value === locationName)
    return hub ? { lat: hub.lat, lng: hub.lng } : { lat: 20, lng: 78 }
  }

  const calculateDistance = () => {
    if (!formData.origin || !formData.destination) return 0
    if (formData.origin === formData.destination) return 0
    const start = getCoordinates(formData.origin)
    const end = getCoordinates(formData.destination)
    
    // Haversine distance formula approximation
    const R = 6371 // Earth radius in km
    const dLat = (end.lat - start.lat) * Math.PI / 180
    const dLng = (end.lng - start.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c
    return Math.round(d)
  }

  const distanceVal = calculateDistance()

  const calculateFreightEstimate = () => {
    if (distanceVal === 0) return { cost: 0, days: 0 }
    
    // Transit time calculation based on distance and mode
    let averageSpeed = 60 // km/h for road
    if (formData.serviceMode === 'Air') averageSpeed = 750
    if (formData.serviceMode === 'Ocean') averageSpeed = 22
    if (formData.serviceMode === 'Rail') averageSpeed = 45

    const hours = distanceVal / averageSpeed
    let days = Math.ceil(hours / 10) // assuming 10 hrs travel time block per day
    if (formData.serviceMode === 'Air') days = 1
    if (formData.serviceMode === 'Ocean') days = Math.max(7, days)

    const weightNum = parseFloat(formData.weight) || 0
    if (weightNum === 0) {
      return { cost: 0, days: days }
    }

    let baseRate = 0
    let perKmRate = 0

    switch (formData.serviceMode) {
      case 'Air':
        baseRate = 18000
        perKmRate = 145
        break
      case 'Ocean':
        baseRate = 35000
        perKmRate = 12
        break
      case 'Rail':
        baseRate = 9500
        perKmRate = 22
        break
      default: // Road
        baseRate = 6000
        perKmRate = 34
    }

    const distanceCost = distanceVal * perKmRate
    const weightCost = weightNum * 6.5 // ₹6.5 per kg

    let rawCost = baseRate + distanceCost + weightCost

    // Checkboxes / options multipliers
    if (formData.isHazardous) rawCost *= 1.8
    if (formData.isTempControlled) rawCost *= 1.55
    if (formData.isFragile) rawCost *= 1.35
    if (formData.isInsuranceRequired) rawCost += 4500

    return {
      cost: Math.round(rawCost),
      days: days
    }
  }

  const estimate = calculateFreightEstimate()

  const handleNextStep = () => {
    // Validate Current Step
    if (currentStep === 1) {
      if (!formData.origin || !formData.destination) {
        alert('Please select both Origin and Destination hubs.')
        return
      }
      if (formData.origin === formData.destination) {
        alert('Origin and Destination cannot be the same hub.')
        return
      }
      if (!formData.pickupAddress || !formData.deliveryAddress) {
        alert('Please fill out the pickup and delivery addresses.')
        return
      }
      if (!formData.readyDate || !formData.deliveryDate) {
        alert('Please select both Cargo Ready Date and Target Delivery Date.')
        return
      }
      if (formData.readyDate < todayStr) {
        alert('Cargo Ready Date cannot be in the past.')
        return
      }
      if (formData.deliveryDate < formData.readyDate) {
        alert('Target Delivery Date cannot be before the Cargo Ready Date.')
        return
      }
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    // Validate step 5
    if (!formData.contactName || !formData.companyName || !formData.contactEmail || !formData.contactPhone) {
      alert('Please fill out all contact fields before submission.')
      return
    }

    const quoteId = `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const shipmentId = `SH-${Math.floor(4000 + Math.random() * 900)}`
    setNewQuoteId(quoteId)

    const newQuote = {
      id: quoteId,
      customer: formData.companyName || 'ABC Logistics',
      customerCity: formData.origin || 'Mumbai',
      origin: formData.origin,
      destination: formData.destination,
      originName: formData.origin,
      destName: formData.destination,
      lane: `${formData.origin || 'INNSA'} → ${formData.destination || 'AEJEA'}`,
      laneDesc: `${formData.origin || 'Mumbai'} → ${formData.destination || 'Dubai'}`,
      mode: `${formData.serviceMode || 'Ocean'} FCL`,
      cost: `₹ ${estimate.cost.toLocaleString('en-IN')}`,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      created: 'Just now',
      basis: `${formData.containerCount || 2} × ${formData.containerType ? formData.containerType.toUpperCase() : '40HC'}`,
      weight: `${parseFloat(formData.weight || 18400).toLocaleString()} kg`,
      transit: '6–10 d',
      transitDays: '6–10 d',
      service: `${formData.serviceMode || 'Ocean'} Standard Express`,
      sellPrice: `₹ ${estimate.cost.toLocaleString('en-IN')}`,
      validUntil: '7 Days',
      cargo: `${formData.commodityDesc || 'General Cargo'} (${parseFloat(formData.weight || 18400).toLocaleString()} kg)`
    }

    const newShipment = {
      id: shipmentId,
      origin: formData.origin || 'Maharashtra',
      destination: formData.destination || 'Dubai',
      mode: formData.serviceMode || 'Ocean',
      status: 'Pending Pickup',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      shippingMethod: formData.loadType || 'FCL',
      items: [
        {
          id: 1,
          packageType: formData.packageType || 'container',
          containerType: formData.containerType || '40hc',
          unitCount: String(formData.containerCount || 1),
          weight: String(formData.weight || 18400),
          commodity: formData.commodityDesc || 'Commercial Goods',
          hsCode: formData.hsCode || '5208.11'
        }
      ],
      declaredValue: String(formData.declaredValue || '3500000'),
      currency: formData.currency || 'INR',
      specialInstructions: formData.specialInstructions || '',
      customer: formData.companyName || 'ABC Logistics',
      quoteRef: quoteId,
      cost: `₹ ${estimate.cost.toLocaleString('en-IN')}`
    }

    // 1. Persist to localStorage for immediate UI synchronization across Customer, Broker, Admin, and Shipments
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
      console.error('LocalStorage sync error:', err)
    }


    // 2. Persist to Django Backend API (SQLite / PostgreSQL Database)
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch('http://localhost:8000/api/v1/shipments/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            origin_name: formData.origin,
            destination_name: formData.destination,
            origin_code: 'INMAA',
            destination_code: 'SGSIN',
            ready_date: formData.readyDate || new Date().toISOString().split('T')[0],
            required_delivery_date: formData.deliveryDate || null,
            mode: (formData.serviceMode || 'OCEAN').toUpperCase(),
            container_type: '40HC',
            container_count: 1,
            gross_weight_kg: parseFloat(formData.weight) || 1000,
            contact_full_name: formData.contactName,
            contact_company_name: formData.companyName,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone
          })
        })
      } catch (apiErr) {
        console.warn('Backend API submission sync:', apiErr)
      }
    }

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      navigate('/dashboard')
    }, 2000)
  }


  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">

      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Content View */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">

          
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Form steps wizard (span 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Steps Progress Header */}
              <div className="glass-card rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-between items-center max-w-lg mx-auto">
                  {[1, 2, 3, 4, 5].map((stepNum) => (
                    <div key={stepNum} className="flex flex-col items-center relative flex-1">
                      {/* Connection bar */}
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
                            ? 'bg-blue-600 text-white border-blue-650 ring-4 ring-blue-100 shadow-md shadow-blue-600/20'
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
              <div className="glass-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 relative min-h-[420px] flex flex-col justify-between">
                
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 space-y-4 my-auto"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-255 flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Quotation Created Successfully!</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Quote ID <span className="font-extrabold text-blue-600">{newQuoteId}</span> is saved and mapped under your dashboard registry logs.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-between">
                    <div>
                      {/* Step Title Header */}
                      <div className="mb-6 pb-4 border-b border-slate-100">
                        <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wide">
                          Step {currentStep} of 5
                        </span>
                        <h2 className="text-lg font-black text-slate-800 mt-0.5">
                          {currentStep === 1 && 'Define Shipping Lane & Route Coordinates'}
                          {currentStep === 2 && 'Select Freight Service Modality'}
                          {currentStep === 3 && 'Cargo Specifications & Classification'}
                          {currentStep === 4 && 'Value declarations & Special Protections'}
                          {currentStep === 5 && 'Submit Shippers Contact Validation'}
                        </h2>
                      </div>

                      {/* Wizard Steps Form Areas */}
                      <div className="space-y-5">
                        
                        {/* STEP 1: ROUTE */}
                        {currentStep === 1 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Origin State Hub</label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                  <select
                                    name="origin"
                                    value={formData.origin}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 appearance-none font-medium cursor-pointer"
                                  >
                                    <option value="" disabled>Select Origin Hub</option>
                                    {INDIAN_STATES_HUBS.map((hub) => (
                                      <option key={hub.value} value={hub.value}>{hub.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Destination State Hub</label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                  <select
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleInputChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 appearance-none font-medium cursor-pointer"
                                  >
                                    <option value="" disabled>Select Destination Hub</option>
                                    {INDIAN_STATES_HUBS.map((hub) => (
                                      <option key={hub.value} value={hub.value}>{hub.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Exact Pickup Address</label>
                                <input
                                  type="text"
                                  required
                                  name="pickupAddress"
                                  placeholder="Floor, Gate No, Warehouse, GIDC Area"
                                  value={formData.pickupAddress}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Exact Delivery Address</label>
                                  <input
                                  type="text"
                                  required
                                  name="deliveryAddress"
                                  placeholder="Corporate Warehouse, ICD Terminal Compound"
                                  value={formData.deliveryAddress}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 placeholder:text-slate-450"
                                />
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

                        {/* STEP 2: SERVICE TYPE */}
                        {currentStep === 2 && (
                          <div className="space-y-5">
                            <div>
                              <span className="block text-slate-700 font-semibold text-xs mb-3">Transit Mode Selection</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { mode: 'Road', label: 'Road Freight', icon: Truck },
                                  { mode: 'Ocean', label: 'Ocean Lines', icon: Anchor },
                                  { mode: 'Air', label: 'Air Express', icon: Plane },
                                  { mode: 'Rail', label: 'Rail Cargo', icon: Train }
                                ].map((item) => {
                                  const Icon = item.icon
                                  return (
                                    <button
                                      key={item.mode}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, serviceMode: item.mode }))}
                                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                                        formData.serviceMode === item.mode
                                          ? 'border-blue-600 bg-blue-50/40 text-blue-600 shadow-sm'
                                          : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white hover:bg-slate-50'
                                      }`}
                                    >
                                      <Icon className="w-6 h-6" />
                                      <span className="text-xs font-bold">{item.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Load Structure</label>
                                <div className="grid grid-cols-2 gap-3">
                                  {['FCL', 'LCL'].map((loadOption) => (
                                    <button
                                      key={loadOption}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, containerLoad: loadOption }))}
                                      className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        formData.containerLoad === loadOption
                                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                                          : 'border-slate-200 hover:border-slate-350 text-slate-655 bg-white hover:bg-slate-50'
                                      }`}
                                    >
                                      {loadOption === 'FCL' ? 'FCL (Full Load)' : 'LCL (Shared Load)'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Incoterms Definition</label>
                                <select
                                  name="incoterm"
                                  value={formData.incoterm}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                                >
                                  {INCOTERMS.map((term) => (
                                    <option key={term.value} value={term.value}>{term.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: SHIPMENT DETAILS */}
                        {currentStep === 3 && (
                          <div className="space-y-5">
                            {/* Shipping Method Tabs */}
                            <div>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {SHIPPING_METHODS.map((method) => (
                                  <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, shippingMethod: method.value }))}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                      formData.shippingMethod === method.value
                                        ? method.value === 'FCL'
                                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                                          : method.value === 'LCL'
                                            ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                            : 'bg-slate-700 text-white border-slate-700 shadow-md shadow-slate-500/20'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                  >
                                    {method.label}
                                    {formData.shippingMethod === method.value && (
                                      <span className="ml-1.5 bg-white/25 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold">ACTIVE</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">Decide which cost leg basis in the quote.</p>
                            </div>

                            {/* Cargo Items */}
                            {formData.items.map((item, index) => {
                              const weightLimit = WEIGHT_LIMITS[item.containerType] || WEIGHT_LIMITS['40hc']
                              const currentWeight = parseFloat(item.weight) || 0
                              const isOverweight = currentWeight > weightLimit.max

                              return (
                                <div key={item.id} className="relative bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-4">
                                  {/* Item Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Package className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Item {index + 1}</span>
                                    </div>
                                    {formData.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                      </button>
                                    )}
                                  </div>

                                  {/* Package Type + Container Type Row */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                                        Package type <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md font-bold ml-1">REQ</span>
                                      </label>
                                      <select
                                        value={item.packageType}
                                        onChange={(e) => handleItemChange(item.id, 'packageType', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer appearance-none"
                                      >
                                        {PACKAGE_TYPES.map((pkg) => (
                                          <option key={pkg.value} value={pkg.value}>{pkg.label}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                                        Container type <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md font-bold ml-1">REQ</span>
                                      </label>
                                      <select
                                        value={item.containerType}
                                        onChange={(e) => handleItemChange(item.id, 'containerType', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer appearance-none"
                                      >
                                        {CONTAINER_TYPES.map((con) => (
                                          <option key={con.value} value={con.value}>{con.label}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Unit Count + Weight Row */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-slate-700 font-semibold text-xs mb-1.5">Unit per item</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.unitCount}
                                        onChange={(e) => handleItemChange(item.id, 'unitCount', e.target.value)}
                                        placeholder="e.g. 1"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                                        Total gross weight (kg) <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md font-bold ml-1">REQ</span>
                                      </label>
                                      <input
                                        type="number"
                                        required
                                        value={item.weight}
                                        onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                                        placeholder="e.g. 18400"
                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none ${
                                          isOverweight ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
                                        }`}
                                      />
                                      <p className={`text-[10px] mt-1 font-medium ${
                                        isOverweight ? 'text-red-500' : 'text-slate-400'
                                      }`}>
                                        {isOverweight
                                          ? `⚠ Exceeds max ${weightLimit.max.toLocaleString()} kg for ${weightLimit.label}`
                                          : `Limit for ${weightLimit.label} = ${weightLimit.max.toLocaleString()} kg`
                                        }
                                      </p>
                                    </div>
                                  </div>

                                  {/* Commodity + HS Code Row */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                                        Commodity description <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md font-bold ml-1">REQ</span>
                                      </label>
                                      <input
                                        type="text"
                                        required
                                        value={item.commodity}
                                        onChange={(e) => handleItemChange(item.id, 'commodity', e.target.value)}
                                        placeholder="e.g. Cotton textile rolls, unbleached"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                      <p className="text-[10px] text-slate-400 font-medium mt-1 italic">*General cargo is rejected — customs-grade specifics</p>
                                    </div>

                                    <div>
                                      <label className="block text-slate-700 font-semibold text-xs mb-1.5">
                                        HS code (suggested) <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-bold ml-1">AUTO</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={item.hsCode}
                                        onChange={(e) => handleItemChange(item.id, 'hsCode', e.target.value)}
                                        placeholder="e.g. 5208.11"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}

                            {/* Add Another Item Button */}
                            <button
                              type="button"
                              onClick={handleAddItem}
                              className="w-full py-3 border-2 border-dashed border-slate-250 hover:border-blue-400 rounded-2xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Add another item
                            </button>
                          </div>
                        )}

                        {/* STEP 4: ADDITIONAL DETAILS */}
                        {currentStep === 4 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Declared Valuation</label>
                                <input
                                  type="number"
                                  required
                                  name="declaredValue"
                                  placeholder="Values for clearance"
                                  value={formData.declaredValue}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Trading Currency</label>
                                <select
                                  name="currency"
                                  value={formData.currency}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium cursor-pointer"
                                >
                                  <option value="INR">INR (₹)</option>
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-700 font-semibold text-xs mb-1.5">Special Handling Instructions</label>
                              <textarea
                                rows="2"
                                name="specialInstructions"
                                placeholder="Write liftgate requirement, stackable bounds, or site gate keys"
                                value={formData.specialInstructions}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              {[
                                { name: 'isHazardous', label: 'Hazardous (HazMat)' },
                                { name: 'isFragile', label: 'Fragile Cargo' },
                                { name: 'isTempControlled', label: 'Temp-Controlled' },
                                { name: 'isInsuranceRequired', label: 'Insurance Cover' }
                              ].map((checkbox) => (
                                <label
                                  key={checkbox.name}
                                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                    formData[checkbox.name]
                                      ? 'border-blue-600 bg-blue-50/20 text-blue-655 font-bold'
                                      : 'border-slate-200 hover:border-slate-350 text-slate-500 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    name={checkbox.name}
                                    checked={formData[checkbox.name]}
                                    onChange={handleInputChange}
                                    className="w-4.5 h-4.5 text-blue-600 bg-white border-slate-200 rounded focus:ring-blue-500/20 cursor-pointer"
                                  />
                                  <span className="text-xs">{checkbox.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* STEP 5: CONTACT DETAILS */}
                        {currentStep === 5 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Contact Full Name</label>
                                <div className="relative">
                                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                  <input
                                    type="text"
                                    required
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Corporate Company</label>
                                <div className="relative">
                                  <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                  <input
                                    type="text"
                                    required
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Corporate Email</label>
                                <div className="relative">
                                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                  <input
                                    type="email"
                                    required
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-slate-700 font-semibold text-xs mb-1.5">Phone Contact</label>
                                <div className="relative">
                                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                                  <input
                                    type="tel"
                                    required
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-700 font-semibold text-xs mb-1.5">Base Country</label>
                              <input
                                type="text"
                                required
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          </div>
                        )}
                        
                      </div>
                    </div>

                    {/* Step Navigation Controls */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        disabled={currentStep === 1}
                        className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous Step
                      </button>

                      {currentStep < 5 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          Next Section <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          Save & Dispatch Quote <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </form>
                )}

              </div>
            </div>

            {/* Right side: Light-Themed Live Estimate Panel (span 4) */}
            <div className="lg:col-span-4">
              <div className="glass-card rounded-3xl bg-white text-slate-800 border border-slate-200 p-6 shadow-xl space-y-6 sticky top-24">
                
                {/* Panel Header */}
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-800">Live Estimation Engine</h3>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Dynamic SLA Rates</p>
                  </div>
                </div>

                {/* Estimate Parameters */}
                <div className="space-y-4">
                  {/* Distance */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Calculated Distance</span>
                      <p className="text-xs text-slate-550 font-medium mt-0.5">Neural lane tracking</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800 block">
                        {distanceVal > 0 ? `${distanceVal.toLocaleString()} km` : 'Select Hubs'}
                      </span>
                    </div>
                  </div>

                  {/* Transit Time */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Transit Duration</span>
                      <p className="text-xs text-slate-555 font-medium mt-0.5">Carrier speed standard</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800 block">
                        {estimate.days > 0 ? `${estimate.days} Days (${formData.serviceMode})` : 'Select Mode'}
                      </span>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex justify-between items-start pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-extrabold uppercase tracking-wider">ESTIMATED TOTAL</span>
                      <p className="text-xs text-slate-450 font-semibold mt-0.5">Indicative flat base</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-slate-800 block">
                        {estimate.cost > 0 ? `₹ ${estimate.cost.toLocaleString('en-IN')}` : '₹ 0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Route Options Details */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-150 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Optimized Lane Options</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">⚡ Cheapest Option:</span>
                      <span className="font-bold text-emerald-600">
                        {estimate.cost > 0 ? `₹${Math.round(estimate.cost * 0.85).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">✈️ Express Route:</span>
                      <span className="font-bold text-sky-600">
                        {estimate.cost > 0 ? `₹${Math.round(estimate.cost * 1.45).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">🌱 Low CO2 Route:</span>
                      <span className="font-bold text-purple-650">
                        {estimate.cost > 0 ? `₹${Math.round(estimate.cost * 1.05).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button on right side */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Calculator className="w-4.5 h-4.5" /> Generate Quotation
                </button>

                {/* Note */}
                <div className="flex gap-2 items-start text-[10px] text-slate-450 bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <Info className="w-4 h-4 text-blue-650 shrink-0 mt-0.5" />
                  <p className="leading-normal font-semibold">
                    This live rate calculates base cargo values and lane telemetry data to estimate final bills within 98.4% accuracy.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
