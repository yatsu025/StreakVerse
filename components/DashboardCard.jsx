export default function DashboardCard({ title, value, colorClass = "text-white" }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{title}</p>
      <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
    </div>
  )
}
