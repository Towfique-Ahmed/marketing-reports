const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'marketing.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT,
    publish_date TEXT,
    month INTEGER,
    year INTEGER,
    views INTEGER DEFAULT 0,
    organic_traffic INTEGER DEFAULT 0,
    backlinks INTEGER DEFAULT 0,
    keywords_targeted INTEGER DEFAULT 0,
    keywords_top10 INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    avg_time_on_page TEXT DEFAULT '0:00',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS social_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    title TEXT,
    post_url TEXT,
    post_date TEXT,
    month INTEGER,
    year INTEGER,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS landing_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    page_url TEXT,
    page_type TEXT DEFAULT 'new',
    publish_date TEXT,
    month INTEGER,
    year INTEGER,
    sessions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate REAL DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    avg_session_duration TEXT DEFAULT '0:00',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS email_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    subject TEXT,
    send_date TEXT,
    month INTEGER,
    year INTEGER,
    recipients INTEGER DEFAULT 0,
    delivered INTEGER DEFAULT 0,
    opens INTEGER DEFAULT 0,
    open_rate REAL DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    click_rate REAL DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    platform TEXT DEFAULT 'YouTube',
    video_url TEXT,
    publish_date TEXT,
    month INTEGER,
    year INTEGER,
    views INTEGER DEFAULT 0,
    watch_time_hours REAL DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS seo_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    organic_traffic INTEGER DEFAULT 0,
    total_keywords INTEGER DEFAULT 0,
    top10_keywords INTEGER DEFAULT 0,
    domain_authority INTEGER DEFAULT 0,
    backlinks INTEGER DEFAULT 0,
    top_pages TEXT DEFAULT '[]',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(month, year)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    assignee TEXT,
    due_date TEXT,
    completed_date TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    month INTEGER,
    year INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS other_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    activity_type TEXT DEFAULT 'Other',
    activity_date TEXT,
    month INTEGER,
    year INTEGER,
    description TEXT,
    result TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS monthly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    title TEXT,
    highlights TEXT DEFAULT '[]',
    summary TEXT,
    is_finalized INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(month, year)
  );
`);

module.exports = db;
