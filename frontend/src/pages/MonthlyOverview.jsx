import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import MonthYearFilter from '../components/MonthYearFilter';
import { getMonthlyOverview, saveMonthlyOverview } from '../api';

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

function Section({ title, color, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, decimal }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        step={decimal ? '0.01' : '1'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        placeholder="0"
      />
    </div>
  );
}

const emptyForm = () => ({
  active_users: '', new_users: '', total_clicks: '', total_impressions: '', avg_ctr: '', avg_position: '',
  yt_views: '', yt_watch_time: '', yt_subscribers: '',
  community_prev: '', community_new: '', community_total: '',
  li_impressions: '', li_reactions: '', li_comments: '', li_reposts: '', li_page_views: '',
  li_unique_visitors: '', li_button_clicks: '', li_followers: '', li_search_appearance: '',
  fb_visits: '', fb_views: '', fb_reach: '', fb_interactions: '', fb_link_clicks: '', fb_follows: '',
  tw_impressions: '', tw_engagement_rate: '', tw_engagements: '', tw_profile_visits: '',
  tw_replies: '', tw_likes: '', tw_reposts: '', tw_bookmarks: '', tw_shares: '',
  notes: '',
});

export default function MonthlyOverview() {
  const now = new Date();
  const [filter, setFilter] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    getMonthlyOverview(filter).then(d => {
      if (d && d.month) {
        const f = emptyForm();
        Object.keys(f).forEach(k => { if (d[k] !== undefined && d[k] !== null) f[k] = d[k] === 0 ? '' : d[k]; });
        setForm(f);
      } else {
        setForm({ ...emptyForm(), ...filter });
      }
      setLoading(false);
    }).catch(() => { setForm(emptyForm()); setLoading(false); });
  }, [filter.month, filter.year]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    const payload = { ...filter };
    Object.keys(form).forEach(k => {
      if (k === 'notes') { payload[k] = form[k] || ''; }
      else if (k === 'avg_ctr' || k === 'avg_position' || k === 'yt_watch_time' || k === 'tw_engagement_rate') {
        payload[k] = parseFloat(form[k]) || 0;
      } else {
        payload[k] = parseInt(form[k]) || 0;
      }
    });
    await saveMonthlyOverview(payload);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const periodLabel = filter.month && filter.year ? `${MONTHS[filter.month]} ${filter.year}` : 'Select Period';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monthly Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform performance stats — {periodLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          <Section title="Site Performance (Google Search Console)" color="#3B82F6">
            <Field label="Active Users" value={form.active_users} onChange={v => set('active_users', v)} />
            <Field label="New Users" value={form.new_users} onChange={v => set('new_users', v)} />
            <Field label="Total Clicks" value={form.total_clicks} onChange={v => set('total_clicks', v)} />
            <Field label="Total Impressions" value={form.total_impressions} onChange={v => set('total_impressions', v)} />
            <Field label="Avg CTR (%)" value={form.avg_ctr} onChange={v => set('avg_ctr', v)} decimal />
            <Field label="Avg Position" value={form.avg_position} onChange={v => set('avg_position', v)} decimal />
          </Section>

          <Section title="YouTube Channel" color="#EF4444">
            <Field label="Views" value={form.yt_views} onChange={v => set('yt_views', v)} />
            <Field label="Watch Time (hrs)" value={form.yt_watch_time} onChange={v => set('yt_watch_time', v)} decimal />
            <Field label="Subscribers" value={form.yt_subscribers} onChange={v => set('yt_subscribers', v)} />
          </Section>

          <Section title="Community Members" color="#10B981">
            <Field label="Previous Total" value={form.community_prev} onChange={v => set('community_prev', v)} />
            <Field label="New Members" value={form.community_new} onChange={v => set('community_new', v)} />
            <Field label="Current Total" value={form.community_total} onChange={v => set('community_total', v)} />
          </Section>

          <Section title="LinkedIn Performance" color="#0077B5">
            <Field label="Impressions" value={form.li_impressions} onChange={v => set('li_impressions', v)} />
            <Field label="Reactions" value={form.li_reactions} onChange={v => set('li_reactions', v)} />
            <Field label="Comments" value={form.li_comments} onChange={v => set('li_comments', v)} />
            <Field label="Reposts" value={form.li_reposts} onChange={v => set('li_reposts', v)} />
            <Field label="Page Views" value={form.li_page_views} onChange={v => set('li_page_views', v)} />
            <Field label="Unique Visitors" value={form.li_unique_visitors} onChange={v => set('li_unique_visitors', v)} />
            <Field label="Button Clicks" value={form.li_button_clicks} onChange={v => set('li_button_clicks', v)} />
            <Field label="Total Followers" value={form.li_followers} onChange={v => set('li_followers', v)} />
            <Field label="Search Appearances" value={form.li_search_appearance} onChange={v => set('li_search_appearance', v)} />
          </Section>

          <Section title="Facebook Performance" color="#1877F2">
            <Field label="Visits" value={form.fb_visits} onChange={v => set('fb_visits', v)} />
            <Field label="Views" value={form.fb_views} onChange={v => set('fb_views', v)} />
            <Field label="Reach" value={form.fb_reach} onChange={v => set('fb_reach', v)} />
            <Field label="Content Interactions" value={form.fb_interactions} onChange={v => set('fb_interactions', v)} />
            <Field label="Link Clicks" value={form.fb_link_clicks} onChange={v => set('fb_link_clicks', v)} />
            <Field label="Follows" value={form.fb_follows} onChange={v => set('fb_follows', v)} />
          </Section>

          <Section title="Twitter/X Performance" color="#000000">
            <Field label="Impressions" value={form.tw_impressions} onChange={v => set('tw_impressions', v)} />
            <Field label="Engagement Rate (%)" value={form.tw_engagement_rate} onChange={v => set('tw_engagement_rate', v)} decimal />
            <Field label="Engagements" value={form.tw_engagements} onChange={v => set('tw_engagements', v)} />
            <Field label="Profile Visits" value={form.tw_profile_visits} onChange={v => set('tw_profile_visits', v)} />
            <Field label="Replies" value={form.tw_replies} onChange={v => set('tw_replies', v)} />
            <Field label="Likes" value={form.tw_likes} onChange={v => set('tw_likes', v)} />
            <Field label="Reposts" value={form.tw_reposts} onChange={v => set('tw_reposts', v)} />
            <Field label="Bookmarks" value={form.tw_bookmarks} onChange={v => set('tw_bookmarks', v)} />
            <Field label="Shares" value={form.tw_shares} onChange={v => set('tw_shares', v)} />
          </Section>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-700 mb-3">Notes</h3>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" placeholder="Any notes or highlights for this month..." />
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50 px-8">
              <Save size={15} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Overview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
