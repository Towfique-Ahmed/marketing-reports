import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);
const CATEGORIES = ['Content', 'SEO', 'Social Media', 'Email', 'Video', 'Design', 'Analytics', 'General'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];
const STATUS_KEYS = { 'All': '', 'Pending': 'pending', 'In Progress': 'in_progress', 'Completed': 'completed', 'Cancelled': 'cancelled' };

const blank = {
  title: '', category: 'General', assignee: '', due_date: '',
  completed_date: '', status: 'pending', priority: 'medium',
  month: '', year: '', notes: ''
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [tab, setTab] = useState('All');
  const [filter, setFilter] = useState({ month: null, year: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    const statusKey = STATUS_KEYS[tab];
    if (statusKey) params.status = statusKey;
    if (filter.month) params.month = filter.month;
    if (filter.year) params.year = filter.year;
    api.get('/tasks', { params }).then(r => setTasks(r.data));

    // Load all for stats
    const allParams = {};
    if (filter.month) allParams.month = filter.month;
    if (filter.year) allParams.year = filter.year;
    api.get('/tasks', { params: allParams }).then(r => setAllTasks(r.data));
  };

  useEffect(() => { load(); }, [tab, filter]);

  const openAdd = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (t) => { setForm({ ...t }); setEditing(t.id); setModalOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/tasks/${editing}`, form);
      else await api.post('/tasks', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/tasks/${deleteId}`);
    load();
  };

  const quickStatus = async (task, newStatus) => {
    await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
    load();
  };

  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
    pending: allTasks.filter(t => t.status === 'pending').length,
  };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const priorityBadge = (p) => ({ high: 'badge-red', medium: 'badge-yellow', low: 'badge-green' }[p] || 'badge-gray');
  const statusBadge = (s) => ({ completed: 'badge-green', in_progress: 'badge-blue', pending: 'badge-yellow', cancelled: 'badge-gray' }[s] || 'badge-gray');
  const statusLabel = (s) => s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tasks</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Task</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-pad text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="card-pad text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
        </div>
        <div className="card-pad text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.in_progress}</p>
        </div>
        <div className="card-pad text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completion Rate</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{completionRate}%</p>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="card-pad mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
            <span className="text-sm text-slate-500">{stats.completed}/{stats.total}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 flex-wrap">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-slate-400 py-12">No tasks found.</td></tr>
              ) : tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="font-medium text-slate-800">{t.title}</div>
                    {t.notes && <p className="text-xs text-slate-400 truncate max-w-xs">{t.notes}</p>}
                  </td>
                  <td><span className="badge badge-gray">{t.category}</span></td>
                  <td><span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span></td>
                  <td><span className={`badge ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span></td>
                  <td className="text-slate-600">{t.assignee || '—'}</td>
                  <td className="whitespace-nowrap">{t.due_date || '—'}</td>
                  <td className="whitespace-nowrap">{t.completed_date || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {t.status !== 'completed' && (
                        <button className="text-xs text-emerald-600 hover:underline" onClick={() => quickStatus(t, 'completed')}>✓ Done</button>
                      )}
                      <button className="text-xs text-indigo-600 hover:underline" onClick={() => openEdit(t)}>Edit</button>
                      <button className="text-xs text-red-500 hover:underline" onClick={() => setDeleteId(t.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editing ? 'Edit Task' : 'Add Task'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Assignee</label>
            <input className="form-input" value={form.assignee} onChange={e => set('assignee', e.target.value)} placeholder="Name" />
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Completed Date</label>
            <input type="date" className="form-input" value={form.completed_date} onChange={e => set('completed_date', e.target.value)} />
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
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.title}>
            {saving ? 'Saving...' : editing ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this task? This action cannot be undone."
      />
    </div>
  );
}
