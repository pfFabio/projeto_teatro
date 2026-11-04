// =============================================================================
// Aba de Ideias & Propostas (Painel Admin)
// Single Responsibility: visualização e gestão de mensagens recebidas (Ata #02)
// =============================================================================

import { useState } from 'react';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { ideiasAPI } from '../../services/api';

const STATUS_CORES = {
  NOVA: { bg: 'rgba(230, 81, 0, 0.15)', texto: '#e65100', label: 'Nova Proposta' },
  LIDA: { bg: 'rgba(2, 136, 209, 0.15)', texto: '#0288d1', label: 'Lida' },
  RESPONDIDA: { bg: 'rgba(46, 125, 50, 0.15)', texto: '#2e7d32', label: 'Respondida' },
  ARQUIVADA: { bg: 'rgba(117, 117, 117, 0.15)', texto: '#757575', label: 'Arquivada' },
};

export default function AbaIdeias({ ideias, onRecarregar }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modalDetalhe, setModalDetalhe] = useState({ aberto: false, ideia: null });
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, ideiaId: null });
  const [processando, setProcessando] = useState(false);

  async function handleMudarStatus(id, novoStatus) {
    try {
      setProcessando(true);
      await ideiasAPI.atualizarStatus(id, novoStatus);
      if (modalDetalhe.ideia && modalDetalhe.ideia.id === id) {
        setModalDetalhe({ aberto: true, ideia: { ...modalDetalhe.ideia, status: novoStatus } });
      }
      onRecarregar();
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao atualizar status da ideia');
    } finally {
      setProcessando(false);
    }
  }

  async function handleConfirmarExclusao() {
    if (!confirmacaoExcluir.ideiaId) return;
    try {
      await ideiasAPI.deletar(confirmacaoExcluir.ideiaId);
      if (modalDetalhe.ideia?.id === confirmacaoExcluir.ideiaId) {
        setModalDetalhe({ aberto: false, ideia: null });
      }
      onRecarregar();
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao excluir mensagem');
    }
  }

  function formatarData(dataIso) {
    if (!dataIso) return '—';
    try {
      const d = new Date(dataIso);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dataIso;
    }
  }

  const ideiasFiltradas = ideias.filter((item) => {
    if (filtroStatus && item.status !== filtroStatus) return false;
    if (busca) {
      const termo = busca.toLowerCase();
      return (
        item.nome?.toLowerCase().includes(termo) ||
        item.email?.toLowerCase().includes(termo) ||
        item.titulo?.toLowerCase().includes(termo) ||
        item.descricao?.toLowerCase().includes(termo)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input
          type="text"
          className="campo-input"
          placeholder="🔍 Buscar ideia por nome, email ou conteúdo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />
        <select
          className="campo-select"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Todos os status</option>
          <option value="NOVA">Apenas Novas</option>
          <option value="LIDA">Lidas</option>
          <option value="RESPONDIDA">Respondidas</option>
          <option value="ARQUIVADA">Arquivadas</option>
        </select>
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Status</th>
              <th>Proponente</th>
              <th>Contato</th>
              <th>Proposta / Ideia</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ideiasFiltradas.map((item) => {
              const cor = STATUS_CORES[item.status] || STATUS_CORES.NOVA;
              return (
                <tr key={item.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: cor.bg,
                        color: cor.texto,
                      }}
                    >
                      {cor.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.nome}</div>
                  </td>
                  <td style={{ fontSize: 'var(--texto-xs)' }}>
                    <div>📧 {item.email}</div>
                    {item.telefone && <div>📱 {item.telefone}</div>}
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    {item.titulo && (
                      <div style={{ fontWeight: 600, fontSize: 'var(--texto-sm)', marginBottom: '2px' }}>
                        {item.titulo}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 'var(--texto-xs)',
                        color: 'var(--cor-texto-secundario)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.descricao}
                    >
                      {item.descricao}
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', whiteSpace: 'nowrap' }}>
                    {formatarData(item.criadoEm)}
                  </td>
                  <td>
                    <div className="admin-acoes">
                      <button
                        className="admin-acao-btn"
                        onClick={() => {
                          setModalDetalhe({ aberto: true, ideia: item });
                          if (item.status === 'NOVA') {
                            handleMudarStatus(item.id, 'LIDA');
                          }
                        }}
                        title="Ver Mensagem Completa"
                      >
                        👁️
                      </button>
                      <button
                        className="admin-acao-btn perigo"
                        onClick={() => setConfirmacaoExcluir({ aberto: true, ideiaId: item.id })}
                        title="Excluir Mensagem"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {ideiasFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--cor-texto-terciario)' }}>
                  Nenhuma mensagem de ideia ou proposta recebida.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalhes da Ideia */}
      <Modal
        aberto={modalDetalhe.aberto}
        onFechar={() => setModalDetalhe({ aberto: false, ideia: null })}
        titulo="💡 Proposta Recebida — Tem uma Ideia?"
        rodape={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-sm btn-secundario"
                onClick={() => handleMudarStatus(modalDetalhe.ideia.id, 'RESPONDIDA')}
                disabled={processando}
              >
                ✓ Marcar como Respondida
              </button>
              <button
                type="button"
                className="btn btn-sm btn-fantasma"
                onClick={() => handleMudarStatus(modalDetalhe.ideia.id, 'ARQUIVADA')}
                disabled={processando}
              >
                📁 Arquivar
              </button>
            </div>
            <button
              className="btn btn-primario btn-sm"
              onClick={() => setModalDetalhe({ aberto: false, ideia: null })}
            >
              Fechar
            </button>
          </div>
        }
      >
        {modalDetalhe.ideia && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cor-borda)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: 'var(--texto-lg)', marginBottom: '4px' }}>
                  {modalDetalhe.ideia.titulo || 'Proposta Sem Título'}
                </h3>
                <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
                  Enviado em {formatarData(modalDetalhe.ideia.criadoEm)}
                </span>
              </div>
              <div>
                <select
                  className="campo-select"
                  value={modalDetalhe.ideia.status}
                  onChange={(e) => handleMudarStatus(modalDetalhe.ideia.id, e.target.value)}
                  style={{ fontSize: 'var(--texto-xs)', padding: '4px 8px' }}
                >
                  <option value="NOVA">Nova Proposta</option>
                  <option value="LIDA">Lida</option>
                  <option value="RESPONDIDA">Respondida</option>
                  <option value="ARQUIVADA">Arquivada</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--cor-fundo-card)', padding: '12px', borderRadius: 'var(--raio-md)' }}>
              <div>
                <strong style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', display: 'block' }}>Proponente</strong>
                <span>{modalDetalhe.ideia.nome}</span>
              </div>
              <div>
                <strong style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', display: 'block' }}>Email</strong>
                <a href={`mailto:${modalDetalhe.ideia.email}`} style={{ color: 'var(--cor-primaria)' }}>
                  {modalDetalhe.ideia.email}
                </a>
              </div>
              {modalDetalhe.ideia.telefone && (
                <div>
                  <strong style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', display: 'block' }}>Telefone / WhatsApp</strong>
                  <a
                    href={`https://wa.me/55${modalDetalhe.ideia.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--cor-primaria)' }}
                  >
                    {modalDetalhe.ideia.telefone} ↗
                  </a>
                </div>
              )}
              <div>
                <strong style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', display: 'block' }}>Consentimento LGPD</strong>
                <span style={{ color: 'var(--cor-sucesso)' }}>✓ Autorizado pelo titular</span>
              </div>
            </div>

            <div>
              <strong style={{ fontSize: 'var(--texto-sm)', display: 'block', marginBottom: '8px' }}>
                Descrição da Proposta:
              </strong>
              <div
                style={{
                  padding: '16px',
                  background: 'var(--cor-fundo)',
                  borderRadius: 'var(--raio-md)',
                  border: '1px solid var(--cor-borda)',
                  fontSize: 'var(--texto-sm)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {modalDetalhe.ideia.descricao}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmação de Exclusão */}
      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, ideiaId: null })}
        onConfirmar={handleConfirmarExclusao}
        titulo="Excluir Mensagem"
        mensagem="Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

