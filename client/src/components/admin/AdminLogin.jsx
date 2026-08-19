// =============================================================================
// Componente de Login do Admin
// Single Responsibility: apenas formulário de login
// =============================================================================

import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !senha) {
      setErro('Preencha email e senha');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      await onLogin(email, senha);
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-conteudo">
      <div className="admin-login animar-entrada">
        <div className="admin-login-card">
          <div className="admin-login-icone">🔐</div>
          <h2 style={{ marginBottom: '8px' }}>Área Administrativa</h2>
          <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '32px' }}>
            Faça login para gerenciar o Theatrum
          </p>

          {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="campo-grupo">
              <label className="campo-label">Email</label>
              <input
                type="email"
                className="campo-input"
                placeholder="admin@theatrum.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Senha</label>
              <input
                type="password"
                className="campo-input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primario btn-lg btn-bloco"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
