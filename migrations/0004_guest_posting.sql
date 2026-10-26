-- Remove account requirements from public discussions while preserving the
-- historical Better Auth data and its staff-role checks.
ALTER TABLE posts ADD COLUMN author_name TEXT NOT NULL DEFAULT '访客 / Guest';
ALTER TABLE posts ADD COLUMN owner_token_hash TEXT;
ALTER TABLE comments ADD COLUMN author_name TEXT NOT NULL DEFAULT '访客 / Guest';
ALTER TABLE comments ADD COLUMN owner_token_hash TEXT;
ALTER TABLE reports ADD COLUMN reporter_fingerprint TEXT;

UPDATE posts
SET author_name = COALESCE(
  (SELECT CASE WHEN p.visibility = 'private' THEN '社区成员' ELSE p.display_name END
   FROM profiles p WHERE p.user_id = posts.author_id),
  (SELECT u.name FROM "user" u WHERE u.id = posts.author_id),
  '访客 / Guest'
);
UPDATE comments
SET author_name = COALESCE(
  (SELECT CASE WHEN p.visibility = 'private' THEN '社区成员' ELSE p.display_name END
   FROM profiles p WHERE p.user_id = comments.author_id),
  (SELECT u.name FROM "user" u WHERE u.id = comments.author_id),
  '访客 / Guest'
);

-- A non-login service identity satisfies the existing foreign keys. It is not
-- an account, has no password/session, and is never returned as a profile.
INSERT OR IGNORE INTO "user" (id,name,email,emailVerified,createdAt,updatedAt)
VALUES ('community-guest','Guest','guest@anonymous.invalid',0,
  CAST(strftime('%s','now') AS INTEGER),CAST(strftime('%s','now') AS INTEGER));

CREATE INDEX IF NOT EXISTS posts_owner_token_idx ON posts(owner_token_hash);
CREATE INDEX IF NOT EXISTS comments_owner_token_idx ON comments(owner_token_hash);
CREATE INDEX IF NOT EXISTS reports_fingerprint_idx ON reports(reporter_fingerprint,status);

CREATE TABLE IF NOT EXISTS admin_bootstrap_lock (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
