import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);

const blank = {
  title: '', page_url: '', page_type: 'new', publish_date: '',
  month: '', year: '', sessions: 0, conversions: 0,
  conversion_rate: 0, bounce_rate: 0, avg_session_duration: '0:00', notes: ''
};

export default function LandingPages() {
  const [pages, setPages] = useState([]);
  const [tab, setTab] = useState('All');
  const [filter, setFilter] = useState({ month: null, year: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (tab !== 'All') params.page_type = tab.toLowerCase();
    if (filter.month) params.month = filter.month;
    if (filter.year) params.year = filter.year;
    api.get('/landing-pages', { params }).then(r => setPages(r.data));
  };

  useEffect(() => { load(); }, [tab, filter]);

  const openAdd = () => { setForm({ ...blank, page_type: tab !== 'All' ? tab.toLowerCase() : 'new' }); setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id); setModalOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/landing-pages/${editing}`, form);
      else await api.post('/landing-pages', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/landing-pages/${deleteId}`);
    load();
  };

  const totals = pages.reduce((a, p) => ({
    sessions: a.sessions + (p.sessions || 0),
    conversions: a.conversions + (p.conversions || 0),
  }), { sessions: 0, conversions: 0 });

  const avgConvRate = pages.length > 0 ? (pages.reduce((a, p) => a + (p.conversion_rate || 0), 0) / pages.length).toFixed(2) : '0';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Landing Pages</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Page</button>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {['All', 'New', 'Updated'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {pages.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Sessions</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.sessions.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Conversions</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.conversions.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Conversion Rate</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{avgConvRate}%</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Sessions</th>
                <th>Conversions</th>
                <th>Conv. Rate</th>
                <th>Bounce Rate</th>
                <th>Avg Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-slate-400 py-12">No landing pages found.</td></tr>
              ) : pages.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="font-medium text-slate-800">{p.title}</div>
                    {p.page_url && <a href={p.page_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">View page</a>}
                  </td>
                  <td>
                    <span className={`badge ${p.page_type === 'new' ? 'badge-green' : 'badge-blue'}`}>
                      {p.page_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">{p.publish_date || '—'}</td>
                  <td>{(p.sessions || 0).toLocaleString()}</td>
                  <td>{p.conversions || 0}</td>
                  <td>{p.conversion_rate ? `${p.conversion_rate}%` : '—'}</td>
                  <td>{p.bounce_rate ? `${p.bounce_rate}%` : '—'}</td>
                  <td>{p.avg_session_duration || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-indigo-600 hover:underline" onClick={() => openEdit(p)}>Edit</button>
                      <button className="text-xs text-red-500 hover:underline" onClick={() => setDeleteId(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editing ? 'Edit Landing Page' : 'Add Landing Page'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Landing page title" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Page URL</label>
            <input className="form-input" value={form.page_url} onChange={e => set('page_url', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="form-label">Page Type</label>
            <select className="form-input" value={form.page_type} onChange={e => set('page_type', e.target.value)}>
              <option value="new">New</option>
              <option value="updated">Updated</option>
            </select>
          </div>
          <div>
            <label className="form-label">Publish Date</label>
            <input type="date" className="form-input" value={form.publish_date} onChange={e => set('publish_date', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Month</label>
            <select className="form-input" value={form.month || ''} onChange={e => set('month', e.target.value ? parseInt(e.target.value) : '')}>
              <option value="">—</option>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <select className="form-input" value={form.year || ''} onChange={e => set('year', e.target.value ? parseInt(e.target.value) : '')}>
              <option value="">—</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Sessions</label>
            <input type="number" min="0" className="form-input" value={form.sessions} onChange={e => set('sessions', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Conversions</label>
            <input type="number" min="0" className="form-input" value={form.conversions} onChange={e => set('conversions', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Conversion Rate (%)</label>
            <input type="number" min="0" max="100" step="0.01" className="form-input" value={form.conversion_rate} onChange={e => set('conversion_rate', parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Bounce Rate (%)</label>
            <input type="number" min="0" max="100" step="0.1" className="form-input" value={form.bounce_rate} onChange={e => set('bounce_rate', parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Avg Session Duration (mm:ss)</label>
            <input className="form-input" value={form.avg_session_duration} onChange={e => set('avg_session_duration', e.target.value)} placeholder="2:30" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.title}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Page'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this landing page? This action cannot be undone."
      />
    </div>
  );
}
