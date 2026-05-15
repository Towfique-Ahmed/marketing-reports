import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);

const blank = {
  title: '', url: '', publish_date: '', month: '', year: '',
  views: 0, organic_traffic: 0, backlinks: 0,
  keywords_targeted: 0, keywords_top10: 0,
  bounce_rate: 0, avg_time_on_page: '0:00', notes: ''
};

export default function BlogPosts() {
  const [posts, setPosts] = useState([]);
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
    api.get('/blog-posts', { params }).then(r => setPosts(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id); setModalOpen(true); };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/blog-posts/${editing}`, form);
      else await api.post('/blog-posts', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/blog-posts/${deleteId}`);
    load();
  };

  const totals = posts.reduce((a, p) => ({
    views: a.views + (p.views || 0),
    organic_traffic: a.organic_traffic + (p.organic_traffic || 0),
    backlinks: a.backlinks + (p.backlinks || 0),
  }), { views: 0, organic_traffic: 0, backlinks: 0 });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Blog Posts</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Post</button>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Posts</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{posts.length}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Views</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.views.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Organic Traffic</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.organic_traffic.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Views</th>
                <th>Organic Traffic</th>
                <th>Backlinks</th>
                <th>KW Top 10</th>
                <th>Bounce Rate</th>
                <th>Avg Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-slate-400 py-12">No blog posts found. Add your first post.</td></tr>
              ) : posts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="font-medium text-slate-800">{p.title}</div>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline truncate block max-w-xs">{p.url}</a>}
                  </td>
                  <td className="whitespace-nowrap">{p.publish_date || '—'}</td>
                  <td>{(p.views || 0).toLocaleString()}</td>
                  <td>{(p.organic_traffic || 0).toLocaleString()}</td>
                  <td>{p.backlinks || 0}</td>
                  <td>{p.keywords_top10 || 0} / {p.keywords_targeted || 0}</td>
                  <td>{p.bounce_rate ? `${p.bounce_rate}%` : '—'}</td>
                  <td>{p.avg_time_on_page || '—'}</td>
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

      <Modal title={editing ? 'Edit Blog Post' : 'Add Blog Post'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Blog post title" />
          </div>
          <div className="col-span-2">
            <label className="form-label">URL</label>
            <input className="form-input" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="form-label">Publish Date</label>
            <input type="date" className="form-input" value={form.publish_date} onChange={e => set('publish_date', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          <div>
            <label className="form-label">Views</label>
            <input type="number" min="0" className="form-input" value={form.views} onChange={e => set('views', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Organic Traffic</label>
            <input type="number" min="0" className="form-input" value={form.organic_traffic} onChange={e => set('organic_traffic', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Backlinks</label>
            <input type="number" min="0" className="form-input" value={form.backlinks} onChange={e => set('backlinks', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Keywords Targeted</label>
            <input type="number" min="0" className="form-input" value={form.keywords_targeted} onChange={e => set('keywords_targeted', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Keywords in Top 10</label>
            <input type="number" min="0" className="form-input" value={form.keywords_top10} onChange={e => set('keywords_top10', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Bounce Rate (%)</label>
            <input type="number" min="0" max="100" step="0.1" className="form-input" value={form.bounce_rate} onChange={e => set('bounce_rate', parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Avg Time on Page (mm:ss)</label>
            <input className="form-input" value={form.avg_time_on_page} onChange={e => set('avg_time_on_page', e.target.value)} placeholder="3:45" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.title}>
            {saving ? 'Saving...' : editing ? 'Update Post' : 'Add Post'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this blog post? This action cannot be undone."
      />
    </div>
  );
}
