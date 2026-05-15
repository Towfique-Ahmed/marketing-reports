import { useState, useEffect } from 'react';
import api from '../api';
import StatCard from '../components/StatCard';
import MonthYearFilter from '../components/MonthYearFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#4F46E5','#06B6D4','#10B981','#F59E0B','#EF4444','#8B5CF6'];

export default function Dashboard() {
  const now = new Date();
  const [filter, setFilter] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter.month) params.month = filter.month;
    if (filter.year) params.year = filter.year;
    api.get('/dashboard', { params }).then(r => { setData(r.data); setLoading(false); });
  }, [filter]);

  if (loading || !data) return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard...</div>;

  const trendData = data.monthly_trend.map(m => ({ name: MONTH_NAMES[m.month-1], ...m }));
  const platformData = (data.social.by_platform || []).map(p => ({ name: p.platform, value: p.c }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Blog Posts" value={data.blog.count} subtitle={`${data.blog.views.toLocaleString()} views`} color="indigo" icon="✍️" />
        <StatCard title="Social Posts" value={data.social.total} subtitle={`${data.social.impressions.toLocaleString()} impressions`} color="blue" icon="📱" />
        <StatCard title="Landing Pages" value={data.landing_pages.total} subtitle={`${data.landing_pages.new} new · ${data.landing_pages.updated} updated`} color="cyan" icon="🏠" />
        <StatCard title="Email Campaigns" value={data.email.count} subtitle={`${data.email.recipients.toLocaleString()} recipients`} color="purple" icon="📧" />
        <StatCard title="Videos Published" value={data.video.count} subtitle={`${data.video.views.toLocaleString()} views`} color="rose" icon="🎬" />
        <StatCard title="Tasks Completed" value={`${data.tasks.completed}/${data.tasks.total}`} subtitle={`${data.tasks.completion_rate}% completion rate`} color="emerald" icon="✅" />
        {data.seo && <StatCard title="SEO Traffic" value={data.seo.organic_traffic} subtitle={`${data.seo.top10_keywords} keywords top 10`} color="amber" icon="🔍" />}
        <StatCard title="Social Engagement" value={data.social.engagement.toLocaleString()} subtitle="Total interactions" color="orange" icon="💬" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card-pad lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Monthly Activity — {filter.year || new Date().getFullYear()}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="blogs" name="Blog Posts" fill="#4F46E5" radius={[3,3,0,0]} />
              <Bar dataKey="social" name="Social Posts" fill="#06B6D4" radius={[3,3,0,0]} />
              <Bar dataKey="emails" name="Emails" fill="#10B981" radius={[3,3,0,0]} />
              <Bar dataKey="videos" name="Videos" fill="#F59E0B" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-pad">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Social Media Breakdown</h2>
          {platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {platformData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {platformData.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-600">{p.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{p.value} posts</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No social data for this period</div>
          )}
        </div>
      </div>

      {data.tasks.total > 0 && (
        <div className="card-pad">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-700">Task Completion Rate</h2>
            <span className="text-sm font-bold text-indigo-600">{data.tasks.completion_rate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${data.tasks.completion_rate}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1">{data.tasks.completed} of {data.tasks.total} tasks completed</p>
        </div>
      )}
    </div>
  );
}
