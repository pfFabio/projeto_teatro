// =============================================================================
// Theatrum — Seção de Propagandas na Página Inicial (5 Mais Recentes)
// Suporte a carrossel de anúncios, transições suaves, fotos e links customizados
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../services/api';

export default function PropagandasSection({ propagandas = [], config = {} }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [indiceFoto, setIndiceFoto] = useState(0);
  const [pausado, setPausado] = useState(false);

  const totalPropagandas = propagandas.length;

  // Resetar índice de foto ao trocar de propaganda
  useEffect(() => {
    setIndiceFoto(0);
  }, [indiceAtual]);

  // Avançar para a próxima propaganda
  const proximaPropaganda = useCallback(() => {
    if (totalPropagandas <= 1) return;
    setIndiceAtual((prev) => (prev + 1) % totalPropagandas);
  }, [totalPropagandas]);

  // Voltar para a propaganda anterior
  const propagandaAnterior = useCallback(() => {
    if (totalPropagandas <= 1) return;
    setIndiceAtual((prev) => (prev - 1 + totalPropagandas) % totalPropagandas);
  }, [totalPropagandas]);

  // Auto-play do carrossel de propagandas
  useEffect(() => {
    if (pausado || totalPropagandas <= 1) return;
    const timer = setInterval(proximaPropaganda, 7000);
    return () => clearInterval(timer);
  }, [pausado, totalPropagandas, proximaPropaganda]);

  // Fallback caso nenhuma propaganda esteja cadastrada
  if (totalPropagandas === 0) {
    const tituloFallback = config.propaganda_titulo?.valor || 'Aulas e Projetos Theatrum';
    const textoFallback = config.propaganda_texto?.valor ||
      'Descubra o artista que existe em você! Nossas oficinas e aulas de teatro são para todas as idades e níveis de experiência. Venha desenvolver sua expressão corporal, oratória e criatividade em um ambiente acolhedor e inspirador.';
    const botaoTextoFallback = config.propaganda_botao_texto?.valor || 'Saiba Mais';
    const botaoLinkFallback = config.propaganda_botao_link?.valor || '#contato';
    const imagemFallback = config.propaganda_imagem?.valor;

    return (
      <section className="secao">
        <div className="pagina-conteudo">
          <div className="home-propaganda animar-entrada">
            <div className="home-propaganda-info">
              <div className="propaganda-badge-container">
                <span className="propaganda-badge">📢 Destaque</span>
              </div>
              <h2>
                {tituloFallback} <span>✨</span>
              </h2>
              <p>{textoFallback}</p>
              {botaoLinkFallback.startsWith('http') ? (
                <a
                  href={botaoLinkFallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-dourado btn-lg"
                >
                  {botaoTextoFallback} →
                </a>
              ) : (
                <Link to={botaoLinkFallback} className="btn btn-dourado btn-lg">
                  {botaoTextoFallback} →
                </Link>
              )}
            </div>
            <div>
              {imagemFallback ? (
                <img
                  src={getMediaUrl(imagemFallback)}
                  alt="Propaganda"
                  className="home-propaganda-img"
                />
              ) : (
                <div className="home-propaganda-placeholder">
                  <span>🎭</span>
                  <span>Theatrum Aulas & Oficinas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const propagandaAtual = propagandas[indiceAtual] || propagandas[0];
  const fotos = propagandaAtual.fotos || [];
  const fotoAtual = fotos[indiceFoto] || fotos[0];
  const linkDestino = propagandaAtual.link || '#contato';
  const textoBotao = propagandaAtual.textoBotao || 'Saiba Mais';

  function renderBotaoCTA() {
    if (linkDestino.startsWith('http://') || linkDestino.startsWith('https://')) {
      return (
        <a
          href={linkDestino}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-dourado btn-lg"
          style={{ alignSelf: 'flex-start' }}
        >
          {textoBotao} →
        </a>
      );
    }

    if (linkDestino.startsWith('#')) {
      return (
        <a
          href={linkDestino}
          className="btn btn-dourado btn-lg"
          style={{ alignSelf: 'flex-start' }}
          onClick={(e) => {
            const el = document.querySelector(linkDestino);
            if (el) {
              e.preventDefault();
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {textoBotao} →
        </a>
      );
    }

    return (
      <Link
        to={linkDestino}
        className="btn btn-dourado btn-lg"
        style={{ alignSelf: 'flex-start' }}
      >
        {textoBotao} →
      </Link>
    );
  }

  return (
    <section className="secao">
      <div className="pagina-conteudo">
        <div
          className="home-propaganda animar-entrada"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          {/* Coluna de Textos */}
          <div className="home-propaganda-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--espaco-3)' }}>
              <span className="propaganda-badge">
                📢 {totalPropagandas > 1 ? `Novidade (${indiceAtual + 1}/${totalPropagandas})` : 'Novidade'}
              </span>
              {propagandaAtual.criadoEm && (
                <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
                  Publicado recentemente
                </span>
              )}
            </div>

            <h2>
              {propagandaAtual.titulo} <span>✨</span>
            </h2>

            <p>{propagandaAtual.descricao}</p>

            <div style={{ marginTop: 'var(--espaco-4)', display: 'flex', alignItems: 'center', gap: 'var(--espaco-4)' }}>
              {renderBotaoCTA()}
            </div>
          </div>

          {/* Coluna de Imagem / Galeria de Fotos */}
          <div className="home-propaganda-midia-wrapper">
            {fotoAtual ? (
              <div className="home-propaganda-foto-container">
                <img
                  src={getMediaUrl(fotoAtual.url)}
                  alt={propagandaAtual.titulo}
                  className="home-propaganda-img"
                  loading="eager"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const ph = e.target.parentElement.querySelector('.home-propaganda-placeholder');
                    if (ph) ph.style.display = 'flex';
                  }}
                />
                <div
                  className="home-propaganda-placeholder"
                  style={{ display: 'none' }}
                >
                  <span>🎭</span>
                  <span>{propagandaAtual.titulo}</span>
                </div>

                {/* Se a propaganda tiver mais de 1 foto, miniaturas/navegador de fotos */}
                {fotos.length > 1 && (
                  <div className="propaganda-fotos-navegador">
                    {fotos.map((f, fIdx) => (
                      <button
                        key={f.id || fIdx}
                        type="button"
                        className={`propaganda-foto-thumb ${fIdx === indiceFoto ? 'ativa' : ''}`}
                        onClick={() => setIndiceFoto(fIdx)}
                        aria-label={`Ver foto ${fIdx + 1}`}
                      >
                        <img src={getMediaUrl(f.url)} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="home-propaganda-placeholder">
                <span>🎭</span>
                <span>{propagandaAtual.titulo}</span>
              </div>
            )}
          </div>

          {/* Controles de Navegação entre as 5 propagandas */}
          {totalPropagandas > 1 && (
            <div className="home-propaganda-controles">
              <button
                type="button"
                className="propaganda-nav-btn"
                onClick={propagandaAnterior}
                aria-label="Propaganda anterior"
                title="Anterior"
              >
                ‹
              </button>

              <div className="propaganda-indicadores">
                {propagandas.map((p, idx) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    className={`propaganda-indicador ${idx === indiceAtual ? 'ativo' : ''}`}
                    onClick={() => setIndiceAtual(idx)}
                    aria-label={`Ir para propaganda ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="propaganda-nav-btn"
                onClick={proximaPropaganda}
                aria-label="Próxima propaganda"
                title="Próxima"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
