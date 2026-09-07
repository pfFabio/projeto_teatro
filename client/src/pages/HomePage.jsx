// =============================================================================
// Página Inicial (HomePage) — Foco na experiência visual das obras teatrais
// Fluxo do espectador: Início -> Obra (/obras/:id) -> Agenda (/agenda)
// =============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carrossel from '../components/common/Carousel';
import PropagandasSection from '../components/common/PropagandasSection';
import { pecasAPI, configAPI, propagandasAPI, getMediaUrl } from '../services/api';
import { getTag } from '../constants/statusPeca';
import defaultCover from '../assets/theatre-placeholder.jpg';

export default function HomePage() {
  const [pecas, setPecas] = useState([]);
  const [propagandas, setPropagandas] = useState([]);
  const [config, setConfig] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resPecas, resConfig, resProps] = await Promise.all([
        pecasAPI.listar({ limite: 10 }),
        configAPI.listar(),
        propagandasAPI.listar({ limite: 5, ativo: true }).catch(() => ({ data: { propagandas: [] } })),
      ]);

      setPecas(resPecas.data.pecas || []);
      setConfig(resConfig.data || {});
      setPropagandas(resProps.data.propagandas || []);
    } catch (erro) {
      console.error('Erro ao carregar dados da home:', erro);
    } finally {
      setCarregando(false);
    }
  }

  const pecasDestaque = pecas.slice(0, 6);

  if (carregando) {
    return (
      <div className="pagina-conteudo">
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando espetáculos do Theatrum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-pagina">
      {/* 1. HERO: Palco Cinematográfico das Obras */}
      <section className="home-hero">
        <div className="pagina-conteudo" style={{ paddingBottom: 0 }}>
          <Carrossel itens={pecas} />
        </div>
      </section>

      {/* 2. VITRINE DE OBRAS: O foco total na arte e na experiência dos espetáculos */}
      {pecasDestaque.length > 0 && (
        <section className="secao home-obras-secao">
          <div className="pagina-conteudo">
            <div className="home-secao-cabecalho">
              <div>
                <span className="home-secao-kicker">Repertório Artístico</span>
                <h2 className="secao-titulo">🎭 Obras em Destaque</h2>
              </div>
              <p className="secao-subtitulo">
                Conheça os espetáculos em cartaz e as próximas produções da nossa temporada.
              </p>
            </div>

            <div className="home-destaque-grid">
              {pecasDestaque.map((peca) => {
                const tag = getTag(peca.status);
                const capaFoto = peca.fotos?.[0]?.url ? getMediaUrl(peca.fotos[0].url) : defaultCover;

                return (
                  <Link
                    to={`/obras/${peca.id}`}
                    key={peca.id}
                    className="card peca-card animar-entrada"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    title={`Ver detalhes de ${peca.titulo}`}
                  >
                    <div className="peca-card-imagem">
                      <img
                        src={capaFoto}
                        alt={peca.titulo}
                        className="card-imagem"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = defaultCover;
                        }}
                      />
                      <div className="peca-card-status">
                        <span className={`tag ${tag.classe}`}>{tag.texto}</span>
                      </div>
                    </div>

                    <div className="card-corpo">
                      <h3 className="card-titulo">{peca.titulo}</h3>
                      <p className="card-texto peca-card-resumo">{peca.resumo}</p>
                      
                      <div className="peca-card-meta">
                        <span>👥 {peca._count?.colaboradores || 0} integrantes</span>
                        <span className="peca-card-cta-btn">
                          Ver Obra →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Ações de Conversão da Home */}
            <div className="home-acoes-rodape">
              <Link to="/obras" className="btn btn-fantasma btn-lg">
                Explorar Todas as Obras 🎭
              </Link>
              <Link to="/agenda" className="btn btn-primario btn-lg">
                Consultar Agenda Completa 📅
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. COMUNICADOS & NOVIDADES DA COMPANHIA */}
      <section className="home-propagandas-container">
        <PropagandasSection propagandas={propagandas} config={config} />
      </section>
    </div>
  );
}
