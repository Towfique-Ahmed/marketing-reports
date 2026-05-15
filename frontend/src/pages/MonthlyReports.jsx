import { useState, useEffect } from 'react';
import api from '../api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);

const blankReport = (month, year) => ({
  month, year, title: '', highlights: [''], summary: '', is_finalized: false
});

export default function MonthlyReports() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [form, setForm] = useState(blankReport(new Date().getMonth() + 1, currentYear));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  const loadReport = async (month, year) => {
    const [reportRes, dashRes] = await Promise.all([
      api.get(`/monthly-reports/${year}/${month}`),
      api.get('/dashboard', { params: { month, year } })
    ]);
    const r = reportRes.data;
    setActivityData(dashRes.data);
    if (r) {
      setReport(r);
      setForm({
        month, year,
        title: r.title || '',
        highlights: r.highlights && r.highlights.length > 0 ? r.highlights : [''],
        summary: r.summary || '',
        is_finalized: !!r.is_finalized
      });
    } else {
      setReport(null);
      setForm(blankReport(month, year));
    }
  };

  useEffect(() => {
    loadReport(selectedMonth, selectedYear);
    setSaved(false);
  }, [selectedMonth, selectedYear]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setHighlight = (i, v) => {
    const hl = [...form.highlights];
    hl[i] = v;
    setField('highlights', hl);
  };

  const addHighlight = () => setField('highlights', [...form.highlights, '']);
  const removeHighlight = (i) => setField('highlights', form.highlights.filter((_, idx) => idx !== i));

  const save = async (finalize = false) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        highlights: form.highlights.filter(h => h.trim()),
        is_finalized: finalize ? true : form.is_finalized
      };
      await api.post('/monthly-reports', payload);
      setSaved(true);
      await loadReport(selectedMonth, selectedYear);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const monthName = MONTHS[selectedMonth - 1];

  if (printMode && report) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-slate-900">{form.title || `${monthName} ${selectedYear} Marketing Report`}</h1>
          <p className="text-slate-500 mt-1">{monthName} {selectedYear}</p>
          {form.is_finalized && <span className="badge badge-green mt-2">Finalized</span>}
        </div>

        {activityData && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Activity Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Blog Posts', value: activityData.blog.count, sub: `${activityData.blog.views.toLocaleString()} views` },
                { label: 'Social Posts', value: activityData.social.total, sub: `${activityData.social.impressions.toLocaleString()} impressions` },
                { label: 'Email Campaigns', value: activityData.email.count, sub: `${activityData.email.recipients.toLocaleString()} recipients` },
                { label: 'Videos', value: activityData.video.count, sub: `${activityData.video.views.toLocaleString()} views` },
                { label: 'Landing Pages', value: activityData.landing_pages.total, sub: `${activityData.landing_pages.new} new, ${activityData.landing_pages.updated} updated` },
                { label: 'Tasks', value: `${activityData.tasks.completed}/${activityData.tasks.total}`, sub: `${activityData.tasks.completion_rate}% completion` },
              ].map(s => (
                <div key={s.label} className="border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-500 uppercase font-semibold">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {form.highlights.filter(h => h.trim()).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Highlights</h2>
            <ul className="space-y-2">
              {form.highlights.filter(h => h.trim()).map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-slate-700">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {form.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Summary</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{form.summary}</p>
          </div>
        )}

        <div className="flex gap-3 mt-8 print:hidden">
          <button className="btn-secondary" onClick={() => setPrintMode(false)}>← Back to Editor</button>
          <button className="btn-primary" onClick={() => window.print()}>🖨 Print</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monthly Reports</h1>
        <div className="flex items-center gap-3">
          <select
            className="form-input w-36"
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select
            className="form-input w-28"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Auto-Summary */}
        <div className="card-pad">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Auto Summary — {monthName} {selectedYear}</h2>
          {activityData ? (
            <div className="space-y-3">
              {[
                { icon: '✍️', label: 'Blog Posts', value: activityData.blog.count, sub: `${activityData.blog.views.toLocaleString()} views` },
                { icon: '📱', label: 'Social Posts', value: activityData.social.total, sub: `${activityData.social.impressions.toLocaleString()} impressions` },
                { icon: '📧', label: 'Emails', value: activityData.email.count, sub: `${activityData.email.recipients.toLocaleString()} recipients` },
                { icon: '🎬', label: 'Videos', value: activityData.video.count, sub: `${activityData.video.views.toLocaleString()} views` },
                { icon: '🏠', label: 'Landing Pages', value: activityData.landing_pages.total, sub: `${activityData.landing_pages.new} new` },
                { icon: '✅', label: 'Tasks', value: `${activityData.tasks.completed}/${activityData.tasks.total}`, sub: `${activityData.tasks.completion_rate}% done` },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm text-slate-600">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 text-sm">{item.value}</span>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                </div>
              ))}
              {activityData.seo && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span className="text-sm text-slate-600">SEO Traffic</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 text-sm">{activityData.seo.organic_traffic?.toLocaleString()}</span>
                    <p className="text-xs text-slate-400">{activityData.seo.top10_keywords} top 10 kw</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Loading...</p>
          )}
        </div>

        {/* Report Editor */}
        <div className="lg:col-span-2 card-pad">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700">Report Editor</h2>
            <div className="flex items-center gap-2">
              {form.is_finalized && <span className="badge badge-green">Finalized</span>}
              {saved && <span className="text-xs text-emerald-600 font-semibold">Saved!</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Report Title</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder={`${monthName} ${selectedYear} Marketing Report`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0">Highlights</label>
                <button className="text-xs text-indigo-600 hover:underline" onClick={addHighlight}>+ Add bullet</button>
              </div>
              <div className="space-y-2">
                {form.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-indigo-400 text-lg">•</span>
                    <input
                      className="form-input flex-1"
                      value={h}
                      onChange={e => setHighlight(i, e.target.value)}
                      placeholder="Key achievement or highlight..."
                    />
                    {form.highlights.length > 1 && (
                      <button onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Summary / Commentary</label>
              <textarea
                className="form-input"
                rows={6}
                value={form.summary}
                onChange={e => setField('summary', e.target.value)}
                placeholder="Write an overall summary of this month's marketing performance..."
              />
            </div>
          </div>

          <div className="flex gap-3 justify-between mt-6">
            <button
              className="btn-secondary"
              onClick={() => setPrintMode(true)}
            >
              👁 Preview & Print
            </button>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => save(false)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                className="btn-primary"
                onClick={() => save(true)}
                disabled={saving || form.is_finalized}
              >
                {form.is_finalized ? 'Finalized' : 'Finalize Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
