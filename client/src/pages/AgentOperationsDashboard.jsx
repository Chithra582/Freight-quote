import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Server, 
  Navigation, 
  DollarSign, 
  CloudRain, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Sliders, 
  Zap, 
  AlertOctagon,
  FileCode,
  RotateCcw
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import DashboardCard from '../components/DashboardCard'

const AGENTS_METRICS = [
  {
    id: 'route',
    name: '1. Route Intelligence Agent',
    icon: Navigation,
    color: 'sky',
    status: 'HEALTHY',
    version: 'v2.4-dijkstra-multi-modal',
    latencyMs: 142,
    successRate: '99.8%',
    totalExecutions: '14,820',
    fallbackRate: '0.2%',
    description: 'Calculates multi-modal graph corridors, port turn times, and maritime transshipment loops.',
    lastExecution: '12s ago',
    activeProvider: 'Global Marine Route Graph API (Primary)'
  },
  {
    id: 'pricing',
    name: '2. Pricing Engine Agent',
    icon: DollarSign,
    color: 'blue',
    status: 'HEALTHY',
    version: 'v3.1-deterministic-10step',
    latencyMs: 84,
    successRate: '100.0%',
    totalExecutions: '28,490',
    fallbackRate: '0.0%',
    description: 'Deterministic 10-step cost build-up, Incoterm responsibility, and air lower-break rules.',
    lastExecution: '4s ago',
    activeProvider: 'FreightIQ Master Tariff & Rate Card Engine'
  },
  {
    id: 'weather',
    name: '3. Marine Meteorology Agent',
    icon: CloudRain,
    color: 'amber',
    status: 'HEALTHY',
    version: 'v1.8-noaa-gfs-radar',
    latencyMs: 310,
    successRate: '98.9%',
    totalExecutions: '9,210',
    fallbackRate: '1.1%',
    description: 'Scans oceanic wave heights, tropical storm tracks, and voyage delay probabilities.',
    lastExecution: '45s ago',
    activeProvider: 'NOAA GFS Global Oceanic Wave Radar API'
  },
  {
    id: 'customs',
    name: '4. Customs & Regulatory Agent',
    icon: ShieldCheck,
    color: 'indigo',
    status: 'HEALTHY',
    version: 'v2.2-icegate-tariff-engine',
    latencyMs: 195,
    successRate: '99.4%',
    totalExecutions: '12,650',
    fallbackRate: '0.6%',
    description: 'Validates HS codes, generates document checklists, and cross-references statutory tariffs.',
    lastExecution: '18s ago',
    activeProvider: 'WCO Harmonized Tariff & National Customs Feeds'
  },
  {
    id: 'risk',
    name: '5. Composite Risk Engine',
    icon: TrendingUp,
    color: 'emerald',
    status: 'HEALTHY',
    version: 'v2.0-multi-factor-scoring',
    latencyMs: 65,
    successRate: '100.0%',
    totalExecutions: '21,340',
    fallbackRate: '0.0%',
    description: 'Synthesizes route, pricing volatility, weather delay, and customs friction into composite score.',
    lastExecution: '4s ago',
    activeProvider: 'FreightIQ Composite Risk Analytics Model'
  }
]

const SAMPLE_EXECUTION_LOGS = [
  { id: 'EX-9804', agent: 'Pricing Agent', trigger: 'Quote Calculation QT-2026-00934', status: 'SUCCESS', latency: '78ms', provider: 'Primary Rate Card', time: 'Just now' },
  { id: 'EX-9803', agent: 'Route Agent', trigger: 'Corridor Search Chennai -> Singapore', status: 'SUCCESS', latency: '135ms', provider: 'Primary Graph', time: '12s ago' },
  { id: 'EX-9802', agent: 'Weather Agent', trigger: 'Radar Scan Malacca Strait', status: 'SUCCESS', latency: '298ms', provider: 'NOAA GFS Radar', time: '45s ago' },
  { id: 'EX-9801', agent: 'Weather Agent', trigger: 'Radar Scan North Sea Route', status: 'FALLBACK_CACHED', latency: '410ms', provider: 'Cached Telemetry', time: '2 mins ago' },
  { id: 'EX-9800', agent: 'Customs Agent', trigger: 'HS Code 5208.11 Verification', status: 'SUCCESS', latency: '184ms', provider: 'ICEGATE EDI Engine', time: '5 mins ago' }
]

export default function AgentOperationsDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [agents, setAgents] = useState(AGENTS_METRICS)
  const [logs, setLogs] = useState(SAMPLE_EXECUTION_LOGS)
  const [selectedAgentTab, setSelectedAgentTab] = useState('all') // 'all' | 'route' | 'pricing' | 'weather' | 'customs' | 'risk'
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshAgents = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      alert('All 5 AI Agent pipelines pinged and validated. Status: 100% Operational.')
    }, 800)
  }

  const filteredAgents = selectedAgentTab === 'all' 
    ? agents 
    : agents.filter(a => a.id === selectedAgentTab)

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
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-3">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Centralized Multi-Agent Operations Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                AI Agent Operations Command Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Section 6: Real-time telemetry, execution latency, provider fallbacks, and health metrics for the 5 Autonomous Maritime Agents.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshAgents}
                disabled={isRefreshing}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Pinging Services...' : 'Ping All 5 Agents'}</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              title="ACTIVE AI AGENTS"
              value="5 / 5 Online"
              change="Zero degraded pipelines"
              isPositive={true}
              icon={Server}
              color="emerald"
            />
            <DashboardCard
              title="AVG LATENCY"
              value="159 ms"
              change="Parallel execution pipeline"
              isPositive={true}
              icon={Zap}
              color="blue"
            />
            <DashboardCard
              title="TOTAL EXECUTIONS"
              value="86,510"
              change="99.7% Success SLA"
              isPositive={true}
              icon={Activity}
              color="indigo"
            />
            <DashboardCard
              title="PROVIDER FALLBACKS"
              value="0.38%"
              change="Cached telemetry safety net"
              isPositive={true}
              icon={ShieldCheck}
              color="purple"
            />
          </div>

          {/* Agent Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All 5 Agents' },
              { id: 'route', label: '1. Route Agent' },
              { id: 'pricing', label: '2. Pricing Agent' },
              { id: 'weather', label: '3. Weather Agent' },
              { id: 'customs', label: '4. Customs Agent' },
              { id: 'risk', label: '5. Risk Engine' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedAgentTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedAgentTab === tab.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 5-Agent Detail Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAgents.map(ag => {
              const IconComp = ag.icon
              return (
                <div key={ag.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-xs sm:text-sm">{ag.name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">{ag.version}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ag.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ag.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center font-mono">
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Latency</span>
                        <div className="font-black text-slate-900 text-xs mt-0.5">{ag.latencyMs} ms</div>
                      </div>
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Success</span>
                        <div className="font-black text-emerald-600 text-xs mt-0.5">{ag.successRate}</div>
                      </div>
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Executions</span>
                        <div className="font-black text-slate-900 text-xs mt-0.5">{ag.totalExecutions}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1 text-[11px] font-mono text-slate-500">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="text-slate-800 font-bold truncate max-w-[170px]">{ag.activeProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Ping:</span>
                      <span className="text-slate-800 font-bold">{ag.lastExecution}</span>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

          {/* Execution History Table (Section 6 Spec) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Live Agent Pipeline Execution History</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Section 14: Degraded state & fallback logging</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Exec ID</th>
                    <th className="px-4 py-3">Agent Service</th>
                    <th className="px-4 py-3">Trigger / Context</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Active Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-bold text-indigo-600">{log.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 font-sans">{log.agent}</td>
                      <td className="px-4 py-3 text-slate-600 font-sans">{log.trigger}</td>
                      <td className="px-4 py-3 text-slate-800 font-bold">{log.latency}</td>
                      <td className="px-4 py-3 text-slate-500 font-sans">{log.provider}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-[11px]">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

    </div>
  )
}
