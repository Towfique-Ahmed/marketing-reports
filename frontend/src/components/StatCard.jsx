export default function StatCard({ label, value, sub, icon: Icon, color = '#3B82F6' }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
}
