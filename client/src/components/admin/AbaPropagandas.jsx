// =============================================================================
// Theatrum — Aba de Gerenciamento de Propagandas / Anúncios
// Listagem, filtros, status, edição de textos, exclusão e gestão de fotos
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import ModalPropagandaForm from './ModalPropagandaForm';
import ModalFotosPropagandaManager from './ModalFotosPropagandaManager';
import ConfirmModal from '../common/ConfirmModal';
import { propagandasAPI, getMediaUrl } from '../../services/api';

export default function AbaPropagandas({ onRecarregarTotal }) {
  const [propagandas, setPropagandas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODAS'); // TODAS | ATIVAS | INATIVAS

  // Estados dos modais
  const [modalForm, setModalForm] = useState({ aberto: false, propaganda: null });
  const [modalFotos, setModalFotos] = useState({ aberto: false, propaganda: null });
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, propaganda: null });
  const [alternandoStatus, setAlternandoStatus] = useState(null);

  const carregarPropagandas = useCallback(async () => {
    try {
      setCarregando(true);
      const params = { limite: 100 };
      if (filtroStatus === 'ATIVAS') params.ativo = true;
      if (filtroStatus === 'INATIVAS') params.ativo = false;
      if (busca.trim()) params.busca = busca.trim();

      const res = await propagandasAPI.listar(params);
      setPropagandas(res.data.propagandas || []);
    } catch (err) {
      console.error('Erro ao carregar propagandas:', err);
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus, busca]);

  useEffect(() => {
    carregarPropagandas();
  }, [carregarPropagandas]);

  async function handleAlternarStatus(prop) {
    try {
      setAlternandoStatus(prop.id);
      await propagandasAPI.atualizar(prop.id, { ativo: !prop.ativo });
      await carregarPropagandas();
      if (onRecarregarTotal) onRecarregarTotal();
    } catch (err) {
      alert('Erro ao alterar status da propaganda');
    } finally {
      setAlternandoStatus(null);
    }
  }

  async function handleExcluirConfirmado() {
    if (!confirmacaoExcluir.propaganda) return;
    try {
      await propagandasAPI.deletar(confirmacaoExcluir.propaganda.id);
      setConfirmacaoExcluir({ aberto: false, propaganda: null });
      await carregarPropagandas();
      if (onRecarregarTotal) onRecarregarTotal();
    } catch (err) {
      alert('Erro ao excluir propaganda');
    }
  }

  return (
    <div>
      {/* Barra de Ações Superior */}
      <div className="admin-barra-acoes">
        <div className="admin-busca-wrapper">
          <input
            type="text"
            className="campo-input admin-busca"
            placeholder="🔍 Buscar propaganda por título ou texto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="admin-filtros">
            <button
              className={`btn btn-sm ${filtroStatus === 'TODAS' ? 'btn-primario' : 'btn-fantasma'}`}
              onClick={() => setFiltroStatus('TODAS')}
            >
              Todas ({propagandas.length})
            </button>
            <button
              className={`btn btn-sm ${filtroStatus === 'ATIVAS' ? 'btn-primario' : 'btn-fantasma'}`}
              onClick={() => setFiltroStatus('ATIVAS')}
            >
              Ativas
            </button>
            <button
              className={`btn btn-sm ${filtroStatus === 'INATIVAS' ? 'btn-primario' : 'btn-fantasma'}`}
              onClick={() => setFiltroStatus('INATIVAS')}
            >
              Inativas
            </button>
          </div>
        </div>

        <button
          className="btn btn-primario"
          onClick={() => setModalForm({ aberto: true, propaganda: null })}
        >
          ➕ Nova Propaganda
        </button>
      </div>

      {/* Lista de Propagandas */}
      {carregando ? (
        <div className="carregando-container" style={{ padding: '60px 0' }}>
          <div className="spinner" />
          <p>Carregando publicações de propaganda...</p>
        </div>
      ) : propagandas.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--cor-fundo-card)',
            border: '1px solid var(--cor-borda)',
            borderRadius: 'var(--raio-xl)',
            color: 'var(--cor-texto-secundario)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📢</div>
          <h3 style={{ color: 'var(--cor-texto)', marginBottom: '8px' }}>Nenhuma propaganda encontrada</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto var(--espaco-6)' }}>
            Crie publicações de anúncios de cursos, workshops e novidades para que apareçam em destaque na página inicial.
          </p>
          <button
            className="btn btn-primario"
            onClick={() => setModalForm({ aberto: true, propaganda: null })}
          >
            Publicar Primeira Propaganda
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--espaco-6)' }}>
          {propagandas.map((prop) => {
            const fotoCapa = prop.fotos && prop.fotos.length > 0 ? prop.fotos[0] : null;

            return (
              <div
                key={prop.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: prop.ativo ? '1px solid var(--cor-borda)' : '1px dashed var(--cor-borda)',
                  opacity: prop.ativo ? 1 : 0.75,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Foto da Propaganda */}
                <div style={{ position: 'relative', width: '100%', height: '180px', background: 'var(--cor-fundo-elevado)', overflow: 'hidden' }}>
                  {fotoCapa ? (
                    <img
                      src={getMediaUrl(fotoCapa.url)}
                      alt={prop.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(13,189,173,0.15) 0%, rgba(212,160,23,0.15) 100%)',
                        color: 'var(--cor-texto-secundario)',
                        gap: '6px',
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>📢</span>
                      <span style={{ fontSize: 'var(--texto-xs)' }}>Sem fotos cadastradas</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    <span
                      className={`tag ${prop.ativo ? 'tag-em-cartaz' : 'tag-encerrada'}`}
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
                    >
                      {prop.ativo ? '● Ativa na Home' : '○ Inativa'}
                    </span>
                  </div>

                  {/* Contador de fotos */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: 'var(--raio-sm)',
                      fontSize: 'var(--texto-xs)',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    📷 {prop.fotos?.length || 0} foto(s)
                  </div>
                </div>

                {/* Conteúdo textual da propaganda */}
                <div className="card-corpo" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 className="card-titulo" style={{ margin: 0, fontSize: 'var(--texto-lg)' }}>
                      {prop.titulo}
                    </h3>
                  </div>

                  <p
                    className="card-texto"
                    style={{
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: 'var(--espaco-4)',
                      lineHeight: '1.6',
                    }}
                  >
                    {prop.descricao}
                  </p>

                  {/* Metadados: Link & Botão */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: 'var(--texto-xs)',
                      color: 'var(--cor-texto-terciario)',
                      padding: '8px 12px',
                      background: 'var(--cor-fundo-elevado)',
                      borderRadius: 'var(--raio-md)',
                      marginBottom: 'var(--espaco-4)',
                    }}
                  >
                    <span>🔘 Botão: <strong>{prop.textoBotao || 'Saiba Mais'}</strong></span>
                    {prop.link && <span>🔗 Destino: <code style={{ color: 'var(--cor-primaria)' }}>{prop.link}</code></span>}
                  </div>

                  {/* Botões de Ação */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginTop: 'auto',
                      borderTop: '1px solid var(--cor-borda)',
                      paddingTop: 'var(--espaco-4)',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secundario btn-sm"
                      onClick={() => setModalForm({ aberto: true, propaganda: prop })}
                      title="Editar textos e links"
                    >
                      ✏️ Editar Textos
                    </button>

                    <button
                      type="button"
                      className="btn btn-dourado btn-sm"
                      onClick={() => setModalFotos({ aberto: true, propaganda: prop })}
                      title="Adicionar ou excluir fotos"
                    >
                      🖼️ Fotos ({prop.fotos?.length || 0})
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${prop.ativo ? 'btn-fantasma' : 'btn-primario'}`}
                      onClick={() => handleAlternarStatus(prop)}
                      disabled={alternandoStatus === prop.id}
                      title={prop.ativo ? 'Desativar propaganda' : 'Ativar propaganda'}
                    >
                      {alternandoStatus === prop.id ? '...' : prop.ativo ? '⏸ Pausar' : '▶ Ativar'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-fantasma btn-sm"
                      onClick={() => setConfirmacaoExcluir({ aberto: true, propaganda: prop })}
                      style={{ color: 'var(--cor-erro, #ef4444)' }}
                      title="Excluir propaganda"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <ModalPropagandaForm
        aberto={modalForm.aberto}
        propaganda={modalForm.propaganda}
        onFechar={() => setModalForm({ aberto: false, propaganda: null })}
        onSalvo={() => {
          carregarPropagandas();
          if (onRecarregarTotal) onRecarregarTotal();
        }}
        onAbrirFotos={(prop) => setModalFotos({ aberto: true, propaganda: prop })}
      />

      <ModalFotosPropagandaManager
        aberto={modalFotos.aberto}
        propaganda={modalFotos.propaganda}
        onFechar={() => setModalFotos({ aberto: false, propaganda: null })}
        onAtualizado={() => {
          carregarPropagandas();
          if (onRecarregarTotal) onRecarregarTotal();
        }}
      />

      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, propaganda: null })}
        onConfirmar={handleExcluirConfirmado}
        titulo="Excluir Propaganda"
        mensagem={`Deseja realmente excluir permanentemente a propaganda "${confirmacaoExcluir.propaganda?.titulo}" e todas as suas imagens?`}
        textoConfirmar="Sim, Excluir Propaganda"
      />
    </div>
  );
}
