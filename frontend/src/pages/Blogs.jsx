import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Upload, Download } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';
import CsvImportModal from '../components/CsvImportModal';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, bulkBlogPosts } from '../api';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CSV_COLUMNS = [
  { key: 'title', label: 'Title', required: true, example: 'My Blog Post' },
  { key: 'url', label: 'URL', example: 'https://example.com/blog' },
  { key: 'publish_date', label: 'Publish Date', example: '2026-05-01' },
  { key: 'month', label: 'Month', type: 'number', example: '5' },
  { key: 'year', label: 'Year', type: 'number', example: '2026' },
  { key: 'views', label: 'Views', type: 'number', example: '1000' },
  { key: 'rank', label: 'Rank', type: 'number', example: '5' },
  { key: 'ai_overview', label: 'AI Overview', example: 'yes' },
  { key: 'keywords', label: 'Keywords', example: 'wordpress, hosting' },
  { key: 'notes', label: 'Notes', example: '' },
];

function exportCsv(data) {
  const header = CSV_COLUMNS.map(c => c.label).join(',');
  const rows = data.map(r => CSV_COLUMNS.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'blogs.csv'; a.click(); URL.revokeObjectURL(url);
}

const empty = { title: '', url: '', publish_date: '', month: '', year: '', views: '', rank: '', ai_overview: '', keywords: '', notes: '' };

export default function Blogs() {
  const now = new Date();
  const [filter, setFilter] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
  const [deleteId, setDeleteId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    setLoading(true);
    getBlogPosts(filter).then(d => { setRows(d); setLoading(false); }).catch(() => setLoading(false));
  }, [filter.month, filter.year]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setForm({ ...empty, month: filter.month || '', year: filter.year || '' }); setModal({ mode: 'add' }); }
  function openEdit(r) { setForm({ ...r, month: r.month || '', year: r.year || '' }); setModal({ mode: 'edit', id: r.id }); }

  async function handleSave() {
    const payload = { ...form, month: form.month ? parseInt(form.month) : null, year: form.year ? parseInt(form.year) : null, views: parseInt(form.views) || 0, rank: parseInt(form.rank) || 0 };
    if (modal.mode === 'add') await createBlogPost(payload);
    else await updateBlogPost(modal.id, payload);
    setModal(null);
    load();
  }

  async function handleDelete() {
    await deleteBlogPost(deleteId);
    setDeleteId(null);
    load();
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} posts</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button onClick={() => exportCsv(rows)} className="btn-secondary flex items-center gap-1.5"><Download size={15} /> Export</button>
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-1.5"><Upload size={15} /> Import</button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add Blog</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title','Date','Views','Rank','AI Overview','Keywords'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No blogs yet. Add your first blog post.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-medium text-gray-800 truncate">{r.title}</div>
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"><ExternalLink size={10} /> View</a>}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.publish_date ? r.publish_date : (r.month ? `${MONTHS[r.month]} ${r.year}` : '—')}</td>
                <td className="px-4 py-3 text-gray-700">{r.views > 0 ? r.views.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.rank > 0 ? `#${r.rank}` : '—'}</td>
                <td className="px-4 py-3">{r.ai_overview ? <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">{r.ai_overview}</span> : '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[8rem]">{r.keywords || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-blue-500 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Blog Post' : 'Edit Blog Post'} onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
              <input value={form.url} onChange={e => set('url', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://" />
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Rank</label>
              <input type="number" value={form.rank} onChange={e => set('rank', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">AI Overview</label>
              <input value={form.ai_overview} onChange={e => set('ai_overview', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. yes, no, featured" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Keywords</label>
              <input value={form.keywords} onChange={e => set('keywords', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="comma-separated" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.title} className="btn-primary disabled:opacity-50">
              {modal.mode === 'add' ? 'Add Blog' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && <ConfirmDialog message="Delete this blog post?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      {showImport && <CsvImportModal title="Blogs" columns={CSV_COLUMNS} onImport={bulkBlogPosts} onClose={() => { setShowImport(false); load(); }} />}
    </div>
  );
}
