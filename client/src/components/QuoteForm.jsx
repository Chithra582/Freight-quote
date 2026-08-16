import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Scale, 
  Box, 
  Truck, 
  Sparkles, 
  Calendar, 
  Leaf, 
  ArrowRight,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'

const CARGO_TYPES = [
  { value: 'standard', label: 'General Goods (No Special Handling)', multiplier: 1.0 },
  { value: 'hazardous', label: 'Hazardous Materials (HazMat)', multiplier: 1.8 },
  { value: 'fragile', label: 'Fragile / High-Value', multiplier: 1.4 },
  { value: 'temp_controlled', label: 'Temperature Controlled', multiplier: 1.6 },
]

const INDIAN_STATES_HUBS = [
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Delhi NCT', label: 'Delhi NCT' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Goa', label: 'Goa' }
]

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    origin: 'Maharashtra',
    destination: 'Delhi NCT',
    weight: '1250',
    volume: '4.2',
    cargoType: 'standard',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [quoteResult, setQuoteResult] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const generateMockQuote = (e) => {
    e.preventDefault()
    if (!formData.origin || !formData.destination || !formData.weight || !formData.volume) {
      alert('Please fill in all details.')
      return
    }

    if (formData.origin === formData.destination) {
      alert('Origin and Destination cannot be the same hub location.')
      return
    }

    setIsLoading(true)
    setQuoteResult(null)

    // Simulate AI loading/calculation time
    setTimeout(() => {
      const cargoDetails = CARGO_TYPES.find(c => c.value === formData.cargoType)
      const weightNum = parseFloat(formData.weight) || 1250
      const volumeNum = parseFloat(formData.volume) || 4.2

      // Calculate mock distance based on string length differences
      const originLen = formData.origin.length
      const destLen = formData.destination.length
      const distance = Math.max(300, (originLen + destLen) * 32)

      // Standard Road Freight Math
      const roadBase = distance * 0.12 * cargoDetails.multiplier
      const roadWeight = (weightNum / 1000) * 8.5
      const roadVolume = volumeNum * 15
      const roadSubtotal = roadBase + roadWeight + roadVolume
      const roadDiscount = roadSubtotal * 0.12
      const roadTotal = roadSubtotal - roadDiscount

      setQuoteResult({
        origin: formData.origin,
        destination: formData.destination,
        weight: weightNum,
        volume: volumeNum,
        distance: distance.toLocaleString(),
        cargoLabel: cargoDetails.label,
        cost: Math.round(roadTotal * 80),
        discount: Math.round(roadDiscount * 80),
        speed: '3-5 Days',
        co2: Math.round(distance * 0.08),
        co2Saving: '65%',
        routeOptimization: distance > 900 
          ? 'Consolidated express shipping lane routed via national highway network. Fuel footprint optimized.'
          : 'Direct lane optimized via highway bypass corridors. Avoided metropolitan toll delays.',
      })
      setIsLoading(false)
    }, 1500)
  }

  const handleReset = () => {
    setFormData({
      origin: 'Maharashtra',
      destination: 'Delhi NCT',
      weight: '1250',
      volume: '4.2',
      cargoType: 'standard',
    })
    setQuoteResult(null)
  }

  return (
    <div className="w-full">
      <div className="glass-card rounded-3xl overflow-hidden p-6 sm:p-7 relative border border-slate-200 shadow-xl bg-white/90 backdrop-blur-md">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-blue-500/15">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                AI Route & Quote Engine
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Instant Multi-Carrier Cost Matrix
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!quoteResult ? (
              <motion.form
                key="form-inputs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={generateMockQuote}
                className="space-y-4"
              >
                {/* Origin & Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5" htmlFor="origin">
                      Origin State / Hub
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <select
                        id="origin"
                        name="origin"
                        required
                        value={formData.origin}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer font-medium"
                      >
                        {INDIAN_STATES_HUBS.map((city) => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5" htmlFor="destination">
                      Destination State / Hub
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <select
                        id="destination"
                        name="destination"
                        required
                        value={formData.destination}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer font-medium"
                      >
                        {INDIAN_STATES_HUBS.map((city) => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight & Volume */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5" htmlFor="weight">
                      Weight (Kg)
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="weight"
                        name="weight"
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1250"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5" htmlFor="volume">
                      Volume (m³)
                    </label>
                    <div className="relative">
                      <Box className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="volume"
                        name="volume"
                        type="number"
                        step="any"
                        required
                        min="0.1"
                        placeholder="e.g. 4.2"
                        value={formData.volume}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Cargo Type */}
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5" htmlFor="cargoType">
                    Cargo Classification
                  </label>
                  <div className="relative">
                    <Box className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 font-bold" />
                    <select
                      id="cargoType"
                      name="cargoType"
                      value={formData.cargoType}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer font-medium"
                    >
                      {CARGO_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-xs hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Rates...
                      </>
                    ) : (
                      <>
                        Optimize Route & Generate Rate <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="form-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Header Summary */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 relative">
                  <span className="absolute -top-2.5 left-4 px-2 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-100 border border-blue-200 rounded-full flex items-center gap-1 uppercase">
                    <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" /> Optimal Route Mapped
                  </span>
                  
                  <div className="space-y-1.5 mt-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Route Lane</p>
                    <p className="text-slate-800 font-black text-xs sm:text-sm flex items-center gap-2">
                      <span>{quoteResult.origin}</span>
                      <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{quoteResult.destination}</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                      <Calendar className="w-4 h-4 text-blue-500" /> Est. {quoteResult.speed} Transit Time
                    </div>
                  </div>
                </div>

                {/* Optimizations Text */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    <span className="text-blue-650 font-bold">AI Routing Optimization:</span> {quoteResult.routeOptimization}
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                      <Leaf className="w-4 h-4" /> {quoteResult.co2}kg CO₂
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1.5 py-0.5 rounded-full font-bold">
                      -{quoteResult.co2Saving} Carbon
                    </span>
                  </div>
                </div>

                {/* Quote details */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center flex flex-col justify-center shadow-sm">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Estimated Quote</p>
                  <div className="text-3xl font-extrabold text-slate-900 mt-1 mb-0.5 flex items-center justify-center">
                    <span className="text-2xl text-blue-650 font-black mr-1">₹</span>
                    <span>{quoteResult.cost.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-bold mb-4">Saved ₹{quoteResult.discount.toLocaleString('en-IN')} via AI prediction</p>

                  <button
                    type="button"
                    onClick={() => alert(`Success: shipment booked via Standard Road Freight!\nCost: ₹${quoteResult.cost.toLocaleString('en-IN')}\nRoute: ${quoteResult.origin} → ${quoteResult.destination}`)}
                    className="w-full py-2.5 rounded-xl gradient-primary text-white text-xs font-bold hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    Book shipment <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Back button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-350 bg-white text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Adjust Search Parameters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
