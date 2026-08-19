// =============================================================================
// Componente Carrossel — Slideshow de peças com auto-play
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function Carrossel({ itens = [], autoPlay = true, intervalo = 5000 }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  // Função para avançar slide
  const proximoSlide = useCallback(() => {
    setIndiceAtual((atual) => (atual + 1) % itens.length);
  }, [itens.length]);

  // Função para voltar slide
  const slideAnterior = useCallback(() => {
    setIndiceAtual((atual) => (atual - 1 + itens.length) % itens.length);
  }, [itens.length]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || pausado || itens.length <= 1) return;

    const timer = setInterval(proximoSlide, intervalo);
    return () => clearInterval(timer);
  }, [autoPlay, pausado, itens.length, intervalo, proximoSlide]);

  if (itens.length === 0) {
    return (
      <div className="carrossel">
        <div className="peca-card-placeholder">
          <span>🎭</span>
        </div>
      </div>
    );
  }

  // Traduzir status para tag
  const tagStatus = (status) => {
    const mapa = {
      EM_CARTAZ: { classe: 'tag-em-cartaz', texto: 'Em Cartaz' },
      ENCERRADA: { classe: 'tag-encerrada', texto: 'Encerrada' },
      PROGRAMADA: { classe: 'tag-programada', texto: 'Programada' },
    };
    return mapa[status] || mapa.PROGRAMADA;
  };

  return (
    <div
      className="carrossel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div
        className="carrossel-track"
        style={{ transform: `translateX(-${indiceAtual * 100}%)` }}
      >
        {itens.map((item, i) => {
          const fotoUrl = item.fotos?.[0]?.url;
          const tag = tagStatus(item.status);

          return (
            <div className="carrossel-slide" key={item.id || i}>
              <div className="carrossel-layout">
                {/* Lado Esquerdo / Painel de Informações */}
                <div className="carrossel-info-panel">
                  <div className="carrossel-tag-container">
                    <span className={`tag ${tag.classe}`}>
                      {tag.texto}
                    </span>
                    {item.dataEstreia && (
                      <span className="carrossel-data-badge">
                        📅 Estreia: {new Date(item.dataEstreia + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="carrossel-titulo">{item.titulo}</h2>
                  <p className="carrossel-resumo">{item.resumo}</p>
                  
                  <div className="carrossel-local">
                    <span>
                      📍 {item.locais && item.locais.length > 0
                        ? item.locais.map(l => l.cidade?.split(',')[0]?.trim()).filter(Boolean).join(' • ')
                        : item.endereco?.split('—')[0]?.trim()}
                    </span>
                  </div>

                  <div className="carrossel-acoes">
                    <Link to={`/pecas/${item.id}`} className="btn btn-primario btn-lg">
                      Ver Detalhes do Espetáculo →
                    </Link>
                  </div>
                </div>

                {/* Lado Direito / Arte da Peça */}
                <div className="carrossel-arte-container">
                  {fotoUrl ? (
                    <img
                      className="carrossel-arte-img"
                      src={fotoUrl}
                      alt={item.titulo}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="carrossel-arte-placeholder">
                      <span style={{ fontSize: '4.5rem' }}>🎭</span>
                      <span style={{ fontSize: 'var(--texto-base)', color: 'var(--cor-texto-secundario)', marginTop: '8px' }}>Theatrum Espetáculos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles de Navegação (Barra Inferior Externa da Arte) */}
      {itens.length > 1 && (
        <div className="carrossel-controles">
          <button
            className="carrossel-nav-btn"
            onClick={slideAnterior}
            aria-label="Slide anterior"
            title="Anterior"
          >
            ‹
          </button>

          {/* Indicadores */}
          <div className="carrossel-indicadores">
            {itens.map((_, i) => (
              <button
                key={i}
                className={`carrossel-indicador ${i === indiceAtual ? 'ativo' : ''}`}
                onClick={() => setIndiceAtual(i)}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="carrossel-nav-btn"
            onClick={proximoSlide}
            aria-label="Próximo slide"
            title="Próximo"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
