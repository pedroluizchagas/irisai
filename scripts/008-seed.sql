-- Seed básico para desenvolvimento local
-- ATENÇÃO: execute apenas em ambiente de desenvolvimento

-- Tenant e usuário de exemplo
INSERT INTO tenants (id, name, slug, plan, created_at)
VALUES ('seed-tenant', 'Workspace Iris Seed', 'iris-seed', 'free', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, tenant_id, name, email, password_hash, role, created_at)
VALUES ('seed-user', 'seed-tenant', 'Usuário Seed', 'seed@example.com', '$2a$12$VfDZZZZZZZZZZZZZZZZZZuS5HashedExample', 'owner', now())
ON CONFLICT (id) DO NOTHING;

-- Tarefas
INSERT INTO tasks (id, tenant_id, user_id, title, description, status, priority, due_date, tags, created_at, updated_at)
VALUES 
('seed-task-1', 'seed-tenant', 'seed-user', 'Configurar ambiente', 'Instalar dependências e preparar .env', 'todo', 'medium', now() + interval '2 days', '["dev","setup"]', now(), now()),
('seed-task-2', 'seed-tenant', 'seed-user', 'Criar primeira meta', 'Definir objetivo inicial', 'in_progress', 'high', now() + interval '7 days', '["goals"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Eventos
INSERT INTO events (id, tenant_id, user_id, title, description, start_time, end_time, location, recurrence, reminder_minutes, color, created_at, updated_at)
VALUES ('seed-event-1', 'seed-tenant', 'seed-user', 'Reunião inicial', 'Kickoff do projeto', now() + interval '1 day', now() + interval '1 day 1 hour', 'Online', NULL, 15, '#0088ff', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Notas
INSERT INTO notes (id, tenant_id, user_id, title, content, tags, is_pinned, created_at, updated_at)
VALUES ('seed-note-1', 'seed-tenant', 'seed-user', 'Checklist inicial', '1) Instalar PNPM\n2) pnpm i\n3) pnpm dev', '["notes","setup"]', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Transações
INSERT INTO transactions (id, tenant_id, user_id, type, amount, currency, category, description, date, is_recurring, recurrence_interval, created_at)
VALUES ('seed-txn-1', 'seed-tenant', 'seed-user', 'income', 1500.00, 'BRL', 'servico', 'Primeiro pagamento', now(), false, NULL, now()),
       ('seed-txn-2', 'seed-tenant', 'seed-user', 'expense', 200.00, 'BRL', 'ferramentas', 'Assinatura mensal', now(), true, 'monthly', now())
ON CONFLICT (id) DO NOTHING;

-- Metas
INSERT INTO goals (id, tenant_id, user_id, title, description, target_value, current_value, unit, deadline, status, created_at, updated_at)
VALUES ('seed-goal-1', 'seed-tenant', 'seed-user', 'Lançar MVP', 'Primeira versão utilizável', 1, 0, NULL, now() + interval '30 days', 'active', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Hábitos
INSERT INTO habits (id, tenant_id, user_id, title, description, frequency, target_count, color, is_active, created_at)
VALUES ('seed-habit-1', 'seed-tenant', 'seed-user', 'Revisão diária', 'Checar tarefas e eventos do dia', 'daily', 1, '#22cc88', true, now())
ON CONFLICT (id) DO NOTHING;

-- Log de hábito (hoje)
INSERT INTO habit_logs (id, habit_id, tenant_id, user_id, completed_at, note)
VALUES ('seed-hlog-1', 'seed-habit-1', 'seed-tenant', 'seed-user', now(), 'Primeira revisão feita')
ON CONFLICT (id) DO NOTHING;
