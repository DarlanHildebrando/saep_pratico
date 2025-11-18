// App.jsx — SPA mínima "meia meia meia" (React + axios)
// Entregas: 4 (login), 5 (principal), 6 (cadastro produto), 7 (gestão de estoque)
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 8000,
});

// util
const notEmpty = (v) => String(v ?? "").trim().length > 0;
const toInt = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export default function App() {
  // -------------------------------
  // estado global simples
  // -------------------------------
  const [view, setView] = useState("login"); // 'login' | 'home' | 'materiais' | 'estoque'
  const [user, setUser] = useState(null); // {id, nome, email}

  // -------------------------------
  // login (4)
  // -------------------------------
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const doLogin = async (e) => {
    e?.preventDefault();
    if (!notEmpty(loginEmail) || !notEmpty(loginSenha)) {
      alert("Informe email e senha.");
      return;
    }
    try {
      console.log('====================================');
      console.log(loginSenha);
      
      
      const { data } = await API.post("/auth/login", {
        email: loginEmail,
        senha: loginSenha,
      });
      setUser(data);
      setView("home");
      setLoginEmail("");
      setLoginSenha("");
    } catch (err) {
      alert(err?.response?.data?.error || "Falha no login");
    }
  };

  const logout = () => {
    setUser(null);
    setView("login");
  };

  // -------------------------------
  // materiais (6) + uso em estoque (7)
  // -------------------------------
  const [materiais, setmateriais] = useState([]);
  const [loadingmateriais, setLoadingmateriais] = useState(false);
  const [q, setQ] = useState(""); // busca

  // form produto
  const emptyProduto = { id: null, nome: "", quantidade: 0, estoque_minimo: 0 };
  const [produtoForm, setProdutoForm] = useState(emptyProduto);
  const [editandoId, setEditandoId] = useState(null);

  const carregarmateriais = async (term = q) => {
    setLoadingmateriais(true);
    try {
      const url = notEmpty(term) ? `/materiais?q=${encodeURIComponent(term)}` : "/materiais";
      const { data } = await API.get(url);
      setmateriais(Array.isArray(data) ? data : []);
    } catch (e) {
      alert("Erro ao carregar materiais");
    } finally {
      setLoadingmateriais(false);
    }
  };

  useEffect(() => {
    if (view === "materiais" || view === "estoque") carregarmateriais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const materiaisOrdenados = useMemo(() => {
    // 7.1.1 — ordem alfabética no FRONT (não confiar na ordenação do backend)
    return [...materiais].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  }, [materiais]);

  const limparProdutoForm = () => {
    setProdutoForm(emptyProduto);
    setEditandoId(null);
  };

  const validarProdutoForm = () => {
    const { nome, quantidade, estoque_minimo } = produtoForm;
    if (!notEmpty(nome)) return "Informe o nome do produto.";
    if (toInt(quantidade) < 0) return "Quantidade não pode ser negativa.";
    if (toInt(estoque_minimo) < 0) return "Estoque mínimo não pode ser negativo.";
    return null;
    // 6.1.6 — validações mínimas
  };

  const criarProduto = async () => {
    const msg = validarProdutoForm();
    if (msg) return alert(msg);
    try {
      await API.post("/materiais", {
        nome: produtoForm.nome.trim(),
        quantidade: toInt(produtoForm.quantidade),
        estoque_minimo: toInt(produtoForm.estoque_minimo),
      });
      await carregarmateriais();
      limparProdutoForm();
    } catch (e) {
      alert(e?.response?.data?.error || "Erro ao criar produto");
    }
  };

  const iniciarEdicao = (p) => {
    setEditandoId(p.id);
    setProdutoForm({
      id: p.id,
      nome: p.nome,
      quantidade: p.quantidade,
      estoque_minimo: p.estoque_minimo,
    });
  };

  const salvarProduto = async () => {
    if (!editandoId) return;
    const msg = validarProdutoForm();
    if (msg) return alert(msg);
    try {
      await API.put(`/materiais/${editandoId}`, {
        nome: produtoForm.nome.trim(),
        quantidade: toInt(produtoForm.quantidade),
        estoque_minimo: toInt(produtoForm.estoque_minimo),
      });
      await carregarmateriais();
      limparProdutoForm();
    } catch (e) {
      alert(e?.response?.data?.error || "Erro ao salvar produto");
    }
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Excluir este produto?")) return;
    try {
      await API.delete(`/materiais/${id}`);
      await carregarmateriais();
      // 6.1.5 — excluir
    } catch (e) {
      alert(e?.response?.data?.error || "Erro ao excluir produto");
    }
  };

  const buscar = async (e) => {
    e?.preventDefault();
    await carregarmateriais(q);
    // 6.1.2 — busca atualiza a listagem
  };

  // -------------------------------
  // gestão de estoque (7)
  // -------------------------------
  const [movProdutoId, setMovProdutoId] = useState("");
  const [movTipo, setMovTipo] = useState("entrada"); // entrada|saida
  const [movQuantidade, setMovQuantidade] = useState("");
  const [movData, setMovData] = useState(""); // date (yyyy-mm-dd)
  const [movObs, setMovObs] = useState("");

  const enviarMovimentacao = async () => {
    if (!user) return alert("Faça login.");
    if (!movProdutoId) return alert("Selecione um produto.");
    if (!["entrada", "saida"].includes(movTipo)) return alert("Tipo inválido.");
    const qtd = toInt(movQuantidade);
    if (!(qtd > 0)) return alert("Informe uma quantidade > 0.");

    try {
      const payload = {
        produto_id: Number(movProdutoId),
        usuario_id: user.id,
        tipo: movTipo,
        quantidade: qtd,
        data_movimentacao: notEmpty(movData) ? new Date(movData).toISOString() : null, // 7.1.3
        observacao: notEmpty(movObs) ? movObs.trim() : null,
      };
      const { data } = await API.post("/movimentacoes", payload);
      // data.produto.abaxo_do_minimo (do backend)
      alert("Movimentação registrada com sucesso.");
      if (data?.produto?.abaixo_do_minimo) {
        alert("⚠️ Estoque abaixo do mínimo para este produto!");
      }
      // atualizar listagem para refletir novo saldo
      await carregarmateriais();
      // limpar form
      setMovQuantidade("");
      setMovObs("");
      // manter produto/tipo/data para facilitar uso contínuo
    } catch (e) {
      alert(e?.response?.data?.error || "Erro ao registrar movimentação");
    }
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
<div className="app">

  <h1 className="title-main">Coxão do Santinho — Gestão de Estoque</h1>

  {/* LOGIN */}
  {view === "login" && (
    <section className="form-section">
      <div className="login-title"> 
      <h2>Login</h2>
      <img className="meat" src="./meat-on-bone-svgrepo-com.svg" alt="" />
      </div>
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="ana@example.com"
          required
        />
      </div>

      <div className="field">
        <label>Senha</label>
        <input
          type="password"
          value={loginSenha}
          onChange={(e) => setLoginSenha(e.target.value)}
          placeholder="•••••••"
          required
        />
      </div>

      <button className="btn primary" onClick={doLogin}>Entrar</button>
    </section>
  )}

  {/* HOME */}
  {view === "home" && (
    <section className="form-section">
      <h2>Olá, {user?.nome}</h2>

      <div className="row-buttons">
        <button className="btn" onClick={() => setView("materiais")}>Cadastro de Produto</button>
        <button className="btn" onClick={() => setView("estoque")}>Gestão de Estoque</button>
        <button className="btn" onClick={logout}>Sair</button>
      </div>
    </section>
  )}

  {/* materiais */}
  {view === "materiais" && (
    <section className="form-section">
      <h2>Cadastro de Produto</h2>

      {/* Busca */}
      <form className="search-bar" onSubmit={buscar}>
        <input
          type="text"
          placeholder="Buscar por nome"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn primary" type="submit">Buscar</button>
        <button
          className="btn"
          type="button"
          onClick={() => { setQ(""); carregarmateriais(""); }}
        >
          Limpar
        </button>
      </form>

      {/* Form criar/editar */}
      <div className="form-grid">
        <div className="field">
          <label>Nome</label>
          <input
            type="text"
            value={produtoForm.nome}
            onChange={(e) =>
              setProdutoForm((s) => ({ ...s, nome: e.target.value }))
            }
            placeholder='ex.: "meia meia meia arrastão"'
            required
          />
        </div>

        <div className="field">
          <label>Quantidade</label>
          <input
            type="number"
            min={0}
            value={produtoForm.quantidade}
            onChange={(e) =>
              setProdutoForm((s) => ({ ...s, quantidade: e.target.value }))
            }
          />
        </div>

        <div className="field">
          <label>Estoque mínimo</label>
          <input
            type="number"
            min={0}
            value={produtoForm.estoque_minimo}
            onChange={(e) =>
              setProdutoForm((s) => ({ ...s, estoque_minimo: e.target.value }))
            }
          />
        </div>

        <div className="row-buttons">
          {editandoId ? (
            <>
              <button className="btn primary" onClick={salvarProduto}>Salvar</button>
              <button className="btn" onClick={limparProdutoForm}>Cancelar</button>
            </>
          ) : (
            <button className="btn primary" onClick={criarProduto}>Cadastrar</button>
          )}
          <button className="btn" onClick={() => setView("home")}>Voltar</button>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrapper">
        {loadingmateriais && <p>Carregando...</p>}

        {!loadingmateriais && (
          <table className="prod-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Qtd</th>
                <th>Mín</th>
                <th>Alerta</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {materiaisOrdenados.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td className="center">{p.quantidade}</td>
                  <td className="center">{p.estoque_minimo}</td>
                  <td className="center">
                    {p.quantidade < p.estoque_minimo ? "⚠️" : "—"}
                  </td>
                  <td className="actions">
                    <button className="btn-sm" onClick={() => iniciarEdicao(p)}>Editar</button>
                    <button className="btn-sm danger" onClick={() => excluirProduto(p.id)}>Excluir</button>
                  </td>
                </tr>
              ))}

              {materiaisOrdenados.length === 0 && (
                <tr><td colSpan={5}>Nenhum produto.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )}

  {/* ESTOQUE */}
  {view === "estoque" && (
    <section className="form-section">
      <h2>Gestão de Estoque</h2>

      <div className="list-section">
        <h3>materiais (ordem alfabética)</h3>
        <ul className="prod-list">
          {materiaisOrdenados.map((p) => (
            <li key={p.id} className="prod-item">
              <span className="name">{p.nome}</span>
              <span>Qtd: <b>{p.quantidade}</b></span>
              <span>Mín: <b>{p.estoque_minimo}</b></span>
              <span>{p.quantidade < p.estoque_minimo ? "⚠️ Baixo" : ""}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mov-section">
        <h3>Registrar movimentação</h3>

        <div className="field">
          <label>Produto</label>
          <select
            value={movProdutoId}
            onChange={(e) => setMovProdutoId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {materiaisOrdenados.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Tipo</label>
          <div className="row">
            <label><input type="radio" name="tipo" value="entrada" checked={movTipo === "entrada"} onChange={(e) => setMovTipo(e.target.value)} /> Entrada</label>
            <label><input type="radio" name="tipo" value="saida" checked={movTipo === "saida"} onChange={(e) => setMovTipo(e.target.value)} /> Saída</label>
          </div>
        </div>

        <div className="field">
          <label>Quantidade</label>
          <input type="number" min={1} value={movQuantidade} onChange={(e) => setMovQuantidade(e.target.value)} />
        </div>

        <div className="field">
          <label>Data da movimentação</label>
          <input type="date" value={movData} onChange={(e) => setMovData(e.target.value)} />
        </div>

        <div className="field">
          <label>Observação</label>
          <input type="text" value={movObs} onChange={(e) => setMovObs(e.target.value)} />
        </div>

        <div className="row-buttons">
          <button className="btn primary" onClick={enviarMovimentacao}>Registrar</button>
          <button className="btn" onClick={() => setView("home")}>Voltar</button>
        </div>
      </div>
    </section>
  )}

</div>
  );
}
