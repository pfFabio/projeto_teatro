// =============================================================================
// Componente de Login do Admin
// Single Responsibility: autenticação e recuperação de credenciais (Ata #02)
// =============================================================================

import { useState } from 'react';
import Modal from '../common/Modal';
import { authAPI } from '../../services/api';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Modal Esqueci Senha
  const [modalRecuperacao, setModalRecuperacao] = useState(false);
  const [etapaRecuperacao, setEtapaRecuperacao] = useState('SOLICITAR'); // SOLICITAR | REDEFINIR
  const [idRecuperacao, setIdRecuperacao] = useState('');
  const [tokenRecuperacao, setTokenRecuperacao] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [msgRecuperacao, setMsgRecuperacao] = useState('');
  const [erroRecuperacao, setErroRecuperacao] = useState('');
  const [processandoRecuperacao, setProcessandoRecuperacao] = useState(false);

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

  function abrirModalRecuperacao() {
    setIdRecuperacao(email || '');
    setEtapaRecuperacao('SOLICITAR');
    setMsgRecuperacao('');
    setErroRecuperacao('');
    setTokenRecuperacao('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setModalRecuperacao(true);
  }

  async function handleSolicitarRecuperacao(e) {
    e.preventDefault();
    if (!idRecuperacao.trim()) {
      setErroRecuperacao('Informe seu email ou nome de usuário.');
      return;
    }

    try {
      setProcessandoRecuperacao(true);
      setErroRecuperacao('');
      const res = await authAPI.esqueciSenha({ email: idRecuperacao.trim() });
      setMsgRecuperacao(res.data?.mensagem || 'Instruções de recuperação geradas.');
      if (res.data?.tokenRecuperacao) {
        setTokenRecuperacao(res.data.tokenRecuperacao);
      }
      setEtapaRecuperacao('REDEFINIR');
    } catch (err) {
      setErroRecuperacao(err.response?.data?.mensagem || 'Erro ao solicitar recuperação.');
    } finally {
      setProcessandoRecuperacao(false);
    }
  }

  async function handleRedefinirSenha(e) {
    e.preventDefault();
    if (!tokenRecuperacao.trim()) {
      setErroRecuperacao('Informe o token/código de recuperação.');
      return;
    }
    if (!novaSenha || novaSenha.length < 6) {
      setErroRecuperacao('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setErroRecuperacao('As senhas digitadas não coincidem.');
      return;
    }

    try {
      setProcessandoRecuperacao(true);
      setErroRecuperacao('');
      const res = await authAPI.redefinirSenha({
        token: tokenRecuperacao.trim(),
        novaSenha,
      });
      setSucesso(res.data?.mensagem || 'Senha redefinida com sucesso! Você já pode entrar.');
      setModalRecuperacao(false);
    } catch (err) {
      setErroRecuperacao(err.response?.data?.mensagem || 'Erro ao redefinir senha.');
    } finally {
      setProcessandoRecuperacao(false);
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

          {sucesso && <div className="alerta alerta-sucesso">✓ {sucesso}</div>}
          {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

          <form onSubmit={handleSubmit}>
            <div className="campo-grupo">
              <label className="campo-label">Email ou Usuário</label>
              <input
                type="text"
                className="campo-input"
                placeholder="admin@theatrum.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="campo-grupo">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="campo-label" style={{ marginBottom: 0 }}>Senha</label>
                <button
                  type="button"
                  onClick={abrirModalRecuperacao}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--cor-primaria)',
                    fontSize: 'var(--texto-xs)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                className="campo-input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ marginTop: '8px' }}
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

      {/* Modal Esqueci minha Senha */}
      <Modal
        aberto={modalRecuperacao}
        onFechar={() => setModalRecuperacao(false)}
        titulo="🔑 Recuperação de Acesso"
      >
        {erroRecuperacao && <div className="alerta alerta-erro">⚠ {erroRecuperacao}</div>}
        {msgRecuperacao && <div className="alerta alerta-sucesso">ℹ {msgRecuperacao}</div>}

        {etapaRecuperacao === 'SOLICITAR' ? (
          <form onSubmit={handleSolicitarRecuperacao}>
            <p style={{ fontSize: 'var(--texto-sm)', color: 'var(--cor-texto-secundario)', marginBottom: '16px' }}>
              Digite o email ou o identificador de usuário cadastrado para gerar o código de recuperação:
            </p>
            <div className="campo-grupo">
              <label className="campo-label">Email ou Usuário</label>
              <input
                type="text"
                className="campo-input"
                placeholder="admin@theatrum.com"
                value={idRecuperacao}
                onChange={(e) => setIdRecuperacao(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-fantasma"
                onClick={() => setModalRecuperacao(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primario"
                disabled={processandoRecuperacao}
              >
                {processandoRecuperacao ? 'Aguarde...' : 'Gerar Código de Recuperação →'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRedefinirSenha}>
            <div className="campo-grupo">
              <label className="campo-label">Código / Token de Recuperação</label>
              <input
                type="text"
                className="campo-input"
                placeholder="Cole o código de recuperação"
                value={tokenRecuperacao}
                onChange={(e) => setTokenRecuperacao(e.target.value)}
                required
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Nova Senha (mínimo 6 caracteres)</label>
              <input
                type="password"
                className="campo-input"
                placeholder="••••••••"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Confirmar Nova Senha</label>
              <input
                type="password"
                className="campo-input"
                placeholder="••••••••"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-fantasma btn-sm"
                onClick={() => setEtapaRecuperacao('SOLICITAR')}
              >
                ← Voltar
              </button>
              <button
                type="submit"
                className="btn btn-primario"
                disabled={processandoRecuperacao}
              >
                {processandoRecuperacao ? 'Redefinindo...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
