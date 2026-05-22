import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, Share2, Users, Mail,
  Video, Globe, BarChart3, LineChart, Palette, ChevronRight
} from 'lucide-react';

const groups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    label: 'Content',
    items: [
      { to: '/blogs', icon: FileText, label: 'Blogs' },
      { to: '/documentations', icon: BookOpen, label: 'Documentations' },
      { to: '/social', icon: Share2, label: 'Social Media' },
      { to: '/community', icon: Users, label: 'Community' },
    ]
  },
  {
    label: 'Campaigns',
    items: [
      { to: '/emails', icon: Mail, label: 'Emails' },
      { to: '/videos', icon: Video, label: 'Videos' },
      { to: '/landing-pages', icon: Globe, label: 'Landing Pages' },
    ]
  },
  {
    label: 'Reports',
    items: [
      { to: '/overview', icon: BarChart3, label: 'Monthly Overview' },
      { to: '/analytics', icon: LineChart, label: 'Analytics' },
    ]
  },
  {
    label: 'Settings',
    items: [
      { to: '/settings', icon: Palette, label: 'Appearance' },
    ]
  }
];

export default function Sidebar() {
  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
    >
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-white font-bold text-lg tracking-tight">xCloud Reports</div>
        <div className="text-white/40 text-xs mt-0.5">Marketing Dashboard</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {groups.map(group => (
          <div key={group.label}>
            <div className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/8'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <div className="text-white/25 text-xs">xCloud Marketing</div>
      </div>
    </aside>
  );
}
