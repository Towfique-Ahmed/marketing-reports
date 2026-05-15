import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BlogPosts from './pages/BlogPosts';
import SocialMedia from './pages/SocialMedia';
import LandingPages from './pages/LandingPages';
import EmailCampaigns from './pages/EmailCampaigns';
import Videos from './pages/Videos';
import SEOReports from './pages/SEOReports';
import Tasks from './pages/Tasks';
import OtherActivities from './pages/OtherActivities';
import MonthlyReports from './pages/MonthlyReports';
import YearlyReports from './pages/YearlyReports';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/blog" element={<BlogPosts />} />
        <Route path="/social" element={<SocialMedia />} />
        <Route path="/landing-pages" element={<LandingPages />} />
        <Route path="/email" element={<EmailCampaigns />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/seo" element={<SEOReports />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/other" element={<OtherActivities />} />
        <Route path="/monthly" element={<MonthlyReports />} />
        <Route path="/yearly" element={<YearlyReports />} />
      </Routes>
    </Layout>
  );
}
