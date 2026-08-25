// =============================================================================
// Theatrum — Modal de Gerenciamento de Fotos e Vídeos da Peça
// Extraído de AbaPecas.jsx (SOLID - Single Responsibility)
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { pecasAPI, getMediaUrl } from '../../services/api';

export default function ModalFotosManager({ aberto, peca, onFechar, onAtualizado }) {
  const [fotos, setFotos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, fotoId: null });

  useEffect(() => {
    if (aberto && peca) {
      carregarFotos();
    } else {
      setFotos([]);
      setErro('');
    }
  }, [aberto, peca]);

  async function carregarFotos() {
    try {
      setCarregando(true);
      setErro('');
      const res = await pecasAPI.buscar(peca.id);
      setFotos(res.data.fotos || []);
    } catch (err) {
      setErro('Erro ao carregar fotos');
    } finally {
      setCarregando(false);
    }
  }

  async function handleUploadFotos(e) {
    const arquivos = e.target.files;
    if (!arquivos || arquivos.length === 0 || !peca) return;

    try {
      setEnviando(true);
      setErro('');
      const formData = new FormData();
      for (let i = 0; i < arquivos.length; i++) {
        formData.append('arquivos', arquivos[i]);
      }
      await pecasAPI.adicionarFotos(peca.id, formData);
      await carregarFotos();
      onAtualizado();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao enviar fotos/vídeos');
    } finally {
      setEnviando(false);
    }
  }

  async function handleDeletarFotoConfirmada() {
    if (!confirmacaoExcluir.fotoId || !peca) return;
    try {
      await pecasAPI.deletarFoto(peca.id, confirmacaoExcluir.fotoId);
      setFotos(prev => prev.filter(f => f.id !== confirmacaoExcluir.fotoId));
      onAtualizado();
    } catch (err) {
      setErro('Erro ao excluir foto');
    }
  }

  async function handleDefinirCapa(fotoId) {
    if (!peca) return;
    try {
      setCarregando(true);
      setErro('');
      const res = await pecasAPI.definirFotoCapa(peca.id, fotoId);
      setFotos(res.data || []);
      onAtualizado();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao definir foto de capa');
    } finally {
      setCarregando(false);
    }
  }

  async function handleMoverFoto(index, direcao) {
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= fotos.length || !peca) return;

    const novasFotos = [...fotos];
    const [fotoMovida] = novasFotos.splice(index, 1);
    novasFotos.splice(novoIndex, 0, fotoMovida);
    setFotos(novasFotos);

    try {
      const ids = novasFotos.map(f => f.id);
      const res = await pecasAPI.reordenarFotos(peca.id, ids);
      setFotos(res.data || novasFotos);
      onAtualizado();
    } catch (err) {
      setErro('Erro ao salvar nova ordem das fotos');
      await carregarFotos();
    }
  }

  return (
    <>
      <Modal
        aberto={aberto}
        onFechar={onFechar}
        titulo={`🖼️ Fotos e Vídeos: ${peca?.titulo || ''}`}
        rodape={
          <button className="btn btn-primario" onClick={onFechar}>
            Concluir
          </button>
        }
      >
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

        <div style={{ marginBottom: '24px' }}>
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
              {enviando ? 'Enviando arquivos...' : 'Clique para selecionar fotos e vídeos'}
            </div>
            <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
              Formatos suportados: JPG, PNG, WebP, GIF, MP4, WebM (Max 50MB)
            </div>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
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
              Mídias Cadastradas ({fotos.length})
            </h4>
            <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
              A 1ª foto é a <strong>Capa</strong> exibida no carrossel da Home
            </span>
          </div>

          {carregando ? (
            <div className="carregando-container" style={{ padding: '24px 0' }}>
              <div className="spinner" />
              <p>Carregando mídias...</p>
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
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
              <p>Nenhuma foto ou vídeo cadastrado ainda para esta peça.</p>
              <p style={{ fontSize: 'var(--texto-xs)', marginTop: '4px' }}>
                Envie imagens para escolher a capa e montar a galeria do espetáculo.
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
                    boxShadow: index === 0 ? '0 0 12px rgba(13, 189, 173, 0.3)' : 'none',
                    transition: 'all var(--transicao-rapida)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '120px', background: '#000' }}>
                    {foto.tipo === 'VIDEO' ? (
                      <video src={getMediaUrl(foto.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={getMediaUrl(foto.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {index === 0 ? '⭐ CAPA (1º)' : `${index + 1}º`}
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmacaoExcluir({ aberto: true, fotoId: foto.id })}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: 'var(--cor-erro, #ef4444)',
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
                      title="Excluir mídia"
                    >
                      🗑️
                    </button>
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      background: 'var(--cor-fundo-elevado)',
                      borderTop: '1px solid var(--cor-borda)',
                    }}
                  >
                    {index !== 0 ? (
                      <button
                        type="button"
                        className="btn btn-dourado btn-sm"
                        onClick={() => handleDefinirCapa(foto.id)}
                        style={{ fontSize: '11px', padding: '4px 6px', width: '100%', justifyContent: 'center' }}
                      >
                        ⭐ Tornar Capa
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--cor-dourado)',
                          fontWeight: 600,
                          textAlign: 'center',
                          padding: '4px 0',
                        }}
                      >
                        ✓ Capa Atual do Banner
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-sm"
                        onClick={() => handleMoverFoto(index, -1)}
                        disabled={index === 0}
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          flex: 1,
                          justifyContent: 'center',
                          opacity: index === 0 ? 0.3 : 1,
                        }}
                        title="Mover para antes"
                      >
                        ◀ Mover
                      </button>
                      <button
                        type="button"
                        className="btn btn-fantasma btn-sm"
                        onClick={() => handleMoverFoto(index, 1)}
                        disabled={index === fotos.length - 1}
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          flex: 1,
                          justifyContent: 'center',
                          opacity: index === fotos.length - 1 ? 0.3 : 1,
                        }}
                        title="Mover para depois"
                      >
                        Mover ▶
                      </button>
                    </div>
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
        titulo="Excluir Mídia"
        mensagem="Deseja realmente excluir permanentemente esta foto/vídeo da peça?"
        textoConfirmar="Sim, Excluir"
      />
    </>
  );
}
