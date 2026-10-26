-- New posts and replies publish immediately after Google sign-in.
-- Preserve previously pending content as hidden rather than exposing it during
-- the transition away from pre-publication review.
UPDATE posts
SET status=CASE WHEN status='pending' THEN 'hidden' ELSE status END,
    owner_token_hash=NULL,
    updated_at=CURRENT_TIMESTAMP
WHERE status='pending' OR owner_token_hash IS NOT NULL;
UPDATE comments
SET status=CASE WHEN status='pending' THEN 'hidden' ELSE status END,
    owner_token_hash=NULL,
    updated_at=CURRENT_TIMESTAMP
WHERE status='pending' OR owner_token_hash IS NOT NULL;
