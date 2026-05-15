import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);
const VIDEO_PLATFORMS = ['YouTube', 'Vimeo', 'TikTok', 'Instagram', 'LinkedIn', 'Facebook', 'Other'];

const blank = {
  title: '', platform: 'YouTube', video_url: '', publish_date: '',
  month: '', year: '', views: 0, watch_time_hours: 0,
  likes: 0, comments: 0, shares: 0, notes: ''
};

export default function Videos() {
  const [videos, setVideos] = useState([]);
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
    api.get('/videos', { params }).then(r => setVideos(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (v) => { setForm({ ...v }); setEditing(v.id); setModalOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/videos/${editing}`, form);
      else await api.post('/videos', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/videos/${deleteId}`);
    load();
  };

  const totals = videos.reduce((a, v) => ({
    views: a.views + (v.views || 0),
    watch_time_hours: a.watch_time_hours + (v.watch_time_hours || 0),
    likes: a.likes + (v.likes || 0),
  }), { views: 0, watch_time_hours: 0, likes: 0 });

  const platformBadge = (platform) => {
    const map = { 'YouTube': 'badge-red', 'Vimeo': 'badge-blue', 'TikTok': 'badge-gray', 'Instagram': 'badge-purple', 'LinkedIn': 'badge-blue' };
    return map[platform] || 'badge-gray';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Videos</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Video</button>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Videos</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{videos.length}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Views</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.views.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Watch Time (hrs)</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.watch_time_hours.toFixed(1)}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Platform</th>
                <th>Publish Date</th>
                <th>Views</th>
                <th>Watch Time (hrs)</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-slate-400 py-12">No videos found.</td></tr>
              ) : videos.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="font-medium text-slate-800">{v.title}</div>
                    {v.video_url && <a href={v.video_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">Watch video</a>}
                  </td>
                  <td><span className={`badge ${platformBadge(v.platform)}`}>{v.platform}</span></td>
                  <td className="whitespace-nowrap">{v.publish_date || '—'}</td>
                  <td>{(v.views || 0).toLocaleString()}</td>
                  <td>{(v.watch_time_hours || 0).toFixed(1)}</td>
                  <td>{(v.likes || 0).toLocaleString()}</td>
                  <td>{v.comments || 0}</td>
                  <td>{v.shares || 0}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-indigo-600 hover:underline" onClick={() => openEdit(v)}>Edit</button>
                      <button className="text-xs text-red-500 hover:underline" onClick={() => setDeleteId(v.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editing ? 'Edit Video' : 'Add Video'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Video title" />
          </div>
          <div>
            <label className="form-label">Platform</label>
            <select className="form-input" value={form.platform} onChange={e => set('platform', e.target.value)}>
              {VIDEO_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Publish Date</label>
            <input type="date" className="form-input" value={form.publish_date} onChange={e => set('publish_date', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Video URL</label>
            <input className="form-input" value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://..." />
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
            <label className="form-label">Views</label>
            <input type="number" min="0" className="form-input" value={form.views} onChange={e => set('views', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Watch Time (hours)</label>
            <input type="number" min="0" step="0.1" className="form-input" value={form.watch_time_hours} onChange={e => set('watch_time_hours', parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Likes</label>
            <input type="number" min="0" className="form-input" value={form.likes} onChange={e => set('likes', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Comments</label>
            <input type="number" min="0" className="form-input" value={form.comments} onChange={e => set('comments', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Shares</label>
            <input type="number" min="0" className="form-input" value={form.shares} onChange={e => set('shares', parseInt(e.target.value)||0)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.title}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Video'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this video? This action cannot be undone."
      />
    </div>
  );
}
