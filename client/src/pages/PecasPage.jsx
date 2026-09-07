// =============================================================================
// Página de Obras — Catálogo de espetáculos com filtros e busca
// Otimizado com useCallback e dependências controladas
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { pecasAPI, getMediaUrl } from '../services/api';
import { getTag, statusFiltros } from '../constants/statusPeca';
import defaultCover from '../assets/theatre-placeholder.jpg';

export default function PecasPage() {
  const [pecas, setPecas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const carregarPecas = useCallback(async (paramsBusca) => {
    try {
      setCarregando(true);
      const params = {
        pagina: paramsBusca.pagina,
        limite: 12,
        ...(paramsBusca.status ? { status: paramsBusca.status } : {}),
        ...(paramsBusca.busca ? { busca: paramsBusca.busca } : {}),
      };

      const res = await pecasAPI.listar(params);
      setPecas(res.data.pecas || []);
      setTotalPaginas(res.data.totalPaginas || 1);
    } catch (erro) {
      console.error('Erro ao carregar obras:', erro);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Efeito para recarregar quando status ou página mudam
  useEffect(() => {
    carregarPecas({ pagina, status: filtroStatus, busca });
  }, [filtroStatus, pagina, carregarPecas]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagina(1);
      carregarPecas({ pagina: 1, status: filtroStatus, busca });
    }, 400);

    return () => clearTimeout(timer);
  }, [busca, filtroStatus, carregarPecas]);

  return (
    <div className="pagina-conteudo">
      <h1 className="pagina-titulo">🎭 Nossas Obras</h1>
      <p className="pagina-subtitulo">
        Explore todas as obras e produções do Theatrum
      </p>

      {/* Barra de Filtros */}
      <div className="filtros-bar">
        <input
          type="text"
          className="campo-input"
          placeholder="🔍 Buscar obra..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {statusFiltros.map((filtro) => (
            <button
              key={filtro.valor}
              className={`filtro-chip ${filtroStatus === filtro.valor ? 'ativo' : ''}`}
              onClick={() => {
                setFiltroStatus(filtro.valor);
                setPagina(1);
              }}
            >
              {filtro.texto}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {carregando ? (
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando obras...</p>
        </div>
      ) : pecas.length === 0 ? (
        <div className="vazio">
          <div className="vazio-icone">🎭</div>
          <p>Nenhuma obra encontrada</p>
          {(busca || filtroStatus) && (
            <button
              className="btn btn-fantasma"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setBusca('');
                setFiltroStatus('');
                setPagina(1);
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid de Obras */}
          <div className="pecas-grid">
            {pecas.map((peca) => {
              const tag = getTag(peca.status);

              return (
                <Link
                  to={`/obras/${peca.id}`}
                  key={peca.id}
                  className="card peca-card animar-entrada"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="peca-card-imagem">
                    <img
                      src={peca.fotos?.[0]?.url ? getMediaUrl(peca.fotos[0].url) : defaultCover}
                      alt={peca.titulo}
                      onError={(e) => {
                        e.target.src = defaultCover;
                      }}
                    />
                    <div className="peca-card-status">
                      <span className={`tag ${tag.classe}`}>{tag.texto}</span>
                    </div>
                  </div>
                  <div className="peca-card-corpo">
                    <h3 className="peca-card-titulo">{peca.titulo}</h3>
                    <p className="peca-card-resumo">{peca.resumo}</p>
                    <div className="peca-card-meta">
                      <span>👥 {peca._count?.colaboradores || 0} integrantes</span>
                      <span style={{ color: 'var(--cor-primaria-clara)', fontWeight: 500 }}>
                        Ver Obra →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="paginacao">
              <button
                className="paginacao-btn"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                ← Anterior
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button
                  key={i + 1}
                  className={`paginacao-btn ${pagina === i + 1 ? 'ativa' : ''}`}
                  onClick={() => setPagina(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="paginacao-btn"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
