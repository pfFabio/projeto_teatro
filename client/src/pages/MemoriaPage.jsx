// =============================================================================
// Página Memória da Companhia — Trajetória, Espetáculos e Acervo Histórico
// Requisito da Ata #02 a partir do Portfólio Oficial Theatrum Mundi 2026
// =============================================================================

import { useState, useEffect } from 'react';
import { memoriaAPI } from '../services/api';

export default function MemoriaPage() {
  const [dadosMemoria, setDadosMemoria] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const res = await memoriaAPI.listar();
        setDadosMemoria(res.data);
      } catch (err) {
        console.error('Erro ao carregar dados de memória:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const itens = dadosMemoria?.itens || [];
  const companhia = dadosMemoria?.companhia || {
    nome: 'Theatrum Mundi',
    diretor: 'Angelo Faria Turci',
    fundacao: '2012',
    cidade: 'Maricá / Rio de Janeiro, RJ',
    curriculoPdfUrl: '/downloads/PORTFOLIO_CURRICULO_THEATRUM_2026.pdf',
  };

  const itensFiltrados = filtroCategoria
    ? itens.filter((i) => i.categoria === filtroCategoria)
    : itens;

  const categorias = [
    { valor: '', rotulo: 'Todos os Marcos' },
    { valor: 'ESPETACULO', rotulo: '🎭 Espetáculos' },
    { valor: 'PREMIO', rotulo: '🏆 Prêmios & Editais' },
    { valor: 'FORMACAO', rotulo: '🎓 Formação & Pesquisa' },
  ];

  return (
    <div className="pagina-conteudo memoria-pagina">
      {/* 1. HERO HEADER */}
      <section className="memoria-hero">
        <span className="subtitulo-secao">Acervo & Memória</span>
        <h1 className="titulo-secao">Trajetória Theatrum Mundi</h1>
        <p className="memoria-lead">
          Fundada em 2012 no Rio de Janeiro pelo dramaturgo e encenador{' '}
          <strong>{companhia.diretor}</strong>, a Theatrum compreende o palco como território
          de reflexão crítica, experimentação estética e diálogo vivo entre tradição e contemporaneidade.
        </p>

        <div className="memoria-hero-acoes">
          <a
            href={companhia.curriculoPdfUrl}
            download="PORTFOLIO_CURRICULO_THEATRUM_2026.pdf"
            className="btn btn-primario btn-md"
            target="_blank"
            rel="noopener noreferrer"
          >
            📥 Baixar Portfólio / Currículo Completo (PDF)
          </a>
        </div>
      </section>

      {/* 2. ESTATÍSTICAS E RECONHECIMENTOS */}
      <section className="memoria-stats-grid">
        <div className="memoria-stat-card">
          <span className="memoria-stat-numero">2012</span>
          <span className="memoria-stat-label">Ano de Fundação</span>
          <span className="memoria-stat-desc">Pesquisa continuada de linguagem cênica</span>
        </div>
        <div className="memoria-stat-card">
          <span className="memoria-stat-numero">+20</span>
          <span className="memoria-stat-label">Premiações Nacionais</span>
          <span className="memoria-stat-desc">Zilka Salaberry, FENATA, CBTIJ e CENYM</span>
        </div>
        <div className="memoria-stat-card">
          <span className="memoria-stat-numero">RJ & Brasil</span>
          <span className="memoria-stat-label">Circulação Cultural</span>
          <span className="memoria-stat-desc">Temporadas UFF, Laura Alvim, SESC e SESI</span>
        </div>
      </section>

      {/* 3. FILTROS DA LINHA DO TEMPO */}
      <div className="memoria-filtros-bar">
        <div className="filtros-grupo">
          {categorias.map((c) => (
            <button
              key={c.valor}
              className={`btn btn-sm ${filtroCategoria === c.valor ? 'btn-primario' : 'btn-secundario'}`}
              onClick={() => setFiltroCategoria(c.valor)}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* 4. LINHA DO TEMPO CRONOLÓGICA */}
      {carregando ? (
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando acervo histórico...</p>
        </div>
      ) : (
        <div className="memoria-timeline">
          {itensFiltrados.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`memoria-timeline-item ${item.destaque ? 'item-destaque' : ''}`}
            >
              <div className="memoria-timeline-marcador">
                <span className="memoria-timeline-ano">{item.ano}</span>
              </div>

              <div className="memoria-timeline-conteudo card">
                <div className="memoria-card-cabecalho">
                  <span className={`tag tag-categoria-${item.categoria.toLowerCase()}`}>
                    {item.categoria === 'ESPETACULO'
                      ? '🎭 Espetáculo'
                      : item.categoria === 'PREMIO'
                      ? '🏆 Premiação'
                      : '🎓 Formação'}
                  </span>
                  {item.destaque && <span className="tag-destaque-badge">⭐ Destaque</span>}
                </div>

                <h3 className="memoria-card-titulo">{item.titulo}</h3>
                <p className="memoria-card-desc">{item.descricao}</p>

                {item.local && (
                  <div className="memoria-card-local">
                    <span className="icone-local">📍</span>
                    <span>{item.local}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. SEÇÃO INSTITUCIONAL & SEDE */}
      <section className="memoria-sede card">
        <div className="memoria-sede-conteudo">
          <h3>Sede Artística & Pesquisa</h3>
          <p>
            O núcleo de criação e laboratórios do grupo está sediado em Itaipuaçú, Maricá/RJ,
            onde acontecem os treinamentos corporais do ator, as pesquisas dramatúrgicas
            e a concepção visual dos espetáculos.
          </p>
          <div className="memoria-sede-meta">
            <span>📍 Silvana da Costa, 437, Itaipuaçú - Maricá/RJ</span>
            <span>✉️ ciatheatrum@gmail.com</span>
            <span>📱 +55 (21) 97309-2514</span>
          </div>
        </div>
      </section>
    </div>
  );
}

