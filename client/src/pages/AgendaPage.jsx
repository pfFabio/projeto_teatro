// =============================================================================
// Página de Agenda — Programação de Espetáculos (Datas, Horários e Locais)
// =============================================================================

import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { pecasAPI, getMediaUrl } from '../services/api';
import { getTag, statusFiltros } from '../constants/statusPeca';
import MapView from '../components/common/MapView';

export default function AgendaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pecas, setPecas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [localMapaModal, setLocalMapaModal] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  // Sincroniza busca vinda de parâmetro da URL (ex: de PecaDetalhesPage)
  useEffect(() => {
    const termoUrl = searchParams.get('busca');
    if (termoUrl !== null && termoUrl !== busca) {
      setBusca(termoUrl);
    }
  }, [searchParams]);

  async function carregarDados() {
    try {
      setCarregando(true);
      const res = await pecasAPI.listar({ limite: 100 });
      setPecas(res.data?.pecas || []);
    } catch (erro) {
      console.error('Erro ao carregar espetáculos para a agenda:', erro);
    } finally {
      setCarregando(false);
    }
  }

  // Extrai todos os itens de apresentação/sessão
  const todasSessoes = useMemo(() => {
    const sessoes = [];

    pecas.forEach((peca) => {
      const temLocais = peca.locais && peca.locais.length > 0;

      if (temLocais) {
        peca.locais.forEach((local) => {
          sessoes.push({
            id: `sessao-${peca.id}-${local.id}`,
            pecaId: peca.id,
            pecaTitulo: peca.titulo,
            pecaResumo: peca.resumo,
            pecaFoto: peca.fotos?.[0]?.url,
            pecaStatus: peca.status,
            nomeLocal: local.nomeLocal || 'Teatro',
            cidade: local.cidade || '',
            endereco: local.endereco || '',
            latitude: local.latitude,
            longitude: local.longitude,
            dataEstreia: local.dataEstreia,
            dataFim: local.dataFim,
            horario: local.horario,
            status: local.status || peca.status,
          });
        });
      } else if (peca.endereco || peca.dataEstreia) {
        // Fallback para peças com endereço/data legados cadastrados diretamente
        sessoes.push({
          id: `sessao-${peca.id}-padrao`,
          pecaId: peca.id,
          pecaTitulo: peca.titulo,
          pecaResumo: peca.resumo,
          pecaFoto: peca.fotos?.[0]?.url,
          pecaStatus: peca.status,
          nomeLocal: peca.endereco?.split('—')[0]?.trim() || 'Teatro',
          cidade: peca.endereco?.includes(',') ? peca.endereco.split(',').pop()?.trim() : '',
          endereco: peca.endereco || '',
          latitude: peca.latitude,
          longitude: peca.longitude,
          dataEstreia: peca.dataEstreia,
          dataFim: null,
          horario: null,
          status: peca.status,
        });
      }
    });

    return sessoes;
  }, [pecas]);

  // Extrai cidades únicas para o filtro
  const cidadesDisponiveis = useMemo(() => {
    const conjunto = new Set();
    todasSessoes.forEach((s) => {
      if (s.cidade) conjunto.add(s.cidade.trim());
    });
    return Array.from(conjunto).sort();
  }, [todasSessoes]);

  // Filtra as sessões conforme critérios
  const sessoesFiltradas = useMemo(() => {
    return todasSessoes.filter((sessao) => {
      // Filtro de status
      if (filtroStatus && sessao.status !== filtroStatus) {
        return false;
      }

      // Filtro de cidade
      if (filtroCidade && sessao.cidade !== filtroCidade) {
        return false;
      }

      // Filtro de busca textual
      if (busca && busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const noTitulo = sessao.pecaTitulo?.toLowerCase().includes(termo);
        const noLocal = sessao.nomeLocal?.toLowerCase().includes(termo);
        const noEndereco = sessao.endereco?.toLowerCase().includes(termo);
        const naCidade = sessao.cidade?.toLowerCase().includes(termo);
        const noHorario = sessao.horario?.toLowerCase().includes(termo);

        if (!noTitulo && !noLocal && !noEndereco && !naCidade && !noHorario) {
          return false;
        }
      }

      return true;
    });
  }, [todasSessoes, filtroStatus, filtroCidade, busca]);

  // Formatação amigável da data
  function formatarData(dataStr) {
    if (!dataStr) return null;
    try {
      return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch {
      return dataStr;
    }
  }

  function limparFiltros() {
    setBusca('');
    setFiltroStatus('');
    setFiltroCidade('');
    setSearchParams({});
  }

  return (
    <div className="pagina-conteudo">
      <div className="agenda-header-section">
        <h1 className="pagina-titulo">📅 Agenda de Apresentações</h1>
        <p className="pagina-subtitulo">
          Consulte dias, horários e teatros de todas as apresentações do Theatrum
        </p>
      </div>

      {/* Barra de Filtros */}
      <div className="filtros-bar agenda-filtros">
        <div className="agenda-busca-wrapper">
          <input
            type="text"
            className="campo-input"
            placeholder="🔍 Buscar por obra, teatro, cidade ou horário..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              if (!e.target.value) {
                const params = new URLSearchParams(searchParams);
                params.delete('busca');
                setSearchParams(params);
              }
            }}
          />
        </div>

        <div className="agenda-controles-filtros">
          {/* Status Chips */}
          <div className="flex gap-2 flex-wrap">
            {statusFiltros.map((filtro) => (
              <button
                key={filtro.valor}
                className={`filtro-chip ${filtroStatus === filtro.valor ? 'ativo' : ''}`}
                onClick={() => setFiltroStatus(filtro.valor)}
              >
                {filtro.texto}
              </button>
            ))}
          </div>

          {/* Filtro por Cidade */}
          {cidadesDisponiveis.length > 0 && (
            <select
              className="campo-input agenda-cidade-select"
              value={filtroCidade}
              onChange={(e) => setFiltroCidade(e.target.value)}
              aria-label="Filtrar por cidade"
            >
              <option value="">🏙️ Todas as Cidades</option>
              {cidadesDisponiveis.map((cidade) => (
                <option key={cidade} value={cidade}>
                  📍 {cidade}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Conteúdo da Agenda */}
      {carregando ? (
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando agenda de espetáculos...</p>
        </div>
      ) : sessoesFiltradas.length === 0 ? (
        <div className="vazio">
          <div className="vazio-icone">📅</div>
          <h3>Nenhuma apresentação encontrada</h3>
          <p style={{ color: 'var(--cor-texto-secundario)', marginTop: '8px' }}>
            Não encontramos sessões com os filtros selecionados no momento.
          </p>
          {(busca || filtroStatus || filtroCidade) && (
            <button
              className="btn btn-fantasma"
              style={{ marginTop: '16px' }}
              onClick={limparFiltros}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="agenda-grid">
          {sessoesFiltradas.map((sessao) => {
            const tag = getTag(sessao.status);
            const dataInicio = formatarData(sessao.dataEstreia);
            const dataFim = formatarData(sessao.dataFim);

            return (
              <div key={sessao.id} className="card agenda-card animar-entrada">
                {/* Cabeçalho do Card: Imagem & Info da Obra */}
                <div className="agenda-card-hero">
                  {sessao.pecaFoto ? (
                    <img
                      src={getMediaUrl(sessao.pecaFoto)}
                      alt={sessao.pecaTitulo}
                      className="agenda-card-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const ph = e.target.parentElement.querySelector('.agenda-card-placeholder');
                        if (ph) ph.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="agenda-card-placeholder"
                    style={{ display: sessao.pecaFoto ? 'none' : 'flex' }}
                  >
                    🎭
                  </div>

                  <div className="agenda-card-hero-overlay">
                    <span className={`tag ${tag.classe}`}>{tag.texto}</span>
                    <Link
                      to={`/obras/${sessao.pecaId}`}
                      className="agenda-obra-link"
                      title="Ver detalhes desta obra"
                    >
                      {sessao.pecaTitulo}
                    </Link>
                  </div>
                </div>

                {/* Corpo do Card: Horário, Dias e Endereço */}
                <div className="agenda-card-corpo">
                  {/* Bloco: Dia / Temporada */}
                  <div className="agenda-info-bloco">
                    <div className="agenda-info-label">
                      <span>📅</span> <strong>Dia / Temporada:</strong>
                    </div>
                    <div className="agenda-info-valor agenda-data-destaque">
                      {dataInicio ? (
                        <>
                          {dataFim ? `${dataInicio} até ${dataFim}` : `A partir de ${dataInicio}`}
                        </>
                      ) : (
                        <span style={{ color: 'var(--cor-texto-terciario)' }}>Temporada a confirmar</span>
                      )}
                    </div>
                  </div>

                  {/* Bloco: Horário */}
                  <div className="agenda-info-bloco">
                    <div className="agenda-info-label">
                      <span>⏰</span> <strong>Horário:</strong>
                    </div>
                    <div className="agenda-info-valor">
                      {sessao.horario ? (
                        <span className="agenda-badge-horario">{sessao.horario}</span>
                      ) : (
                        <span style={{ color: 'var(--cor-texto-terciario)' }}>Consulte a bilheteria</span>
                      )}
                    </div>
                  </div>

                  {/* Bloco: Teatro / Local & Endereço */}
                  <div className="agenda-info-bloco">
                    <div className="agenda-info-label">
                      <span>📍</span> <strong>Teatro & Endereço:</strong>
                    </div>
                    <div className="agenda-info-valor">
                      <div className="agenda-nome-local">{sessao.nomeLocal}</div>
                      {sessao.endereco && (
                        <div className="agenda-endereco-texto">{sessao.endereco}</div>
                      )}
                      {sessao.cidade && (
                        <span className="agenda-cidade-tag">{sessao.cidade}</span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="agenda-card-acoes">
                    <Link
                      to={`/obras/${sessao.pecaId}`}
                      className="btn btn-fantasma btn-sm"
                    >
                      Ver Obra 🎭
                    </Link>

                    {sessao.latitude && sessao.longitude ? (
                      <button
                        type="button"
                        className="btn btn-primario btn-sm"
                        onClick={() => setLocalMapaModal(sessao)}
                      >
                        Ver no Mapa 📍
                      </button>
                    ) : (
                      sessao.endereco && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sessao.endereco)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-fantasma btn-sm"
                        >
                          Mapa Externo ↗
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Mapa para a Apresentação Selecionada */}
      {localMapaModal && (
        <div className="modal-overlay" onClick={() => setLocalMapaModal(null)}>
          <div
            className="modal-conteudo modal-lg animar-escala"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>📍 {localMapaModal.nomeLocal}</h3>
              <button
                type="button"
                className="modal-fechar"
                onClick={() => setLocalMapaModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-corpo" style={{ padding: 'var(--espaco-4)' }}>
              <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '12px' }}>
                🎭 <strong>{localMapaModal.pecaTitulo}</strong> — {localMapaModal.endereco}
              </p>
              <div style={{ height: '350px', borderRadius: 'var(--raio-lg)', overflow: 'hidden' }}>
                <MapView
                  latitude={localMapaModal.latitude}
                  longitude={localMapaModal.longitude}
                  endereco={`${localMapaModal.nomeLocal} — ${localMapaModal.endereco}`}
                />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localMapaModal.endereco || localMapaModal.nomeLocal)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-fantasma btn-sm"
                >
                  Abrir no Google Maps ↗
                </a>
                <button
                  type="button"
                  className="btn btn-primario btn-sm"
                  onClick={() => setLocalMapaModal(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
