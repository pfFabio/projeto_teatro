// =============================================================================
// Theatrum — Modal de Gerenciamento de Fotos da Propaganda
// Permite adicionar fotos, excluir fotos individuais e reordená-las
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { propagandasAPI, getMediaUrl } from '../../services/api';

export default function ModalFotosPropagandaManager({
  aberto,
  propaganda,
  onFechar,
  onAtualizado,
}) {
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, fotoId: null });

  useEffect(() => {
    if (aberto && propaganda) {
      carregarFotos();
    } else {
      setFotos([]);
      setErro('');
    }
  }, [aberto, propaganda]);

  async function carregarFotos() {
    try {
      setCarregando(true);
      setErro('');
      const res = await propagandasAPI.buscar(propaganda.id);
      setFotos(res.data.fotos || []);
    } catch (err) {
      setErro('Erro ao carregar fotos da propaganda');
    } finally {
      setCarregando(false);
    }
  }

  async function handleUploadFotos(e) {
    const arquivos = e.target.files;
    if (!arquivos || arquivos.length === 0 || !propaganda) return;

    try {
      setEnviando(true);
      setErro('');
      const formData = new FormData();
      for (let i = 0; i < arquivos.length; i++) {
        formData.append('fotos', arquivos[i]);
      }
      await propagandasAPI.adicionarFotos(propaganda.id, formData);
      await carregarFotos();
      if (onAtualizado) onAtualizado();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao enviar fotos da propaganda');
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletarFotoConfirmada() {
    if (!confirmacaoExcluir.fotoId || !propaganda) return;
    try {
      await propagandasAPI.deletarFoto(propaganda.id, confirmacaoExcluir.fotoId);
      setFotos(prev => prev.filter(f => f.id !== confirmacaoExcluir.fotoId));
      if (onAtualizado) onAtualizado();
    } catch (err) {
      setErro('Erro ao excluir foto');
    }
  }

  async function handleMoverFoto(index, direcao) {
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= fotos.length || !propaganda) return;

    const novasFotos = [...fotos];
    const [fotoMovida] = novasFotos.splice(index, 1);
    novasFotos.splice(novoIndex, 0, fotoMovida);
    setFotos(novasFotos);

    try {
      const ids = novasFotos.map(f => f.id);
      const res = await propagandasAPI.reordenarFotos(propaganda.id, ids);
      setFotos(res.data || novasFotos);
      if (onAtualizado) onAtualizado();
    } catch (err) {
      setErro('Erro ao salvar ordem das fotos');
      await carregarFotos();
    }
  }

  return (
    <>
      <Modal
        aberto={aberto}
        onFechar={onFechar}
        titulo={`🖼️ Fotos da Propaganda: ${propaganda?.titulo || ''}`}
        largura="700px"
        rodape={
          <button className="btn btn-primario" onClick={onFechar}>
            Concluir
          </button>
        }
      >
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

        <div style={{ marginBottom: '20px' }}>
          <label
            className="upload-area"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              cursor: 'pointer',
            }}
          >
            <div className="upload-area-icone">📤</div>
            <div style={{ fontWeight: 600, color: 'var(--cor-texto)', marginBottom: '4px' }}>
              {enviando ? 'Enviando fotos...' : 'Clique ou arraste para adicionar fotos a esta propaganda'}
            </div>
            <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
              Formatos suportados: JPG, PNG, WebP, GIF (Até 10MB por arquivo)
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUploadFotos}
              disabled={enviando}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4
              style={{
                fontSize: 'var(--texto-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--cor-texto-secundario)',
                margin: 0,
              }}
            >
              Fotos Cadastradas ({fotos.length})
            </h4>
            <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
              A 1ª foto é a <strong>Principal</strong> exibida no banner da Home
            </span>
          </div>

          {carregando ? (
            <div className="carregando-container" style={{ padding: '24px 0' }}>
              <div className="spinner" />
              <p>Carregando fotos...</p>
            </div>
          ) : fotos.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                background: 'var(--cor-fundo-card)',
                borderRadius: 'var(--raio-lg)',
                border: '1px solid var(--cor-borda)',
                color: 'var(--cor-texto-terciario)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
              <p style={{ fontWeight: 600, color: 'var(--cor-texto)' }}>Nenhuma foto cadastrada para esta propaganda.</p>
              <p style={{ fontSize: 'var(--texto-xs)', marginTop: '4px' }}>
                Adicione fotos para ilustrar a propaganda com destaque na página inicial.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '14px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {fotos.map((foto, index) => (
                <div
                  key={foto.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--raio-lg)',
                    overflow: 'hidden',
                    border: index === 0 ? '2px solid var(--cor-primaria)' : '1px solid var(--cor-borda)',
                    background: 'var(--cor-fundo-card)',
                    boxShadow: index === 0 ? '0 0 12px rgba(13, 189, 173, 0.25)' : 'none',
                    transition: 'all var(--transicao-rapida)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '120px', background: '#0a0a0c' }}>
                    <img
                      src={getMediaUrl(foto.url)}
                      alt={`Foto ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: index === 0 ? 'var(--cor-dourado)' : 'rgba(0, 0, 0, 0.75)',
                        color: index === 0 ? 'var(--cor-texto-inverso)' : 'white',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--raio-sm)',
                      }}
                    >
                      {index === 0 ? '⭐ PRINCIPAL (1ª)' : `${index + 1}ª`}
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmacaoExcluir({ aberto: true, fotoId: foto.id })}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                      title="Excluir foto"
                    >
                      🗑️
                    </button>
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      gap: '6px',
                      justifyContent: 'space-between',
                      background: 'var(--cor-fundo-elevado)',
                      borderTop: '1px solid var(--cor-borda)',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-fantasma btn-sm"
                      onClick={() => handleMoverFoto(index, -1)}
                      disabled={index === 0}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        flex: 1,
                        justifyContent: 'center',
                        opacity: index === 0 ? 0.3 : 1,
                      }}
                      title="Mover para esquerda"
                    >
                      ◀ Anterior
                    </button>
                    <button
                      type="button"
                      className="btn btn-fantasma btn-sm"
                      onClick={() => handleMoverFoto(index, 1)}
                      disabled={index === fotos.length - 1}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        flex: 1,
                        justifyContent: 'center',
                        opacity: index === fotos.length - 1 ? 0.3 : 1,
                      }}
                      title="Mover para direita"
                    >
                      Próxima ▶
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, fotoId: null })}
        onConfirmar={handleDeletarFotoConfirmada}
        titulo="Excluir Foto"
        mensagem="Deseja realmente excluir permanentemente esta foto da propaganda?"
        textoConfirmar="Sim, Excluir Foto"
      />
    </>
  );
}
