// =============================================================================
// Aba de Configurações do Site
// Single Responsibility: apenas gerenciamento de configurações
// =============================================================================

import { useState } from 'react';
import { configAPI, authAPI } from '../../services/api';

const CONFIG_ITEMS = [
  { chave: 'titulo_site', label: '🏷 Título do Site' },
  { chave: 'subtitulo_site', label: '📝 Subtítulo' },
  { chave: 'propaganda_titulo', label: '📢 Título da Propaganda' },
  { chave: 'propaganda_texto', label: '📄 Texto da Propaganda', multiline: true },
  { chave: 'propaganda_botao_texto', label: '🔘 Texto do Botão' },
  { chave: 'propaganda_botao_link', label: '🔗 Link do Botão' },
  { chave: 'contato_email', label: '📧 Email de Contato' },
  { chave: 'contato_telefone', label: '📱 Telefone de Contato' },
  { chave: 'rodape_texto', label: '📋 Texto do Rodapé' },
];

export default function AbaConfig({ configs, onRecarregar }) {
  const [editando, setEditando] = useState({});
  const [salvando, setSalvando] = useState('');

  // Troca de Senha
  const [formSenha, setFormSenha] = useState({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [msgSenha, setMsgSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  async function handleAlterarSenha(e) {
    e.preventDefault();
    setMsgSenha('');
    setErroSenha('');

    if (!formSenha.senhaAtual || !formSenha.novaSenha) {
      setErroSenha('Preencha a senha atual e a nova senha');
      return;
    }
    if (formSenha.novaSenha.length < 6) {
      setErroSenha('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (formSenha.novaSenha !== formSenha.confirmarNovaSenha) {
      setErroSenha('A confirmação da nova senha não confere');
      return;
    }

    try {
      setSalvandoSenha(true);
      const res = await authAPI.alterarSenha({
        senhaAtual: formSenha.senhaAtual,
        novaSenha: formSenha.novaSenha,
      });
      setMsgSenha(res.data?.mensagem || 'Senha alterada com sucesso!');
      setFormSenha({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
    } catch (err) {
      setErroSenha(err.response?.data?.mensagem || 'Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function salvarConfig(chave) {
    try {
      setSalvando(chave);
      await configAPI.atualizar(chave, { valor: editando[chave] });
      onRecarregar();
    } catch (err) {
      alert('Erro ao salvar configuração');
    } finally {
      setSalvando('');
    }
  }

  return (
    <div>
      <div style={{
        background: 'var(--cor-fundo-card)',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-xl)',
        padding: 'var(--espaco-6)',
      }}>
        <h3 style={{ marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-xl)' }}>
          ⚙ Configurações do Site
        </h3>
        <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-sm)' }}>
          Edite os textos e configurações que aparecem no site público.
        </p>

        {CONFIG_ITEMS.map((item) => {
          const valorAtual = editando[item.chave] !== undefined
            ? editando[item.chave]
            : configs[item.chave]?.valor || '';

          return (
            <div key={item.chave} className="campo-grupo">
              <label className="campo-label">{item.label}</label>
              <div className="flex gap-2">
                {item.multiline ? (
                  <textarea
                    className="campo-textarea"
                    value={valorAtual}
                    onChange={(e) => setEditando({ ...editando, [item.chave]: e.target.value })}
                    style={{ minHeight: '80px' }}
                  />
                ) : (
                  <input
                    className="campo-input"
                    value={valorAtual}
                    onChange={(e) => setEditando({ ...editando, [item.chave]: e.target.value })}
                  />
                )}
                <button
                  className="btn btn-primario btn-sm"
                  onClick={() => salvarConfig(item.chave)}
                  disabled={salvando === item.chave || editando[item.chave] === undefined}
                  style={{ flexShrink: 0 }}
                >
                  {salvando === item.chave ? '...' : '💾'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção de Segurança: Alteração de Senha */}
      <div style={{
        marginTop: 'var(--espaco-6)',
        background: 'var(--cor-fundo-card)',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-xl)',
        padding: 'var(--espaco-6)',
      }}>
        <h3 style={{ marginBottom: 'var(--espaco-4)', fontSize: 'var(--texto-xl)' }}>
          🔒 Segurança & Troca de Senha
        </h3>
        <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-sm)' }}>
          Altere a senha de acesso do administrador do Theatrum.
        </p>

        {msgSenha && <div className="alerta alerta-sucesso">✓ {msgSenha}</div>}
        {erroSenha && <div className="alerta alerta-erro">⚠ {erroSenha}</div>}

        <form onSubmit={handleAlterarSenha} style={{ maxWidth: '480px' }}>
          <div className="campo-grupo">
            <label className="campo-label">Senha Atual</label>
            <input
              type="password"
              className="campo-input"
              value={formSenha.senhaAtual}
              onChange={(e) => setFormSenha({ ...formSenha, senhaAtual: e.target.value })}
              placeholder="Digite a senha atual"
              required
            />
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Nova Senha (mínimo 6 caracteres)</label>
            <input
              type="password"
              className="campo-input"
              value={formSenha.novaSenha}
              onChange={(e) => setFormSenha({ ...formSenha, novaSenha: e.target.value })}
              placeholder="Digite a nova senha segura"
              required
            />
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Confirmar Nova Senha</label>
            <input
              type="password"
              className="campo-input"
              value={formSenha.confirmarNovaSenha}
              onChange={(e) => setFormSenha({ ...formSenha, confirmarNovaSenha: e.target.value })}
              placeholder="Repita a nova senha"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primario"
            disabled={salvandoSenha}
            style={{ marginTop: 'var(--espaco-2)' }}
          >
            {salvandoSenha ? 'Alterando...' : '🔑 Salvar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
