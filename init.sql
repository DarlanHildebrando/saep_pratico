--------------------------------------------------------
-- Tabelas
--------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuarios (
  id     SERIAL PRIMARY KEY,
  nome   TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE,
  senha  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materiais (
  id              SERIAL PRIMARY KEY,
  nome            TEXT NOT NULL,
  quantidade      INTEGER NOT NULL DEFAULT 0,
  estoque_minimo  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id                 SERIAL PRIMARY KEY,
  produto_id         INTEGER NOT NULL REFERENCES materiais(id),
  usuario_id         INTEGER NOT NULL REFERENCES usuarios(id),
  tipo               TEXT NOT NULL, -- 'entrada' | 'saida'
  quantidade         INTEGER NOT NULL,
  data_movimentacao  TIMESTAMP NOT NULL DEFAULT NOW(),
  observacao         TEXT
);

--------------------------------------------------------
-- Popular Banco
--------------------------------------------------------

-- Usuários
INSERT INTO usuarios (nome, email, senha) VALUES
  ('Ana Souza',  'ana@example.com',   '123'),
  ('Bruno Lima', 'bruno@example.com', '123'),
  ('Carla Dias', 'carla@example.com', '123')
ON CONFLICT (email) DO NOTHING;

-- Materiais
INSERT INTO materiais (nome, quantidade, estoque_minimo) VALUES
  ('Strap', 40, 10),
  ('Grip de borracha', 60, 15),
  ('Cinturão', 25, 12)
ON CONFLICT DO NOTHING;

--------------------------------------------------------
-- Movimentações
--------------------------------------------------------

-- Entradas iniciais (Ana)
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
  ((SELECT id FROM materiais WHERE nome='Strap'),
   (SELECT id FROM usuarios WHERE email='ana@example.com'),
   'entrada', 30, NOW() - INTERVAL '2 days', 'Compra inicial'),
  ((SELECT id FROM materiais WHERE nome='Grip de borracha'),
   (SELECT id FROM usuarios WHERE email='ana@example.com'),
   'entrada', 50, NOW() - INTERVAL '2 days', 'Compra inicial'),
  ((SELECT id FROM materiais WHERE nome='Cinturão'),
   (SELECT id FROM usuarios WHERE email='ana@example.com'),
   'entrada', 20, NOW() - INTERVAL '2 days', 'Compra inicial');

-- Saídas (Bruno)
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
  ((SELECT id FROM materiais WHERE nome='Strap'),
   (SELECT id FROM usuarios WHERE email='bruno@example.com'),
   'saida', 6, NOW() - INTERVAL '1 day', 'Retirada para evento'),
  ((SELECT id FROM materiais WHERE nome='Grip de borracha'),
   (SELECT id FROM usuarios WHERE email='bruno@example.com'),
   'saida', 15, NOW() - INTERVAL '1 day', 'Retirada para feira'),
  ((SELECT id FROM materiais WHERE nome='Cinturão'),
   (SELECT id FROM usuarios WHERE email='bruno@example.com'),
   'saida', 4, NOW() - INTERVAL '1 day', 'Retirada para divulgação');

-- Reposição (Carla)
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao) VALUES
  ((SELECT id FROM materiais WHERE nome='Strap'),
   (SELECT id FROM usuarios WHERE email='carla@example.com'),
   'entrada', 10, 'Devolução de kits'),
  ((SELECT id FROM materiais WHERE nome='Grip de borracha'),
   (SELECT id FROM usuarios WHERE email='carla@example.com'),
   'entrada', 20, 'Devolução de kits'),
  ((SELECT id FROM materiais WHERE nome='Cinturão'),
   (SELECT id FROM usuarios WHERE email='carla@example.com'),
   'entrada', 8, 'Devolução de kits');
