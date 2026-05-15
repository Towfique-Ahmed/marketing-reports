import { useState, useEffect } from 'react';
import api from '../api';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function YearlyReports() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('content');

  useEffect(() => {
    setLoading(true);
    api.get(`/yearly-summary/${year}`).then(r => {
      setData(r.data);
      setLoading(false);
    });
  }, [year]);

  if (loading || !data) return <div className="flex items-center justify-center h-64 text-slate-400">Loading yearly report...</div>;

  const { totals, monthly } = data;

  const contentChartData = monthly.map(m => ({
    name: MONTH_NAMES[m.month - 1],
    Blogs: m.blogs,
    Social: m.social_posts,
    Emails: m.emails,
    Videos: m.videos,
  }));

  const trafficChartData = monthly.map(m => ({
    name: MONTH_NAMES[m.month - 1],
    'Blog Views': m.blog_views,
    'Social Impressions': m.social_impressions,
    'Video Views': m.video_views,
  }));

  const taskChartData = monthly.map(m => ({
    name: MONTH_NAMES[m.month - 1],
    Total: m.tasks_total,
    Completed: m.tasks_completed,
  }));

  const chartData = activeChart === 'content' ? contentChartData : activeChart === 'traffic' ? trafficChartData : taskChartData;
  const chartBars = activeChart === 'content'
    ? [{ key: 'Blogs', fill: '#4F46E5' }, { key: 'Social', fill: '#06B6D4' }, { key: 'Emails', fill: '#10B981' }, { key: 'Videos', fill: '#F59E0B' }]
    : activeChart === 'traffic'
    ? [{ key: 'Blog Views', fill: '#4F46E5' }, { key: 'Social Impressions', fill: '#06B6D4' }, { key: 'Video Views', fill: '#F59E0B' }]
    : [{ key: 'Total', fill: '#94A3B8' }, { key: 'Completed', fill: '#10B981' }];

  const completionRate = totals.tasks_total > 0 ? Math.round((totals.tasks_completed / totals.tasks_total) * 100) : 0;
  const finalizedReports = monthly.filter(m => m.report && m.report.is_finalized);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Yearly Report — {year}</h1>
        <div className="flex items-center gap-3">
          <select
            className="form-input w-28"
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-secondary" onClick={() => window.print()}>🖨 Print</button>
        </div>
      </div>

      {/* Yearly Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Blog Posts" value={totals.blogs} subtitle={`${totals.blog_views.toLocaleString()} total views`} color="indigo" icon="✍️" />
        <StatCard title="Social Posts" value={totals.social_posts} subtitle={`${totals.social_impressions.toLocaleString()} impressions`} color="blue" icon="📱" />
        <StatCard title="Email Campaigns" value={totals.emails} subtitle={`${totals.email_recipients.toLocaleString()} recipients`} color="purple" icon="📧" />
        <StatCard title="Videos" value={totals.videos} subtitle={`${totals.video_views.toLocaleString()} views`} color="rose" icon="🎬" />
        <StatCard title="Landing Pages" value={totals.landing_pages} subtitle="Total pages" color="cyan" icon="🏠" />
        <StatCard title="Tasks Completed" value={`${totals.tasks_completed}/${totals.tasks_total}`} subtitle={`${completionRate}% completion rate`} color="emerald" icon="✅" />
        <StatCard title="Finalized Reports" value={finalizedReports.length} subtitle="Monthly reports done" color="amber" icon="📅" />
      </div>

      {/* Chart */}
      <div className="card-pad mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-700">Monthly Breakdown</h2>
          <div className="flex gap-1">
            {[
              { key: 'content', label: 'Content' },
              { key: 'traffic', label: 'Traffic' },
              { key: 'tasks', label: 'Tasks' },
            ].map(btn => (
              <button
                key={btn.key}
                onClick={() => setActiveChart(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeChart === btn.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {chartBars.map(b => <Bar key={b.key} dataKey={b.key} fill={b.fill} radius={[3,3,0,0]} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="card mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700">Monthly Breakdown Table</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Blogs</th>
                <th>Blog Views</th>
                <th>Social</th>
                <th>Impressions</th>
                <th>Emails</th>
                <th>Recipients</th>
                <th>Videos</th>
                <th>Video Views</th>
                <th>Tasks</th>
                <th>SEO Traffic</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map(m => (
                <tr key={m.month} className={m.blogs + m.social_posts + m.emails + m.videos === 0 ? 'opacity-40' : ''}>
                  <td className="font-medium text-slate-800">{FULL_MONTHS[m.month - 1]}</td>
                  <td>{m.blogs}</td>
                  <td>{m.blog_views.toLocaleString()}</td>
                  <td>{m.social_posts}</td>
                  <td>{m.social_impressions.toLocaleString()}</td>
                  <td>{m.emails}</td>
                  <td>{m.email_recipients.toLocaleString()}</td>
                  <td>{m.videos}</td>
                  <td>{m.video_views.toLocaleString()}</td>
                  <td>
                    {m.tasks_total > 0 ? (
                      <span className="text-slate-600">{m.tasks_completed}/{m.tasks_total}</span>
                    ) : '—'}
                  </td>
                  <td>{m.seo ? m.seo.organic_traffic?.toLocaleString() : '—'}</td>
                  <td>
                    {m.report ? (
                      m.report.is_finalized
                        ? <span className="badge badge-green">Finalized</span>
                        : <span className="badge badge-yellow">Draft</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                <td className="font-bold text-slate-800">TOTALS</td>
                <td className="font-bold">{totals.blogs}</td>
                <td className="font-bold">{totals.blog_views.toLocaleString()}</td>
                <td className="font-bold">{totals.social_posts}</td>
                <td className="font-bold">{totals.social_impressions.toLocaleString()}</td>
                <td className="font-bold">{totals.emails}</td>
                <td className="font-bold">{totals.email_recipients.toLocaleString()}</td>
                <td className="font-bold">{totals.videos}</td>
                <td className="font-bold">{totals.video_views.toLocaleString()}</td>
                <td className="font-bold">{totals.tasks_completed}/{totals.tasks_total}</td>
                <td>—</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Finalized Reports List */}
      {finalizedReports.length > 0 && (
        <div className="card-pad">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Finalized Monthly Reports</h2>
          <div className="space-y-3">
            {finalizedReports.map(m => (
              <div key={m.month} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                  {MONTH_NAMES[m.month - 1]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{m.report.title || `${FULL_MONTHS[m.month - 1]} ${year} Report`}</p>
                  {m.report.summary && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{m.report.summary}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{m.blogs} blogs</span>
                    <span>{m.social_posts} social</span>
                    <span>{m.emails} emails</span>
                    <span>{m.videos} videos</span>
                    <span>{m.tasks_completed}/{m.tasks_total} tasks</span>
                  </div>
                </div>
                <span className="badge badge-green flex-shrink-0">Finalized</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
