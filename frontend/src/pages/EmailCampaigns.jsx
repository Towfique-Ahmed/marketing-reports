import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import MonthYearFilter from '../components/MonthYearFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);

const blank = {
  campaign_name: '', subject: '', send_date: '', month: '', year: '',
  recipients: 0, delivered: 0, opens: 0, open_rate: 0,
  clicks: 0, click_rate: 0, unsubscribes: 0, conversions: 0, notes: ''
};

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
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
    api.get('/email-campaigns', { params }).then(r => setCampaigns(r.data));
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setForm(blank); setEditing(null); setModalOpen(true); };
  const openEdit = (c) => { setForm({ ...c }); setEditing(c.id); setModalOpen(true); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.campaign_name) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/email-campaigns/${editing}`, form);
      else await api.post('/email-campaigns', form);
      setModalOpen(false);
      load();
    } finally { setSaving(false); }
  };

  const del = async () => {
    await api.delete(`/email-campaigns/${deleteId}`);
    load();
  };

  const totals = campaigns.reduce((a, c) => ({
    recipients: a.recipients + (c.recipients || 0),
    delivered: a.delivered + (c.delivered || 0),
    opens: a.opens + (c.opens || 0),
    clicks: a.clicks + (c.clicks || 0),
    conversions: a.conversions + (c.conversions || 0),
  }), { recipients: 0, delivered: 0, opens: 0, clicks: 0, conversions: 0 });

  const avgOpenRate = campaigns.length > 0 ? (campaigns.reduce((a, c) => a + (c.open_rate || 0), 0) / campaigns.length).toFixed(1) : '0';
  const avgClickRate = campaigns.length > 0 ? (campaigns.reduce((a, c) => a + (c.click_rate || 0), 0) / campaigns.length).toFixed(1) : '0';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Email Campaigns</h1>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button className="btn-primary" onClick={openAdd}>+ Add Campaign</button>
        </div>
      </div>

      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Campaigns</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{campaigns.length}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recipients</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.recipients.toLocaleString()}</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Open Rate</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{avgOpenRate}%</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Click Rate</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{avgClickRate}%</p>
          </div>
          <div className="card-pad text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conversions</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totals.conversions.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Subject</th>
                <th>Send Date</th>
                <th>Recipients</th>
                <th>Delivered</th>
                <th>Opens</th>
                <th>Open Rate</th>
                <th>Clicks</th>
                <th>Click Rate</th>
                <th>Unsub</th>
                <th>Conv.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr><td colSpan={12} className="text-center text-slate-400 py-12">No email campaigns found.</td></tr>
              ) : campaigns.map(c => (
                <tr key={c.id}>
                  <td className="font-medium text-slate-800 max-w-xs">{c.campaign_name}</td>
                  <td className="max-w-xs truncate text-slate-600">{c.subject || '—'}</td>
                  <td className="whitespace-nowrap">{c.send_date || '—'}</td>
                  <td>{(c.recipients || 0).toLocaleString()}</td>
                  <td>{(c.delivered || 0).toLocaleString()}</td>
                  <td>{(c.opens || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${c.open_rate >= 20 ? 'badge-green' : c.open_rate >= 10 ? 'badge-yellow' : 'badge-red'}`}>
                      {c.open_rate || 0}%
                    </span>
                  </td>
                  <td>{(c.clicks || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${c.click_rate >= 3 ? 'badge-green' : c.click_rate >= 1 ? 'badge-yellow' : 'badge-red'}`}>
                      {c.click_rate || 0}%
                    </span>
                  </td>
                  <td>{c.unsubscribes || 0}</td>
                  <td>{c.conversions || 0}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-indigo-600 hover:underline" onClick={() => openEdit(c)}>Edit</button>
                      <button className="text-xs text-red-500 hover:underline" onClick={() => setDeleteId(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal title={editing ? 'Edit Email Campaign' : 'Add Email Campaign'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Campaign Name *</label>
            <input className="form-input" value={form.campaign_name} onChange={e => set('campaign_name', e.target.value)} placeholder="e.g. May Newsletter" />
          </div>
          <div className="col-span-2">
            <label className="form-label">Subject Line</label>
            <input className="form-input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Email subject" />
          </div>
          <div>
            <label className="form-label">Send Date</label>
            <input type="date" className="form-input" value={form.send_date} onChange={e => set('send_date', e.target.value)} />
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
            <label className="form-label">Recipients</label>
            <input type="number" min="0" className="form-input" value={form.recipients} onChange={e => set('recipients', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Delivered</label>
            <input type="number" min="0" className="form-input" value={form.delivered} onChange={e => set('delivered', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Opens</label>
            <input type="number" min="0" className="form-input" value={form.opens} onChange={e => set('opens', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Open Rate (%)</label>
            <input type="number" min="0" max="100" step="0.1" className="form-input" value={form.open_rate} onChange={e => set('open_rate', parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Clicks</label>
            <input type="number" min="0" className="form-input" value={form.clicks} onChange={e => set('clicks', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Click Rate (%)</label>
            <input type="number" min="0" max="100" step="0.1" className="form-input" value={form.click_rate} onChange={e => set('click_rate', parseFloat(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Unsubscribes</label>
            <input type="number" min="0" className="form-input" value={form.unsubscribes} onChange={e => set('unsubscribes', parseInt(e.target.value)||0)} />
          </div>
          <div>
            <label className="form-label">Conversions</label>
            <input type="number" min="0" className="form-input" value={form.conversions} onChange={e => set('conversions', parseInt(e.target.value)||0)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving || !form.campaign_name}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Campaign'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={del}
        message="Delete this email campaign? This action cannot be undone."
      />
    </div>
  );
}
