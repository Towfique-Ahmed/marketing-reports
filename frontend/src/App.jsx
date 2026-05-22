import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Blogs from './pages/Blogs';
import Documentations from './pages/Documentations';
import SocialMedia from './pages/SocialMedia';
import Community from './pages/Community';
import EmailCampaigns from './pages/EmailCampaigns';
import Videos from './pages/Videos';
import LandingPages from './pages/LandingPages';
import MonthlyOverview from './pages/MonthlyOverview';
import Analytics from './pages/Analytics';
import AppearanceSettings from './pages/AppearanceSettings';
import { getSettings } from './api';

function App() {
  useEffect(() => {
    getSettings().then(s => {
      const root = document.documentElement;
      if (s.primary_color) root.style.setProperty('--color-primary', s.primary_color);
      if (s.accent_color) root.style.setProperty('--color-accent', s.accent_color);
      if (s.sidebar_bg) root.style.setProperty('--color-sidebar-bg', s.sidebar_bg);
      if (s.font_family) {
        root.style.setProperty('--font-family', `'${s.font_family}', system-ui, sans-serif`);
        document.body.style.fontFamily = `'${s.font_family}', system-ui, sans-serif`;
      }
    }).catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="documentations" element={<Documentations />} />
          <Route path="social" element={<SocialMedia />} />
          <Route path="community" element={<Community />} />
          <Route path="emails" element={<EmailCampaigns />} />
          <Route path="videos" element={<Videos />} />
          <Route path="landing-pages" element={<LandingPages />} />
          <Route path="overview" element={<MonthlyOverview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AppearanceSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
