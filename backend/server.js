const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initDb = require('./db');

const app = express();
let db;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', db: !!db }));

app.use('/api', (req, res, next) => {
  if (!db) return res.status(503).json({ error: 'Server starting, please retry' });
  next();
});

// ─── HELPERS ────────────────────────────────────────────────────────────────
function mf(req) {
  return {
    month: req.query.month ? parseInt(req.query.month) : null,
    year: req.query.year ? parseInt(req.query.year) : null,
  };
}

function withFilters(sql, params, { month, year }) {
  const conds = [];
  if (month) { conds.push('month = ?'); params.push(month); }
  if (year) { conds.push('year = ?'); params.push(year); }
  return conds.length ? sql + ' WHERE ' + conds.join(' AND ') : sql;
}

function makeCrud(table, insertFn, updateFn, orderBy = 'id DESC') {
  const url = table.replace(/_/g, '-');
  app.get(`/api/${url}`, (req, res) => {
    const { month, year } = mf(req);
    const params = [];
    res.json(db.prepare(withFilters(`SELECT * FROM ${table} ORDER BY ${orderBy}`, params, { month, year })).all(...params));
  });

  app.delete(`/api/${url}/:id`, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id=?`).run(req.params.id);
    res.json({ ok: true });
  });

  app.post(`/api/${url}/bulk`, (req, res) => {
    const rows = Array.isArray(req.body) ? req.body : [];
    let count = 0;
    for (const row of rows) {
      try { insertFn(row); count++; } catch(e) { /* skip bad rows */ }
    }
    res.json({ inserted: count });
  });
}

// ─── BLOG POSTS ─────────────────────────────────────────────────────────────
function insertBlog(b) {
  return db.prepare(`INSERT INTO blog_posts (title,url,publish_date,month,year,views,rank,ai_overview,keywords,notes) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .run(b.title,b.url||'',b.publish_date||'',b.month||null,b.year||null,b.views||0,b.rank||0,b.ai_overview||'',b.keywords||'',b.notes||'');
}
makeCrud('blog_posts', insertBlog, null, 'publish_date DESC');
app.post('/api/blog-posts', (req, res) => {
  const r = insertBlog(req.body);
  res.json(db.prepare('SELECT * FROM blog_posts WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/blog-posts/:id', (req, res) => {
  const b = req.body;
  db.prepare(`UPDATE blog_posts SET title=?,url=?,publish_date=?,month=?,year=?,views=?,rank=?,ai_overview=?,keywords=?,notes=? WHERE id=?`)
    .run(b.title,b.url||'',b.publish_date||'',b.month||null,b.year||null,b.views||0,b.rank||0,b.ai_overview||'',b.keywords||'',b.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM blog_posts WHERE id=?').get(req.params.id));
});

// ─── DOCUMENTATIONS ──────────────────────────────────────────────────────────
function insertDoc(d) {
  return db.prepare(`INSERT INTO documentations (title,url,publish_date,month,year,notes) VALUES (?,?,?,?,?,?)`)
    .run(d.title,d.url||'',d.publish_date||'',d.month||null,d.year||null,d.notes||'');
}
makeCrud('documentations', insertDoc, null, 'publish_date DESC');
app.post('/api/documentations', (req, res) => {
  const r = insertDoc(req.body);
  res.json(db.prepare('SELECT * FROM documentations WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/documentations/:id', (req, res) => {
  const d = req.body;
  db.prepare(`UPDATE documentations SET title=?,url=?,publish_date=?,month=?,year=?,notes=? WHERE id=?`)
    .run(d.title,d.url||'',d.publish_date||'',d.month||null,d.year||null,d.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM documentations WHERE id=?').get(req.params.id));
});

// ─── SOCIAL POSTS ────────────────────────────────────────────────────────────
function insertSocial(s) {
  return db.prepare(`INSERT INTO social_posts (title,post_date,month,year,fb_url,linkedin_url,twitter_url,notes) VALUES (?,?,?,?,?,?,?,?)`)
    .run(s.title,s.post_date||'',s.month||null,s.year||null,s.fb_url||'',s.linkedin_url||'',s.twitter_url||'',s.notes||'');
}
makeCrud('social_posts', insertSocial, null, 'post_date DESC');
app.post('/api/social-posts', (req, res) => {
  const r = insertSocial(req.body);
  res.json(db.prepare('SELECT * FROM social_posts WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/social-posts/:id', (req, res) => {
  const s = req.body;
  db.prepare(`UPDATE social_posts SET title=?,post_date=?,month=?,year=?,fb_url=?,linkedin_url=?,twitter_url=?,notes=? WHERE id=?`)
    .run(s.title,s.post_date||'',s.month||null,s.year||null,s.fb_url||'',s.linkedin_url||'',s.twitter_url||'',s.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM social_posts WHERE id=?').get(req.params.id));
});

// ─── COMMUNITY POSTS ─────────────────────────────────────────────────────────
function insertCommunity(c) {
  return db.prepare(`INSERT INTO community_posts (title,post_date,month,year,url,notes) VALUES (?,?,?,?,?,?)`)
    .run(c.title,c.post_date||'',c.month||null,c.year||null,c.url||'',c.notes||'');
}
makeCrud('community_posts', insertCommunity, null, 'post_date DESC');
app.post('/api/community-posts', (req, res) => {
  const r = insertCommunity(req.body);
  res.json(db.prepare('SELECT * FROM community_posts WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/community-posts/:id', (req, res) => {
  const c = req.body;
  db.prepare(`UPDATE community_posts SET title=?,post_date=?,month=?,year=?,url=?,notes=? WHERE id=?`)
    .run(c.title,c.post_date||'',c.month||null,c.year||null,c.url||'',c.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM community_posts WHERE id=?').get(req.params.id));
});

// ─── EMAIL CAMPAIGNS ─────────────────────────────────────────────────────────
function insertEmail(e) {
  return db.prepare(`INSERT INTO email_campaigns (campaign_name,send_date,month,year,recipients,open_rate,click_rate,notes) VALUES (?,?,?,?,?,?,?,?)`)
    .run(e.campaign_name,e.send_date||'',e.month||null,e.year||null,e.recipients||0,e.open_rate||0,e.click_rate||0,e.notes||'');
}
makeCrud('email_campaigns', insertEmail, null, 'send_date DESC');
app.post('/api/email-campaigns', (req, res) => {
  const r = insertEmail(req.body);
  res.json(db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/email-campaigns/:id', (req, res) => {
  const e = req.body;
  db.prepare(`UPDATE email_campaigns SET campaign_name=?,send_date=?,month=?,year=?,recipients=?,open_rate=?,click_rate=?,notes=? WHERE id=?`)
    .run(e.campaign_name,e.send_date||'',e.month||null,e.year||null,e.recipients||0,e.open_rate||0,e.click_rate||0,e.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(req.params.id));
});

// ─── VIDEOS ──────────────────────────────────────────────────────────────────
function insertVideo(v) {
  return db.prepare(`INSERT INTO videos (title,platform,video_url,publish_date,month,year,views,watch_time_hours,likes,comments,shares,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(v.title,v.platform||'YouTube',v.video_url||'',v.publish_date||'',v.month||null,v.year||null,v.views||0,v.watch_time_hours||0,v.likes||0,v.comments||0,v.shares||0,v.notes||'');
}
makeCrud('videos', insertVideo, null, 'publish_date DESC');
app.post('/api/videos', (req, res) => {
  const r = insertVideo(req.body);
  res.json(db.prepare('SELECT * FROM videos WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/videos/:id', (req, res) => {
  const v = req.body;
  db.prepare(`UPDATE videos SET title=?,platform=?,video_url=?,publish_date=?,month=?,year=?,views=?,watch_time_hours=?,likes=?,comments=?,shares=?,notes=? WHERE id=?`)
    .run(v.title,v.platform||'YouTube',v.video_url||'',v.publish_date||'',v.month||null,v.year||null,v.views||0,v.watch_time_hours||0,v.likes||0,v.comments||0,v.shares||0,v.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM videos WHERE id=?').get(req.params.id));
});

// ─── LANDING PAGES ────────────────────────────────────────────────────────────
function insertLanding(l) {
  return db.prepare(`INSERT INTO landing_pages (title,page_url,page_type,publish_date,month,year,sessions,conversions,conversion_rate,bounce_rate,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(l.title,l.page_url||'',l.page_type||'new',l.publish_date||'',l.month||null,l.year||null,l.sessions||0,l.conversions||0,l.conversion_rate||0,l.bounce_rate||0,l.notes||'');
}
makeCrud('landing_pages', insertLanding, null, 'publish_date DESC');
app.post('/api/landing-pages', (req, res) => {
  const r = insertLanding(req.body);
  res.json(db.prepare('SELECT * FROM landing_pages WHERE id=?').get(r.lastInsertRowid));
});
app.put('/api/landing-pages/:id', (req, res) => {
  const l = req.body;
  db.prepare(`UPDATE landing_pages SET title=?,page_url=?,page_type=?,publish_date=?,month=?,year=?,sessions=?,conversions=?,conversion_rate=?,bounce_rate=?,notes=? WHERE id=?`)
    .run(l.title,l.page_url||'',l.page_type||'new',l.publish_date||'',l.month||null,l.year||null,l.sessions||0,l.conversions||0,l.conversion_rate||0,l.bounce_rate||0,l.notes||'',req.params.id);
  res.json(db.prepare('SELECT * FROM landing_pages WHERE id=?').get(req.params.id));
});

// ─── MONTHLY OVERVIEW (upsert) ────────────────────────────────────────────────
app.get('/api/monthly-overview', (req, res) => {
  const { month, year } = mf(req);
  if (month && year) {
    const row = db.prepare('SELECT * FROM monthly_overview WHERE month=? AND year=?').get(month, year);
    return res.json(row || { month, year });
  }
  res.json(db.prepare('SELECT * FROM monthly_overview ORDER BY year DESC, month DESC').all());
});

app.post('/api/monthly-overview', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT id FROM monthly_overview WHERE month=? AND year=?').get(d.month, d.year);
  if (existing) {
    db.prepare(`UPDATE monthly_overview SET
      active_users=?,new_users=?,total_clicks=?,total_impressions=?,avg_ctr=?,avg_position=?,
      yt_views=?,yt_watch_time=?,yt_subscribers=?,
      community_prev=?,community_new=?,community_total=?,
      li_impressions=?,li_reactions=?,li_comments=?,li_reposts=?,li_page_views=?,
      li_unique_visitors=?,li_button_clicks=?,li_followers=?,li_search_appearance=?,
      fb_visits=?,fb_views=?,fb_reach=?,fb_interactions=?,fb_link_clicks=?,fb_follows=?,
      tw_impressions=?,tw_engagement_rate=?,tw_engagements=?,tw_profile_visits=?,
      tw_replies=?,tw_likes=?,tw_reposts=?,tw_bookmarks=?,tw_shares=?,
      notes=?,updated_at=datetime('now') WHERE month=? AND year=?`)
      .run(
        d.active_users||0,d.new_users||0,d.total_clicks||0,d.total_impressions||0,d.avg_ctr||0,d.avg_position||0,
        d.yt_views||0,d.yt_watch_time||0,d.yt_subscribers||0,
        d.community_prev||0,d.community_new||0,d.community_total||0,
        d.li_impressions||0,d.li_reactions||0,d.li_comments||0,d.li_reposts||0,d.li_page_views||0,
        d.li_unique_visitors||0,d.li_button_clicks||0,d.li_followers||0,d.li_search_appearance||0,
        d.fb_visits||0,d.fb_views||0,d.fb_reach||0,d.fb_interactions||0,d.fb_link_clicks||0,d.fb_follows||0,
        d.tw_impressions||0,d.tw_engagement_rate||0,d.tw_engagements||0,d.tw_profile_visits||0,
        d.tw_replies||0,d.tw_likes||0,d.tw_reposts||0,d.tw_bookmarks||0,d.tw_shares||0,
        d.notes||'',d.month,d.year
      );
  } else {
    db.prepare(`INSERT INTO monthly_overview (month,year,
      active_users,new_users,total_clicks,total_impressions,avg_ctr,avg_position,
      yt_views,yt_watch_time,yt_subscribers,
      community_prev,community_new,community_total,
      li_impressions,li_reactions,li_comments,li_reposts,li_page_views,
      li_unique_visitors,li_button_clicks,li_followers,li_search_appearance,
      fb_visits,fb_views,fb_reach,fb_interactions,fb_link_clicks,fb_follows,
      tw_impressions,tw_engagement_rate,tw_engagements,tw_profile_visits,
      tw_replies,tw_likes,tw_reposts,tw_bookmarks,tw_shares,notes) VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(
        d.month,d.year,
        d.active_users||0,d.new_users||0,d.total_clicks||0,d.total_impressions||0,d.avg_ctr||0,d.avg_position||0,
        d.yt_views||0,d.yt_watch_time||0,d.yt_subscribers||0,
        d.community_prev||0,d.community_new||0,d.community_total||0,
        d.li_impressions||0,d.li_reactions||0,d.li_comments||0,d.li_reposts||0,d.li_page_views||0,
        d.li_unique_visitors||0,d.li_button_clicks||0,d.li_followers||0,d.li_search_appearance||0,
        d.fb_visits||0,d.fb_views||0,d.fb_reach||0,d.fb_interactions||0,d.fb_link_clicks||0,d.fb_follows||0,
        d.tw_impressions||0,d.tw_engagement_rate||0,d.tw_engagements||0,d.tw_profile_visits||0,
        d.tw_replies||0,d.tw_likes||0,d.tw_reposts||0,d.tw_bookmarks||0,d.tw_shares||0,
        d.notes||''
      );
  }
  res.json(db.prepare('SELECT * FROM monthly_overview WHERE month=? AND year=?').get(d.month, d.year));
});

// ─── APP SETTINGS ─────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    db.prepare(`INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`).run(key, String(value));
  }
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const now = new Date();
  const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

  const count = (table, extraWhere = '') => {
    const where = `WHERE month=? AND year=?${extraWhere ? ' AND ' + extraWhere : ''}`;
    return db.prepare(`SELECT COUNT(*) as c FROM ${table} ${where}`).get(month, year)?.c || 0;
  };

  const emailStats = db.prepare(`SELECT COUNT(*) as count, COALESCE(AVG(open_rate),0) as avg_open, COALESCE(AVG(click_rate),0) as avg_click, COALESCE(SUM(recipients),0) as total_recipients FROM email_campaigns WHERE month=? AND year=?`).get(month, year);
  const socialWithFb = db.prepare(`SELECT COUNT(*) as c FROM social_posts WHERE month=? AND year=? AND fb_url != ''`).get(month, year)?.c || 0;
  const socialWithLi = db.prepare(`SELECT COUNT(*) as c FROM social_posts WHERE month=? AND year=? AND linkedin_url != ''`).get(month, year)?.c || 0;
  const socialWithTw = db.prepare(`SELECT COUNT(*) as c FROM social_posts WHERE month=? AND year=? AND twitter_url != ''`).get(month, year)?.c || 0;
  const overview = db.prepare('SELECT * FROM monthly_overview WHERE month=? AND year=?').get(month, year);

  res.json({
    month, year,
    blogs: count('blog_posts'),
    documentations: count('documentations'),
    social_posts: count('social_posts'),
    community_posts: count('community_posts'),
    emails: count('email_campaigns'),
    videos: count('videos'),
    landing_pages: count('landing_pages'),
    email_avg_open: emailStats?.avg_open || 0,
    email_avg_click: emailStats?.avg_click || 0,
    email_total_recipients: emailStats?.total_recipients || 0,
    social_fb: socialWithFb,
    social_li: socialWithLi,
    social_tw: socialWithTw,
    overview: overview || null,
  });
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
app.get('/api/analytics/:year', (req, res) => {
  const year = parseInt(req.params.year);
  const months = [1,2,3,4,5,6,7,8,9,10,11,12];

  const content = months.map(m => ({
    month: m,
    blogs: db.prepare('SELECT COUNT(*) as c FROM blog_posts WHERE month=? AND year=?').get(m, year)?.c || 0,
    docs: db.prepare('SELECT COUNT(*) as c FROM documentations WHERE month=? AND year=?').get(m, year)?.c || 0,
    social: db.prepare('SELECT COUNT(*) as c FROM social_posts WHERE month=? AND year=?').get(m, year)?.c || 0,
    community: db.prepare('SELECT COUNT(*) as c FROM community_posts WHERE month=? AND year=?').get(m, year)?.c || 0,
    emails: db.prepare('SELECT COUNT(*) as c FROM email_campaigns WHERE month=? AND year=?').get(m, year)?.c || 0,
    videos: db.prepare('SELECT COUNT(*) as c FROM videos WHERE month=? AND year=?').get(m, year)?.c || 0,
    landing_pages: db.prepare('SELECT COUNT(*) as c FROM landing_pages WHERE month=? AND year=?').get(m, year)?.c || 0,
  }));

  const emails = months.map(m => {
    const r = db.prepare('SELECT COUNT(*) as count, COALESCE(AVG(open_rate),0) as avg_open, COALESCE(AVG(click_rate),0) as avg_click, COALESCE(SUM(recipients),0) as total_recipients FROM email_campaigns WHERE month=? AND year=?').get(m, year);
    return { month: m, count: r?.count||0, avg_open: r?.avg_open||0, avg_click: r?.avg_click||0, total_recipients: r?.total_recipients||0 };
  });

  const overview = months.map(m => {
    const r = db.prepare('SELECT * FROM monthly_overview WHERE month=? AND year=?').get(m, year);
    return r || { month: m, year };
  });

  res.json({ year, content, emails, overview });
});

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────
const frontendBuild = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => res.sendFile(path.join(frontendBuild, 'index.html')));
}

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const runningDirectly = require.main === module;

initDb()
  .then(initializedDb => {
    db = initializedDb;
    console.log('Database initialized successfully');
    if (runningDirectly) app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('STARTUP ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  });

module.exports = app;
