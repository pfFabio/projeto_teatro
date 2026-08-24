// =============================================================================
// Página de Peças — Listagem com filtros e busca
// =============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pecasAPI, getMediaUrl } from '../services/api';
import { getTag, statusFiltros } from '../constants/statusPeca';

export default function PecasPage() {
  const [pecas, setPecas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    carregarPecas();
  }, [filtroStatus, pagina]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagina(1);
      carregarPecas();
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  async function carregarPecas() {
    try {
      setCarregando(true);
      const params = { pagina, limite: 12 };
      if (filtroStatus) params.status = filtroStatus;
      if (busca) params.busca = busca;

      const res = await pecasAPI.listar(params);
      setPecas(res.data.pecas || []);
      setTotalPaginas(res.data.totalPaginas || 1);
    } catch (erro) {
      console.error('Erro ao carregar peças:', erro);
    } finally {
      setCarregando(false);
    }
  }

  // statusFiltros e getTag importados de constants/statusPeca

  return (
    <div className="pagina-conteudo">
      <h1 className="pagina-titulo">🎪 Nossas Peças</h1>
      <p className="pagina-subtitulo">
        Explore todos os espetáculos do Theatrum
      </p>

      {/* Barra de Filtros */}
      <div className="filtros-bar">
        <input
          type="text"
          className="campo-input"
          placeholder="🔍 Buscar peça..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {statusFiltros.map((filtro) => (
            <button
              key={filtro.valor}
              className={`filtro-chip ${filtroStatus === filtro.valor ? 'ativo' : ''}`}
              onClick={() => { setFiltroStatus(filtro.valor); setPagina(1); }}
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
          <p>Carregando peças...</p>
        </div>
      ) : pecas.length === 0 ? (
        <div className="vazio">
          <div className="vazio-icone">🎭</div>
          <p>Nenhuma peça encontrada</p>
          {(busca || filtroStatus) && (
            <button
              className="btn btn-fantasma"
              style={{ marginTop: '16px' }}
              onClick={() => { setBusca(''); setFiltroStatus(''); }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid de Peças */}
          <div className="pecas-grid">
            {pecas.map((peca) => {
              const tag = getTag(peca.status);

              return (
                <Link
                  to={`/pecas/${peca.id}`}
                  key={peca.id}
                  className="card peca-card animar-entrada"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="peca-card-imagem">
                    {peca.fotos?.[0]?.url && (
                      <img
                        src={getMediaUrl(peca.fotos[0].url)}
                        alt={peca.titulo}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const ph = e.target.parentElement.querySelector('.peca-card-placeholder');
                          if (ph) ph.style.display = 'flex';
                        }}
                      />
                    )}
                    <div
                      className="peca-card-placeholder"
                      style={{ display: peca.fotos?.[0]?.url ? 'none' : 'flex' }}
                    >
                      🎭
                    </div>
                    <div className="peca-card-status">
                      <span className={`tag ${tag.classe}`}>{tag.texto}</span>
                    </div>
                  </div>
                  <div className="peca-card-corpo">
                    <h3 className="peca-card-titulo">{peca.titulo}</h3>
                    <p className="peca-card-resumo">{peca.resumo}</p>
                    <div className="peca-card-meta">
                      <span>
                        📍 {peca.locais && peca.locais.length > 0
                          ? peca.locais.map(l => l.cidade?.split(',')[0]?.trim()).filter(Boolean).join(', ')
                          : peca.endereco?.split('—')[0]?.trim()}
                      </span>
                      <span>👥 {peca._count?.colaboradores || 0}</span>
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
