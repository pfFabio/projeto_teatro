// =============================================================================
// Theatrum — Aba de Gerenciamento de Comprovantes de Despesa (Painel Admin)
// Single Responsibility: Auditoria, prestação de contas, filtros e upload seguro
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import ModalComprovanteForm, { CATEGORIAS_COMPROVANTE } from './ModalComprovanteForm';
import ConfirmModal from '../common/ConfirmModal';
import { comprovantesAPI } from '../../services/api';

const NOMES_CATEGORIAS = {
  TRANSPORTE: 'Transporte',
  ALIMENTACAO: 'Alimentação',
  CACHE: 'Cachê',
  CENOGRAFIA_FIGURINO: 'Cenografia/Figurino',
  DIVULGACAO: 'Divulgação',
  INFRAESTRUTURA: 'Infraestrutura',
  OUTROS: 'Outros',
};

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(dataStr) {
  if (!dataStr) return '—';
  if (dataStr.includes('-')) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
}

export default function AbaComprovantes({ pecas = [], colaboradores = [] }) {
  const [comprovantes, setComprovantes] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroPeca, setFiltroPeca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Modais
  const [modalForm, setModalForm] = useState({ aberto: false, comprovante: null });
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, comprovante: null });
  const [baixandoId, setBaixandoId] = useState(null);

  const carregarComprovantes = useCallback(async () => {
    try {
      setCarregando(true);
      const params = {};
      if (filtroPeca) params.pecaId = filtroPeca;
      if (filtroCategoria) params.categoria = filtroCategoria;
      if (busca.trim()) params.busca = busca.trim();

      const res = await comprovantesAPI.listar(params);
      setComprovantes(res.data.comprovantes || []);
      setValorTotal(res.data.valorTotal || 0);
    } catch (err) {
      console.error('Erro ao carregar comprovantes:', err);
    } finally {
      setCarregando(false);
    }
  }, [filtroPeca, filtroCategoria, busca]);

  useEffect(() => {
    carregarComprovantes();
  }, [carregarComprovantes]);

  async function handleSalvarComprovante(formData, id) {
    if (id) {
      await comprovantesAPI.atualizar(id, formData);
    } else {
      await comprovantesAPI.criar(formData);
    }
    await carregarComprovantes();
  }

  async function handleExcluirConfirmado() {
    if (!confirmacaoExcluir.comprovante) return;
    try {
      await comprovantesAPI.deletar(confirmacaoExcluir.comprovante.id);
      setConfirmacaoExcluir({ aberto: false, comprovante: null });
      await carregarComprovantes();
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao excluir comprovante');
    }
  }

  async function handleBaixarArquivo(comp) {
    try {
      setBaixandoId(comp.id);
      const res = await comprovantesAPI.baixarArquivo(comp.id);
      const blob = new Blob([res.data], { type: comp.mimetype || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Erro ao abrir o arquivo do comprovante.');
    } finally {
      setBaixandoId(null);
    }
  }

  const totalPDFs = comprovantes.filter(
    (c) => c.mimetype?.includes('pdf') || c.arquivoNome?.toLowerCase().endsWith('.pdf')
  ).length;

  return (
    <div>
      {/* Cards de Métricas Financeiras */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-valor" style={{ color: 'var(--cor-primaria)' }}>
            {formatarMoeda(valorTotal)}
          </div>
          <div className="admin-stat-label">Total em Despesas</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-valor">{comprovantes.length}</div>
          <div className="admin-stat-label">Comprovantes Cadastrados</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-valor">{totalPDFs}</div>
          <div className="admin-stat-label">Documentos em PDF</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-valor">{comprovantes.length - totalPDFs}</div>
          <div className="admin-stat-label">Imagens / Recibos</div>
        </div>
      </div>

      {/* Barra de Ferramentas e Filtros */}
      <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <input
          type="text"
          className="campo-input"
          placeholder="🔍 Buscar por título, descrição ou fornecedor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ minWidth: '240px', flex: '1' }}
        />

        <select
          className="campo-select"
          value={filtroPeca}
          onChange={(e) => setFiltroPeca(e.target.value)}
          style={{ maxWidth: '220px' }}
        >
          <option value="">Todas as Peças / Geral</option>
          {pecas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>

        <select
          className="campo-select"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Todas as Categorias</option>
          {CATEGORIAS_COMPROVANTE.map((cat) => (
            <option key={cat.valor} value={cat.valor}>
              {cat.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-primario"
          onClick={() => setModalForm({ aberto: true, comprovante: null })}
        >
          + Novo Comprovante
        </button>
      </div>

      {/* Tabela de Comprovantes */}
      <div className="tabela-container">
        {carregando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cor-texto-terciario)' }}>
            Carregando comprovantes...
          </div>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Título & Descrição</th>
                <th>Categoria</th>
                <th>Vínculo</th>
                <th>Valor (R$)</th>
                <th>Anexo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {comprovantes.map((comp) => {
                const isPdf = comp.mimetype?.includes('pdf') || comp.arquivoNome?.toLowerCase().endsWith('.pdf');
                return (
                  <tr key={comp.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--texto-xs)' }}>
                      {formatarData(comp.dataComprovante)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{comp.titulo}</div>
                      {comp.descricao && (
                        <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)', maxWidth: '300px' }}>
                          {comp.descricao}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ fontSize: '11px', background: 'var(--cor-superficie-elevada)' }}>
                        {NOMES_CATEGORIAS[comp.categoria] || comp.categoria}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--texto-xs)' }}>
                      {comp.peca?.titulo ? (
                        <div style={{ fontWeight: 500, color: 'var(--cor-primaria)' }}>🎭 {comp.peca.titulo}</div>
                      ) : (
                        <div style={{ color: 'var(--cor-texto-terciario)' }}>Geral da Cia</div>
                      )}
                      {comp.colaborador?.nome && (
                        <div style={{ color: 'var(--cor-texto-secundario)' }}>👤 {comp.colaborador.nome}</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--cor-texto-primario)', whiteSpace: 'nowrap' }}>
                      {formatarMoeda(comp.valor)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-fantasma"
                        onClick={() => handleBaixarArquivo(comp)}
                        disabled={baixandoId === comp.id}
                        title={`Abrir ${comp.arquivoNome || 'anexo'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>{isPdf ? '📄' : '🖼️'}</span>
                        <span style={{ fontSize: '11px' }}>
                          {baixandoId === comp.id ? 'Abrindo...' : comp.arquivoNome || 'Ver Anexo'}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div className="admin-acoes">
                        <button
                          type="button"
                          className="admin-acao-btn"
                          onClick={() => setModalForm({ aberto: true, comprovante: comp })}
                          title="Editar Comprovante"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="admin-acao-btn perigo"
                          onClick={() => setConfirmacaoExcluir({ aberto: true, comprovante: comp })}
                          title="Excluir Comprovante"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {comprovantes.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--cor-texto-terciario)' }}>
                    Nenhum comprovante financeiro cadastrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      <ModalComprovanteForm
        aberto={modalForm.aberto}
        onFechar={() => setModalForm({ aberto: false, comprovante: null })}
        comprovanteParaEditar={modalForm.comprovante}
        onSalvar={handleSalvarComprovante}
        pecas={pecas}
        colaboradores={colaboradores}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, comprovante: null })}
        onConfirmar={handleExcluirConfirmado}
        titulo="Excluir Comprovante"
        mensagem={`Tem certeza que deseja excluir o comprovante "${confirmacaoExcluir.comprovante?.titulo}" no valor de ${formatarMoeda(
          confirmacaoExcluir.comprovante?.valor
        )}? O arquivo anexado também será apagado permanentemente.`}
        textoConfirmar="Sim, Excluir"
      />
    </div>
  );
}
