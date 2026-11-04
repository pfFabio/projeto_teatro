// =============================================================================
// Página Inicial (HomePage) — Foco na experiência visual das obras teatrais
// Fluxo do espectador: Início -> Obra (/obras/:id) -> Agenda (/agenda)
// Atualizado com Projetos Futuros e Formulário de Ideias (Ata #02)
// =============================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carrossel from '../components/common/Carousel';
import PropagandasSection from '../components/common/PropagandasSection';
import { pecasAPI, configAPI, propagandasAPI, ideiasAPI, getMediaUrl } from '../services/api';
import { getTag } from '../constants/statusPeca';
import defaultCover from '../assets/theatre-placeholder.jpg';

export default function HomePage() {
  const [pecas, setPecas] = useState([]);
  const [propagandas, setPropagandas] = useState([]);
  const [config, setConfig] = useState({});
  const [carregando, setCarregando] = useState(true);

  // Formulário "Tem uma ideia?"
  const [formIdeia, setFormIdeia] = useState({
    nome: '',
    email: '',
    telefone: '',
    titulo: '',
    descricao: '',
    consentimento: true,
  });
  const [enviandoIdeia, setEnviandoIdeia] = useState(false);
  const [mensagemSucessoIdeia, setMensagemSucessoIdeia] = useState('');
  const [erroIdeia, setErroIdeia] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resPecas, resConfig, resProps] = await Promise.all([
        pecasAPI.listar({ limite: 12 }),
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

  async function handleEnviarIdeia(e) {
    e.preventDefault();
    setErroIdeia('');
    setMensagemSucessoIdeia('');

    if (!formIdeia.nome.trim() || !formIdeia.email.trim() || !formIdeia.descricao.trim()) {
      setErroIdeia('Por favor, preencha seu nome, email e a descrição da sua ideia.');
      return;
    }

    try {
      setEnviandoIdeia(true);
      const res = await ideiasAPI.enviar(formIdeia);
      setMensagemSucessoIdeia(res.data.mensagem || 'Ideia enviada com sucesso!');
      setFormIdeia({
        nome: '',
        email: '',
        telefone: '',
        titulo: '',
        descricao: '',
        consentimento: true,
      });
    } catch (err) {
      setErroIdeia(err.response?.data?.mensagem || 'Erro ao enviar ideia. Tente novamente.');
    } finally {
      setEnviandoIdeia(false);
    }
  }

  const pecasDestaque = pecas.slice(0, 6);
  const projetosFuturos = pecas.filter((p) => p.status === 'PROJETO_FUTURO');

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
                Conheça os espetáculos em cartaz e as produções do repertório oficial da Theatrum.
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

      {/* 3. PROJETOS FUTUROS & NOVAS CRIAÇÕES (Ata #02) */}
      {projetosFuturos.length > 0 && (
        <section className="secao home-futuros-secao">
          <div className="pagina-conteudo">
            <div className="home-secao-cabecalho">
              <div>
                <span className="home-secao-kicker">Em Concepção & Laboratório</span>
                <h2 className="secao-titulo">💡 Projetos Futuros</h2>
              </div>
              <p className="secao-subtitulo">
                Pesquisas cênicas, experimentos corporais e novos espetáculos que estão sendo gerados na companhia.
              </p>
            </div>

            <div className="home-futuros-grid">
              {projetosFuturos.map((pf) => (
                <div key={pf.id} className="card home-futuro-card">
                  <div className="home-futuro-badge">
                    <span className="tag tag-projeto-futuro">💡 Projeto Futuro</span>
                  </div>
                  <h3>{pf.titulo}</h3>
                  <p>{pf.resumo}</p>
                  <div className="home-futuro-rodape">
                    <Link to={`/obras/${pf.id}`} className="btn btn-secundario btn-sm">
                      Acompanhar Criação →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FORMULÁRIO PÚBLICO: "TEM UMA IDEIA? SUGIRA UM ESPETÁCULO OU PARCERIA" (Ata #02) */}
      <section className="secao home-ideias-secao">
        <div className="pagina-conteudo">
          <div className="home-ideias-card card">
            <div className="home-ideias-header">
              <span className="home-secao-kicker">Diálogo & Conexão</span>
              <h2>💡 Tem uma Ideia ou Parceria?</h2>
              <p>
                Espaço aberto para dramaturgos, encenadores, técnicos, produtores e espectadores.
                Compartilhe sua proposta ou ideia de projeto com a direção da Theatrum.
              </p>
            </div>

            {mensagemSucessoIdeia ? (
              <div className="alerta alerta-sucesso">
                <span>✨ {mensagemSucessoIdeia}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-secundario"
                  style={{ marginLeft: '1rem' }}
                  onClick={() => setMensagemSucessoIdeia('')}
                >
                  Enviar Outra Ideia
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnviarIdeia} className="home-ideias-form">
                {erroIdeia && <div className="alerta alerta-erro">{erroIdeia}</div>}

                <div className="form-grid-2">
                  <div className="campo-grupo">
                    <label className="campo-rotulo" htmlFor="ideia-nome">Seu Nome *</label>
                    <input
                      id="ideia-nome"
                      type="text"
                      className="campo-input"
                      placeholder="Ex: Maria Pereira"
                      value={formIdeia.nome}
                      onChange={(e) => setFormIdeia({ ...formIdeia, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="campo-grupo">
                    <label className="campo-rotulo" htmlFor="ideia-email">Seu Email *</label>
                    <input
                      id="ideia-email"
                      type="email"
                      className="campo-input"
                      placeholder="seu.email@exemplo.com"
                      value={formIdeia.email}
                      onChange={(e) => setFormIdeia({ ...formIdeia, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="campo-grupo">
                    <label className="campo-rotulo" htmlFor="ideia-telefone">Telefone / WhatsApp</label>
                    <input
                      id="ideia-telefone"
                      type="tel"
                      className="campo-input"
                      placeholder="(21) 99999-9999"
                      value={formIdeia.telefone}
                      onChange={(e) => setFormIdeia({ ...formIdeia, telefone: e.target.value })}
                    />
                  </div>
                  <div className="campo-grupo">
                    <label className="campo-rotulo" htmlFor="ideia-titulo">Título da Ideia / Tema</label>
                    <input
                      id="ideia-titulo"
                      type="text"
                      className="campo-input"
                      placeholder="Ex: Parceria para temporada no RJ"
                      value={formIdeia.titulo}
                      onChange={(e) => setFormIdeia({ ...formIdeia, titulo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="campo-grupo">
                  <label className="campo-rotulo" htmlFor="ideia-descricao">Descreva sua ideia ou proposta *</label>
                  <textarea
                    id="ideia-descricao"
                    className="campo-input campo-textarea"
                    rows="4"
                    placeholder="Conte sobre sua história, texto dramático, proposta técnica ou convite de circulação..."
                    value={formIdeia.descricao}
                    onChange={(e) => setFormIdeia({ ...formIdeia, descricao: e.target.value })}
                    required
                  />
                </div>

                <div className="home-ideias-lgpd">
                  <label className="campo-checkbox-rotulo">
                    <input
                      type="checkbox"
                      checked={formIdeia.consentimento}
                      onChange={(e) => setFormIdeia({ ...formIdeia, consentimento: e.target.checked })}
                    />
                    <span>
                      Autorizo a Theatrum a utilizar meus dados de contato exclusivamente para retorno sobre esta proposta (conforme a LGPD — Lei nº 13.709/2018).
                    </span>
                  </label>
                </div>

                <div className="home-ideias-acoes">
                  <button type="submit" className="btn btn-primario btn-md" disabled={enviandoIdeia}>
                    {enviandoIdeia ? 'Enviando...' : '🚀 Enviar Minha Proposta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 5. COMUNICADOS & NOVIDADES DA COMPANHIA */}
      <section className="home-propagandas-container">
        <PropagandasSection propagandas={propagandas} config={config} />
      </section>
    </div>
  );
}
