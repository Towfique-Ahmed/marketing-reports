import { useState, useEffect } from 'react';
import { FileText, BookOpen, Share2, Users, Mail, Video, Globe, TrendingUp, MousePointer, Eye } from 'lucide-react';
import StatCard from '../components/StatCard';
import MonthYearFilter from '../components/MonthYearFilter';
import { getDashboard } from '../api';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const now = new Date();
  const [filter, setFilter] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboard(filter).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [filter.month, filter.year]);

  const periodLabel = filter.month && filter.year
    ? `${MONTHS[filter.month]} ${filter.year}`
    : filter.year ? String(filter.year) : 'All Time';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Marketing overview — {periodLabel}</p>
        </div>
        <MonthYearFilter month={filter.month} year={filter.year} onChange={setFilter} />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : !data ? (
        <div className="text-center py-16 text-gray-400">No data</div>
      ) : (
        <>
          {/* Content counts */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Content Published</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <StatCard label="Blogs" value={data.blogs} icon={FileText} color="#3B82F6" />
              <StatCard label="Docs" value={data.documentations} icon={BookOpen} color="#8B5CF6" />
              <StatCard label="Social" value={data.social_posts} icon={Share2} color="#F59E0B" />
              <StatCard label="Community" value={data.community_posts} icon={Users} color="#10B981" />
              <StatCard label="Emails" value={data.emails} icon={Mail} color="#EF4444" />
              <StatCard label="Videos" value={data.videos} icon={Video} color="#EC4899" />
              <StatCard label="Landing" value={data.landing_pages} icon={Globe} color="#06B6D4" />
            </div>
          </div>

          {/* Email performance */}
          {data.emails > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Email Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Avg Open Rate" value={`${(data.email_avg_open || 0).toFixed(1)}%`} icon={TrendingUp} color="#3B82F6" />
                <StatCard label="Avg Click Rate" value={`${(data.email_avg_click || 0).toFixed(1)}%`} icon={MousePointer} color="#8B5CF6" />
                <StatCard label="Total Recipients" value={(data.email_total_recipients || 0).toLocaleString()} icon={Mail} color="#10B981" />
              </div>
            </div>
          )}

          {/* Social platform breakdown */}
          {data.social_posts > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Social Platform Posts</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="stat-card flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">fb</div>
                  <div>
                    <p className="text-xs text-gray-500">Facebook</p>
                    <p className="text-xl font-bold text-gray-800">{data.social_fb}</p>
                  </div>
                </div>
                <div className="stat-card flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">in</div>
                  <div>
                    <p className="text-xs text-gray-500">LinkedIn</p>
                    <p className="text-xl font-bold text-gray-800">{data.social_li}</p>
                  </div>
                </div>
                <div className="stat-card flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs">𝕏</div>
                  <div>
                    <p className="text-xs text-gray-500">Twitter/X</p>
                    <p className="text-xl font-bold text-gray-800">{data.social_tw}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Site performance */}
          {data.overview && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Site Performance</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Clicks" value={(data.overview.total_clicks || 0).toLocaleString()} icon={MousePointer} color="#3B82F6" />
                <StatCard label="Impressions" value={(data.overview.total_impressions || 0).toLocaleString()} icon={Eye} color="#8B5CF6" />
                <StatCard label="Avg CTR" value={`${(data.overview.avg_ctr || 0).toFixed(2)}%`} icon={TrendingUp} color="#10B981" />
                <StatCard label="Avg Position" value={(data.overview.avg_position || 0).toFixed(1)} icon={TrendingUp} color="#F59E0B" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
