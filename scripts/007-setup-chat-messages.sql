CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_chat_tenant_user ON chat_messages(tenant_id, user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_chat_created ON chat_messages(tenant_id, created_at);
COMMIT;
