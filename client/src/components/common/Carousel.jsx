// =============================================================================
// Componente Carrossel — Slideshow cinematográfico com foco nas imagens das obras
// Fluxo do cliente: Home -> Página da Obra (/obras/:id) -> Agenda (/agenda)
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMediaUrl } from '../../services/api';
import { getTag } from '../../constants/statusPeca';
import defaultCover from '../../assets/theatre-placeholder.jpg';

export default function Carrossel({ itens = [], autoPlay = true, intervalo = 6000 }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  // Função para avançar slide
  const proximoSlide = useCallback(() => {
    setIndiceAtual((atual) => (atual + 1) % (itens.length || 1));
  }, [itens.length]);

  // Função para voltar slide
  const slideAnterior = useCallback(() => {
    setIndiceAtual((atual) => (atual - 1 + itens.length) % (itens.length || 1));
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

  return (
    <div
      className="carrossel carrossel-imersivo"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div
        className="carrossel-track"
        style={{ transform: `translateX(-${indiceAtual * 100}%)` }}
      >
        {itens.map((item, i) => {
          const fotoUrl = item.fotos?.[0]?.url ? getMediaUrl(item.fotos[0].url) : null;
          const tag = getTag(item.status);

          return (
            <div className="carrossel-slide" key={item.id || i}>
              {/* Imagem de Fundo em Widescreen Cinematográfico */}
              <div className="carrossel-imagem-wrap">
                <img
                  className="carrossel-bg-img"
                  src={fotoUrl || defaultCover}
                  alt={item.titulo}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onError={(e) => {
                    e.target.src = defaultCover;
                  }}
                />
                <div className="carrossel-degrade-overlay" />
              </div>

              {/* Informações e Botão de Ação */}
              <div className="carrossel-conteudo-hero">
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

                <h2 className="carrossel-titulo">
                  <Link to={`/obras/${item.id}`} className="carrossel-titulo-link">
                    {item.titulo}
                  </Link>
                </h2>

                <p className="carrossel-resumo">{item.resumo}</p>

                <div className="carrossel-acoes">
                  <Link to={`/obras/${item.id}`} className="btn btn-primario btn-lg">
                    Ver Obra →
                  </Link>
                  <Link
                    to={`/agenda?busca=${encodeURIComponent(item.titulo)}`}
                    className="btn btn-fantasma btn-lg carrossel-btn-agenda"
                  >
                    Ver Datas na Agenda 📅
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles de Navegação */}
      {itens.length > 1 && (
        <div className="carrossel-controles">
          <button
            className="carrossel-nav-btn"
            onClick={slideAnterior}
            aria-label="Slide anterior"
            title="Anterior"
            type="button"
          >
            ‹
          </button>
          <div className="carrossel-indicadores">
            {itens.map((_, i) => (
              <button
                key={i}
                className={`carrossel-indicador ${i === indiceAtual ? 'ativo' : ''}`}
                onClick={() => setIndiceAtual(i)}
                aria-label={`Ir para slide ${i + 1}`}
                type="button"
              />
            ))}
          </div>
          <button
            className="carrossel-nav-btn"
            onClick={proximoSlide}
            aria-label="Próximo slide"
            title="Próximo"
            type="button"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
