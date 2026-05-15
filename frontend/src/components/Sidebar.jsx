import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { label: 'Content', separator: true },
  { to: '/blog', label: 'Blog Posts', icon: '✍️' },
  { to: '/social', label: 'Social Media', icon: '📱' },
  { to: '/landing-pages', label: 'Landing Pages', icon: '🏠' },
  { to: '/videos', label: 'Videos', icon: '🎬' },
  { label: 'Campaigns', separator: true },
  { to: '/email', label: 'Email Campaigns', icon: '📧' },
  { to: '/other', label: 'Other Activities', icon: '⚡' },
  { label: 'Analytics', separator: true },
  { to: '/seo', label: 'SEO Performance', icon: '🔍' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { label: 'Reports', separator: true },
  { to: '/monthly', label: 'Monthly Reports', icon: '📅' },
  { to: '/yearly', label: 'Yearly Reports', icon: '📆' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-slate-800 flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
          <div>
            <p className="text-white font-bold text-sm">MarketingHub</p>
            <p className="text-slate-400 text-xs">Reports Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {nav.map((item, i) => (
          item.separator
            ? <p key={i} className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 pt-4 pb-1">{item.label}</p>
            : <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-700">
        <p className="text-slate-500 text-xs">© 2025 Marketing Platform</p>
      </div>
    </aside>
  );
}
