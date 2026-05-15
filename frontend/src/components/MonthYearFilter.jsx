const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length:5}, (_,i) => currentYear - i);

export default function MonthYearFilter({ month, year, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="form-input w-36"
        value={month || ''}
        onChange={e => onChange({ month: e.target.value ? parseInt(e.target.value) : null, year })}
      >
        <option value="">All Months</option>
        {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
      </select>
      <select
        className="form-input w-28"
        value={year || ''}
        onChange={e => onChange({ month, year: e.target.value ? parseInt(e.target.value) : null })}
      >
        <option value="">All Years</option>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      {(month || year) && (
        <button className="btn-secondary text-xs py-1.5" onClick={() => onChange({ month: null, year: null })}>
          Clear
        </button>
      )}
    </div>
  );
}
