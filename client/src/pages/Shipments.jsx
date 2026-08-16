import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  Plane,
  Anchor,
  Train,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Weight,
  Box,
  FileText,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Edit3,
  X,
  Sliders,
  Check
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import { downloadQuotePDF } from '../utils/exportUtils'

const PACKAGE_TYPES = [
  { value: 'container', label: 'Container' },
  { value: 'pallets', label: 'Pallet' },
  { value: 'boxes', label: 'Carton' },
  { value: 'crates', label: 'Crate' },
  { value: 'drums', label: 'Drums / Barrels' },
  { value: 'rolls', label: 'Rolls / Spools' }
]

const CONTAINER_TYPES = [
  { value: '20gp', label: "20' General Purpose (20GP)" },
  { value: '40gp', label: "40' General Purpose (40GP)" },
  { value: '40hc', label: "40' High Cube (40HC)" },
  { value: '45hc', label: "45' High Cube (45HC)" },
  { value: '20rf', label: "20' Reefer Refrigerated (20RF)" },
  { value: '40rf', label: "40' Reefer Refrigerated (40RF)" },
  { value: '20ot', label: "20' Open Top (20OT)" },
  { value: '40ot', label: "40' Open Top (40OT)" },
  { value: '20fr', label: "20' Flat Rack (20FR)" },
  { value: '40fr', label: "40' Flat Rack (40FR)" },
  { value: 'lcl', label: 'LCL Loose Cargo' },
  { value: 'none', label: 'Non-Containerized Cargo' }
]

const SHIPPING_METHODS = [
  { value: 'FCL', label: 'FCL', description: 'Full Container Load — exclusive container use' },
  { value: 'LCL', label: 'LCL', description: 'Less than Container Load — shared consolidated container space' },
  { value: 'FTL', label: 'FTL', description: 'Full Truckload — dedicated road transport' },
  { value: 'LTL', label: 'LTL', description: 'Less than Truckload — partial truck space' },
  { value: 'AIR', label: 'Air Freight', description: 'Expedited air cargo delivery' }
]

const SAMPLE_SHIPMENTS = [
  {
    id: 'SH-4021',
    origin: 'Maharashtra',
    destination: 'Gujarat',
    mode: 'Ocean',
    status: 'In Transit',
    date: 'Aug 14, 2026',
    shippingMethod: 'FCL',
    items: [
      { id: 1, packageType: 'container', containerType: '40hc', unitCount: '2', weight: '18400', commodity: 'Garments & apparel, ready-made cotton', hsCode: '6109.10' },
      { id: 2, packageType: 'container', containerType: '20gp', unitCount: '1', weight: '8200', commodity: 'Fabric rolls, dyed woven synthetic', hsCode: '5407.52' }
    ],
    declaredValue: '8500000',
    currency: 'INR',
    specialInstructions: 'Reefer monitoring required for fabric humidity control.'
  },
  {
    id: 'SH-4020',
    origin: 'Tamil Nadu',
    destination: 'Delhi NCT',
    mode: 'Rail',
    status: 'Delivered',
    date: 'Aug 10, 2026',
    shippingMethod: 'FTL',
    items: [
      { id: 1, packageType: 'pallets', containerType: 'none', unitCount: '14', weight: '11200', commodity: 'Automotive precision transmission gears', hsCode: '8708.40' }
    ],
    declaredValue: '6300000',
    currency: 'INR',
    specialInstructions: 'Fragile automotive parts. Pallet tie-down straps required.'
  },
  {
    id: 'SH-4019',
    origin: 'Karnataka',
    destination: 'Maharashtra',
    mode: 'Road',
    status: 'Pending Pickup',
    date: 'Aug 04, 2026',
    shippingMethod: 'LCL',
    items: [
      { id: 1, packageType: 'crates', containerType: 'lcl', unitCount: '8', weight: '6400', commodity: 'Electronic PCB assemblies', hsCode: '8534.00' }
    ],
    declaredValue: '12000000',
    currency: 'INR',
    specialInstructions: 'Fragile — anti-static packaging required.'
  },
  {
    id: 'SH-4018',
    origin: 'West Bengal',
    destination: 'Telangana',
    mode: 'Air',
    status: 'Customs Hold',
    date: 'Jul 30, 2026',
    shippingMethod: 'FOB',
    items: [
      { id: 1, packageType: 'drums', containerType: 'none', unitCount: '20', weight: '14000', commodity: 'Industrial lubricant oil, refined', hsCode: '2710.19' }
    ],
    declaredValue: '4200000',
    currency: 'USD',
    specialInstructions: 'Hazardous material. UN3082 classification.'
  }
]

export default function Shipments() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [shipments, setShipments] = useState(SAMPLE_SHIPMENTS)
  const [expandedShipment, setExpandedShipment] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [userRole, setUserRole] = useState('customer')

  // Adjust Shipment Modal State
  const [adjustingShipment, setAdjustingShipment] = useState(null)
  const [adjStatus, setAdjStatus] = useState('In Transit')
  const [adjOrigin, setAdjOrigin] = useState('')
  const [adjDestination, setAdjDestination] = useState('')
  const [adjMode, setAdjMode] = useState('Ocean')
  const [adjMethod, setAdjMethod] = useState('FCL')
  const [adjWeight, setAdjWeight] = useState('')
  const [adjCommodity, setAdjCommodity] = useState('')
  const [adjDeclaredValue, setAdjDeclaredValue] = useState('')
  const [adjSpecialInstructions, setAdjSpecialInstructions] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    let token = localStorage.getItem('token')
    if (!token) {
      localStorage.setItem('token', 'demo-jwt-token')
    }

    const role = (localStorage.getItem('userRole') || 'customer').toLowerCase()
    setUserRole(role)

    const storedShipments = localStorage.getItem('allShipments')
    if (storedShipments) {
      try {
        const parsed = JSON.parse(storedShipments)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(s => s.id))
          const remaining = SAMPLE_SHIPMENTS.filter(s => !existingIds.has(s.id))
          setShipments([...parsed, ...remaining])
        }
      } catch (err) {
        console.error('Shipments loading error:', err)
      }
    }
  }, [navigate])

  // Only Broker can adjust; Admin and Customer can only view and download as PDF
  const canAdjust = userRole === 'broker'




  const handleOpenAdjustShipment = (s, e) => {
    if (e) e.stopPropagation()
    setAdjustingShipment(s)
    setAdjStatus(s.status || 'In Transit')
    setAdjOrigin(s.origin || '')
    setAdjDestination(s.destination || '')
    setAdjMode(s.mode || 'Ocean')
    setAdjMethod(s.shippingMethod || 'FCL')
    setAdjWeight(s.items?.[0]?.weight || 18400)
    setAdjCommodity(s.items?.[0]?.commodity || 'General Cargo')
    setAdjDeclaredValue(s.declaredValue || '8500000')
    setAdjSpecialInstructions(s.specialInstructions || '')
  }

  const handleSaveShipmentAdjustment = () => {
    if (!adjustingShipment) return
    const updated = shipments.map(s => {
      if (s.id === adjustingShipment.id) {
        return {
          ...s,
          status: adjStatus,
          origin: adjOrigin,
          destination: adjDestination,
          mode: adjMode,
          shippingMethod: adjMethod,
          declaredValue: adjDeclaredValue,
          specialInstructions: adjSpecialInstructions,
          items: s.items && s.items.length > 0 ? [
            { ...s.items[0], weight: adjWeight, commodity: adjCommodity },
            ...s.items.slice(1)
          ] : [
            { id: 1, packageType: 'container', containerType: '40hc', unitCount: '1', weight: adjWeight, commodity: adjCommodity }
          ]
        }
      }
      return s
    })

    setShipments(updated)
    localStorage.setItem('allShipments', JSON.stringify(updated))
    setAdjustingShipment(null)
    alert(`Shipment ${adjustingShipment.id} adjusted and saved successfully!`)
  }

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'air': return <Plane className="w-4 h-4 text-sky-500" />
      case 'ocean': return <Anchor className="w-4 h-4 text-blue-600" />
      case 'rail': return <Train className="w-4 h-4 text-purple-600" />
      default: return <Truck className="w-4 h-4 text-indigo-500" />
    }
  }

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'in transit':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Truck, dotColor: 'bg-blue-500' }
      case 'delivered':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2, dotColor: 'bg-emerald-500' }
      case 'pending pickup':
      case 'pending booking':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, dotColor: 'bg-amber-500' }
      case 'customs hold':
      case 'delayed':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertCircle, dotColor: 'bg-rose-500' }
      case 'vessel dispatched':
      case 'customs cleared':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: CheckCircle2, dotColor: 'bg-indigo-500' }
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: Clock, dotColor: 'bg-slate-400' }
    }
  }

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterStatus === 'all') return matchesSearch
    return matchesSearch && s.status.toLowerCase() === filterStatus.toLowerCase()
  })

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
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* Header bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-800">System Shipments & Cargo Ledger</h1>
                <p className="text-[10px] text-slate-500 font-medium">Track, manage, and manually adjust system shipments across broker and administrative consoles</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="glass-card rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipments by ID, origin, destination..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Statuses ({shipments.length})</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="pending pickup">Pending Pickup</option>
                <option value="customs hold">Customs Hold</option>
              </select>
            </div>
          </div>

          {/* Shipments List */}
          <div className="space-y-3">
            {filteredShipments.map((shipment) => {
              const statusConfig = getStatusConfig(shipment.status)
              const StatusIcon = statusConfig.icon
              const isExpanded = expandedShipment === shipment.id
              const totalWeight = shipment.items?.reduce((sum, it) => sum + (parseFloat(it.weight) || 0), 0) || 0

              return (
                <div
                  key={shipment.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300"
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => setExpandedShipment(isExpanded ? null : shipment.id)}
                    className="p-4 sm:p-5 cursor-pointer select-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* ID Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                          <span className="text-sm font-extrabold text-sky-600">{shipment.id}</span>
                        </div>

                        {/* Route */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{shipment.origin}</span>
                            <span className="text-slate-300">→</span>
                            <span className="truncate">{shipment.destination}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        {/* Mode */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                          {getModeIcon(shipment.mode)}
                          <span>{shipment.mode}</span>
                        </div>

                        {/* Weight summary */}
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {totalWeight.toLocaleString()} kg
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {shipment.status}
                        </span>

                        {/* Adjust Button (Broker & Admin only) */}
                        {canAdjust && (
                          <button
                            onClick={(e) => handleOpenAdjustShipment(shipment, e)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-amber-700" />
                            <span>Adjust</span>
                          </button>
                        )}

                        {/* Expand toggle */}
                        <div className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Shipment Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-slate-100 pt-5">

                          {/* Top Action inside details */}
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-xs font-bold text-slate-700">Shipment Specification Record</span>
                              <p className="text-[10px] text-slate-500">Method: {shipment.shippingMethod || 'FCL'} · Declared: ₹{parseFloat(shipment.declaredValue || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {canAdjust && (
                                <button
                                  onClick={(e) => handleOpenAdjustShipment(shipment, e)}
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" /> Adjust Details
                                </button>
                              )}
                              <button
                                onClick={() => downloadQuotePDF({

                                  id: shipment.id,
                                  customer: 'Direct Shipper',
                                  cost: `₹ ${parseFloat(shipment.declaredValue || 500000).toLocaleString('en-IN')}`,
                                  originName: shipment.origin,
                                  destName: shipment.destination,
                                  mode: shipment.mode,
                                  basis: shipment.shippingMethod
                                })}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" /> Waybill PDF
                              </button>
                            </div>
                          </div>

                          {/* Cargo Items Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                                  <th className="text-left py-2 px-3">Pkg Type</th>
                                  <th className="text-left py-2 px-3">Container</th>
                                  <th className="text-left py-2 px-3">Units</th>
                                  <th className="text-left py-2 px-3">Weight (kg)</th>
                                  <th className="text-left py-2 px-3">Commodity</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {shipment.items?.map((it, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50 font-medium">
                                    <td className="py-2.5 px-3 uppercase font-bold text-slate-700">{it.packageType}</td>
                                    <td className="py-2.5 px-3 font-mono text-slate-600">{it.containerType}</td>
                                    <td className="py-2.5 px-3 font-bold text-slate-800">{it.unitCount}</td>
                                    <td className="py-2.5 px-3 font-bold text-slate-800">{parseFloat(it.weight || 0).toLocaleString()} kg</td>
                                    <td className="py-2.5 px-3 text-slate-600">{it.commodity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Special Instructions */}
                          {shipment.specialInstructions && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                              <span className="font-bold text-amber-900 block mb-0.5">Special Cargo Instructions:</span>
                              <p className="text-amber-800 font-medium">{shipment.specialInstructions}</p>
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            {filteredShipments.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">No shipments found matching filter.</p>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Interactive Shipment Adjustment Modal */}
      {adjustingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
                  OPERATIONAL DISPATCH CONTROL
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Adjust Shipment {adjustingShipment.id}
                </h3>
              </div>
              <button
                onClick={() => setAdjustingShipment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Shipment Milestone Status
                </label>
                <select
                  value={adjStatus}
                  onChange={e => setAdjStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="In Transit">In Transit</option>
                  <option value="Vessel Dispatched">Vessel Dispatched</option>
                  <option value="Customs Cleared">Customs Cleared</option>
                  <option value="Pending Pickup">Pending Pickup</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Customs Hold">Customs Hold</option>
                </select>
              </div>

              {/* Origin & Destination */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Origin State/Port</label>
                  <input
                    type="text"
                    value={adjOrigin}
                    onChange={e => setAdjOrigin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Destination State/Port</label>
                  <input
                    type="text"
                    value={adjDestination}
                    onChange={e => setAdjDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Mode & Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Transport Mode</label>
                  <select
                    value={adjMode}
                    onChange={e => setAdjMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Ocean">Ocean Freight</option>
                    <option value="Air">Air Freight</option>
                    <option value="Road">Road Transport</option>
                    <option value="Rail">Rail Intermodal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Shipping Basis Method</label>
                  <select
                    value={adjMethod}
                    onChange={e => setAdjMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="FCL">FCL (Full Container)</option>
                    <option value="LCL">LCL (Consolidated)</option>
                    <option value="FTL">FTL (Full Truckload)</option>
                    <option value="LTL">LTL (Less Truckload)</option>
                    <option value="AIR">Air Cargo</option>
                  </select>
                </div>
              </div>

              {/* Weight & Commodity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    value={adjWeight}
                    onChange={e => setAdjWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Declared Value (INR)</label>
                  <input
                    type="number"
                    value={adjDeclaredValue}
                    onChange={e => setAdjDeclaredValue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Commodity Description */}
              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Commodity Description</label>
                <input
                  type="text"
                  value={adjCommodity}
                  onChange={e => setAdjCommodity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">Operational Handling Instructions</label>
                <textarea
                  rows="2"
                  value={adjSpecialInstructions}
                  onChange={e => setAdjSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAdjustingShipment(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShipmentAdjustment}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Shipment Adjustment</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
