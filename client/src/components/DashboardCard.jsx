import { motion } from 'framer-motion'

export default function DashboardCard({ title, value, icon: Icon, trend, trendType, color = 'blue' }) {
  // Map color schemes for borders and indicators
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-500/10 text-blue-600',
      trendBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    green: {
      bg: 'bg-emerald-50/30',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500/10 text-emerald-600',
      trendBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    purple: {
      bg: 'bg-purple-50/30',
      border: 'border-purple-100',
      iconBg: 'bg-purple-500/10 text-purple-600',
      trendBg: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    amber: {
      bg: 'bg-amber-50/30',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500/10 text-amber-600',
      trendBg: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  }

  const activeColor = colorMap[color] || colorMap.blue

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`glass-card rounded-2xl p-5 border border-slate-200 bg-white shadow-sm flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
            {value}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeColor.iconBg}`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
            trendType === 'positive'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
              : 'bg-rose-50 text-rose-600 border-rose-250'
          }`}>
            {trend}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">vs prior cycle</span>
        </div>
      )}
    </motion.div>
  )
}
