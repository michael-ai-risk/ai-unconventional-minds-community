CREATE UNIQUE INDEX IF NOT EXISTS event_interest_user_unique
  ON event_interest(event_id, user_id)
  WHERE user_id IS NOT NULL;
