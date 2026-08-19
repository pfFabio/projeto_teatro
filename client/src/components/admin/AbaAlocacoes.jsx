// =============================================================================
// Aba de Alocações — Alocar colaboradores em peças
// Single Responsibility: apenas gerenciamento de alocações
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { pecasAPI } from '../../services/api';

export default function AbaAlocacoes({ pecas, colaboradores, onRecarregar }) {
  const [pecaSelecionada, setPecaSelecionada] = useState('');
  const [pecaDetalhes, setPecaDetalhes] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [colabSelecionado, setColabSelecionado] = useState('');
  const [funcaoNaPeca, setFuncaoNaPeca] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregarPecaDetalhes(id) {
    try {
      setCarregando(true);
      const res = await pecasAPI.buscar(id);
      setPecaDetalhes(res.data);
    } catch (erro) {
      console.error('Erro ao carregar peça:', erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (pecaSelecionada) {
      carregarPecaDetalhes(pecaSelecionada);
    } else {
      setPecaDetalhes(null);
    }
  }, [pecaSelecionada]);

  async function alocar() {
    if (!colabSelecionado || !funcaoNaPeca) return;
    try {
      setSalvando(true);
      await pecasAPI.alocarColaborador(pecaSelecionada, {
        colaboradorId: parseInt(colabSelecionado),
        funcaoNaPeca,
      });
      setModalAberto(false);
      setColabSelecionado('');
      setFuncaoNaPeca('');
      carregarPecaDetalhes(pecaSelecionada);
      onRecarregar();
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao alocar');
    } finally {
      setSalvando(false);
    }
  }

  async function removerAlocacao(colabId) {
    if (!confirm('Remover este colaborador da peça?')) return;
    try {
      await pecasAPI.removerColaborador(pecaSelecionada, colabId);
      carregarPecaDetalhes(pecaSelecionada);
      onRecarregar();
    } catch (err) {
      alert('Erro ao remover');
    }
  }

  const idsAlocados = new Set((pecaDetalhes?.colaboradores || []).map(c => c.colaboradorId));
  const colabsDisponiveis = colaboradores.filter(c => !idsAlocados.has(c.id));

  return (
    <div>
      <div className="admin-toolbar">
        <select
          className="campo-select"
          value={pecaSelecionada}
          onChange={(e) => setPecaSelecionada(e.target.value)}
          style={{ maxWidth: '400px' }}
        >
          <option value="">Selecione uma peça...</option>
          {pecas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
        </select>

        {pecaSelecionada && (
          <button className="btn btn-primario" onClick={() => setModalAberto(true)}>
            + Alocar Colaborador
          </button>
        )}
      </div>

      {!pecaSelecionada ? (
        <div className="vazio">
          <div className="vazio-icone">🔗</div>
          <p>Selecione uma peça para gerenciar as alocações</p>
        </div>
      ) : carregando ? (
        <div className="carregando-container"><div className="spinner" /></div>
      ) : (
        <div className="alocacao-container">
          <div className="alocacao-panel">
            <h4>👥 Equipe de "{pecaDetalhes?.titulo}"</h4>
            {(pecaDetalhes?.colaboradores || []).length === 0 ? (
              <p style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-sm)' }}>
                Nenhum colaborador alocado. Use o botão acima para alocar.
              </p>
            ) : (
              <div className="elenco-lista">
                {pecaDetalhes.colaboradores.map((aloc) => (
                  <div className="elenco-item" key={aloc.id} style={{ justifyContent: 'space-between' }}>
                    <div className="flex items-center gap-3">
                      <div className="elenco-item-avatar-placeholder">
                        {aloc.colaborador.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="elenco-item-info">
                        <div className="elenco-item-nome">{aloc.colaborador.nome}</div>
                        <div className="elenco-item-funcao">{aloc.funcaoNaPeca} • {aloc.colaborador.funcao}</div>
                      </div>
                    </div>
                    <button
                      className="admin-acao-btn perigo"
                      onClick={() => removerAlocacao(aloc.colaboradorId)}
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="alocacao-panel">
            <h4>📋 Informações da Peça</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espaco-3)', fontSize: 'var(--texto-sm)' }}>
              <div>
                <span style={{ color: 'var(--cor-texto-terciario)' }}>Status: </span>
                <span className={`tag ${pecaDetalhes?.status === 'EM_CARTAZ' ? 'tag-em-cartaz' : pecaDetalhes?.status === 'ENCERRADA' ? 'tag-encerrada' : 'tag-programada'}`}>
                  {pecaDetalhes?.status?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--cor-texto-terciario)' }}>Endereço: </span>
                {pecaDetalhes?.endereco}
              </div>
              <div>
                <span style={{ color: 'var(--cor-texto-terciario)' }}>Total equipe: </span>
                {pecaDetalhes?.colaboradores?.length || 0} pessoas
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo="🔗 Alocar Colaborador"
        rodape={
          <>
            <button className="btn btn-fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
            <button className="btn btn-primario" onClick={alocar} disabled={salvando || !colabSelecionado || !funcaoNaPeca}>
              {salvando ? 'Alocando...' : 'Alocar'}
            </button>
          </>
        }
      >
        <div className="campo-grupo">
          <label className="campo-label">Colaborador</label>
          <select className="campo-select" value={colabSelecionado} onChange={e => setColabSelecionado(e.target.value)}>
            <option value="">Selecione...</option>
            {colabsDisponiveis.map(c => (
              <option key={c.id} value={c.id}>{c.nome} — {c.funcao}</option>
            ))}
          </select>
        </div>
        <div className="campo-grupo">
          <label className="campo-label">Função na Peça</label>
          <input
            className="campo-input"
            placeholder="Ex: Hamlet, Figurinista, Iluminação..."
            value={funcaoNaPeca}
            onChange={e => setFuncaoNaPeca(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
