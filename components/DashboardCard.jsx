export default function DashboardCard({ title, value, icon, color = 'default' }) {
  const valueColor = {
    default: 'text-white',
    green:   'text-green-400',
    orange:  'text-orange-400',
    blue:    'text-sky-400',
  }[color]

  const iconBg = {
    default: 'bg-white/5 text-gray-400',
    green:   'bg-green-500/10 text-green-400',
    orange:  'bg-orange-500/10 text-orange-400',
    blue:    'bg-sky-500/10 text-sky-400',
  }[color]

  return (
    <div className="card p-6 space-y-4 hover:border-white/15 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">{title}</p>
        {icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${iconBg}`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</p>
    </div>
  )
}
