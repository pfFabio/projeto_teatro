// =============================================================================
// Página de Detalhes da Obra (PecaDetalhesPage)
// Palco visual cinematográfico, sinopse, equipe, ingresso e downloads técnicos (Ata #02)
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
    async function carregarPeca() {
      try {
        setCarregando(true);
        const res = await pecasAPI.buscar(id);
        setPeca(res.data);
      } catch (erro) {
        console.error('Erro ao buscar detalhes da obra:', erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarPeca();
  }, [id]);

  if (carregando) {
    return (
      <div className="pagina-conteudo peca-pagina-detalhe">
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando detalhes da obra...</p>
        </div>
      </div>
    );
  }

  if (!peca) {
    return (
      <div className="pagina-conteudo peca-pagina-detalhe">
        <div className="vazio-container">
          <h2>Obra não encontrada</h2>
          <p>O espetáculo que você procura não está cadastrado ou foi removido.</p>
          <Link to="/obras" className="btn btn-primario btn-md">
            Voltar às Obras
          </Link>
        </div>
      </div>
    );
  }

  const tag = getTag(peca.status);
  const fotos = peca.fotos || [];
  const temFotosUpload = fotos.length > 0;
  const fotoAtual = temFotosUpload ? fotos[fotoSelecionada] || fotos[0] : null;
  const colaboradores = peca.colaboradores || [];

  // Downloads técnicos padrão se a peça for Em Cartaz (Ata #02: Rider, Projeto, Dramaturgia, Ficha Técnica)
  const downloadsPadrao = [
    {
      id: 'dt-1',
      titulo: 'Rider Técnico Completo',
      descricao: 'Mapa de palco, especificações de iluminação e som',
      url: '/downloads/RIDER_TECNICO_Da_Janela_o_Mar.pdf',
      tamanho: '3.4 MB',
      formato: 'PDF',
    },
    {
      id: 'dt-2',
      titulo: 'Projeto de Encenação & Press Kit',
      descricao: 'Conceito artístico, sinopse detalhada e histórico de montagem',
      url: '/downloads/PROJETO_Da_Janela_o_Mar.pdf',
      tamanho: '6.5 MB',
      formato: 'PDF',
    },
    {
      id: 'dt-3',
      titulo: 'Dramaturgia Original',
      descricao: 'Texto integral da dramaturgia poética por Angelo Faria Turci',
      url: '/downloads/DRAMATURGIA_Da_Janela_o_Mar.pdf',
      tamanho: '68 KB',
      formato: 'PDF',
    },
    {
      id: 'dt-4',
      titulo: 'Ficha Técnica & Clipping',
      descricao: 'Ficha artística e técnica completa e clipping de imprensa',
      url: '/downloads/FICHA_TECNICA_Da_Janela_o_Mar.pdf',
      tamanho: '27 KB',
      formato: 'PDF',
    },
  ];

  const downloadsExibidos =
    peca.downloadsTecnicos && peca.downloadsTecnicos.length > 0
      ? peca.downloadsTecnicos
      : downloadsPadrao;

  // Iniciais do nome para avatar fallback
  const iniciais = (nome) => {
    if (!nome) return '🎭';
    return nome
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const urlFotoAtual = temFotosUpload && fotoAtual?.url ? getMediaUrl(fotoAtual.url) : defaultCover;

  return (
    <div className="peca-pagina-detalhe">
      {/* 1. PALCO HERO IMERSIVO — A imagem ocupa a tela quase completamente como background trazendo a vibe da peça */}
      <section className="peca-hero-imersivo" aria-label={`Palco e atmosfera de ${peca.titulo}`}>
        {/* Aura atmosférica difusa da imagem para projetar as cores e a vibração da peça nas bordas */}
        <div className="peca-hero-aura-wrapper" aria-hidden="true">
          <img
            src={urlFotoAtual}
            alt=""
            className="peca-hero-aura-img"
            onError={(e) => {
              e.target.src = defaultCover;
            }}
          />
        </div>

        {/* Cenário de Fundo (Background Image / Video ocupando a tela) */}
        <div className="peca-palco-visual peca-hero-bg-container">
          {temFotosUpload && fotoAtual ? (
            fotoAtual.tipo === 'VIDEO' ? (
              <video
                key={fotoAtual.url}
                src={getMediaUrl(fotoAtual.url)}
                controls
                className="peca-imagem-principal peca-hero-bg-media"
              />
            ) : (
              <img
                key={fotoAtual.url}
                src={getMediaUrl(fotoAtual.url)}
                alt={fotoAtual.descricao || peca.titulo}
                className="peca-imagem-principal peca-hero-bg-media"
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
                className="peca-imagem-principal peca-hero-bg-media peca-img-padrao"
              />
            </div>
          )}

          {/* Overlays Cinemáticos de Palco Teatral (Vignette de holofotes + gradiente de fusão inferior) */}
          <div className="peca-hero-scenic-overlay" aria-hidden="true" />
        </div>

        {/* Setas Minimalistas de Navegação entre Imagens (apenas quando há múltiplas fotos) */}
        {fotos.length > 1 && (
          <div className="peca-hero-setas-container" aria-label="Navegação de fotos">
            <button
              type="button"
              className="peca-hero-seta peca-seta-esquerda"
              onClick={() => setFotoSelecionada((prev) => (prev - 1 + fotos.length) % fotos.length)}
              aria-label="Foto anterior"
              title="Foto anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="peca-hero-seta peca-seta-direita"
              onClick={() => setFotoSelecionada((prev) => (prev + 1) % fotos.length)}
              aria-label="Próxima foto"
              title="Próxima foto"
            >
              ›
            </button>
          </div>
        )}

        {/* Camada de Conteúdo e Controles sobrepostos ao Background */}
        <div className="peca-hero-camada-conteudo">
          {/* Topo do Palco: Apenas navegação limpa */}
          <div className="peca-header-topo peca-hero-topo">
            <Link to="/obras" className="peca-voltar-link">
              ← Voltar para Obras
            </Link>
          </div>

          {/* Base do Palco: Título Monumental e CTAs */}
          <div className="peca-hero-rodape">
            <div className="peca-hero-info">
              <h1 className="peca-titulo-destaque">{peca.titulo}</h1>

              <div className="peca-hero-acoes peca-header-cta">
                {peca.linkIngresso && (
                  <a
                    href={peca.linkIngresso}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primario peca-btn-ingresso"
                  >
                    🎟️ Comprar Ingresso
                  </a>
                )}
                <Link
                  to={`/agenda?busca=${encodeURIComponent(peca.titulo)}`}
                  className={`btn ${peca.linkIngresso ? 'btn-secundario' : 'btn-primario'} peca-btn-agenda`}
                >
                  📅 Ver Programação na Agenda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTEÚDO INFERIOR: Sinopse, Equipe e Downloads Técnicos */}
      <div className="pagina-conteudo peca-conteudo-wrapper" id="sinopse-elenco">
        <div className="peca-conteudo-inferior">
          {/* Bloco da Sinopse / Resumo */}
          <section className="peca-bloco-sinopse card">
            <div className="peca-bloco-header peca-bloco-header-sinopse">
              <div className="peca-bloco-header-titulo">
                <span className="peca-icone-secao">📖</span>
                <h2>Sinopse</h2>
              </div>
              <div className="peca-meta-badges">
                <span className={`tag ${tag.classe}`}>{tag.texto}</span>
                {colaboradores.length > 0 && (
                  <span className="tag-equipe-badge">
                    👥 {colaboradores.length} {colaboradores.length === 1 ? 'integrante' : 'integrantes'}
                  </span>
                )}
              </div>
            </div>
            <p className="peca-texto-sinopse">{peca.resumo}</p>

            {/* Chamada para a Agenda / Ingressos */}
            <div className="peca-agenda-banner">
              <div className="peca-agenda-banner-texto">
                <strong>Temporada & Apresentações</strong>
                <p>Confira datas, horários de sessões e teatros com mapa interativo na nossa Agenda.</p>
              </div>
              <div className="peca-agenda-banner-acoes">
                {peca.linkIngresso && (
                  <a
                    href={peca.linkIngresso}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primario btn-sm"
                  >
                    Ingressos 🎟️
                  </a>
                )}
                <Link
                  to={`/agenda?busca=${encodeURIComponent(peca.titulo)}`}
                  className="btn btn-fantasma btn-sm"
                >
                  Consultar Agenda →
                </Link>
              </div>
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

        {/* 3. ÁREA DE DOWNLOADS TÉCNICOS (Exclusivo para obras Em Cartaz — Ata #02) */}
        {peca.status === 'EM_CARTAZ' && (
          <section className="peca-bloco-downloads card" style={{ marginTop: '2rem' }}>
            <div className="peca-bloco-header">
              <span className="peca-icone-secao">📦</span>
              <div>
                <h2>Informações Técnicas & Downloads</h2>
                <p className="peca-downloads-subtitulo">
                  Materiais para programadores, curadores e diretores de espaços culturais:
                </p>
              </div>
            </div>

            <div className="peca-downloads-grid">
              {downloadsExibidos.map((down) => (
                <a
                  key={down.id}
                  href={down.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="peca-download-card"
                >
                  <div className="peca-download-icone">
                    {down.formato === 'PDF' ? '📄' : down.formato === 'ZIP' ? '🗂️' : '📁'}
                  </div>
                  <div className="peca-download-info">
                    <span className="peca-download-titulo">{down.titulo}</span>
                    {down.descricao && <span className="peca-download-desc">{down.descricao}</span>}
                  </div>
                  <div className="peca-download-acao">
                    {down.tamanho && <span className="peca-download-tamanho">{down.tamanho}</span>}
                    <span className="peca-download-btn">Baixar ↓</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
