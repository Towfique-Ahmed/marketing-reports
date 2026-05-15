import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);
const PLATFORMS = ['Facebook', 'LinkedIn', 'Twitter/X', 'Community', 'Instagram', 'TikTok', 'YouTube', 'Pinterest', 'Other'];
const TABS = ['All', 'Facebook', 'LinkedIn', 'Twitter/X', 'Community'];

const blank = {
  platform: 'Facebook', title: '', post_url: '', post_date: '',
  month: '', year: '', impressions: 0, reach: 0, engagement: 0,
  likes: 0, comments: 0, shares: 0, clicks: 0, notes: ''
};

export default function SocialMedia() {
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('All');
  const [filter, setFilter] = useState({ month: null, year: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    const params = {};
    if (tab !== 'All') params.platform = tab;
    if (filter.month) params.month = filter.month;
    if (filter.year) params.year = filter.year;
    api.get('/social-posts', { params }).then(r => setPosts(r.data));
  };

  useEffect(() => { load(); }, [tab, filter]);

  const openAdd = () => { setForm({ ...blank, platform: tab !== 'All' ? tab : 'Facebook' }); setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id); setModalOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.platform) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/social-posts/${editing}`, form);
      else await api.post('/social-posts', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/social-posts/${deleteId}`);
    load();
  };

  const totals = posts.reduce((a, p) => ({
    impressions: a.impressions + (p.impressions || 0),
    reach: a.reach + (p.reach || 0),
    engagement: a.engagement + (p.engagement || 0),
  }), { impressions: 0, reach: 0, engagement: 0 });

  const engRate = totals.impressions > 0 ? ((totals.engagement / totals.impressions) * 100).toFixed(2) : '0';

  const platformBadge = (platform) => {
    const map = {
      'Facebook': 'badge-blue',
      'LinkedIn': 'badge-blue',
      'Twitter/X': 'badge-gray',
      'Community': 'badge-purple',
      'Instagram': 'badge-purple',
      'TikTok': 'badge-gray',
    };
    return map[platform] || 'badge-gray';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Social Media</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Post</button>
        </div>
      </div>

      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {posts.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Posts</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{posts.length}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Impressions</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.impressions.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Reach</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.reach.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Engagement Rate</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{engRate}%</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Title</th>
                <th>Date</th>
                <th>Impressions</th>
                <th>Reach</th>
                <th>Engagement</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
                <th>Clicks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-slate-400 py-12">No social posts found.</td></tr>
              ) : posts.map(p => (
                <tr key={p.id}>
                  <td><span className={`badge ${platformBadge(p.platform)}`}>{p.platform}</span></td>
                  <td>
                    <div className="font-medium text-slate-800 max-w-xs truncate">{p.title || '—'}</div>
                    {p.post_url && <a href={p.post_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">View post</a>}
                  </td>
                  <td className="whitespace-nowrap">{p.post_date || '—'}</td>
                  <td>{(p.impressions || 0).toLocaleString()}</td>
                  <td>{(p.reach || 0).toLocaleString()}</td>
                  <td>{(p.engagement || 0).toLocaleString()}</td>
                  <td>{p.likes || 0}</td>
                  <td>{p.comments || 0}</td>
                  <td>{p.shares || 0}</td>
                  <td>{p.clicks || 0}</td>
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

      <Modal title={editing ? 'Edit Social Post' : 'Add Social Post'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Platform *</label>
            <select className="form-input" value={form.platform} onChange={e => set('platform', e.target.value)}>
              {PLATFORMS.map(pl => <option key={pl} value={pl}>{pl}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Post Date</label>
            <input type="date" className="form-input" value={form.post_date} onChange={e => set('post_date', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Title / Caption</label>
            <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Post title or caption" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Post URL</label>
            <input className="form-input" value={form.post_url} onChange={e => set('post_url', e.target.value)} placeholder="https://..." />
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
            <label className="form-label">Impressions</label>
            <input type="number" min="0" className="form-input" value={form.impressions} onChange={e => set('impressions', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Reach</label>
            <input type="number" min="0" className="form-input" value={form.reach} onChange={e => set('reach', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Engagement</label>
            <input type="number" min="0" className="form-input" value={form.engagement} onChange={e => set('engagement', parseInt(e.target.value)||0)} />
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
          <div>
            <label className="form-label">Clicks</label>
            <input type="number" min="0" className="form-input" value={form.clicks} onChange={e => set('clicks', parseInt(e.target.value)||0)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Post'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this social post? This action cannot be undone."
      />
    </div>
  );
}
