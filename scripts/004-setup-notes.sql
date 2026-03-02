CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  tags TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_notes_tenant_user ON notes(tenant_id, user_id);
COMMIT;
