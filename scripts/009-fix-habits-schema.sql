-- Corrige esquema da tabela habits em bases antigas
-- Adiciona coluna 'title' se não existir
ALTER TABLE habits ADD COLUMN IF NOT EXISTS title VARCHAR(255);
COMMIT;
