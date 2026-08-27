// =============================================================================
// Dashboard do Admin — Componente de shell com abas
// Single Responsibility: apenas navegação entre abas
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import AbaPecas from './AbaPecas';
import AbaColaboradores from './AbaColaboradores';
import AbaAlocacoes from './AbaAlocacoes';
import AbaConfig from './AbaConfig';
import { pecasAPI, colaboradoresAPI, configAPI } from '../../services/api';

const ABAS = [
  { id: 'pecas', label: 'Peças', icone: '🎪' },
  { id: 'colaboradores', label: 'Colaboradores', icone: '👥' },
  { id: 'alocacoes', label: 'Alocações', icone: '🔗' },
  { id: 'config', label: 'Configurações', icone: '⚙️' },
];

export default function AdminDashboard({ usuario, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('pecas');

  // State compartilhado entre abas
  const [pecas, setPecas] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [configs, setConfigs] = useState({});
  const [carregando, setCarregando] = useState(true);

  // State de busca e filtros
  const [buscaColab, setBuscaColab] = useState('');
  const [filtroFuncao, setFiltroFuncao] = useState('');

  // State de modais (controlados pelo dashboard para manter contexto)
  const [modalPeca, setModalPeca] = useState({ aberto: false, peca: null });
  const [modalColab, setModalColab] = useState({ aberto: false, colab: null });

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const [resPecas, resColabs, resConfig] = await Promise.all([
        pecasAPI.listar({ limite: 100 }),
        colaboradoresAPI.listar({ limite: 100 }),
        configAPI.listar(),
      ]);
      setPecas(resPecas.data.pecas || []);
      setColaboradores(resColabs.data.colaboradores || []);
      setConfigs(resConfig.data || {});
    } catch (erro) {
      console.error('Erro ao carregar dados do painel:', erro);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const stats = {
    totalPecas: pecas.length,
    emCartaz: pecas.filter(p => p.status === 'EM_CARTAZ').length,
    totalColabs: colaboradores.length,
    totalLocais: pecas.reduce((acc, p) => acc + (p.locais?.length || 0), 0),
  };

  if (carregando) {
    return (
      <div className="pagina-conteudo">
        <div className="carregando-container">
          <div className="spinner" />
          <p>Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-conteudo">
      {/* Header do Dashboard */}
      <div className="admin-header animar-entrada">
        <div>
          <h1 className="admin-titulo">🎭 Painel Administrativo</h1>
          <p className="admin-subtitulo">Olá, {usuario.nome}!</p>
        </div>
        <button className="btn btn-fantasma" onClick={onLogout}>
          🚪 Sair
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-valor">{stats.totalPecas}</div>
          <div className="admin-stat-label">Peças</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-valor">{stats.emCartaz}</div>
          <div className="admin-stat-label">Em Cartaz</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-valor">{stats.totalColabs}</div>
          <div className="admin-stat-label">Colaboradores</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-valor">{stats.totalLocais}</div>
          <div className="admin-stat-label">Locais</div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="admin-abas" role="tablist" aria-label="Abas do painel administrativo">
        {ABAS.map((aba) => {
          const isAtiva = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              role="tab"
              aria-selected={isAtiva}
              className={`admin-aba ${isAtiva ? 'ativa' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              <span className="admin-aba-icone">{aba.icone}</span>
              <span className="admin-aba-label">{aba.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba */}
      <div className="admin-conteudo animar-entrada">
        {abaAtiva === 'pecas' && (
          <AbaPecas
            pecas={pecas}
            onRecarregar={carregarDados}
            modalPeca={modalPeca}
            setModalPeca={setModalPeca}
          />
        )}
        {abaAtiva === 'colaboradores' && (
          <AbaColaboradores
            colaboradores={colaboradores}
            busca={buscaColab}
            setBusca={setBuscaColab}
            filtroFuncao={filtroFuncao}
            setFiltroFuncao={setFiltroFuncao}
            onRecarregar={carregarDados}
            modalColab={modalColab}
            setModalColab={setModalColab}
          />
        )}
        {abaAtiva === 'alocacoes' && (
          <AbaAlocacoes
            pecas={pecas}
            colaboradores={colaboradores}
            onRecarregar={carregarDados}
          />
        )}
        {abaAtiva === 'config' && (
          <AbaConfig
            configs={configs}
            onRecarregar={carregarDados}
          />
        )}
      </div>
    </div>
  );
}
