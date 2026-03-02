CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(21) PRIMARY KEY,
  tenant_id VARCHAR(21) NOT NULL,
  user_id VARCHAR(21) NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  category VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  date TIMESTAMP NOT NULL DEFAULT now(),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_transactions_tenant_user ON transactions(tenant_id, user_id);
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_transactions_date ON transactions(tenant_id, "date");
COMMIT;

CREATE INDEX ASYNC IF NOT EXISTS idx_transactions_category ON transactions(tenant_id, category);
COMMIT;
