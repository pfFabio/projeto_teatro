// =============================================================================
// Página de Detalhes da Peça — Galeria, resumo, mapa, elenco
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MapView from '../components/common/MapView';
import { pecasAPI, getMediaUrl } from '../services/api';
import { getTag } from '../constants/statusPeca';

export default function PecaDetalhesPage() {
  const { id } = useParams();
  const [peca, setPeca] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState(0);
  const [localSelecionadoIndex, setLocalSelecionadoIndex] = useState(0);

  useEffect(() => {
    carregarPeca();
  }, [id]);

  async function carregarPeca() {
    try {
      setCarregando(true);
      const res = await pecasAPI.buscar(id);
      setPeca(res.data);
      setLocalSelecionadoIndex(0);
    } catch (erro) {
      console.error('Erro ao carregar peça:', erro);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="pagina-conteudo">
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!peca) {
    return (
      <div className="pagina-conteudo">
        <div className="vazio">
          <div className="vazio-icone">😔</div>
          <h3>Peça não encontrada</h3>
          <Link to="/pecas" className="btn btn-primario" style={{ marginTop: '16px' }}>
            ← Voltar às Peças
          </Link>
        </div>
      </div>
    );
  }

  const tag = getTag(peca.status);

  const fotos = peca.fotos || [];
  const colaboradores = peca.colaboradores || [];
  const locais = peca.locais || [];

  // Local atualmente selecionado para exibição no mapa
  const localAtual = locais.length > 0 ? locais[localSelecionadoIndex] : null;
  const latitudeMapa = localAtual?.latitude || peca.latitude;
  const longitudeMapa = localAtual?.longitude || peca.longitude;
  const enderecoMapa = localAtual ? `${localAtual.nomeLocal} — ${localAtual.endereco}` : peca.endereco;

  // Cidades únicas onde a peça se apresenta
  const cidadesUnicas = [...new Set(locais.map(l => l.cidade))].join(' • ');

  // Iniciais do nome para avatar placeholder
  const iniciais = (nome) => {
    return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div>
      {/* === Hero === */}
      <div className="peca-detalhe-hero">
        {fotos.length > 0 && fotos[0].tipo === 'IMAGEM' ? (
          <img
            className="peca-detalhe-hero-img"
            src={getMediaUrl(fotos[0].url)}
            alt={peca.titulo}
          />
        ) : (
          <div className="peca-detalhe-hero-img" style={{
            background: 'linear-gradient(135deg, var(--cor-primaria-escura), var(--cor-fundo))',
          }} />
        )}
        <div className="peca-detalhe-hero-overlay">
          <div className="peca-detalhe-hero-info">
            <span className={`tag ${tag.classe}`} style={{ marginBottom: '12px', display: 'inline-block' }}>
              {tag.texto}
            </span>
            <h1>{peca.titulo}</h1>
            <div className="peca-detalhe-meta">
              <span className="peca-detalhe-meta-item">
                📍 {cidadesUnicas || peca.endereco?.split('—')[0]?.trim()}
              </span>
              {locais.length > 0 ? (
                <span className="peca-detalhe-meta-item">
                  🎭 {locais.length} praça(s) de apresentação
                </span>
              ) : peca.dataEstreia && (
                <span className="peca-detalhe-meta-item">
                  📅 Estreia: {new Date(peca.dataEstreia + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              )}
              <span className="peca-detalhe-meta-item">👥 {colaboradores.length} pessoas</span>
            </div>
          </div>
        </div>
      </div>

      {/* === Conteúdo === */}
      <div className="pagina-conteudo">
        <div className="peca-detalhe-grid">
          {/* Coluna principal */}
          <div>
            {/* Resumo */}
            <section className="secao">
              <h2 className="secao-titulo" style={{ fontSize: 'var(--texto-2xl)' }}>📖 Sinopse</h2>
              <p className="peca-detalhe-resumo">{peca.resumo}</p>
            </section>

            {/* Múltiplos Locais e Temporadas */}
            {locais.length > 0 && (
              <section className="secao">
                <h2 className="secao-titulo" style={{ fontSize: 'var(--texto-2xl)' }}>
                  📍 Temporadas & Locais de Apresentação
                </h2>
                <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '16px', fontSize: 'var(--texto-sm)' }}>
                  Selecione uma cidade/teatro para ver no mapa e consultar as datas:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {locais.map((local, index) => {
                    const tagLocal = getTag(local.status);
                    const estaSelecionado = index === localSelecionadoIndex;

                    return (
                      <div
                        key={local.id}
                        onClick={() => setLocalSelecionadoIndex(index)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: 'var(--raio-xl)',
                          background: estaSelecionado ? 'var(--cor-primaria-translucida)' : 'var(--cor-fundo-card)',
                          border: estaSelecionado ? '2px solid var(--cor-primaria-clara)' : '1px solid var(--cor-borda)',
                          cursor: 'pointer',
                          transition: 'all var(--transicao-rapida)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <strong style={{ fontSize: 'var(--texto-lg)', color: 'var(--cor-texto)' }}>
                              {local.nomeLocal}
                            </strong>
                            <span style={{
                              color: 'var(--cor-dourado)',
                              fontWeight: 600,
                              fontSize: 'var(--texto-sm)',
                              background: 'rgba(13, 189, 173, 0.12)',
                              padding: '2px 8px',
                              borderRadius: 'var(--raio-completo)',
                            }}>
                              {local.cidade}
                            </span>
                            <span className={`tag ${tagLocal.classe}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {tagLocal.texto}
                            </span>
                          </div>

                          <div style={{ fontSize: 'var(--texto-sm)', color: 'var(--cor-texto-secundario)' }}>
                            📍 {local.endereco}
                          </div>

                          <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', marginTop: '4px' }}>
                            {local.dataEstreia && (
                              <span>
                                📅 <strong>Temporada:</strong> {new Date(local.dataEstreia + 'T00:00:00').toLocaleDateString('pt-BR')}
                                {local.dataFim && ` até ${new Date(local.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                              </span>
                            )}
                            {local.horario && <span style={{ marginLeft: '8px' }}>• ⏰ {local.horario}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`btn ${estaSelecionado ? 'btn-primario' : 'btn-fantasma'} btn-sm`}
                          style={{ pointerEvents: 'none' }}
                        >
                          {estaSelecionado ? '✓ Local Selecionado' : 'Ver no Mapa 📍'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Galeria de fotos e vídeos */}
            {fotos.length > 0 && (
              <section className="secao">
                <h2 className="secao-titulo" style={{ fontSize: 'var(--texto-2xl)' }}>📸 Galeria</h2>
                
                {/* Mídia principal */}
                <div style={{
                  borderRadius: 'var(--raio-xl)',
                  overflow: 'hidden',
                  marginBottom: 'var(--espaco-4)',
                  border: '1px solid var(--cor-borda)',
                }}>
                  {fotos[fotoSelecionada]?.tipo === 'VIDEO' ? (
                    <video
                      src={getMediaUrl(fotos[fotoSelecionada].url)}
                      controls
                      style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <img
                      src={getMediaUrl(fotos[fotoSelecionada]?.url)}
                      alt={fotos[fotoSelecionada]?.descricao || peca.titulo}
                      style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </div>

                {/* Thumbnails */}
                {fotos.length > 1 && (
                  <div style={{ display: 'flex', gap: 'var(--espaco-2)', overflowX: 'auto' }}>
                    {fotos.map((foto, i) => (
                      <button
                        key={foto.id}
                        onClick={() => setFotoSelecionada(i)}
                        style={{
                          border: i === fotoSelecionada ? '2px solid var(--cor-primaria)' : '2px solid var(--cor-borda)',
                          borderRadius: 'var(--raio-md)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: 'none',
                          padding: 0,
                          flexShrink: 0,
                          opacity: i === fotoSelecionada ? 1 : 0.6,
                          transition: 'all var(--transicao-rapida)',
                        }}
                      >
                        {foto.tipo === 'VIDEO' ? (
                          <div style={{
                            width: '80px',
                            height: '60px',
                            background: 'var(--cor-fundo-elevado)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                          }}>
                            ▶
                          </div>
                        ) : (
                          <img
                            src={getMediaUrl(foto.url)}
                            alt={foto.descricao || ''}
                            style={{ width: '80px', height: '60px', objectFit: 'cover', display: 'block' }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Mapa Interativo */}
            <section className="secao">
              <h2 className="secao-titulo" style={{ fontSize: 'var(--texto-2xl)' }}>
                📍 Mapa do Espetáculo {localAtual ? `(${localAtual.cidade})` : ''}
              </h2>
              <MapView
                latitude={latitudeMapa}
                longitude={longitudeMapa}
                endereco={enderecoMapa}
              />
              <p style={{
                marginTop: 'var(--espaco-3)',
                color: 'var(--cor-texto-secundario)',
                fontSize: 'var(--texto-sm)',
              }}>
                {enderecoMapa}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="peca-detalhe-sidebar">
            {/* Info rápida */}
            <div className="peca-detalhe-info-box">
              <h4>📋 Informações</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espaco-3)' }}>
                <div>
                  <span style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-xs)' }}>STATUS</span>
                  <div><span className={`tag ${tag.classe}`}>{tag.texto}</span></div>
                </div>
                {locais.length > 0 ? (
                  <div>
                    <span style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-xs)' }}>CIDADES / PRAÇAS</span>
                    <div style={{ fontWeight: 500 }}>{cidadesUnicas}</div>
                  </div>
                ) : peca.dataEstreia && (
                  <div>
                    <span style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-xs)' }}>DATA DE ESTREIA</span>
                    <div style={{ fontWeight: 500 }}>
                      {new Date(peca.dataEstreia + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-xs)' }}>EQUIPE</span>
                  <div style={{ fontWeight: 500 }}>{colaboradores.length} pessoas</div>
                </div>
              </div>
            </div>

            {/* Elenco e equipe */}
            <div className="peca-detalhe-info-box">
              <h4>🎭 Elenco & Equipe</h4>
              {colaboradores.length === 0 ? (
                <p style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-sm)' }}>
                  Nenhum colaborador alocado ainda.
                </p>
              ) : (
                <div className="elenco-lista">
                  {colaboradores.map((aloc) => (
                    <div className="elenco-item" key={aloc.id}>
                      {aloc.colaborador.fotoUrl ? (
                        <img
                          className="elenco-item-avatar"
                          src={getMediaUrl(aloc.colaborador.fotoUrl)}
                          alt={aloc.colaborador.nome}
                        />
                      ) : (
                        <div className="elenco-item-avatar-placeholder">
                          {iniciais(aloc.colaborador.nome)}
                        </div>
                      )}
                      <div className="elenco-item-info">
                        <div className="elenco-item-nome">{aloc.colaborador.nome}</div>
                        <div className="elenco-item-funcao">{aloc.funcaoNaPeca}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voltar */}
        <div style={{ marginTop: 'var(--espaco-8)' }}>
          <Link to="/pecas" className="btn btn-fantasma">
            ← Voltar às Peças
          </Link>
        </div>
      </div>
    </div>
  );
}
