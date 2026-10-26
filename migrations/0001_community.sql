-- D1 community database for Better Auth + public community content.
-- The historical drizzle/migrations/*.sql files are Supabase/PostgreSQL migrations;
-- they are retained for audit and must never be applied to this SQLite/D1 database.

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY NOT NULL,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_userId_idx ON "session"(userId);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS account_userId_idx ON "account"(userId);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON "verification"(identifier);

-- Roles are assigned only through a trusted D1 migration/administrative action.
-- There is intentionally no public "claim first admin" endpoint or seeded admin.
CREATE TABLE IF NOT EXISTS roles (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'member')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 1 AND 60),
  avatar_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1))
);
INSERT OR IGNORE INTO categories (slug,title_zh,title_en,sort_order) VALUES
  ('general','随便聊聊','General',1),
  ('learning','学习AI','Learning AI',2),
  ('tools','工具体验','Tool experiences',3),
  ('work-life','工作与生活','Work and life',4),
  ('chiangmai','清迈生活','Chiang Mai life',5),
  ('opportunities','项目与机会','Projects and opportunities',6);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY NOT NULL,
  author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL REFERENCES categories(slug),
  title TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 160),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 8000),
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden','pending')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS posts_public_feed_idx ON posts(status,category_slug,created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id,created_at DESC);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden','pending')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS comments_post_idx ON comments(post_id,status,created_at);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  summary_zh TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '',
  body_zh TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'tba' CHECK (status IN ('tba','scheduled','past','cancelled')),
  starts_at TEXT,
  ends_at TEXT,
  venue_zh TEXT,
  venue_en TEXT,
  language_zh TEXT NOT NULL DEFAULT '中文交流为主，可提供英文辅助',
  language_en TEXT NOT NULL DEFAULT 'Mainly Chinese, with English support',
  is_free INTEGER NOT NULL DEFAULT 1 CHECK (is_free IN (0,1)),
  recap_zh TEXT,
  recap_en TEXT,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  created_by TEXT REFERENCES "user"(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_zh TEXT NOT NULL DEFAULT '',
  excerpt_en TEXT NOT NULL DEFAULT '',
  body_zh TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  category_slug TEXT NOT NULL DEFAULT 'learning',
  kind TEXT NOT NULL DEFAULT 'editorial' CHECK (kind IN ('editorial','member_post','recap')),
  source_links_json TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  published_at TEXT,
  created_by TEXT REFERENCES "user"(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS articles_public_idx ON articles(published,category_slug,published_at DESC);

CREATE TABLE IF NOT EXISTS event_interest (
  id TEXT PRIMARY KEY NOT NULL,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  contact_email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (user_id IS NOT NULL OR contact_email IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY NOT NULL,
  reporter_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post','comment','event','article')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (length(reason) BETWEEN 3 AND 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  resolved_by TEXT REFERENCES "user"(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status,created_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  window_started INTEGER NOT NULL,
  hits INTEGER NOT NULL
);

INSERT OR IGNORE INTO events (
  id,slug,title_zh,title_en,summary_zh,summary_en,body_zh,body_en,status,starts_at,venue_zh,venue_en,is_free,published
) VALUES (
  'event-issue-01','ai-unconventional-minds-first-meetup',
  'AI非正常人类情报站｜第一期免费AI聚会',
  'AI Unconventional Minds Station | First Free AI Meetup',
  '一场轻松的线下聚会：聊聊AI使用经历，以及它对工作和生活带来的真实变化。日期与地点待确认。',
  'A relaxed in-person gathering to talk about real AI experiences and changes to work and everyday life. Date and venue are not confirmed.',
  '欢迎AI初学者、学生、职场人士、程序员、创业者、数字游民、游客，以及任何对AI未来感兴趣的人。无需技术背景，不强制自我介绍或商业合作。',
  'Everyone curious about AI is welcome. No technical background, compulsory introductions, or business goals required.',
  'tba',NULL,NULL,NULL,1,1
);
