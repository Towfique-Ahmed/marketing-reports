const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MonthYearFilter({ month, year, onChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-2">
      <select
        value={month || ''}
        onChange={e => onChange({ month: e.target.value ? parseInt(e.target.value) : null, year })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">All Months</option>
        {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
      </select>
      <select
        value={year || ''}
        onChange={e => onChange({ month, year: e.target.value ? parseInt(e.target.value) : null })}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">All Years</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      {(month || year) && (
        <button
          onClick={() => onChange({ month: null, year: null })}
          className="text-xs text-gray-400 hover:text-gray-600"
        >Clear</button>
      )}
    </div>
  );
}
