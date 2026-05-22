import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Upload, Download } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';
import CsvImportModal from '../components/CsvImportModal';
import StatCard from '../components/StatCard';
import { getLandingPages, createLandingPage, updateLandingPage, deleteLandingPage, bulkLandingPages } from '../api';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CSV_COLUMNS = [
  { key: 'title', label: 'Title', required: true, example: 'OpenClaw Hosting Page' },
  { key: 'page_url', label: 'Page URL', example: 'https://xcloud.host/openclaw' },
  { key: 'page_type', label: 'Type (new/updated)', example: 'new' },
  { key: 'publish_date', label: 'Publish Date', example: '2026-05-01' },
  { key: 'month', label: 'Month', type: 'number', example: '5' },
  { key: 'year', label: 'Year', type: 'number', example: '2026' },
  { key: 'sessions', label: 'Sessions', type: 'number', example: '500' },
  { key: 'conversions', label: 'Conversions', type: 'number', example: '25' },
  { key: 'conversion_rate', label: 'Conversion Rate (%)', type: 'number', example: '5.0' },
  { key: 'bounce_rate', label: 'Bounce Rate (%)', type: 'number', example: '42.5' },
  { key: 'notes', label: 'Notes', example: '' },
];

function exportCsv(data) {
  const header = CSV_COLUMNS.map(c => c.label).join(',');
  const rows = data.map(r => CSV_COLUMNS.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'landing-pages.csv'; a.click(); URL.revokeObjectURL(url);
}

const empty = { title: '', page_url: '', page_type: 'new', publish_date: '', month: '', year: '', sessions: '', conversions: '', conversion_rate: '', bounce_rate: '', notes: '' };

export default function LandingPages() {
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
    getLandingPages(filter).then(d => { setRows(d); setLoading(false); }).catch(() => setLoading(false));
  }, [filter.month, filter.year]);

  useEffect(() => { load(); }, [load]);

  const totalSessions = rows.reduce((a, r) => a + (r.sessions || 0), 0);
  const totalConversions = rows.reduce((a, r) => a + (r.conversions || 0), 0);
  const avgConvRate = rows.length ? (rows.reduce((a, r) => a + (r.conversion_rate || 0), 0) / rows.length).toFixed(1) : 0;

  function openAdd() { setForm({ ...empty, month: filter.month || '', year: filter.year || '' }); setModal({ mode: 'add' }); }
  function openEdit(r) { setForm({ ...r }); setModal({ mode: 'edit', id: r.id }); }

  async function handleSave() {
    const p = { ...form, month: form.month ? parseInt(form.month) : null, year: form.year ? parseInt(form.year) : null, sessions: parseInt(form.sessions) || 0, conversions: parseInt(form.conversions) || 0, conversion_rate: parseFloat(form.conversion_rate) || 0, bounce_rate: parseFloat(form.bounce_rate) || 0 };
    if (modal.mode === 'add') await createLandingPage(p);
    else await updateLandingPage(modal.id, p);
    setModal(null); load();
  }

  async function handleDelete() { await deleteLandingPage(deleteId); setDeleteId(null); load(); }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} pages</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button onClick={() => exportCsv(rows)} className="btn-secondary"><Download size={15} /> Export</button>
          <button onClick={() => setShowImport(true)} className="btn-secondary"><Upload size={15} /> Import</button>
          <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Page</button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Sessions" value={totalSessions.toLocaleString()} color="#3B82F6" />
          <StatCard label="Total Conversions" value={totalConversions.toLocaleString()} color="#10B981" />
          <StatCard label="Avg Conv Rate" value={`${avgConvRate}%`} color="#8B5CF6" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title','Type','Date','Sessions','Conversions','Conv Rate'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No landing pages yet.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3 max-w-xs">
                  <div className="font-medium text-gray-800 truncate">{r.title}</div>
                  {r.page_url && <a href={r.page_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"><ExternalLink size={10} /> View</a>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${r.page_type === 'new' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {r.page_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.publish_date || (r.month ? `${MONTHS[r.month]} ${r.year}` : '—')}</td>
                <td className="px-4 py-3 text-gray-700">{r.sessions > 0 ? r.sessions.toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.conversions > 0 ? r.conversions : '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.conversion_rate > 0 ? `${r.conversion_rate}%` : '—'}</td>
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
        <Modal title={modal.mode === 'add' ? 'Add Landing Page' : 'Edit Landing Page'} onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Page URL</label>
              <input value={form.page_url} onChange={e => set('page_url', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={form.page_type} onChange={e => set('page_type', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="new">New</option>
                <option value="updated">Updated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Publish Date</label>
              <input type="date" value={form.publish_date} onChange={e => set('publish_date', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
              <input type="number" min="1" max="12" value={form.month} onChange={e => set('month', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e => set('year', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sessions</label>
              <input type="number" value={form.sessions} onChange={e => set('sessions', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Conversions</label>
              <input type="number" value={form.conversions} onChange={e => set('conversions', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Conv Rate (%)</label>
              <input type="number" step="0.1" value={form.conversion_rate} onChange={e => set('conversion_rate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bounce Rate (%)</label>
              <input type="number" step="0.1" value={form.bounce_rate} onChange={e => set('bounce_rate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.title} className="btn-primary disabled:opacity-50">
              {modal.mode === 'add' ? 'Add Page' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Delete this landing page?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      {showImport && <CsvImportModal title="Landing Pages" columns={CSV_COLUMNS} onImport={bulkLandingPages} onClose={() => { setShowImport(false); load(); }} />}
    </div>
  );
}
