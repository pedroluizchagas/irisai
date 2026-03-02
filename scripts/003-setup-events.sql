CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location VARCHAR(255),
  recurrence VARCHAR(100),
  reminder_minutes INTEGER DEFAULT 15,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_events_tenant_user ON events(tenant_id, user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_events_start ON events(tenant_id, start_time);
COMMIT;
