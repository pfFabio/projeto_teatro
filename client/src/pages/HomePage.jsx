import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carrossel from '../components/common/Carousel';
import PropagandasSection from '../components/common/PropagandasSection';
import { pecasAPI, configAPI, propagandasAPI, getMediaUrl } from '../services/api';
import { getTag } from '../constants/statusPeca';

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

  // Separar peças em cartaz para destaque
  const pecasEmCartaz = pecas.filter(p => p.status === 'EM_CARTAZ');
  const pecasDestaque = pecas.slice(0, 6);

  if (carregando) {
    return (
      <div className="pagina-conteudo">
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando espetáculos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* === Hero — Carrossel === */}
      <section className="home-hero">
        <div className="pagina-conteudo" style={{ paddingBottom: 0 }}>
          <Carrossel itens={pecas} />
        </div>
      </section>

      {/* === Propagandas / Anúncios Recentes (5 Mais Recentes) === */}
      <PropagandasSection propagandas={propagandas} config={config} />

      {/* === Peças em Destaque === */}
      {pecasDestaque.length > 0 && (
        <section className="secao">
          <div className="pagina-conteudo">
            <h2 className="secao-titulo">🎪 Em Destaque</h2>
            <p className="secao-subtitulo">
              Confira os espetáculos que estão fazendo sucesso
            </p>

            <div className="home-destaque-grid">
              {pecasDestaque.map((peca, i) => {
                const tag = getTag(peca.status);

                return (
                  <Link
                    to={`/pecas/${peca.id}`}
                    key={peca.id}
                    className="card animar-entrada"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="peca-card-imagem">
                      {peca.fotos?.[0]?.url && (
                        <img
                          src={getMediaUrl(peca.fotos[0].url)}
                          alt={peca.titulo}
                          className="card-imagem"
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
                    <div className="card-corpo">
                      <h3 className="card-titulo">{peca.titulo}</h3>
                      <p className="card-texto peca-card-resumo">{peca.resumo}</p>
                      <div className="peca-card-meta">
                        <span>
                          📍 {peca.locais && peca.locais.length > 0
                            ? peca.locais.map(l => l.cidade?.split(',')[0]?.trim()).filter(Boolean).join(', ')
                            : peca.endereco?.split('—')[0]?.trim()}
                        </span>
                        <span>👥 {peca._count?.colaboradores || 0} pessoas</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--espaco-8)' }}>
              <Link to="/pecas" className="btn btn-fantasma btn-lg">
                Ver Todas as Peças →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
