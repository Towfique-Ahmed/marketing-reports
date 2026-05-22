const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'marketing.db');
let sqlDb = null;

function save() {
  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function all(stmt, params) {
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(stmt, params) {
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function run(stmt, params) {
  stmt.bind(params);
  stmt.step();
  stmt.free();
  const rowid = sqlDb.exec('SELECT last_insert_rowid()')[0]?.values[0][0] ?? null;
  save();
  return { lastInsertRowid: rowid };
}

function makeDb(instance) {
  return {
    prepare: (sql) => ({
      all: (...params) => all(instance.prepare(sql), params.flat()),
      get: (...params) => get(instance.prepare(sql), params.flat()),
      run: (...params) => run(instance.prepare(sql), params.flat()),
    }),
    exec: (sql) => { instance.run(sql); save(); },
    pragma: () => {},
  };
}

function createTables(instance) {
  // Schema versioning
  instance.run(`CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)`);
  const vrow = instance.exec(`SELECT value FROM _meta WHERE key='schema_version'`);
  const version = vrow[0]?.values[0]?.[0];
  if (version !== '2') {
    // Drop old tables for clean migration
    for (const t of ['blog_posts','documentations','social_posts','community_posts',
      'email_campaigns','videos','landing_pages','monthly_overview','app_settings',
      'seo_reports','tasks','other_activities','monthly_reports','_meta']) {
      instance.run(`DROP TABLE IF EXISTS ${t}`);
    }
    instance.run(`CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)`);
  }

  instance.run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, url TEXT DEFAULT '', publish_date TEXT DEFAULT '',
      month INTEGER, year INTEGER,
      views INTEGER DEFAULT 0, rank INTEGER DEFAULT 0,
      ai_overview TEXT DEFAULT '', keywords TEXT DEFAULT '',
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS documentations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, url TEXT DEFAULT '', publish_date TEXT DEFAULT '',
      month INTEGER, year INTEGER,
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS social_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, post_date TEXT DEFAULT '', month INTEGER, year INTEGER,
      fb_url TEXT DEFAULT '', linkedin_url TEXT DEFAULT '', twitter_url TEXT DEFAULT '',
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, post_date TEXT DEFAULT '', month INTEGER, year INTEGER,
      url TEXT DEFAULT '', notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS email_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_name TEXT NOT NULL, send_date TEXT DEFAULT '', month INTEGER, year INTEGER,
      recipients INTEGER DEFAULT 0,
      open_rate REAL DEFAULT 0, click_rate REAL DEFAULT 0,
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, platform TEXT DEFAULT 'YouTube',
      video_url TEXT DEFAULT '', publish_date TEXT DEFAULT '',
      month INTEGER, year INTEGER,
      views INTEGER DEFAULT 0, watch_time_hours REAL DEFAULT 0,
      likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, shares INTEGER DEFAULT 0,
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS landing_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, page_url TEXT DEFAULT '', page_type TEXT DEFAULT 'new',
      publish_date TEXT DEFAULT '', month INTEGER, year INTEGER,
      sessions INTEGER DEFAULT 0, conversions INTEGER DEFAULT 0,
      conversion_rate REAL DEFAULT 0, bounce_rate REAL DEFAULT 0,
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS monthly_overview (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL, year INTEGER NOT NULL,
      active_users INTEGER DEFAULT 0, new_users INTEGER DEFAULT 0,
      total_clicks INTEGER DEFAULT 0, total_impressions INTEGER DEFAULT 0,
      avg_ctr REAL DEFAULT 0, avg_position REAL DEFAULT 0,
      yt_views INTEGER DEFAULT 0, yt_watch_time REAL DEFAULT 0, yt_subscribers INTEGER DEFAULT 0,
      community_prev INTEGER DEFAULT 0, community_new INTEGER DEFAULT 0, community_total INTEGER DEFAULT 0,
      li_impressions INTEGER DEFAULT 0, li_reactions INTEGER DEFAULT 0,
      li_comments INTEGER DEFAULT 0, li_reposts INTEGER DEFAULT 0,
      li_page_views INTEGER DEFAULT 0, li_unique_visitors INTEGER DEFAULT 0,
      li_button_clicks INTEGER DEFAULT 0, li_followers INTEGER DEFAULT 0,
      li_search_appearance INTEGER DEFAULT 0,
      fb_visits INTEGER DEFAULT 0, fb_views INTEGER DEFAULT 0,
      fb_reach INTEGER DEFAULT 0, fb_interactions INTEGER DEFAULT 0,
      fb_link_clicks INTEGER DEFAULT 0, fb_follows INTEGER DEFAULT 0,
      tw_impressions INTEGER DEFAULT 0, tw_engagement_rate REAL DEFAULT 0,
      tw_engagements INTEGER DEFAULT 0, tw_profile_visits INTEGER DEFAULT 0,
      tw_replies INTEGER DEFAULT 0, tw_likes INTEGER DEFAULT 0,
      tw_reposts INTEGER DEFAULT 0, tw_bookmarks INTEGER DEFAULT 0, tw_shares INTEGER DEFAULT 0,
      notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(month, year)
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const defaults = [
    ['primary_color', '#3B82F6'], ['sidebar_bg', '#1e293b'],
    ['font_family', 'Inter'], ['theme', 'light'], ['accent_color', '#8B5CF6'],
  ];
  for (const [key, value] of defaults) {
    instance.run(`INSERT OR IGNORE INTO app_settings (key, value) VALUES ('${key}', '${value}')`);
  }
  instance.run(`INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', '2')`);
}

async function init() {
  const initSqlJs = require('sql.js');
  const wasmPath = path.join(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  const SQL = await initSqlJs({ wasmBinary });
  if (fs.existsSync(DB_PATH)) {
    sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    sqlDb = new SQL.Database();
  }
  createTables(sqlDb);
  save();
  return makeDb(sqlDb);
}

module.exports = init;
