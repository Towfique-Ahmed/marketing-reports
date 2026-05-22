import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '../api';

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CONTENT_COLORS = {
  blogs: '#3B82F6', docs: '#8B5CF6', social: '#F59E0B',
  community: '#10B981', emails: '#EF4444', videos: '#EC4899', landing_pages: '#06B6D4'
};

const CONTENT_LABELS = {
  blogs: 'Blogs', docs: 'Docs', social: 'Social', community: 'Community',
  emails: 'Emails', videos: 'Videos', landing_pages: 'Landing'
};

export default function Analytics() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalytics(year).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [year]);

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const contentChartData = data?.content?.map(m => ({
    month: MONTH_NAMES[m.month],
    ...Object.fromEntries(Object.keys(CONTENT_LABELS).map(k => [k, m[k] || 0]))
  })) || [];

  const emailChartData = data?.emails?.map(m => ({
    month: MONTH_NAMES[m.month],
    'Open Rate (%)': parseFloat((m.avg_open || 0).toFixed(1)),
    'Click Rate (%)': parseFloat((m.avg_click || 0).toFixed(2)),
    Recipients: m.total_recipients || 0,
  })) || [];

  const activeMonths = contentChartData.filter(m =>
    Object.keys(CONTENT_LABELS).some(k => m[k] > 0)
  );

  const totals = data?.content?.reduce((acc, m) => {
    Object.keys(CONTENT_LABELS).forEach(k => { acc[k] = (acc[k] || 0) + (m[k] || 0); });
    return acc;
  }, {}) || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monthly comparison and trends</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading analytics...</div>
      ) : (
        <>
          {/* Content Volume Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Content Published — Monthly Breakdown</h2>
            {activeMonths.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No data for {year}</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={contentChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {Object.entries(CONTENT_LABELS).map(([key, label]) => (
                    <Bar key={key} dataKey={key} name={label} stackId="a" fill={CONTENT_COLORS[key]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Email Performance Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Email Performance — Open & Click Rates</h2>
            {emailChartData.every(m => m['Open Rate (%)'] === 0) ? (
              <div className="text-center py-8 text-gray-400 text-sm">No email data for {year}</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={emailChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="Open Rate (%)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Click Rate (%)" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Summary Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">Monthly Summary Table</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Month</th>
                    {Object.values(CONTENT_LABELS).map(l => (
                      <th key={l} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{l}</th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.content?.map(m => {
                    const rowTotal = Object.keys(CONTENT_LABELS).reduce((s, k) => s + (m[k] || 0), 0);
                    return (
                      <tr key={m.month} className={`table-row ${rowTotal === 0 ? 'opacity-40' : ''}`}>
                        <td className="px-4 py-2.5 font-medium text-gray-700">{MONTH_NAMES[m.month]}</td>
                        {Object.keys(CONTENT_LABELS).map(k => (
                          <td key={k} className="px-4 py-2.5 text-center text-gray-600">{m[k] || 0}</td>
                        ))}
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-800">{rowTotal}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td className="px-4 py-3 font-bold text-gray-800">Total {year}</td>
                    {Object.keys(CONTENT_LABELS).map(k => (
                      <td key={k} className="px-4 py-3 text-center font-bold text-gray-800">{totals[k] || 0}</td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold text-gray-800" style={{ color: 'var(--color-primary)' }}>
                      {Object.values(totals).reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
