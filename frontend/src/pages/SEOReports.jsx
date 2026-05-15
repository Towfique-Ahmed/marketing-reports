import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);

const blankForm = (month, year) => ({
  month: month || new Date().getMonth() + 1,
  year: year || currentYear,
  organic_traffic: 0,
  total_keywords: 0,
  top10_keywords: 0,
  domain_authority: 0,
  backlinks: 0,
  notes: ''
});

const blankPage = { url: '', sessions: 0, rank: 0 };

export default function SEOReports() {
  const [reports, setReports] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [topPages, setTopPages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/seo-reports').then(r => setReports(r.data));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (r) => {
    setForm({ ...r });
    let pages = [];
    try { pages = JSON.parse(r.top_pages || '[]'); } catch {}
    setTopPages(pages.length > 0 ? pages : [{ ...blankPage }]);
    setModalOpen(true);
  };

  const openAdd = () => {
    setForm(blankForm());
    setTopPages([{ ...blankPage }]);
    setModalOpen(true);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setPage = (i, k, v) => {
    const updated = [...topPages];
    updated[i] = { ...updated[i], [k]: v };
    setTopPages(updated);
  };

  const addPage = () => setTopPages(p => [...p, { ...blankPage }]);
  const removePage = (i) => setTopPages(p => p.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/seo-reports', { ...form, top_pages: topPages.filter(p => p.url) });
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/seo-reports/${deleteId}`);
    load();
  };

  const getMonthName = (m) => MONTHS[m - 1] || m;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">SEO Performance</h1>
        <button className="btn-primary" onClick={openAdd}>+ Add SEO Report</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Organic Traffic</th>
                <th>Total Keywords</th>
                <th>Top 10 Keywords</th>
                <th>Domain Authority</th>
                <th>Backlinks</th>
                <th>Top Pages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-12">No SEO reports found. Add your first report.</td></tr>
              ) : reports.map(r => {
                let pages = [];
                try { pages = JSON.parse(r.top_pages || '[]'); } catch {}
                return (
                  <tr key={r.id}>
                    <td className="font-medium text-slate-800 whitespace-nowrap">{getMonthName(r.month)} {r.year}</td>
                    <td>{(r.organic_traffic || 0).toLocaleString()}</td>
                    <td>{(r.total_keywords || 0).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-green">{r.top10_keywords || 0}</span>
                    </td>
                    <td>{r.domain_authority || 0}</td>
                    <td>{(r.backlinks || 0).toLocaleString()}</td>
                    <td className="text-slate-500">{pages.length} pages</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-indigo-600 hover:underline" onClick={() => openEdit(r)}>Edit</button>
                        <button className="text-xs text-red-500 hover:underline" onClick={() => setDeleteId(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title="SEO Report" open={modalOpen} onClose={() => setModalOpen(false)} size="xl">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="form-label">Month</label>
            <select className="form-input" value={form.month} onChange={e => set('month', parseInt(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <select className="form-input" value={form.year} onChange={e => set('year', parseInt(e.target.value))}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Organic Traffic</label>
            <input type="number" min="0" className="form-input" value={form.organic_traffic} onChange={e => set('organic_traffic', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Total Keywords</label>
            <input type="number" min="0" className="form-input" value={form.total_keywords} onChange={e => set('total_keywords', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Keywords in Top 10</label>
            <input type="number" min="0" className="form-input" value={form.top10_keywords} onChange={e => set('top10_keywords', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Domain Authority</label>
            <input type="number" min="0" max="100" className="form-input" value={form.domain_authority} onChange={e => set('domain_authority', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Backlinks</label>
            <input type="number" min="0" className="form-input" value={form.backlinks} onChange={e => set('backlinks', parseInt(e.target.value)||0)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">Top Pages</h3>
            <button className="btn-secondary text-xs py-1" onClick={addPage}>+ Add Page</button>
          </div>
          <div className="space-y-2">
            {topPages.map((page, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="form-input flex-1"
                  placeholder="Page URL"
                  value={page.url}
                  onChange={e => setPage(i, 'url', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  className="form-input w-28"
                  placeholder="Sessions"
                  value={page.sessions}
                  onChange={e => setPage(i, 'sessions', parseInt(e.target.value)||0)}
                />
                <input
                  type="number"
                  min="0"
                  className="form-input w-20"
                  placeholder="Rank"
                  value={page.rank}
                  onChange={e => setPage(i, 'rank', parseInt(e.target.value)||0)}
                />
                <button onClick={() => removePage(i)} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Fields: URL, Sessions, Rank</p>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this SEO report? This action cannot be undone."
      />
    </div>
  );
}
