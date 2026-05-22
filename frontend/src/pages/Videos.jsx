import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Upload, Download, Eye, Clock, ThumbsUp } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';
import CsvImportModal from '../components/CsvImportModal';
import StatCard from '../components/StatCard';
import { getVideos, createVideo, updateVideo, deleteVideo, bulkVideos } from '../api';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PLATFORMS = ['YouTube', 'YouTube Shorts', 'Other'];

const CSV_COLUMNS = [
  { key: 'title', label: 'Title', required: true, example: 'How to Deploy on xCloud' },
  { key: 'platform', label: 'Platform', example: 'YouTube' },
  { key: 'video_url', label: 'Video URL', example: 'https://youtube.com/...' },
  { key: 'publish_date', label: 'Publish Date', example: '2026-05-08' },
  { key: 'month', label: 'Month', type: 'number', example: '5' },
  { key: 'year', label: 'Year', type: 'number', example: '2026' },
  { key: 'views', label: 'Views', type: 'number', example: '1500' },
  { key: 'watch_time_hours', label: 'Watch Time (hrs)', type: 'number', example: '120' },
  { key: 'likes', label: 'Likes', type: 'number', example: '45' },
  { key: 'comments', label: 'Comments', type: 'number', example: '12' },
  { key: 'shares', label: 'Shares', type: 'number', example: '8' },
  { key: 'notes', label: 'Notes', example: '' },
];

function exportCsv(data) {
  const header = CSV_COLUMNS.map(c => c.label).join(',');
  const rows = data.map(r => CSV_COLUMNS.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'videos.csv'; a.click(); URL.revokeObjectURL(url);
}

const empty = { title: '', platform: 'YouTube', video_url: '', publish_date: '', month: '', year: '', views: '', watch_time_hours: '', likes: '', comments: '', shares: '', notes: '' };

const platformColors = { YouTube: 'bg-red-100 text-red-700', 'YouTube Shorts': 'bg-pink-100 text-pink-700', Other: 'bg-gray-100 text-gray-700' };

export default function Videos() {
  const now = new Date();
  const [filter, setFilter] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    setLoading(true);
    getVideos(filter).then(d => { setRows(d); setLoading(false); }).catch(() => setLoading(false));
  }, [filter.month, filter.year]);

  useEffect(() => { load(); }, [load]);

  const totalViews = rows.reduce((a, r) => a + (r.views || 0), 0);
  const totalWatchTime = rows.reduce((a, r) => a + (r.watch_time_hours || 0), 0);

  function openAdd() { setForm({ ...empty, month: filter.month || '', year: filter.year || '' }); setModal({ mode: 'add' }); }
  function openEdit(r) { setForm({ ...r }); setModal({ mode: 'edit', id: r.id }); }

  async function handleSave() {
    const p = { ...form, month: form.month ? parseInt(form.month) : null, year: form.year ? parseInt(form.year) : null, views: parseInt(form.views) || 0, watch_time_hours: parseFloat(form.watch_time_hours) || 0, likes: parseInt(form.likes) || 0, comments: parseInt(form.comments) || 0, shares: parseInt(form.shares) || 0 };
    if (modal.mode === 'add') await createVideo(p);
    else await updateVideo(modal.id, p);
    setModal(null); load();
  }

  async function handleDelete() { await deleteVideo(deleteId); setDeleteId(null); load(); }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Videos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} videos</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button onClick={() => exportCsv(rows)} className="btn-secondary"><Download size={15} /> Export</button>
          <button onClick={() => setShowImport(true)} className="btn-secondary"><Upload size={15} /> Import</button>
          <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Video</button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Videos" value={rows.length} icon={Eye} color="#EF4444" />
          <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="#3B82F6" />
          <StatCard label="Watch Time (hrs)" value={totalWatchTime.toFixed(1)} icon={Clock} color="#8B5CF6" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title','Platform','Date','Views','Watch Time','Likes'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No videos yet.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-medium text-gray-800 truncate">{r.title}</div>
                  {r.video_url && <a href={r.video_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"><ExternalLink size={10} /> Watch</a>}
                </td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${platformColors[r.platform] || 'bg-gray-100 text-gray-700'}`}>{r.platform}</span></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.publish_date || (r.month ? `${MONTHS[r.month]} ${r.year}` : '—')}</td>
                <td className="px-4 py-3 text-gray-700">{r.views > 0 ? r.views.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.watch_time_hours > 0 ? `${r.watch_time_hours}h` : '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.likes > 0 ? r.likes : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-blue-500"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Video' : 'Edit Video'} onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Platform</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Video URL</label>
              <input value={form.video_url} onChange={e => set('video_url', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://youtube.com/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Publish Date</label>
              <input type="date" value={form.publish_date} onChange={e => set('publish_date', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input type="number" min="1" max="12" value={form.month} onChange={e => set('month', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                <input type="number" value={form.year} onChange={e => set('year', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Views</label>
              <input type="number" value={form.views} onChange={e => set('views', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Watch Time (hrs)</label>
              <input type="number" step="0.1" value={form.watch_time_hours} onChange={e => set('watch_time_hours', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Likes</label>
              <input type="number" value={form.likes} onChange={e => set('likes', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Comments</label>
              <input type="number" value={form.comments} onChange={e => set('comments', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Shares</label>
              <input type="number" value={form.shares} onChange={e => set('shares', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.title} className="btn-primary disabled:opacity-50">
              {modal.mode === 'add' ? 'Add Video' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Delete this video?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      {showImport && <CsvImportModal title="Videos" columns={CSV_COLUMNS} onImport={bulkVideos} onClose={() => { setShowImport(false); load(); }} />}
    </div>
  );
}
