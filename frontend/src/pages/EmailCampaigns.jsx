import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Upload, Download, TrendingUp, Users, MousePointer } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';
import CsvImportModal from '../components/CsvImportModal';
import StatCard from '../components/StatCard';
import { getEmailCampaigns, createEmailCampaign, updateEmailCampaign, deleteEmailCampaign, bulkEmailCampaigns } from '../api';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CSV_COLUMNS = [
  { key: 'campaign_name', label: 'Campaign Name', required: true, example: 'March Newsletter' },
  { key: 'send_date', label: 'Send Date', example: '2026-03-05' },
  { key: 'month', label: 'Month', type: 'number', example: '3' },
  { key: 'year', label: 'Year', type: 'number', example: '2026' },
  { key: 'recipients', label: 'Recipients', type: 'number', example: '11500' },
  { key: 'open_rate', label: 'Open Rate (%)', type: 'number', example: '36.5' },
  { key: 'click_rate', label: 'Click Rate (%)', type: 'number', example: '2.1' },
  { key: 'notes', label: 'Notes', example: '' },
];

function exportCsv(data) {
  const header = CSV_COLUMNS.map(c => c.label).join(',');
  const rows = data.map(r => CSV_COLUMNS.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'email-campaigns.csv'; a.click(); URL.revokeObjectURL(url);
}

const empty = { campaign_name: '', send_date: '', month: '', year: '', recipients: '', open_rate: '', click_rate: '', notes: '' };

export default function EmailCampaigns() {
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
    getEmailCampaigns(filter).then(d => { setRows(d); setLoading(false); }).catch(() => setLoading(false));
  }, [filter.month, filter.year]);

  useEffect(() => { load(); }, [load]);

  const avgOpen = rows.length ? (rows.reduce((a, r) => a + (r.open_rate || 0), 0) / rows.length).toFixed(1) : 0;
  const avgClick = rows.length ? (rows.reduce((a, r) => a + (r.click_rate || 0), 0) / rows.length).toFixed(1) : 0;
  const totalRecipients = rows.reduce((a, r) => a + (r.recipients || 0), 0);

  function openAdd() { setForm({ ...empty, month: filter.month || '', year: filter.year || '' }); setModal({ mode: 'add' }); }
  function openEdit(r) { setForm({ ...r }); setModal({ mode: 'edit', id: r.id }); }

  async function handleSave() {
    const p = { ...form, month: form.month ? parseInt(form.month) : null, year: form.year ? parseInt(form.year) : null, recipients: parseInt(form.recipients) || 0, open_rate: parseFloat(form.open_rate) || 0, click_rate: parseFloat(form.click_rate) || 0 };
    if (modal.mode === 'add') await createEmailCampaign(p);
    else await updateEmailCampaign(modal.id, p);
    setModal(null); load();
  }

  async function handleDelete() { await deleteEmailCampaign(deleteId); setDeleteId(null); load(); }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function rateColor(rate, low, high) {
    if (rate >= high) return 'text-green-600 font-semibold';
    if (rate >= low) return 'text-yellow-600';
    return 'text-red-500';
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Email Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button onClick={() => exportCsv(rows)} className="btn-secondary"><Download size={15} /> Export</button>
          <button onClick={() => setShowImport(true)} className="btn-secondary"><Upload size={15} /> Import</button>
          <button onClick={openAdd} className="btn-primary"><Plus size={15} /> Add Campaign</button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Avg Open Rate" value={`${avgOpen}%`} icon={TrendingUp} color="#3B82F6" />
          <StatCard label="Avg Click Rate" value={`${avgClick}%`} icon={MousePointer} color="#8B5CF6" />
          <StatCard label="Total Recipients" value={totalRecipients.toLocaleString()} icon={Users} color="#10B981" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Campaign Name','Date','Recipients','Open Rate','Click Rate'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No email campaigns yet.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{r.campaign_name}</div>
                  {r.notes && <div className="text-xs text-gray-400 mt-0.5 truncate">{r.notes}</div>}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.send_date || (r.month ? `${MONTHS[r.month]} ${r.year}` : '—')}</td>
                <td className="px-4 py-3 text-gray-700">{r.recipients > 0 ? r.recipients.toLocaleString() : '—'}</td>
                <td className="px-4 py-3"><span className={rateColor(r.open_rate, 25, 35)}>{r.open_rate > 0 ? `${r.open_rate}%` : '—'}</span></td>
                <td className="px-4 py-3"><span className={rateColor(r.click_rate, 1, 2.5)}>{r.click_rate > 0 ? `${r.click_rate}%` : '—'}</span></td>
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
        <Modal title={modal.mode === 'add' ? 'Add Campaign' : 'Edit Campaign'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Campaign Name *</label>
              <input value={form.campaign_name} onChange={e => set('campaign_name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Send Date</label>
                <input type="date" value={form.send_date} onChange={e => set('send_date', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                <input type="number" min="1" max="12" value={form.month} onChange={e => set('month', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                <input type="number" value={form.year} onChange={e => set('year', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Recipients</label>
                <input type="number" value={form.recipients} onChange={e => set('recipients', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Open Rate (%)</label>
                <input type="number" step="0.01" value={form.open_rate} onChange={e => set('open_rate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 36.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Click Rate (%)</label>
                <input type="number" step="0.01" value={form.click_rate} onChange={e => set('click_rate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 2.1" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={!form.campaign_name} className="btn-primary disabled:opacity-50">
              {modal.mode === 'add' ? 'Add Campaign' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="Delete this campaign?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
      {showImport && <CsvImportModal title="Email Campaigns" columns={CSV_COLUMNS} onImport={bulkEmailCampaigns} onClose={() => { setShowImport(false); load(); }} />}
    </div>
  );
}
