CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  target_value DECIMAL(12,2),
  current_value INTEGER DEFAULT 0,
  unit VARCHAR(50),
  deadline TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_goals_tenant_user ON goals(tenant_id, user_id);
COMMIT;

CREATE TABLE IF NOT EXISTS habits (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_habits_tenant_user ON habits(tenant_id, user_id);
COMMIT;

CREATE TABLE IF NOT EXISTS habit_logs (
  id VARCHAR(21) PRIMARY KEY,
  habit_id VARCHAR(21) NOT NULL,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  completed_at TIMESTAMP DEFAULT now(),
  note TEXT
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
COMMIT;
