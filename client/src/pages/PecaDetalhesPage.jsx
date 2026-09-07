// =============================================================================
// Página de Detalhes da Obra — Foco visual cinematográfico, título, imagem e sinopse/equipe
// =============================================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pecasAPI, getMediaUrl } from '../services/api';
import { getTag } from '../constants/statusPeca';
import defaultCover from '../assets/theatre-placeholder.jpg';

export default function PecaDetalhesPage() {
  const { id } = useParams();
  const [peca, setPeca] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [fotoSelecionada, setFotoSelecionada] = useState(0);

  useEffect(() => {
    carregarPeca();
  }, [id]);

  async function carregarPeca() {
    try {
      setCarregando(true);
      const res = await pecasAPI.buscar(id);
      setPeca(res.data);
      setFotoSelecionada(0);
    } catch (erro) {
      console.error('Erro ao carregar obra:', erro);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <div className="pagina-conteudo">
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando detalhes da obra...</p>
        </div>
      </div>
    );
  }

  if (!peca) {
    return (
      <div className="pagina-conteudo">
        <div className="vazio">
          <div className="vazio-icone">😔</div>
          <h3>Obra não encontrada</h3>
          <Link to="/obras" className="btn btn-primario" style={{ marginTop: '16px' }}>
            ← Voltar às Obras
          </Link>
        </div>
      </div>
    );
  }

  const tag = getTag(peca.status);
  const fotos = peca.fotos || [];
  const colaboradores = peca.colaboradores || [];
  const temFotosUpload = fotos.length > 0;
  const fotoAtual = temFotosUpload ? fotos[fotoSelecionada] : null;

  // Iniciais do nome para avatar placeholder
  const iniciais = (nome) => {
    if (!nome) return '🎭';
    return nome
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="pagina-conteudo peca-pagina-detalhe">
      {/* 1. TOPO: Navegação e Nome da Obra em destaque */}
      <div className="peca-header-topo">
        <div className="peca-header-titulos">
          <Link to="/obras" className="peca-voltar-link">
            ← Voltar para Obras
          </Link>
          <div className="peca-meta-badges">
            <span className={`tag ${tag.classe}`}>{tag.texto}</span>
            {colaboradores.length > 0 && (
              <span className="tag-equipe-badge">
                👥 {colaboradores.length} {colaboradores.length === 1 ? 'integrante' : 'integrantes'}
              </span>
            )}
          </div>
          <h1 className="peca-titulo-destaque">{peca.titulo}</h1>
        </div>

        <div className="peca-header-cta">
          <Link
            to={`/agenda?busca=${encodeURIComponent(peca.titulo)}`}
            className="btn btn-primario btn-md peca-btn-agenda"
          >
            📅 Ver Programação na Agenda
          </Link>
        </div>
      </div>

      {/* 2. SHOWCASE VISUAL: A imagem ocupa a maior parte da tela */}
      <div className="peca-showcase-container">
        <div className="peca-palco-visual">
          {temFotosUpload && fotoAtual ? (
            fotoAtual.tipo === 'VIDEO' ? (
              <video
                src={getMediaUrl(fotoAtual.url)}
                controls
                className="peca-imagem-principal"
              />
            ) : (
              <img
                src={getMediaUrl(fotoAtual.url)}
                alt={fotoAtual.descricao || peca.titulo}
                className="peca-imagem-principal"
                onError={(e) => {
                  e.target.src = defaultCover;
                }}
              />
            )
          ) : (
            <div className="peca-placeholder-wrap">
              <img
                src={defaultCover}
                alt={peca.titulo}
                className="peca-imagem-principal peca-img-padrao"
              />
              <div className="peca-placeholder-legenda">
                <span>🎭 Imagem de divulgação • Theatrum</span>
              </div>
            </div>
          )}
        </div>

        {/* Faixa de Miniaturas (se houver múltiplas fotos cadastradas) */}
        {fotos.length > 1 && (
          <div className="peca-thumbnails-track">
            {fotos.map((foto, i) => (
              <button
                key={foto.id || i}
                onClick={() => setFotoSelecionada(i)}
                className={`peca-thumb-item ${i === fotoSelecionada ? 'selecionada' : ''}`}
                title={foto.descricao || `Foto ${i + 1}`}
                type="button"
              >
                {foto.tipo === 'VIDEO' ? (
                  <div className="peca-thumb-video">▶ Vídeo</div>
                ) : (
                  <img
                    src={getMediaUrl(foto.url)}
                    alt=""
                    onError={(e) => {
                      e.target.src = defaultCover;
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. CONTEÚDO: Resumo e Equipe logo abaixo da imagem */}
      <div className="peca-conteudo-inferior">
        {/* Bloco da Sinopse / Resumo */}
        <section className="peca-bloco-sinopse card">
          <div className="peca-bloco-header">
            <span className="peca-icone-secao">📖</span>
            <h2>Sinopse</h2>
          </div>
          <p className="peca-texto-sinopse">{peca.resumo}</p>

          {/* Chamada para a Agenda */}
          <div className="peca-agenda-banner">
            <div className="peca-agenda-banner-texto">
              <strong>Temporada & Apresentações</strong>
              <p>Confira datas, horários de sessões e teatros com mapa interativo na nossa Agenda.</p>
            </div>
            <Link
              to={`/agenda?busca=${encodeURIComponent(peca.titulo)}`}
              className="btn btn-fantasma btn-sm"
            >
              Consultar Agenda →
            </Link>
          </div>
        </section>

        {/* Bloco da Equipe / Elenco */}
        <section className="peca-bloco-equipe card">
          <div className="peca-bloco-header">
            <span className="peca-icone-secao">👥</span>
            <h2>Equipe & Elenco</h2>
          </div>

          {colaboradores.length === 0 ? (
            <div className="peca-equipe-vazia">
              <span style={{ fontSize: '2rem' }}>🎭</span>
              <p>Ficha técnica e elenco em processo de escalação.</p>
            </div>
          ) : (
            <div className="peca-equipe-lista">
              {colaboradores.map((aloc) => (
                <div className="peca-membro-card" key={aloc.id}>
                  {aloc.colaborador?.fotoUrl ? (
                    <img
                      src={getMediaUrl(aloc.colaborador.fotoUrl)}
                      alt={aloc.colaborador.nome}
                      className="peca-membro-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="peca-membro-avatar-placeholder"
                    style={{ display: aloc.colaborador?.fotoUrl ? 'none' : 'flex' }}
                  >
                    {iniciais(aloc.colaborador?.nome)}
                  </div>
                  <div className="peca-membro-detalhes">
                    <span className="peca-membro-nome">{aloc.colaborador?.nome}</span>
                    <span className="peca-membro-funcao">{aloc.funcaoNaPeca}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
