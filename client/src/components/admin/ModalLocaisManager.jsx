// =============================================================================
// Theatrum — Modal de Gerenciamento de Locais e Temporadas
// Extraído de AbaPecas.jsx (SOLID - Single Responsibility)
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { pecasAPI } from '../../services/api';
import { getTag } from '../../constants/statusPeca';
import { buscarCoordenadasEndereco } from '../../services/geocodingService';

export default function ModalLocaisManager({ aberto, peca, onFechar, onAtualizado }) {
  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nomeLocal: '',
    cidade: '',
    endereco: '',
    latitude: '',
    longitude: '',
    dataEstreia: '',
    dataFim: '',
    horario: '',
    status: 'PROGRAMADA',
  });

  const [buscandoCoords, setBuscandoCoords] = useState(false);
  const [statusCoords, setStatusCoords] = useState({ tipo: '', msg: '' });
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, localId: null });

  useEffect(() => {
    if (aberto && peca) {
      carregarLocais();
      resetForm();
    } else {
      setLocais([]);
      setErro('');
    }
  }, [aberto, peca]);

  function resetForm() {
    setEditandoId(null);
    setForm({
      nomeLocal: '',
      cidade: '',
      endereco: '',
      latitude: '',
      longitude: '',
      dataEstreia: '',
      dataFim: '',
      horario: '',
      status: 'PROGRAMADA',
    });
    setStatusCoords({ tipo: '', msg: '' });
    setErro('');
  }

  async function carregarLocais() {
    try {
      setCarregando(true);
      setErro('');
      const res = await pecasAPI.buscar(peca.id);
      setLocais(res.data.locais || []);
    } catch (err) {
      setErro('Erro ao carregar locais');
    } finally {
      setCarregando(false);
    }
  }

  async function handleBuscarCoordsLocal() {
    if (!form.endereco || form.endereco.length < 4) return;
    setBuscandoCoords(true);
    setStatusCoords({ tipo: 'info', msg: 'Buscando coordenadas...' });

    const res = await buscarCoordenadasEndereco(form.endereco);
    if (res.sucesso) {
      setForm(prev => ({ ...prev, latitude: res.latitude, longitude: res.longitude }));
      setStatusCoords({ tipo: 'sucesso', msg: res.mensagem });
    } else {
      setStatusCoords({ tipo: 'alerta', msg: res.mensagem });
    }
    setBuscandoCoords(false);
  }

  async function handleSalvarLocal(e) {
    e.preventDefault();
    if (!form.nomeLocal.trim() || !form.cidade.trim() || !form.endereco.trim()) {
      setErro('Nome do local, cidade e endereço são obrigatórios');
      return;
    }

    try {
      setSalvando(true);
      setErro('');

      if (editandoId) {
        await pecasAPI.atualizarLocal(peca.id, editandoId, form);
      } else {
        await pecasAPI.adicionarLocal(peca.id, form);
      }

      await carregarLocais();
      resetForm();
      onAtualizado();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar local');
    } finally {
      setSalvando(false);
    }
  }

  function handleIniciarEdicao(local) {
    setEditandoId(local.id);
    setErro('');
    setForm({
      nomeLocal: local.nomeLocal || '',
      cidade: local.cidade || '',
      endereco: local.endereco || '',
      latitude: local.latitude || '',
      longitude: local.longitude || '',
      dataEstreia: local.dataEstreia || '',
      dataFim: local.dataFim || '',
      horario: local.horario || '',
      status: local.status || 'PROGRAMADA',
    });
    setStatusCoords({ tipo: '', msg: '' });
  }

  async function handleDeletarLocalConfirmado() {
    if (!confirmacaoExcluir.localId || !peca) return;
    try {
      await pecasAPI.deletarLocal(peca.id, confirmacaoExcluir.localId);
      setLocais(prev => prev.filter(l => l.id !== confirmacaoExcluir.localId));
      onAtualizado();
    } catch (err) {
      setErro('Erro ao excluir local');
    }
  }

  return (
    <>
      <Modal
        aberto={aberto}
        onFechar={onFechar}
        titulo={`📍 Locais e Datas: ${peca?.titulo || ''}`}
        rodape={
          <button className="btn btn-primario" onClick={onFechar}>
            Concluir
          </button>
        }
      >
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

        <form
          onSubmit={handleSalvarLocal}
          style={{
            background: 'var(--cor-fundo-card)',
            padding: '18px',
            borderRadius: 'var(--raio-lg)',
            border: '1px solid var(--cor-borda)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: 'var(--texto-base)', color: 'var(--cor-texto)', margin: 0 }}>
              {editandoId ? '✏️ Editar Local / Apresentação' : '➕ Adicionar Novo Local de Apresentação'}
            </h4>
            {editandoId && (
              <button
                type="button"
                className="btn btn-fantasma btn-sm"
                onClick={resetForm}
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div className="campo-grupo" style={{ marginBottom: '12px' }}>
              <label className="campo-label">Nome do Local / Teatro *</label>
              <input
                className="campo-input"
                placeholder="Ex: Theatro Municipal de Niterói"
                value={form.nomeLocal}
                onChange={e => setForm({ ...form, nomeLocal: e.target.value })}
                required
              />
            </div>
            <div className="campo-grupo" style={{ marginBottom: '12px' }}>
              <label className="campo-label">Cidade / UF *</label>
              <input
                className="campo-input"
                placeholder="Ex: Niterói, RJ ou Rio de Janeiro, RJ"
                value={form.cidade}
                onChange={e => setForm({ ...form, cidade: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="campo-grupo" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="campo-label" style={{ marginBottom: 0 }}>Endereço Completo *</label>
              <button
                type="button"
                className="btn btn-fantasma btn-sm"
                onClick={handleBuscarCoordsLocal}
                disabled={buscandoCoords || !form.endereco}
                style={{ fontSize: '11px', padding: '2px 8px' }}
              >
                {buscandoCoords ? '⏳ Buscando...' : '📍 Buscar Coordenadas'}
              </button>
            </div>
            <input
              className="campo-input"
              placeholder="Ex: Rua Quinze de Novembro, 35 — Centro, Niterói, RJ"
              value={form.endereco}
              onChange={e => setForm({ ...form, endereco: e.target.value })}
              required
            />
            {statusCoords.msg && (
              <div
                style={{
                  fontSize: 'var(--texto-xs)',
                  marginTop: '4px',
                  color: statusCoords.tipo === 'sucesso' ? 'var(--cor-sucesso)' : 'var(--cor-dourado)',
                }}
              >
                {statusCoords.msg}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="campo-grupo" style={{ marginBottom: 0 }}>
              <label className="campo-label">Latitude (opcional)</label>
              <input
                className="campo-input"
                type="number"
                step="any"
                placeholder="-22.8943"
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ marginBottom: 0 }}>
              <label className="campo-label">Longitude (opcional)</label>
              <input
                className="campo-input"
                type="number"
                step="any"
                placeholder="-43.1228"
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="campo-grupo" style={{ marginBottom: 0 }}>
              <label className="campo-label">Data de Estreia</label>
              <input
                className="campo-input"
                type="date"
                value={form.dataEstreia}
                onChange={e => setForm({ ...form, dataEstreia: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ marginBottom: 0 }}>
              <label className="campo-label">Data de Encerramento</label>
              <input
                className="campo-input"
                type="date"
                value={form.dataFim}
                onChange={e => setForm({ ...form, dataFim: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ marginBottom: 0 }}>
              <label className="campo-label">Status nesta Praça</label>
              <select
                className="campo-select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="PROGRAMADA">Programada</option>
                <option value="EM_CARTAZ">Em Cartaz</option>
                <option value="ENCERRADA">Encerrada</option>
              </select>
            </div>
          </div>

          <div className="campo-grupo" style={{ marginBottom: '16px' }}>
            <label className="campo-label">Horários / Sessões</label>
            <input
              className="campo-input"
              placeholder="Ex: Sextas e Sábados às 20h, Domingos às 18h"
              value={form.horario}
              onChange={e => setForm({ ...form, horario: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primario btn-sm" disabled={salvando}>
            {salvando ? 'Salvando local...' : editandoId ? 'Atualizar Local' : '+ Salvar Este Local'}
          </button>
        </form>

        <div>
          <h4
            style={{
              fontSize: 'var(--texto-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--cor-texto-secundario)',
              marginBottom: '12px',
            }}
          >
            Praças / Locais Cadastrados ({locais.length})
          </h4>

          {carregando ? (
            <div className="carregando-container" style={{ padding: '24px 0' }}>
              <div className="spinner" />
              <p>Carregando locais...</p>
            </div>
          ) : locais.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 16px',
                background: 'var(--cor-fundo-card)',
                borderRadius: 'var(--raio-lg)',
                border: '1px solid var(--cor-borda)',
                color: 'var(--cor-texto-terciario)',
              }}
            >
              <p>
                Nenhum local específico cadastrado ainda. Use o formulário acima para adicionar Rio de Janeiro,
                Niterói, São Paulo, etc.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {locais.map(local => {
                const tag = getTag(local.status);
                return (
                  <div
                    key={local.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--cor-fundo-card)',
                      borderRadius: 'var(--raio-md)',
                      border: '1px solid var(--cor-borda)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: 'var(--texto-base)' }}>{local.nomeLocal}</strong>
                        <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-dourado)', fontWeight: 600 }}>
                          ({local.cidade})
                        </span>
                        <span className={`tag ${tag.classe}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {tag.texto}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>
                        📍 {local.endereco}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--texto-xs)',
                          color: 'var(--cor-texto-terciario)',
                          marginTop: '2px',
                        }}
                      >
                        {local.dataEstreia &&
                          `📅 De ${new Date(local.dataEstreia + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        {local.dataFim &&
                          ` até ${new Date(local.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        {local.horario && ` • ⏰ ${local.horario}`}
                      </div>
                    </div>
                    <div className="admin-acoes">
                      <button
                        className="admin-acao-btn"
                        onClick={() => handleIniciarEdicao(local)}
                        title="Editar local"
                      >
                        ✏️
                      </button>
                      <button
                        className="admin-acao-btn perigo"
                        onClick={() => setConfirmacaoExcluir({ aberto: true, localId: local.id })}
                        title="Excluir local"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, localId: null })}
        onConfirmar={handleDeletarLocalConfirmado}
        titulo="Excluir Local de Apresentação"
        mensagem="Tem certeza que deseja remover este local/temporada da peça?"
        textoConfirmar="Sim, Excluir"
      />
    </>
  );
}
