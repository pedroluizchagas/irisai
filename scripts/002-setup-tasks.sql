CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo',
  priority VARCHAR(10) DEFAULT 'medium',
  due_date TIMESTAMP,
  tags TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_tasks_tenant_user ON tasks(tenant_id, user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_tasks_status ON tasks(tenant_id, status);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_tasks_due_date ON tasks(tenant_id, due_date);
COMMIT;
