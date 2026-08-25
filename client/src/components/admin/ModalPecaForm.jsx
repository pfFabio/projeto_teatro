// =============================================================================
// Theatrum — Modal de Criação e Edição de Peça
// Extraído de AbaPecas.jsx (SOLID - Single Responsibility)
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { pecasAPI } from '../../services/api';
import { buscarCoordenadasEndereco } from '../../services/geocodingService';

export default function ModalPecaForm({
  aberto,
  peca,
  onFechar,
  onSalvo,
  onAbrirLocais,
  onAbrirFotos,
}) {
  const [formPeca, setFormPeca] = useState({
    titulo: '',
    resumo: '',
    endereco: '',
    latitude: '',
    longitude: '',
    dataEstreia: '',
    status: 'PROGRAMADA',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscandoCoords, setBuscandoCoords] = useState(false);
  const [statusCoords, setStatusCoords] = useState({ tipo: '', msg: '' });

  useEffect(() => {
    if (peca) {
      setFormPeca({
        titulo: peca.titulo || '',
        resumo: peca.resumo || '',
        endereco: peca.endereco || '',
        latitude: peca.latitude || '',
        longitude: peca.longitude || '',
        dataEstreia: peca.dataEstreia || '',
        status: peca.status || 'PROGRAMADA',
      });
    } else {
      setFormPeca({
        titulo: '',
        resumo: '',
        endereco: '',
        latitude: '',
        longitude: '',
        dataEstreia: '',
        status: 'PROGRAMADA',
      });
    }
    setErro('');
    setStatusCoords({ tipo: '', msg: '' });
  }, [peca, aberto]);

  async function handleBuscarCoords() {
    if (!formPeca.endereco || formPeca.endereco.length < 4) return;
    setBuscandoCoords(true);
    setStatusCoords({ tipo: 'info', msg: 'Buscando coordenadas no mapa...' });

    const res = await buscarCoordenadasEndereco(formPeca.endereco);
    if (res.sucesso) {
      setFormPeca(prev => ({ ...prev, latitude: res.latitude, longitude: res.longitude }));
      setStatusCoords({ tipo: 'sucesso', msg: res.mensagem });
    } else {
      setStatusCoords({ tipo: 'alerta', msg: res.mensagem });
    }
    setBuscandoCoords(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formPeca.titulo.trim() || !formPeca.resumo.trim() || !formPeca.endereco.trim()) {
      setErro('Título, resumo e endereço são obrigatórios');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      let pecaSalva;

      if (peca) {
        const res = await pecasAPI.atualizar(peca.id, formPeca);
        pecaSalva = res.data;
      } else {
        const res = await pecasAPI.criar(formPeca);
        pecaSalva = res.data;
      }

      onSalvo(pecaSalva, !peca);
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar peça');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={peca ? '✏️ Editar Peça' : '🎪 Nova Peça'}
      rodape={
        <>
          <button className="btn btn-fantasma" onClick={onFechar}>
            Cancelar
          </button>
          <button className="btn btn-primario" onClick={handleSubmit} disabled={salvando}>
            {salvando ? 'Salvando...' : peca ? 'Salvar Alterações' : 'Criar Peça e Configurar Locais →'}
          </button>
        </>
      }
    >
      {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

      <div className="campo-grupo">
        <label className="campo-label">Título *</label>
        <input
          className="campo-input"
          value={formPeca.titulo}
          onChange={e => setFormPeca({ ...formPeca, titulo: e.target.value })}
          placeholder="Ex: Hamlet"
          required
        />
      </div>

      <div className="campo-grupo">
        <label className="campo-label">Resumo / Sinopse *</label>
        <textarea
          className="campo-textarea"
          value={formPeca.resumo}
          onChange={e => setFormPeca({ ...formPeca, resumo: e.target.value })}
          placeholder="Descreva a história e informações da peça..."
          required
        />
      </div>

      <div className="campo-grupo">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="campo-label" style={{ marginBottom: 0 }}>Endereço Principal / Sede *</label>
          <button
            type="button"
            className="btn btn-fantasma btn-sm"
            onClick={handleBuscarCoords}
            disabled={buscandoCoords || !formPeca.endereco}
            style={{ fontSize: 'var(--texto-xs)' }}
            title="Obter Latitude e Longitude a partir deste endereço"
          >
            {buscandoCoords ? '⏳ Localizando...' : '📍 Buscar Coordenadas'}
          </button>
        </div>
        <input
          className="campo-input"
          value={formPeca.endereco}
          onChange={e => {
            setFormPeca({ ...formPeca, endereco: e.target.value });
            setStatusCoords({ tipo: '', msg: '' });
          }}
          placeholder="Ex: Teatro Municipal — Praça Ramos de Azevedo, s/n, São Paulo, SP"
          required
        />
        {statusCoords.msg && (
          <div
            style={{
              fontSize: 'var(--texto-xs)',
              marginTop: '6px',
              color: statusCoords.tipo === 'sucesso' ? 'var(--cor-sucesso)' : statusCoords.tipo === 'alerta' ? 'var(--cor-dourado)' : 'var(--cor-texto-secundario)',
            }}
          >
            {statusCoords.msg}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="campo-grupo">
          <label className="campo-label">Latitude</label>
          <input
            className="campo-input"
            type="number"
            step="any"
            value={formPeca.latitude}
            onChange={e => setFormPeca({ ...formPeca, latitude: e.target.value })}
            placeholder="-23.5453"
          />
        </div>
        <div className="campo-grupo">
          <label className="campo-label">Longitude</label>
          <input
            className="campo-input"
            type="number"
            step="any"
            value={formPeca.longitude}
            onChange={e => setFormPeca({ ...formPeca, longitude: e.target.value })}
            placeholder="-46.6385"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="campo-grupo">
          <label className="campo-label">Data de Estreia Geral</label>
          <input
            className="campo-input"
            type="date"
            value={formPeca.dataEstreia}
            onChange={e => setFormPeca({ ...formPeca, dataEstreia: e.target.value })}
          />
        </div>
        <div className="campo-grupo">
          <label className="campo-label">Status</label>
          <select
            className="campo-select"
            value={formPeca.status}
            onChange={e => setFormPeca({ ...formPeca, status: e.target.value })}
          >
            <option value="PROGRAMADA">Programada</option>
            <option value="EM_CARTAZ">Em Cartaz</option>
            <option value="ENCERRADA">Encerrada</option>
          </select>
        </div>
      </div>

      {peca && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <div
            style={{
              padding: '14px',
              background: 'var(--cor-fundo-card)',
              borderRadius: 'var(--raio-lg)',
              border: '1px solid var(--cor-borda)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--texto-sm)' }}>📍 Locais & Datas de Apresentação</div>
              <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>Adicione temporadas no Rio de Janeiro, Niterói, etc.</div>
            </div>
            <button
              type="button"
              className="btn btn-primario btn-sm"
              onClick={() => {
                onFechar();
                onAbrirLocais(peca);
              }}
            >
              Gerenciar Locais →
            </button>
          </div>

          <div
            style={{
              padding: '14px',
              background: 'var(--cor-fundo-card)',
              borderRadius: 'var(--raio-lg)',
              border: '1px solid var(--cor-borda)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--texto-sm)' }}>📸 Fotos e Vídeos da Peça</div>
              <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>Pôsteres e mídias de divulgação</div>
            </div>
            <button
              type="button"
              className="btn btn-dourado btn-sm"
              onClick={() => {
                onFechar();
                onAbrirFotos(peca);
              }}
            >
              Gerenciar Fotos →
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
