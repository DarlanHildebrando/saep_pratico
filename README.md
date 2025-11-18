# Coxão do Santinho Project

## Como rodar:

 ```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/template-crud-meias.git
cd template-crud-meias

# Banco de dados

# Caso esteja usando docker
docker compose up

# Acessar DB
docker exec -it db psql -U postgres

# Dentro do DB

# Criar tabelas
CREATE DATABASE saep_db;
\c saep_db;


# Popular banco
-- Usuários (divulgadores)
INSERT INTO usuarios (nome, email, senha) VALUES
  ('Ana Souza',  'ana@example.com',   '123'),
  ('Bruno Lima', 'bruno@example.com', '123'),
  ('Carla Dias', 'carla@example.com', '123')
ON CONFLICT (email) DO NOTHING;

-- materiais (modelos oficiais da "meia meia meia")
INSERT INTO materiais (nome, quantidade, estoque_minimo) VALUES
  ('strap', 40, 10),
  ('cinturão', 60, 15),
  ('grip de borracha', 25, 12)
ON CONFLICT DO NOTHING;

-- Movimentações (histórico inicial)
-- Entradas iniciais (Ana)
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
  ((SELECT id FROM materiais WHERE nome='strap'),
   (SELECT id FROM usuarios WHERE email='ana@example.com'),
   'entrada', 30, NOW() - INTERVAL '2 days', 'Compra inicial'),
  ((SELECT id FROM materiais WHERE nome='cinturão'),
   (SELECT id FROM usuarios WHERE email='ana@example.com'),
   'entrada', 50, NOW() - INTERVAL '2 days', 'Compra inicial'),
  ((SELECT id FROM materiais WHERE nome='grip de borracha'),
   (SELECT id FROM usuarios WHERE email='ana@example.com'),
   'entrada', 20, NOW() - INTERVAL '2 days', 'Compra inicial');

-- Saídas (Bruno)
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, data_movimentacao, observacao) VALUES
  ((SELECT id FROM materiais WHERE nome='strap'),
   (SELECT id FROM usuarios WHERE email='bruno@example.com'),
   'saida', 6, NOW() - INTERVAL '1 day', 'Retirada para evento'),
  ((SELECT id FROM materiais WHERE nome='cinturão'),
   (SELECT id FROM usuarios WHERE email='bruno@example.com'),
   'saida', 15, NOW() - INTERVAL '1 day', 'Retirada para feira'),
  ((SELECT id FROM materiais WHERE nome='grip de borracha'),
   (SELECT id FROM usuarios WHERE email='bruno@example.com'),
   'saida', 4, NOW() - INTERVAL '1 day', 'Retirada para divulgação');

-- Reposição (Carla)
INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao) VALUES
  ((SELECT id FROM materiais WHERE nome='strap'),
   (SELECT id FROM usuarios WHERE email='carla@example.com'),
   'entrada', 10, 'Devolução de kits'),
  ((SELECT id FROM materiais WHERE nome='cinturão'),
   (SELECT id FROM usuarios WHERE email='carla@example.com'),
   'entrada', 20, 'Devolução de kits'),
  ((SELECT id FROM materiais WHERE nome='grip de borracha'),
   (SELECT id FROM usuarios WHERE email='carla@example.com'),
   'entrada', 8, 'Devolução de kits');

# Backend
cd backend
npm install
npm start

# Em outro terminal: frontend
cd ../frontend
npm install
npm run dev
 ```
