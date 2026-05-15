import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);
const ACTIVITY_TYPES = ['Webinar', 'Event', 'Partnership', 'PR', 'Community', 'Podcast', 'Press Release', 'Award', 'Conference', 'Other'];

const blank = {
  title: '', activity_type: 'Other', activity_date: '',
  month: '', year: '', description: '', result: '', notes: ''
};

export default function OtherActivities() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState({ month: null, year: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (filter.month) params.month = filter.month;
    if (filter.year) params.year = filter.year;
    api.get('/other-activities', { params }).then(r => setActivities(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (a) => { setForm({ ...a }); setEditing(a.id); setModalOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/other-activities/${editing}`, form);
      else await api.post('/other-activities', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/other-activities/${deleteId}`);
    load();
  };

  const typeBadge = (type) => {
    const map = {
      'Webinar': 'badge-blue', 'Event': 'badge-purple', 'Partnership': 'badge-green',
      'PR': 'badge-yellow', 'Community': 'badge-indigo', 'Podcast': 'badge-orange',
    };
    return map[type] || 'badge-gray';
  };

  const byType = activities.reduce((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Other Activities</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Activity</button>
        </div>
      </div>

      {activities.length > 0 && (
        <div className="card-pad mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Activity Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-1.5">
                <span className={`badge ${typeBadge(type)}`}>{type}</span>
                <span className="text-sm font-bold text-slate-700">{count}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-indigo-600 font-semibold">Total</span>
              <span className="text-sm font-bold text-indigo-700">{activities.length}</span>
            </div>
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
                <th>Description</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-400 py-12">No activities found.</td></tr>
              ) : activities.map(a => (
                <tr key={a.id}>
                  <td className="font-medium text-slate-800">{a.title}</td>
                  <td><span className={`badge ${typeBadge(a.activity_type)}`}>{a.activity_type}</span></td>
                  <td className="whitespace-nowrap">{a.activity_date || '—'}</td>
                  <td className="max-w-xs">
                    <p className="text-slate-600 truncate">{a.description || '—'}</p>
                  </td>
                  <td className="max-w-xs">
                    <p className="text-slate-600 truncate">{a.result || '—'}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-indigo-600 hover:underline" onClick={() => openEdit(a)}>Edit</button>
                      <button className="text-xs text-red-500 hover:underline" onClick={() => setDeleteId(a.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editing ? 'Edit Activity' : 'Add Activity'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Activity title" />
          </div>
          <div>
            <label className="form-label">Activity Type</label>
            <select className="form-input" value={form.activity_type} onChange={e => set('activity_type', e.target.value)}>
              {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Activity Date</label>
            <input type="date" className="form-input" value={form.activity_date} onChange={e => set('activity_date', e.target.value)} />
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
          <div className="col-span-2">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What was done?" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Result / Outcome</label>
            <textarea className="form-input" rows={2} value={form.result} onChange={e => set('result', e.target.value)} placeholder="What was the outcome?" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.title}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Activity'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this activity? This action cannot be undone."
      />
    </div>
  );
}
