// =============================================================================
// Aba de Configurações do Site
// Reorganizada em 4 blocos temáticos: Identidade, Contato, Fallback e Segurança/Perfil
// =============================================================================

import { useState } from 'react';
import { configAPI, authAPI } from '../../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AbaConfig({ configs = {}, usuario = {}, onRecarregar }) {
  // Estado de edição por chave de configuração
  const [editando, setEditando] = useState({});
  const [salvando, setSalvando] = useState('');
  const [sucessoCampo, setSucessoCampo] = useState({});
  const [errosCampo, setErrosCampo] = useState({});

  // Perfil do Administrador
  const [perfilForm, setPerfilForm] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
  });
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [msgPerfil, setMsgPerfil] = useState('');
  const [erroPerfil, setErroPerfil] = useState('');

  // Troca de Senha
  const [formSenha, setFormSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarNovaSenha: '',
  });
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [msgSenha, setMsgSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  // Salvar uma chave de configuração individual
  async function salvarConfig(chave, rotuloAmigavel) {
    const valorParaSalvar = editando[chave] !== undefined
      ? editando[chave]
      : (configs[chave]?.valor || '');

    // Validações defensivas específicas por chave
    if (chave === 'contato_email' && valorParaSalvar.trim().length > 0) {
      if (!EMAIL_REGEX.test(valorParaSalvar.trim())) {
        setErrosCampo((prev) => ({ ...prev, [chave]: 'Formato de e-mail inválido (ex: contato@theatrum.com)' }));
        return;
      }
    }

    setErrosCampo((prev) => ({ ...prev, [chave]: '' }));

    try {
      setSalvando(chave);
      await configAPI.atualizar(chave, { valor: valorParaSalvar });
      setSucessoCampo((prev) => ({ ...prev, [chave]: true }));
      setTimeout(() => {
        setSucessoCampo((prev) => ({ ...prev, [chave]: false }));
      }, 2500);

      if (onRecarregar) {
        onRecarregar();
      }
    } catch (err) {
      setErrosCampo((prev) => ({
        ...prev,
        [chave]: err.response?.data?.mensagem || `Erro ao salvar ${rotuloAmigavel || 'configuração'}.`,
      }));
    } finally {
      setSalvando('');
    }
  }

  // Desfazer alteração pendente de um campo
  function desfazerConfig(chave) {
    setEditando((prev) => {
      const novo = { ...prev };
      delete novo[chave];
      return novo;
    });
    setErrosCampo((prev) => ({ ...prev, [chave]: '' }));
  }

  // Atualizar Perfil do Administrador
  async function handleSalvarPerfil(e) {
    e.preventDefault();
    setMsgPerfil('');
    setErroPerfil('');

    if (!perfilForm.nome.trim()) {
      setErroPerfil('O nome não pode estar em branco');
      return;
    }
    if (!EMAIL_REGEX.test(perfilForm.email.trim())) {
      setErroPerfil('Formato de e-mail inválido');
      return;
    }

    try {
      setSalvandoPerfil(true);
      await authAPI.atualizarPerfil({
        nome: perfilForm.nome.trim(),
        email: perfilForm.email.trim().toLowerCase(),
      });
      setMsgPerfil('Perfil atualizado com sucesso!');
      if (onRecarregar) onRecarregar();
    } catch (err) {
      setErroPerfil(err.response?.data?.mensagem || 'Erro ao atualizar dados de perfil.');
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // Alterar Senha
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

  // Helper para renderizar campo de configuração
  function renderCampo(chave, label, { multiline = false, placeholder = '', dica = '' } = {}) {
    const valorOriginal = configs[chave]?.valor || '';
    const valorAtual = editando[chave] !== undefined ? editando[chave] : valorOriginal;
    const modificado = editando[chave] !== undefined && editando[chave] !== valorOriginal;
    const isSalvando = salvando === chave;
    const isSucesso = sucessoCampo[chave];
    const erro = errosCampo[chave];

    return (
      <div key={chave} className="campo-grupo" style={{ marginBottom: 'var(--espaco-4)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--espaco-1)' }}>
          <label className="campo-label" style={{ marginBottom: 0 }}>{label}</label>
          {modificado && (
            <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-destaque)', fontWeight: 'bold' }}>
              ● Alteração pendente
            </span>
          )}
        </div>

        {dica && (
          <p style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-2)' }}>
            {dica}
          </p>
        )}

        <div className="flex gap-2">
          {multiline ? (
            <textarea
              className="campo-textarea"
              value={valorAtual}
              placeholder={placeholder}
              onChange={(e) => setEditando({ ...editando, [chave]: e.target.value })}
              style={{ minHeight: '80px', borderColor: modificado ? 'var(--cor-destaque)' : undefined }}
            />
          ) : (
            <input
              type="text"
              className="campo-input"
              value={valorAtual}
              placeholder={placeholder}
              onChange={(e) => setEditando({ ...editando, [chave]: e.target.value })}
              style={{ borderColor: modificado ? 'var(--cor-destaque)' : undefined }}
            />
          )}

          <button
            type="button"
            className="btn btn-primario btn-sm"
            onClick={() => salvarConfig(chave, label)}
            disabled={isSalvando || !modificado}
            aria-label={`Salvar ${label}`}
            style={{ flexShrink: 0, minWidth: '85px' }}
          >
            {isSalvando ? 'Salvando...' : isSucesso ? '✓ Salvo!' : '💾 Salvar'}
          </button>

          {modificado && (
            <button
              type="button"
              className="btn btn-secundario btn-sm"
              onClick={() => desfazerConfig(chave)}
              title="Desfazer alteração"
              style={{ flexShrink: 0 }}
            >
              ↩
            </button>
          )}
        </div>

        {erro && (
          <div style={{ color: 'var(--cor-erro, #ef4444)', fontSize: 'var(--texto-xs)', marginTop: 'var(--espaco-1)' }}>
            ⚠ {erro}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espaco-6)' }}>
      {/* 🏛️ BLOCO 1: IDENTIDADE DO SITE */}
      <div style={{
        background: 'var(--cor-fundo-card)',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-xl)',
        padding: 'var(--espaco-6)',
      }}>
        <h3 style={{ fontSize: 'var(--texto-xl)', marginBottom: 'var(--espaco-2)', display: 'flex', alignItems: 'center', gap: 'var(--espaco-2)' }}>
          <span>🏛️</span> Identidade do Site
        </h3>
        <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-sm)' }}>
          Define a marca, título nas abas do navegador e presenças oficiais da companhia.
        </p>

        {renderCampo('titulo_site', 'Nome da Companhia', {
          placeholder: 'Ex: Theatrum Mundi',
          dica: 'Utilizado no título da aba do navegador e no topo de cabeçalhos institucionais.',
        })}

        {renderCampo('subtitulo_site', 'Subtítulo / Slogan Institucional', {
          placeholder: 'Ex: Pesquisa cênica, tradição e contemporaneidade nas artes da cena',
          dica: 'Aparece no subtítulo da página e em metadados institucionais.',
        })}

        {renderCampo('instagram_oficial', 'Instagram Oficial', {
          placeholder: '@theatrum.m',
          dica: 'Exibido e vinculado diretamente no rodapé de todas as páginas públicas.',
        })}
      </div>

      {/* 📞 BLOCO 2: CONTATO PÚBLICO & RODAPÉ */}
      <div style={{
        background: 'var(--cor-fundo-card)',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-xl)',
        padding: 'var(--espaco-6)',
      }}>
        <h3 style={{ fontSize: 'var(--texto-xl)', marginBottom: 'var(--espaco-2)', display: 'flex', alignItems: 'center', gap: 'var(--espaco-2)' }}>
          <span>📞</span> Contato Público & Rodapé
        </h3>
        <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-sm)' }}>
          Alimenta dinamicamente os canais de comunicação e localização da sede no rodapé do portal.
        </p>

        {renderCampo('contato_email', 'E-mail de Contato', {
          placeholder: 'ciatheatrum@gmail.com',
          dica: 'Canal oficial para curadores, teatros e público geral.',
        })}

        {renderCampo('contato_telefone', 'Telefone / WhatsApp', {
          placeholder: '+55 (21) 97309-2514',
          dica: 'Número de telefone comercial ou WhatsApp da produção.',
        })}

        {renderCampo('contato_endereco', 'Endereço da Sede', {
          placeholder: 'Silvana da Costa, 437, Itaipuaçú — Maricá/RJ',
          dica: 'Endereço físico oficial da sede da companhia Theatrum Mundi.',
        })}

        {renderCampo('rodape_texto', 'Texto de Direitos / Rodapé', {
          placeholder: '© 2026 Theatrum — Todos os direitos reservados. Projeto acadêmico.',
          dica: 'Linha de direitos autorais exibida no final de todas as páginas.',
        })}
      </div>

      {/* 📢 BLOCO 3: FALLBACK DA PÁGINA INICIAL */}
      <div style={{
        background: 'var(--cor-fundo-card)',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-xl)',
        padding: 'var(--espaco-6)',
      }}>
        <h3 style={{ fontSize: 'var(--texto-xl)', marginBottom: 'var(--espaco-2)', display: 'flex', alignItems: 'center', gap: 'var(--espaco-2)' }}>
          <span>📢</span> Fallback da Página Inicial
        </h3>
        <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-sm)' }}>
          <strong>Aviso institucional de reserva:</strong> este conteúdo só é exibido na Home caso a aba de <em>Propagandas</em> esteja sem nenhum comunicado ativo.
        </p>

        {renderCampo('propaganda_titulo', 'Título do Destaque Padrão', {
          placeholder: 'Aulas e Projetos Theatrum',
        })}

        {renderCampo('propaganda_texto', 'Texto do Destaque Padrão', {
          multiline: true,
          placeholder: 'Descubra o artista que existe em você...',
        })}

        {renderCampo('propaganda_botao_texto', 'Texto do Botão Padrão', {
          placeholder: 'Saiba Mais',
        })}

        {renderCampo('propaganda_botao_link', 'Link de Destino do Botão', {
          placeholder: '/obras ou https://...',
        })}
      </div>

      {/* 👤 BLOCO 4: CONTA & SEGURANÇA DO ADMINISTRADOR */}
      <div style={{
        background: 'var(--cor-fundo-card)',
        border: '1px solid var(--cor-borda)',
        borderRadius: 'var(--raio-xl)',
        padding: 'var(--espaco-6)',
      }}>
        <h3 style={{ fontSize: 'var(--texto-xl)', marginBottom: 'var(--espaco-2)', display: 'flex', alignItems: 'center', gap: 'var(--espaco-2)' }}>
          <span>👤</span> Conta & Segurança do Administrador
        </h3>
        <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: 'var(--espaco-6)', fontSize: 'var(--texto-sm)' }}>
          Gerencie suas credenciais administrativas e chave de acesso ao sistema.
        </p>

        {/* Sub-bloco: Perfil */}
        <div style={{ marginBottom: 'var(--espaco-8)', paddingBottom: 'var(--espaco-6)', borderBottom: '1px solid var(--cor-borda)' }}>
          <h4 style={{ fontSize: 'var(--texto-lg)', marginBottom: 'var(--espaco-4)' }}>
            Dados do Perfil
          </h4>

          {msgPerfil && <div className="alerta alerta-sucesso" style={{ marginBottom: 'var(--espaco-4)' }}>✓ {msgPerfil}</div>}
          {erroPerfil && <div className="alerta alerta-erro" style={{ marginBottom: 'var(--espaco-4)' }}>⚠ {erroPerfil}</div>}

          <form onSubmit={handleSalvarPerfil} style={{ maxWidth: '480px' }}>
            <div className="campo-grupo">
              <label className="campo-label">Nome do Administrador</label>
              <input
                type="text"
                className="campo-input"
                value={perfilForm.nome}
                onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                required
              />
            </div>

            <div className="campo-grupo">
              <label className="campo-label">E-mail / Login de Acesso</label>
              <input
                type="email"
                className="campo-input"
                value={perfilForm.email}
                onChange={(e) => setPerfilForm({ ...perfilForm, email: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primario"
              disabled={salvandoPerfil}
              style={{ marginTop: 'var(--espaco-2)' }}
            >
              {salvandoPerfil ? 'Salvando...' : '💾 Salvar Dados do Perfil'}
            </button>
          </form>
        </div>

        {/* Sub-bloco: Alteração de Senha */}
        <div>
          <h4 style={{ fontSize: 'var(--texto-lg)', marginBottom: 'var(--espaco-4)' }}>
            Alteração de Senha
          </h4>

          {msgSenha && <div className="alerta alerta-sucesso" style={{ marginBottom: 'var(--espaco-4)' }}>✓ {msgSenha}</div>}
          {erroSenha && <div className="alerta alerta-erro" style={{ marginBottom: 'var(--espaco-4)' }}>⚠ {erroSenha}</div>}

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
    </div>
  );
}
