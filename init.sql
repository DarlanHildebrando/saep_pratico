-- Cria database
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'saep_db') THEN
    EXECUTE 'CREATE DATABASE saep_db';
  END IF;
END
$$;

-- Executa tudo dentro do novo database
DO $$
BEGIN
  EXECUTE $schema$
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
      tipo               TEXT NOT NULL,
      quantidade         INTEGER NOT NULL,
      data_movimentacao  TIMESTAMP NOT NULL DEFAULT NOW(),
      observacao         TEXT
    );

    INSERT INTO usuarios (nome, email, senha) VALUES
      ('Ana Souza',  'ana@example.com',   '123'),
      ('Bruno Lima', 'bruno@example.com', '123'),
      ('Carla Dias', 'carla@example.com', '123')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO materiais (nome, quantidade, estoque_minimo) VALUES
      ('strap', 40, 10),
      ('cinturão', 60, 15),
      ('grip de borracha', 25, 12)
    ON CONFLICT DO NOTHING;

    INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
      ((SELECT id FROM materiais WHERE nome=''strap''),
       (SELECT id FROM usuarios WHERE email=''ana@example.com''),
       ''entrada'', 30, NOW() - INTERVAL ''2 days'', ''Compra inicial''),

      ((SELECT id FROM materiais WHERE nome=''cinturão''),
       (SELECT id FROM usuarios WHERE email=''ana@example.com''),
       ''entrada'', 50, NOW() - INTERVAL ''2 days'', ''Compra inicial''),

      ((SELECT id FROM materiais WHERE nome=''grip de borracha''),
       (SELECT id FROM usuarios WHERE email=''ana@example.com''),
       ''entrada'', 20, NOW() - INTERVAL ''2 days'', ''Compra inicial'');

    INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
      ((SELECT id FROM materiais WHERE nome=''strap''),
       (SELECT id FROM usuarios WHERE email=''bruno@example.com''),
       ''saida'', 6, NOW() - INTERVAL ''1 day'', ''Retirada para evento''),

      ((SELECT id FROM materiais WHERE nome=''cinturão''),
       (SELECT id FROM usuarios WHERE email=''bruno@example.com''),
       ''saida'', 15, NOW() - INTERVAL ''1 day'', ''Retirada para feira''),

      ((SELECT id FROM materiais WHERE nome=''grip de borracha''),
       (SELECT id FROM usuarios WHERE email=''bruno@example.com''),
       ''saida'', 4, NOW() - INTERVAL ''1 day'', ''Retirada para divulgação'');

    INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao) VALUES
      ((SELECT id FROM materiais WHERE nome=''strap''),
       (SELECT id FROM usuarios WHERE email=''carla@example.com''),
       ''entrada'', 10, ''Devolução de kits''),

      ((SELECT id FROM materiais WHERE nome=''cinturão''),
       (SELECT id FROM usuarios WHERE email=''carla@example.com''),
       ''entrada'', 20, ''Devolução de kits''),

      ((SELECT id FROM materiais WHERE nome=''grip de borracha''),
       (SELECT id FROM usuarios WHERE email=''carla@example.com''),
       ''entrada'', 8, ''Devolução de kits'');
  $schema$;
END
$$;
