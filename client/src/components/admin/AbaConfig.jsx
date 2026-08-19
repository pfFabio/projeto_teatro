// =============================================================================
// Aba de Configurações do Site
// Single Responsibility: apenas gerenciamento de configurações
// =============================================================================

import { useState } from 'react';
import { configAPI } from '../../services/api';

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
    </div>
  );
}
