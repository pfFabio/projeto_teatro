// =============================================================================
// Theatrum — Aba de Peças (Painel Administrativo)
// Componente orquestrador limpo e modular (SOLID - Single Responsibility)
// =============================================================================

import { useState } from 'react';
import ModalPecaForm from './ModalPecaForm';
import ModalFotosManager from './ModalFotosManager';
import ModalLocaisManager from './ModalLocaisManager';
import ConfirmModal from '../common/ConfirmModal';
import { pecasAPI, getMediaUrl } from '../../services/api';
import { getTag } from '../../constants/statusPeca';

export default function AbaPecas({ pecas, onRecarregar, modalPeca, setModalPeca }) {
  // Modal de Fotos
  const [modalMidias, setModalMidias] = useState({ aberto: false, peca: null });

  // Modal de Múltiplos Locais / Temporadas
  const [modalLocais, setModalLocais] = useState({ aberto: false, peca: null });

  // Modal de Confirmação de Exclusão
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, pecaId: null });

  function abrirNova() {
    setModalPeca({ aberto: true, peca: null });
  }

  function abrirEditar(peca) {
    setModalPeca({ aberto: true, peca });
  }

  function abrirGerenciadorFotos(peca) {
    setModalMidias({ aberto: true, peca });
  }

  function abrirGerenciadorLocais(peca) {
    setModalLocais({ aberto: true, peca });
  }

  async function handleDeletarPecaConfirmada() {
    if (!confirmacaoExcluir.pecaId) return;
    try {
      await pecasAPI.deletar(confirmacaoExcluir.pecaId);
      onRecarregar();
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao deletar peça');
    }
  }

  function handlePecaSalva(pecaSalva, ehNova) {
    onRecarregar();
    if (ehNova && pecaSalva?.id) {
      abrirGerenciadorLocais(pecaSalva);
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <button className="btn btn-primario" onClick={abrirNova}>
          + Nova Peça
        </button>
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Capa / Título</th>
              <th>Status</th>
              <th>Cidades / Locais</th>
              <th>Mídias</th>
              <th>Equipe</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pecas.map(peca => {
              const tag = getTag(peca.status);
              const fotoCapa = getMediaUrl(peca.fotos?.[0]?.url);
              const totalLocais = peca.locais?.length || 0;
              const cidadesTexto =
                totalLocais > 0
                  ? peca.locais.map(l => l.cidade?.split(',')[0]?.trim()).filter(Boolean).join(', ')
                  : peca.endereco?.split('—')[0]?.trim();

              return (
                <tr key={peca.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {fotoCapa ? (
                        <img
                          src={fotoCapa}
                          alt=""
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--raio-md)',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--raio-md)',
                            background: 'var(--cor-fundo-elevado)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            border: '1px solid var(--cor-borda)',
                          }}
                        >
                          🎭
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{peca.titulo}</div>
                        <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
                          ID #{peca.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${tag.classe}`}>{tag.texto}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-fantasma btn-sm"
                      onClick={() => abrirGerenciadorLocais(peca)}
                      title="Gerenciar locais e datas das apresentações"
                      style={{ fontSize: 'var(--texto-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      📍 {totalLocais > 0 ? `${totalLocais} local(is) (${cidadesTexto})` : '+ Adicionar Locais/Datas'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-fantasma btn-sm"
                      onClick={() => abrirGerenciadorFotos(peca)}
                      title="Gerenciar fotos e vídeos"
                      style={{ fontSize: 'var(--texto-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      📷 {peca.fotos?.length > 0 ? `${peca.fotos.length} foto(s)` : '+ Fotos/Vídeos'}
                    </button>
                  </td>
                  <td>{peca._count?.colaboradores || 0} pessoas</td>
                  <td>
                    <div className="admin-acoes">
                      <button
                        className="admin-acao-btn"
                        onClick={() => abrirGerenciadorLocais(peca)}
                        title="Gerenciar Locais e Datas (Turnê)"
                      >
                        📍
                      </button>
                      <button
                        className="admin-acao-btn"
                        onClick={() => abrirGerenciadorFotos(peca)}
                        title="Gerenciar Fotos e Vídeos"
                      >
                        🖼️
                      </button>
                      <button className="admin-acao-btn" onClick={() => abrirEditar(peca)} title="Editar dados da peça">
                        ✏️
                      </button>
                      <button
                        className="admin-acao-btn perigo"
                        onClick={() => setConfirmacaoExcluir({ aberto: true, pecaId: peca.id })}
                        title="Deletar peça"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pecas.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: 'center', padding: '32px', color: 'var(--cor-texto-terciario)' }}
                >
                  Nenhuma peça cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Subcomponente Formulário de Criação/Edição */}
      <ModalPecaForm
        aberto={modalPeca.aberto}
        peca={modalPeca.peca}
        onFechar={() => setModalPeca({ aberto: false, peca: null })}
        onSalvo={handlePecaSalva}
        onAbrirLocais={abrirGerenciadorLocais}
        onAbrirFotos={abrirGerenciadorFotos}
      />

      {/* Subcomponente Gerenciador de Locais */}
      <ModalLocaisManager
        aberto={modalLocais.aberto}
        peca={modalLocais.peca}
        onFechar={() => setModalLocais({ aberto: false, peca: null })}
        onAtualizado={onRecarregar}
      />

      {/* Subcomponente Gerenciador de Fotos e Vídeos */}
      <ModalFotosManager
        aberto={modalMidias.aberto}
        peca={modalMidias.peca}
        onFechar={() => setModalMidias({ aberto: false, peca: null })}
        onAtualizado={onRecarregar}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, pecaId: null })}
        onConfirmar={handleDeletarPecaConfirmada}
        titulo="Excluir Peça"
        mensagem="Tem certeza de que deseja excluir permanentemente esta peça e todas as fotos e locais vinculados?"
        textoConfirmar="Sim, Excluir"
      />
    </div>
  );
}
