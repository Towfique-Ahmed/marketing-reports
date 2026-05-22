const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initDb = require('./db');

const app = express();
let db; // assigned after async init
app.use(cors());
app.use(express.json());

// ─── HELPERS ────────────────────────────────────────────────────────────────
function monthYear(req) {
  const month = req.query.month ? parseInt(req.query.month) : null;
  const year = req.query.year ? parseInt(req.query.year) : null;
  return { month, year };
}

function addFilters(base, params, { month, year } = {}) {
  const conditions = [];
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (year) { conditions.push('year = ?'); params.push(year); }
  if (conditions.length) return base + ' WHERE ' + conditions.join(' AND ');
  return base;
}

// ─── BLOG POSTS ─────────────────────────────────────────────────────────────
app.get('/api/blog-posts', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const sql = addFilters('SELECT * FROM blog_posts ORDER BY publish_date DESC', params, { month, year });
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/blog-posts', (req, res) => {
  const { title, url, publish_date, month, year, views, organic_traffic, backlinks, keywords_targeted, keywords_top10, bounce_rate, avg_time_on_page, notes } = req.body;
  const r = db.prepare(`INSERT INTO blog_posts (title,url,publish_date,month,year,views,organic_traffic,backlinks,keywords_targeted,keywords_top10,bounce_rate,avg_time_on_page,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(title,url,publish_date,month,year,views||0,organic_traffic||0,backlinks||0,keywords_targeted||0,keywords_top10||0,bounce_rate||0,avg_time_on_page||'0:00',notes||'');
  res.json(db.prepare('SELECT * FROM blog_posts WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/blog-posts/:id', (req, res) => {
  const { title, url, publish_date, month, year, views, organic_traffic, backlinks, keywords_targeted, keywords_top10, bounce_rate, avg_time_on_page, notes } = req.body;
  db.prepare(`UPDATE blog_posts SET title=?,url=?,publish_date=?,month=?,year=?,views=?,organic_traffic=?,backlinks=?,keywords_targeted=?,keywords_top10=?,bounce_rate=?,avg_time_on_page=?,notes=? WHERE id=?`).run(title,url,publish_date,month,year,views||0,organic_traffic||0,backlinks||0,keywords_targeted||0,keywords_top10||0,bounce_rate||0,avg_time_on_page||'0:00',notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM blog_posts WHERE id=?').get(req.params.id));
});

app.delete('/api/blog-posts/:id', (req, res) => {
  db.prepare('DELETE FROM blog_posts WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── SOCIAL POSTS ────────────────────────────────────────────────────────────
app.get('/api/social-posts', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const conditions = [];
  if (req.query.platform) { conditions.push('platform = ?'); params.push(req.query.platform); }
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (year) { conditions.push('year = ?'); params.push(year); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(db.prepare(`SELECT * FROM social_posts${where} ORDER BY post_date DESC`).all(...params));
});

app.post('/api/social-posts', (req, res) => {
  const { platform, title, post_url, post_date, month, year, impressions, reach, engagement, likes, comments, shares, clicks, notes } = req.body;
  const r = db.prepare(`INSERT INTO social_posts (platform,title,post_url,post_date,month,year,impressions,reach,engagement,likes,comments,shares,clicks,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(platform,title||'',post_url||'',post_date,month,year,impressions||0,reach||0,engagement||0,likes||0,comments||0,shares||0,clicks||0,notes||'');
  res.json(db.prepare('SELECT * FROM social_posts WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/social-posts/:id', (req, res) => {
  const { platform, title, post_url, post_date, month, year, impressions, reach, engagement, likes, comments, shares, clicks, notes } = req.body;
  db.prepare(`UPDATE social_posts SET platform=?,title=?,post_url=?,post_date=?,month=?,year=?,impressions=?,reach=?,engagement=?,likes=?,comments=?,shares=?,clicks=?,notes=? WHERE id=?`).run(platform,title||'',post_url||'',post_date,month,year,impressions||0,reach||0,engagement||0,likes||0,comments||0,shares||0,clicks||0,notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM social_posts WHERE id=?').get(req.params.id));
});

app.delete('/api/social-posts/:id', (req, res) => {
  db.prepare('DELETE FROM social_posts WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── LANDING PAGES ───────────────────────────────────────────────────────────
app.get('/api/landing-pages', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const conditions = [];
  if (req.query.page_type) { conditions.push('page_type = ?'); params.push(req.query.page_type); }
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (year) { conditions.push('year = ?'); params.push(year); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(db.prepare(`SELECT * FROM landing_pages${where} ORDER BY publish_date DESC`).all(...params));
});

app.post('/api/landing-pages', (req, res) => {
  const { title, page_url, page_type, publish_date, month, year, sessions, conversions, conversion_rate, bounce_rate, avg_session_duration, notes } = req.body;
  const r = db.prepare(`INSERT INTO landing_pages (title,page_url,page_type,publish_date,month,year,sessions,conversions,conversion_rate,bounce_rate,avg_session_duration,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(title,page_url||'',page_type||'new',publish_date,month,year,sessions||0,conversions||0,conversion_rate||0,bounce_rate||0,avg_session_duration||'0:00',notes||'');
  res.json(db.prepare('SELECT * FROM landing_pages WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/landing-pages/:id', (req, res) => {
  const { title, page_url, page_type, publish_date, month, year, sessions, conversions, conversion_rate, bounce_rate, avg_session_duration, notes } = req.body;
  db.prepare(`UPDATE landing_pages SET title=?,page_url=?,page_type=?,publish_date=?,month=?,year=?,sessions=?,conversions=?,conversion_rate=?,bounce_rate=?,avg_session_duration=?,notes=? WHERE id=?`).run(title,page_url||'',page_type||'new',publish_date,month,year,sessions||0,conversions||0,conversion_rate||0,bounce_rate||0,avg_session_duration||'0:00',notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM landing_pages WHERE id=?').get(req.params.id));
});

app.delete('/api/landing-pages/:id', (req, res) => {
  db.prepare('DELETE FROM landing_pages WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── EMAIL CAMPAIGNS ─────────────────────────────────────────────────────────
app.get('/api/email-campaigns', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const sql = addFilters('SELECT * FROM email_campaigns ORDER BY send_date DESC', params, { month, year });
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/email-campaigns', (req, res) => {
  const { campaign_name, subject, send_date, month, year, recipients, delivered, opens, open_rate, clicks, click_rate, unsubscribes, conversions, notes } = req.body;
  const r = db.prepare(`INSERT INTO email_campaigns (campaign_name,subject,send_date,month,year,recipients,delivered,opens,open_rate,clicks,click_rate,unsubscribes,conversions,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(campaign_name,subject||'',send_date,month,year,recipients||0,delivered||0,opens||0,open_rate||0,clicks||0,click_rate||0,unsubscribes||0,conversions||0,notes||'');
  res.json(db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/email-campaigns/:id', (req, res) => {
  const { campaign_name, subject, send_date, month, year, recipients, delivered, opens, open_rate, clicks, click_rate, unsubscribes, conversions, notes } = req.body;
  db.prepare(`UPDATE email_campaigns SET campaign_name=?,subject=?,send_date=?,month=?,year=?,recipients=?,delivered=?,opens=?,open_rate=?,clicks=?,click_rate=?,unsubscribes=?,conversions=?,notes=? WHERE id=?`).run(campaign_name,subject||'',send_date,month,year,recipients||0,delivered||0,opens||0,open_rate||0,clicks||0,click_rate||0,unsubscribes||0,conversions||0,notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(req.params.id));
});

app.delete('/api/email-campaigns/:id', (req, res) => {
  db.prepare('DELETE FROM email_campaigns WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── VIDEOS ──────────────────────────────────────────────────────────────────
app.get('/api/videos', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const sql = addFilters('SELECT * FROM videos ORDER BY publish_date DESC', params, { month, year });
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/videos', (req, res) => {
  const { title, platform, video_url, publish_date, month, year, views, watch_time_hours, likes, comments, shares, notes } = req.body;
  const r = db.prepare(`INSERT INTO videos (title,platform,video_url,publish_date,month,year,views,watch_time_hours,likes,comments,shares,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(title,platform||'YouTube',video_url||'',publish_date,month,year,views||0,watch_time_hours||0,likes||0,comments||0,shares||0,notes||'');
  res.json(db.prepare('SELECT * FROM videos WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/videos/:id', (req, res) => {
  const { title, platform, video_url, publish_date, month, year, views, watch_time_hours, likes, comments, shares, notes } = req.body;
  db.prepare(`UPDATE videos SET title=?,platform=?,video_url=?,publish_date=?,month=?,year=?,views=?,watch_time_hours=?,likes=?,comments=?,shares=?,notes=? WHERE id=?`).run(title,platform||'YouTube',video_url||'',publish_date,month,year,views||0,watch_time_hours||0,likes||0,comments||0,shares||0,notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id));
});

app.delete('/api/videos/:id', (req, res) => {
  db.prepare('DELETE FROM videos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── SEO REPORTS ─────────────────────────────────────────────────────────────
app.get('/api/seo-reports', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const conditions = [];
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (year) { conditions.push('year = ?'); params.push(year); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(db.prepare(`SELECT * FROM seo_reports${where} ORDER BY year DESC, month DESC`).all(...params));
});

app.post('/api/seo-reports', (req, res) => {
  const { month, year, organic_traffic, total_keywords, top10_keywords, domain_authority, backlinks, top_pages, notes } = req.body;
  const existing = db.prepare('SELECT id FROM seo_reports WHERE month=? AND year=?').get(month, year);
  if (existing) {
    db.prepare(`UPDATE seo_reports SET organic_traffic=?,total_keywords=?,top10_keywords=?,domain_authority=?,backlinks=?,top_pages=?,notes=? WHERE id=?`).run(organic_traffic||0,total_keywords||0,top10_keywords||0,domain_authority||0,backlinks||0,JSON.stringify(top_pages||[]),notes||'',existing.id);
    res.json(db.prepare('SELECT * FROM seo_reports WHERE id=?').get(existing.id));
  } else {
    const r = db.prepare(`INSERT INTO seo_reports (month,year,organic_traffic,total_keywords,top10_keywords,domain_authority,backlinks,top_pages,notes) VALUES (?,?,?,?,?,?,?,?,?)`).run(month,year,organic_traffic||0,total_keywords||0,top10_keywords||0,domain_authority||0,backlinks||0,JSON.stringify(top_pages||[]),notes||'');
    res.json(db.prepare('SELECT * FROM seo_reports WHERE id=?').get(r.lastInsertRowid));
  }
});

app.delete('/api/seo-reports/:id', (req, res) => {
  db.prepare('DELETE FROM seo_reports WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── TASKS ───────────────────────────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const conditions = [];
  if (req.query.status) { conditions.push('status = ?'); params.push(req.query.status); }
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (year) { conditions.push('year = ?'); params.push(year); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(db.prepare(`SELECT * FROM tasks${where} ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, due_date ASC`).all(...params));
});

app.post('/api/tasks', (req, res) => {
  const { title, category, assignee, due_date, completed_date, status, priority, month, year, notes } = req.body;
  const r = db.prepare(`INSERT INTO tasks (title,category,assignee,due_date,completed_date,status,priority,month,year,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(title,category||'General',assignee||'',due_date||'',completed_date||'',status||'pending',priority||'medium',month,year,notes||'');
  res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, category, assignee, due_date, completed_date, status, priority, month, year, notes } = req.body;
  db.prepare(`UPDATE tasks SET title=?,category=?,assignee=?,due_date=?,completed_date=?,status=?,priority=?,month=?,year=?,notes=? WHERE id=?`).run(title,category||'General',assignee||'',due_date||'',completed_date||'',status||'pending',priority||'medium',month,year,notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id));
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── OTHER ACTIVITIES ────────────────────────────────────────────────────────
app.get('/api/other-activities', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const sql = addFilters('SELECT * FROM other_activities ORDER BY activity_date DESC', params, { month, year });
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/other-activities', (req, res) => {
  const { title, activity_type, activity_date, month, year, description, result, notes } = req.body;
  const r = db.prepare(`INSERT INTO other_activities (title,activity_type,activity_date,month,year,description,result,notes) VALUES (?,?,?,?,?,?,?,?)`).run(title,activity_type||'Other',activity_date||'',month,year,description||'',result||'',notes||'');
  res.json(db.prepare('SELECT * FROM other_activities WHERE id=?').get(r.lastInsertRowid));
});

app.put('/api/other-activities/:id', (req, res) => {
  const { title, activity_type, activity_date, month, year, description, result, notes } = req.body;
  db.prepare(`UPDATE other_activities SET title=?,activity_type=?,activity_date=?,month=?,year=?,description=?,result=?,notes=? WHERE id=?`).run(title,activity_type||'Other',activity_date||'',month,year,description||'',result||'',notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM other_activities WHERE id=?').get(req.params.id));
});

app.delete('/api/other-activities/:id', (req, res) => {
  db.prepare('DELETE FROM other_activities WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─── MONTHLY REPORTS ─────────────────────────────────────────────────────────
app.get('/api/monthly-reports', (req, res) => {
  const year = req.query.year ? parseInt(req.query.year) : null;
  if (year) {
    res.json(db.prepare('SELECT * FROM monthly_reports WHERE year=? ORDER BY month ASC').all(year));
  } else {
    res.json(db.prepare('SELECT * FROM monthly_reports ORDER BY year DESC, month DESC').all());
  }
});

app.get('/api/monthly-reports/:year/:month', (req, res) => {
  const report = db.prepare('SELECT * FROM monthly_reports WHERE year=? AND month=?').get(req.params.year, req.params.month);
  if (!report) return res.json(null);
  res.json({ ...report, highlights: JSON.parse(report.highlights || '[]') });
});

app.post('/api/monthly-reports', (req, res) => {
  const { month, year, title, highlights, summary, is_finalized } = req.body;
  const existing = db.prepare('SELECT id FROM monthly_reports WHERE month=? AND year=?').get(month, year);
  const hlJson = JSON.stringify(highlights || []);
  if (existing) {
    db.prepare(`UPDATE monthly_reports SET title=?,highlights=?,summary=?,is_finalized=?,updated_at=datetime('now') WHERE id=?`).run(title||'',hlJson,summary||'',is_finalized?1:0,existing.id);
    const r = db.prepare('SELECT * FROM monthly_reports WHERE id=?').get(existing.id);
    res.json({ ...r, highlights: JSON.parse(r.highlights || '[]') });
  } else {
    const r2 = db.prepare(`INSERT INTO monthly_reports (month,year,title,highlights,summary,is_finalized) VALUES (?,?,?,?,?,?)`).run(month,year,title||'',hlJson,summary||'',is_finalized?1:0);
    const r = db.prepare('SELECT * FROM monthly_reports WHERE id=?').get(r2.lastInsertRowid);
    res.json({ ...r, highlights: JSON.parse(r.highlights || '[]') });
  }
});

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const { month, year } = monthYear(req);
  const params = [];
  const conditions = [];
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (year) { conditions.push('year = ?'); params.push(year); }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

  const blogCount = db.prepare(`SELECT COUNT(*) as c FROM blog_posts${where}`).get(...params).c;
  const blogViews = db.prepare(`SELECT COALESCE(SUM(views),0) as s FROM blog_posts${where}`).get(...params).s;
  const blogTraffic = db.prepare(`SELECT COALESCE(SUM(organic_traffic),0) as s FROM blog_posts${where}`).get(...params).s;

  const socialCounts = db.prepare(`SELECT platform, COUNT(*) as c FROM social_posts${where} GROUP BY platform`).all(...params);
  const socialTotal = db.prepare(`SELECT COUNT(*) as c FROM social_posts${where}`).get(...params).c;
  const socialImpressions = db.prepare(`SELECT COALESCE(SUM(impressions),0) as s FROM social_posts${where}`).get(...params).s;
  const socialEngagement = db.prepare(`SELECT COALESCE(SUM(engagement),0) as s FROM social_posts${where}`).get(...params).s;

  const lpNew = db.prepare(`SELECT COUNT(*) as c FROM landing_pages${where ? where + ' AND' : ' WHERE'} page_type='new'`).get(...params).c;
  const lpUpdated = db.prepare(`SELECT COUNT(*) as c FROM landing_pages${where ? where + ' AND' : ' WHERE'} page_type='updated'`).get(...params).c;

  const emailCount = db.prepare(`SELECT COUNT(*) as c FROM email_campaigns${where}`).get(...params).c;
  const emailRecipients = db.prepare(`SELECT COALESCE(SUM(recipients),0) as s FROM email_campaigns${where}`).get(...params).s;

  const videoCount = db.prepare(`SELECT COUNT(*) as c FROM videos${where}`).get(...params).c;
  const videoViews = db.prepare(`SELECT COALESCE(SUM(views),0) as s FROM videos${where}`).get(...params).s;

  const taskTotal = db.prepare(`SELECT COUNT(*) as c FROM tasks${where}`).get(...params).c;
  const taskDone = db.prepare(`SELECT COUNT(*) as c FROM tasks${where ? where + ' AND' : ' WHERE'} status='completed'`).get(...params).c;

  const seoData = (month && year) ? db.prepare('SELECT * FROM seo_reports WHERE month=? AND year=?').get(month, year) : null;

  // Monthly trend for the year (last 12 months)
  const trendYear = year || new Date().getFullYear();
  const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const bp = db.prepare('SELECT COUNT(*) as c FROM blog_posts WHERE month=? AND year=?').get(m, trendYear).c;
    const sp = db.prepare('SELECT COUNT(*) as c FROM social_posts WHERE month=? AND year=?').get(m, trendYear).c;
    const em = db.prepare('SELECT COUNT(*) as c FROM email_campaigns WHERE month=? AND year=?').get(m, trendYear).c;
    const vi = db.prepare('SELECT COUNT(*) as c FROM videos WHERE month=? AND year=?').get(m, trendYear).c;
    return { month: m, blogs: bp, social: sp, emails: em, videos: vi };
  });

  res.json({
    blog: { count: blogCount, views: blogViews, organic_traffic: blogTraffic },
    social: { total: socialTotal, by_platform: socialCounts, impressions: socialImpressions, engagement: socialEngagement },
    landing_pages: { new: lpNew, updated: lpUpdated, total: lpNew + lpUpdated },
    email: { count: emailCount, recipients: emailRecipients },
    video: { count: videoCount, views: videoViews },
    tasks: { total: taskTotal, completed: taskDone, completion_rate: taskTotal ? Math.round(taskDone/taskTotal*100) : 0 },
    seo: seoData,
    monthly_trend: monthlyTrend
  });
});

// ─── YEARLY SUMMARY ───────────────────────────────────────────────────────────
app.get('/api/yearly-summary/:year', (req, res) => {
  const year = parseInt(req.params.year);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const summary = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return {
      month: m,
      month_name: monthNames[i],
      blogs: db.prepare('SELECT COUNT(*) as c FROM blog_posts WHERE month=? AND year=?').get(m, year).c,
      blog_views: db.prepare('SELECT COALESCE(SUM(views),0) as s FROM blog_posts WHERE month=? AND year=?').get(m, year).s,
      social_posts: db.prepare('SELECT COUNT(*) as c FROM social_posts WHERE month=? AND year=?').get(m, year).c,
      social_impressions: db.prepare('SELECT COALESCE(SUM(impressions),0) as s FROM social_posts WHERE month=? AND year=?').get(m, year).s,
      landing_pages: db.prepare('SELECT COUNT(*) as c FROM landing_pages WHERE month=? AND year=?').get(m, year).c,
      emails: db.prepare('SELECT COUNT(*) as c FROM email_campaigns WHERE month=? AND year=?').get(m, year).c,
      email_recipients: db.prepare('SELECT COALESCE(SUM(recipients),0) as s FROM email_campaigns WHERE month=? AND year=?').get(m, year).s,
      videos: db.prepare('SELECT COUNT(*) as c FROM videos WHERE month=? AND year=?').get(m, year).c,
      video_views: db.prepare('SELECT COALESCE(SUM(views),0) as s FROM videos WHERE month=? AND year=?').get(m, year).s,
      tasks_total: db.prepare('SELECT COUNT(*) as c FROM tasks WHERE month=? AND year=?').get(m, year).c,
      tasks_completed: db.prepare("SELECT COUNT(*) as c FROM tasks WHERE month=? AND year=? AND status='completed'").get(m, year).c,
      seo: db.prepare('SELECT organic_traffic, total_keywords, top10_keywords FROM seo_reports WHERE month=? AND year=?').get(m, year),
      report: db.prepare('SELECT * FROM monthly_reports WHERE month=? AND year=?').get(m, year)
    };
  });

  res.json({
    year,
    totals: {
      blogs: summary.reduce((a, m) => a + m.blogs, 0),
      blog_views: summary.reduce((a, m) => a + m.blog_views, 0),
      social_posts: summary.reduce((a, m) => a + m.social_posts, 0),
      social_impressions: summary.reduce((a, m) => a + m.social_impressions, 0),
      landing_pages: summary.reduce((a, m) => a + m.landing_pages, 0),
      emails: summary.reduce((a, m) => a + m.emails, 0),
      email_recipients: summary.reduce((a, m) => a + m.email_recipients, 0),
      videos: summary.reduce((a, m) => a + m.videos, 0),
      video_views: summary.reduce((a, m) => a + m.video_views, 0),
      tasks_total: summary.reduce((a, m) => a + m.tasks_total, 0),
      tasks_completed: summary.reduce((a, m) => a + m.tasks_completed, 0),
    },
    monthly: summary
  });
});

// ─── SERVE FRONTEND IN PRODUCTION ────────────────────────────────────────────
const frontendBuild = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

initDb()
  .then(initializedDb => {
    db = initializedDb;
    console.log('Database initialized successfully');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('STARTUP ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  });

// Phusion Passenger compatibility (used by cPanel/xCloud)
module.exports = app;
