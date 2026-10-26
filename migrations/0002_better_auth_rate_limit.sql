-- Better Auth database-backed request rate limit storage.
CREATE TABLE IF NOT EXISTS rateLimit (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL,
  lastRequest INTEGER NOT NULL
);
