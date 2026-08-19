// =============================================================================
// Aba de Peças — CRUD + Fotos + Locais
// Single Responsibility: gerenciamento de peças no painel admin
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { pecasAPI } from '../../services/api';
import { getTag } from '../../constants/statusPeca';

export default function AbaPecas({ pecas, onRecarregar, modalPeca, setModalPeca }) {
  const [formPeca, setFormPeca] = useState({
    titulo: '', resumo: '', endereco: '', latitude: '', longitude: '', dataEstreia: '', status: 'PROGRAMADA',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscandoCoords, setBuscandoCoords] = useState(false);
  const [statusCoords, setStatusCoords] = useState({ tipo: '', msg: '' });

  // Modal de Fotos
  const [modalMidias, setModalMidias] = useState({
    aberto: false, peca: null, fotos: [], enviando: false, carregando: false, erro: '',
  });

  // Modal de Múltiplos Locais / Temporadas
  const [modalLocais, setModalLocais] = useState({
    aberto: false, peca: null, locais: [], carregando: false, salvando: false, erro: '',
    editandoId: null,
    form: { nomeLocal: '', cidade: '', endereco: '', latitude: '', longitude: '', dataEstreia: '', dataFim: '', horario: '', status: 'PROGRAMADA' },
    buscandoCoordsLocal: false, statusCoordsLocal: { tipo: '', msg: '' },
  });

  function abrirNova() {
    setFormPeca({ titulo: '', resumo: '', endereco: '', latitude: '', longitude: '', dataEstreia: '', status: 'PROGRAMADA' });
    setErro('');
    setStatusCoords({ tipo: '', msg: '' });
    setModalPeca({ aberto: true, peca: null });
  }

  function abrirEditar(peca) {
    setFormPeca({
      titulo: peca.titulo, resumo: peca.resumo, endereco: peca.endereco || '',
      latitude: peca.latitude || '', longitude: peca.longitude || '',
      dataEstreia: peca.dataEstreia || '', status: peca.status,
    });
    setErro('');
    setStatusCoords({ tipo: '', msg: '' });
    setModalPeca({ aberto: true, peca });
  }

  // ---- Fotos ----
  async function abrirGerenciadorFotos(peca) {
    setModalMidias({ aberto: true, peca, fotos: [], enviando: false, carregando: true, erro: '' });
    try {
      const res = await pecasAPI.buscar(peca.id);
      setModalMidias(prev => ({ ...prev, fotos: res.data.fotos || [], carregando: false }));
    } catch (err) {
      setModalMidias(prev => ({ ...prev, carregando: false, erro: 'Erro ao carregar fotos' }));
    }
  }

  async function handleUploadFotos(e) {
    const arquivos = e.target.files;
    if (!arquivos || arquivos.length === 0 || !modalMidias.peca) return;
    try {
      setModalMidias(prev => ({ ...prev, enviando: true, erro: '' }));
      const formData = new FormData();
      for (let i = 0; i < arquivos.length; i++) formData.append('arquivos', arquivos[i]);
      await pecasAPI.adicionarFotos(modalMidias.peca.id, formData);
      const res = await pecasAPI.buscar(modalMidias.peca.id);
      setModalMidias(prev => ({ ...prev, fotos: res.data.fotos || [], enviando: false }));
      onRecarregar();
    } catch (err) {
      setModalMidias(prev => ({ ...prev, enviando: false, erro: err.response?.data?.mensagem || 'Erro ao enviar fotos/vídeos' }));
    }
  }

  async function handleDeletarFoto(fotoId) {
    if (!confirm('Deseja excluir esta mídia?')) return;
    try {
      await pecasAPI.deletarFoto(modalMidias.peca.id, fotoId);
      setModalMidias(prev => ({ ...prev, fotos: prev.fotos.filter(f => f.id !== fotoId) }));
      onRecarregar();
    } catch (err) { alert('Erro ao excluir foto'); }
  }

  async function handleDefinirCapa(fotoId) {
    if (!modalMidias.peca) return;
    try {
      setModalMidias(prev => ({ ...prev, carregando: true, erro: '' }));
      const res = await pecasAPI.definirFotoCapa(modalMidias.peca.id, fotoId);
      setModalMidias(prev => ({ ...prev, fotos: res.data || [], carregando: false }));
      onRecarregar();
    } catch (err) {
      setModalMidias(prev => ({ ...prev, carregando: false, erro: err.response?.data?.mensagem || 'Erro ao definir foto de capa' }));
    }
  }

  async function handleMoverFoto(index, direcao) {
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= modalMidias.fotos.length || !modalMidias.peca) return;
    const novasFotos = [...modalMidias.fotos];
    const [fotoMovida] = novasFotos.splice(index, 1);
    novasFotos.splice(novoIndex, 0, fotoMovida);
    setModalMidias(prev => ({ ...prev, fotos: novasFotos }));
    try {
      const ids = novasFotos.map(f => f.id);
      const res = await pecasAPI.reordenarFotos(modalMidias.peca.id, ids);
      setModalMidias(prev => ({ ...prev, fotos: res.data || novasFotos }));
      onRecarregar();
    } catch (err) {
      alert('Erro ao salvar nova ordem das fotos');
      const res = await pecasAPI.buscar(modalMidias.peca.id);
      setModalMidias(prev => ({ ...prev, fotos: res.data.fotos || [] }));
    }
  }

  // ---- Locais ----
  async function abrirGerenciadorLocais(peca) {
    setModalLocais({
      aberto: true, peca, locais: [], carregando: true, salvando: false, erro: '',
      editandoId: null,
      form: { nomeLocal: '', cidade: '', endereco: '', latitude: '', longitude: '', dataEstreia: '', dataFim: '', horario: '', status: 'PROGRAMADA' },
      buscandoCoordsLocal: false, statusCoordsLocal: { tipo: '', msg: '' },
    });
    try {
      const res = await pecasAPI.buscar(peca.id);
      setModalLocais(prev => ({ ...prev, locais: res.data.locais || [], carregando: false }));
    } catch (err) {
      setModalLocais(prev => ({ ...prev, carregando: false, erro: 'Erro ao carregar locais' }));
    }
  }

  async function buscarCoordsLocal(enderecoTexto) {
    const query = (enderecoTexto || modalLocais.form.endereco || '').trim();
    if (!query || query.length < 4) return;
    try {
      setModalLocais(prev => ({ ...prev, buscandoCoordsLocal: true, statusCoordsLocal: { tipo: 'info', msg: 'Buscando coordenadas...' } }));
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' } });
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lon = parseFloat(data[0].lon).toFixed(6);
        setModalLocais(prev => ({ ...prev, form: { ...prev.form, latitude: lat, longitude: lon }, statusCoordsLocal: { tipo: 'sucesso', msg: `📍 Coordenadas: ${lat}, ${lon}` } }));
      } else {
        setModalLocais(prev => ({ ...prev, statusCoordsLocal: { tipo: 'alerta', msg: 'Não localizou automaticamente. Preencha manual se desejar.' } }));
      }
    } catch (err) {
      setModalLocais(prev => ({ ...prev, statusCoordsLocal: { tipo: 'erro', msg: 'Erro ao buscar coordenadas online.' } }));
    } finally {
      setModalLocais(prev => ({ ...prev, buscandoCoordsLocal: false }));
    }
  }

  async function handleSalvarLocal(e) {
    e.preventDefault();
    const { nomeLocal, cidade, endereco } = modalLocais.form;
    if (!nomeLocal || !cidade || !endereco) {
      setModalLocais(prev => ({ ...prev, erro: 'Nome do local, cidade e endereço são obrigatórios' }));
      return;
    }
    try {
      setModalLocais(prev => ({ ...prev, salvando: true, erro: '' }));
      if (modalLocais.editandoId) {
        await pecasAPI.atualizarLocal(modalLocais.peca.id, modalLocais.editandoId, modalLocais.form);
      } else {
        await pecasAPI.adicionarLocal(modalLocais.peca.id, modalLocais.form);
      }
      const res = await pecasAPI.buscar(modalLocais.peca.id);
      setModalLocais(prev => ({
        ...prev, locais: res.data.locais || [], salvando: false, editandoId: null,
        form: { nomeLocal: '', cidade: '', endereco: '', latitude: '', longitude: '', dataEstreia: '', dataFim: '', horario: '', status: 'PROGRAMADA' },
        statusCoordsLocal: { tipo: '', msg: '' },
      }));
      onRecarregar();
    } catch (err) {
      setModalLocais(prev => ({ ...prev, salvando: false, erro: err.response?.data?.mensagem || 'Erro ao salvar local' }));
    }
  }

  async function handleDeletarLocal(localId) {
    if (!confirm('Tem certeza que deseja remover este local/temporada da peça?')) return;
    try {
      await pecasAPI.deletarLocal(modalLocais.peca.id, localId);
      setModalLocais(prev => ({ ...prev, locais: prev.locais.filter(l => l.id !== localId) }));
      onRecarregar();
    } catch (err) { alert('Erro ao excluir local'); }
  }

  function handleEditarLocal(local) {
    setModalLocais(prev => ({
      ...prev, editandoId: local.id, erro: '',
      form: { nomeLocal: local.nomeLocal || '', cidade: local.cidade || '', endereco: local.endereco || '', latitude: local.latitude || '', longitude: local.longitude || '', dataEstreia: local.dataEstreia || '', dataFim: local.dataFim || '', horario: local.horario || '', status: local.status || 'PROGRAMADA' },
    }));
  }

  // ---- Geocodificação da Peça ----
  async function buscarCoordenadas(enderecoParaBuscar) {
    const enderecoLimpo = (enderecoParaBuscar || formPeca.endereco || '').trim();
    if (!enderecoLimpo || enderecoLimpo.length < 4) return;
    try {
      setBuscandoCoords(true);
      setStatusCoords({ tipo: 'info', msg: 'Buscando coordenadas no mapa...' });
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoLimpo)}&limit=1`;
      let res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' } });
      let data = await res.json();
      if ((!data || data.length === 0) && enderecoLimpo.includes('—')) {
        const partes = enderecoLimpo.split('—').map(p => p.trim()).filter(Boolean);
        if (partes.length > 1) {
          const enderecoAlternativo = partes.slice(1).join(', ');
          url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoAlternativo)}&limit=1`;
          res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' } });
          data = await res.json();
        }
      }
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lon = parseFloat(data[0].lon).toFixed(6);
        setFormPeca(prev => ({ ...prev, latitude: lat, longitude: lon }));
        setStatusCoords({ tipo: 'sucesso', msg: `📍 Coordenadas encontradas: ${lat}, ${lon}` });
      } else {
        setStatusCoords({ tipo: 'alerta', msg: 'Não localizamos no mapa automaticamente. Preencha manual se desejar.' });
      }
    } catch (err) {
      setStatusCoords({ tipo: 'erro', msg: 'Não foi possível consultar as coordenadas online.' });
    } finally {
      setBuscandoCoords(false);
    }
  }

  useEffect(() => {
    if (!modalPeca.aberto) return;
    if (!formPeca.endereco || formPeca.endereco.length < 8) return;
    const timer = setTimeout(() => { buscarCoordenadas(formPeca.endereco); }, 1200);
    return () => clearTimeout(timer);
  }, [formPeca.endereco, modalPeca.aberto]);

  async function salvarPeca(e) {
    e.preventDefault();
    if (!formPeca.titulo || !formPeca.resumo || !formPeca.endereco) {
      setErro('Título, resumo e endereço são obrigatórios');
      return;
    }
    try {
      setSalvando(true);
      let pecaCriadaOuEditada;
      if (modalPeca.peca) {
        const res = await pecasAPI.atualizar(modalPeca.peca.id, formPeca);
        pecaCriadaOuEditada = res.data;
      } else {
        const res = await pecasAPI.criar(formPeca);
        pecaCriadaOuEditada = res.data;
      }
      setModalPeca({ aberto: false, peca: null });
      onRecarregar();
      if (!modalPeca.peca && pecaCriadaOuEditada?.id) {
        abrirGerenciadorLocais(pecaCriadaOuEditada);
      }
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar peça');
    } finally {
      setSalvando(false);
    }
  }

  async function deletarPeca(id) {
    if (!confirm('Tem certeza que deseja deletar esta peça?')) return;
    try { await pecasAPI.deletar(id); onRecarregar(); } catch (err) { alert('Erro ao deletar peça'); }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <button className="btn btn-primario" onClick={abrirNova}>+ Nova Peça</button>
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Capa / Título</th>
              <th>Status</th>
              <th>Cidades / Locais</th>
              <th>Mídias</th>
              <th>Equipe</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pecas.map((peca) => {
              const tag = getTag(peca.status);
              const fotoCapa = peca.fotos?.[0]?.url;
              const totalLocais = peca.locais?.length || 0;
              const cidadesTexto = totalLocais > 0
                ? peca.locais.map(l => l.cidade?.split(',')[0]?.trim()).filter(Boolean).join(', ')
                : peca.endereco?.split('—')[0]?.trim();

              return (
                <tr key={peca.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {fotoCapa ? (
                        <img src={fotoCapa} alt="" style={{ width: 44, height: 44, borderRadius: 'var(--raio-md)', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--raio-md)', background: 'var(--cor-fundo-elevado)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid var(--cor-borda)' }}>🎭</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{peca.titulo}</div>
                        <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>ID #{peca.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`tag ${tag.classe}`}>{tag.texto}</span></td>
                  <td>
                    <button className="btn btn-fantasma btn-sm" onClick={() => abrirGerenciadorLocais(peca)} title="Gerenciar locais e datas das apresentações" style={{ fontSize: 'var(--texto-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      📍 {totalLocais > 0 ? `${totalLocais} local(is) (${cidadesTexto})` : '+ Adicionar Locais/Datas'}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-fantasma btn-sm" onClick={() => abrirGerenciadorFotos(peca)} title="Gerenciar fotos e vídeos" style={{ fontSize: 'var(--texto-xs)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      📷 {peca.fotos?.length > 0 ? `${peca.fotos.length} foto(s)` : '+ Fotos/Vídeos'}
                    </button>
                  </td>
                  <td>{peca._count?.colaboradores || 0} pessoas</td>
                  <td>
                    <div className="admin-acoes">
                      <button className="admin-acao-btn" onClick={() => abrirGerenciadorLocais(peca)} title="Gerenciar Locais e Datas (Turnê)">📍</button>
                      <button className="admin-acao-btn" onClick={() => abrirGerenciadorFotos(peca)} title="Gerenciar Fotos e Vídeos">🖼️</button>
                      <button className="admin-acao-btn" onClick={() => abrirEditar(peca)} title="Editar dados da peça">✏️</button>
                      <button className="admin-acao-btn perigo" onClick={() => deletarPeca(peca.id)} title="Deletar peça">🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pecas.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--cor-texto-terciario)' }}>Nenhuma peça cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de criar/editar peça */}
      <Modal aberto={modalPeca.aberto} onFechar={() => setModalPeca({ aberto: false, peca: null })} titulo={modalPeca.peca ? '✏️ Editar Peça' : '🎪 Nova Peça'}
        rodape={<><button className="btn btn-fantasma" onClick={() => setModalPeca({ aberto: false, peca: null })}>Cancelar</button><button className="btn btn-primario" onClick={salvarPeca} disabled={salvando}>{salvando ? 'Salvando...' : modalPeca.peca ? 'Salvar Alterações' : 'Criar Peça e Configurar Locais →'}</button></>}
      >
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}
        <div className="campo-grupo"><label className="campo-label">Título *</label><input className="campo-input" value={formPeca.titulo} onChange={e => setFormPeca({...formPeca, titulo: e.target.value})} placeholder="Ex: Hamlet" /></div>
        <div className="campo-grupo"><label className="campo-label">Resumo / Sinopse *</label><textarea className="campo-textarea" value={formPeca.resumo} onChange={e => setFormPeca({...formPeca, resumo: e.target.value})} placeholder="Descreva a história e informações da peça..." /></div>
        <div className="campo-grupo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="campo-label" style={{ marginBottom: 0 }}>Endereço Principal / Sede *</label>
            <button type="button" className="btn btn-fantasma btn-sm" onClick={() => buscarCoordenadas(formPeca.endereco)} disabled={buscandoCoords || !formPeca.endereco} style={{ fontSize: 'var(--texto-xs)' }} title="Obter Latitude e Longitude a partir deste endereço">{buscandoCoords ? '⏳ Localizando...' : '📍 Buscar Coordenadas'}</button>
          </div>
          <input className="campo-input" value={formPeca.endereco} onChange={e => { setFormPeca({...formPeca, endereco: e.target.value}); setStatusCoords({ tipo: '', msg: '' }); }} placeholder="Ex: Teatro Municipal — Praça Ramos de Azevedo, s/n, São Paulo, SP" />
          {statusCoords.msg && <div style={{ fontSize: 'var(--texto-xs)', marginTop: '6px', color: statusCoords.tipo === 'sucesso' ? 'var(--cor-sucesso)' : statusCoords.tipo === 'alerta' ? 'var(--cor-dourado)' : 'var(--cor-texto-secundario)' }}>{statusCoords.msg}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="campo-grupo"><label className="campo-label">Latitude</label><input className="campo-input" type="number" step="any" value={formPeca.latitude} onChange={e => setFormPeca({...formPeca, latitude: e.target.value})} placeholder="-23.5453" /></div>
          <div className="campo-grupo"><label className="campo-label">Longitude</label><input className="campo-input" type="number" step="any" value={formPeca.longitude} onChange={e => setFormPeca({...formPeca, longitude: e.target.value})} placeholder="-46.6385" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="campo-grupo"><label className="campo-label">Data de Estreia Geral</label><input className="campo-input" type="date" value={formPeca.dataEstreia} onChange={e => setFormPeca({...formPeca, dataEstreia: e.target.value})} /></div>
          <div className="campo-grupo"><label className="campo-label">Status</label>
            <select className="campo-select" value={formPeca.status} onChange={e => setFormPeca({...formPeca, status: e.target.value})}>
              <option value="PROGRAMADA">Programada</option><option value="EM_CARTAZ">Em Cartaz</option><option value="ENCERRADA">Encerrada</option>
            </select>
          </div>
        </div>
        {modalPeca.peca && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <div style={{ padding: '14px', background: 'var(--cor-fundo-card)', borderRadius: 'var(--raio-lg)', border: '1px solid var(--cor-borda)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 600, fontSize: 'var(--texto-sm)' }}>📍 Locais & Datas de Apresentação</div><div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>Adicione temporadas no Rio de Janeiro, Niterói, etc.</div></div>
              <button type="button" className="btn btn-primario btn-sm" onClick={() => { const pecaAlvo = modalPeca.peca; setModalPeca({ aberto: false, peca: null }); abrirGerenciadorLocais(pecaAlvo); }}>Gerenciar Locais →</button>
            </div>
            <div style={{ padding: '14px', background: 'var(--cor-fundo-card)', borderRadius: 'var(--raio-lg)', border: '1px solid var(--cor-borda)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 600, fontSize: 'var(--texto-sm)' }}>📸 Fotos e Vídeos da Peça</div><div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>Pôsteres e mídias de divulgação</div></div>
              <button type="button" className="btn btn-dourado btn-sm" onClick={() => { const pecaAlvo = modalPeca.peca; setModalPeca({ aberto: false, peca: null }); abrirGerenciadorFotos(pecaAlvo); }}>Gerenciar Fotos →</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Múltiplos Locais e Datas */}
      <Modal aberto={modalLocais.aberto} onFechar={() => setModalLocais({ ...modalLocais, aberto: false })} titulo={`📍 Locais e Datas: ${modalLocais.peca?.titulo || ''}`}
        rodape={<button className="btn btn-primario" onClick={() => setModalLocais({ ...modalLocais, aberto: false })}>Concluir</button>}
      >
        {modalLocais.erro && <div className="alerta alerta-erro">⚠ {modalLocais.erro}</div>}
        <form onSubmit={handleSalvarLocal} style={{ background: 'var(--cor-fundo-card)', padding: '18px', borderRadius: 'var(--raio-lg)', border: '1px solid var(--cor-borda)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: 'var(--texto-base)', color: 'var(--cor-texto)' }}>{modalLocais.editandoId ? '✏️ Editar Local / Apresentação' : '➕ Adicionar Novo Local de Apresentação'}</h4>
            {modalLocais.editandoId && (<button type="button" className="btn btn-fantasma btn-sm" onClick={() => setModalLocais(prev => ({ ...prev, editandoId: null, form: { nomeLocal: '', cidade: '', endereco: '', latitude: '', longitude: '', dataEstreia: '', dataFim: '', horario: '', status: 'PROGRAMADA' } }))}>Cancelar Edição</button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div className="campo-grupo" style={{ marginBottom: '12px' }}><label className="campo-label">Nome do Local / Teatro *</label><input className="campo-input" placeholder="Ex: Theatro Municipal de Niterói" value={modalLocais.form.nomeLocal} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, nomeLocal: e.target.value } }))} required /></div>
            <div className="campo-grupo" style={{ marginBottom: '12px' }}><label className="campo-label">Cidade / UF *</label><input className="campo-input" placeholder="Ex: Niterói, RJ ou Rio de Janeiro, RJ" value={modalLocais.form.cidade} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, cidade: e.target.value } }))} required /></div>
          </div>
          <div className="campo-grupo" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="campo-label" style={{ marginBottom: 0 }}>Endereço Completo *</label>
              <button type="button" className="btn btn-fantasma btn-sm" onClick={() => buscarCoordsLocal(modalLocais.form.endereco)} disabled={modalLocais.buscandoCoordsLocal || !modalLocais.form.endereco} style={{ fontSize: '11px', padding: '2px 8px' }}>{modalLocais.buscandoCoordsLocal ? '⏳ Buscando...' : '📍 Buscar Coordenadas'}</button>
            </div>
            <input className="campo-input" placeholder="Ex: Rua Quinze de Novembro, 35 — Centro, Niterói, RJ" value={modalLocais.form.endereco} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, endereco: e.target.value } }))} required />
            {modalLocais.statusCoordsLocal.msg && <div style={{ fontSize: 'var(--texto-xs)', marginTop: '4px', color: modalLocais.statusCoordsLocal.tipo === 'sucesso' ? 'var(--cor-sucesso)' : 'var(--cor-dourado)' }}>{modalLocais.statusCoordsLocal.msg}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="campo-grupo" style={{ marginBottom: 0 }}><label className="campo-label">Latitude (opcional)</label><input className="campo-input" type="number" step="any" placeholder="-22.8943" value={modalLocais.form.latitude} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, latitude: e.target.value } }))} /></div>
            <div className="campo-grupo" style={{ marginBottom: 0 }}><label className="campo-label">Longitude (opcional)</label><input className="campo-input" type="number" step="any" placeholder="-43.1228" value={modalLocais.form.longitude} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, longitude: e.target.value } }))} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div className="campo-grupo" style={{ marginBottom: 0 }}><label className="campo-label">Data de Estreia</label><input className="campo-input" type="date" value={modalLocais.form.dataEstreia} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, dataEstreia: e.target.value } }))} /></div>
            <div className="campo-grupo" style={{ marginBottom: 0 }}><label className="campo-label">Data de Encerramento</label><input className="campo-input" type="date" value={modalLocais.form.dataFim} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, dataFim: e.target.value } }))} /></div>
            <div className="campo-grupo" style={{ marginBottom: 0 }}><label className="campo-label">Status nesta Praça</label><select className="campo-select" value={modalLocais.form.status} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, status: e.target.value } }))}><option value="PROGRAMADA">Programada</option><option value="EM_CARTAZ">Em Cartaz</option><option value="ENCERRADA">Encerrada</option></select></div>
          </div>
          <div className="campo-grupo" style={{ marginBottom: '16px' }}><label className="campo-label">Horários / Sessões</label><input className="campo-input" placeholder="Ex: Sextas e Sábados às 20h, Domingos às 18h" value={modalLocais.form.horario} onChange={e => setModalLocais(prev => ({ ...prev, form: { ...prev.form, horario: e.target.value } }))} /></div>
          <button type="submit" className="btn btn-primario btn-sm" disabled={modalLocais.salvando}>{modalLocais.salvando ? 'Salvando local...' : modalLocais.editandoId ? 'Atualizar Local' : '+ Salvar Este Local'}</button>
        </form>

        <div>
          <h4 style={{ fontSize: 'var(--texto-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cor-texto-secundario)', marginBottom: '12px' }}>Praças / Locais Cadastrados ({modalLocais.locais.length})</h4>
          {modalLocais.carregando ? (<div className="carregando-container" style={{ padding: '24px 0' }}><div className="spinner" /><p>Carregando locais...</p></div>
          ) : modalLocais.locais.length === 0 ? (<div style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--cor-fundo-card)', borderRadius: 'var(--raio-lg)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-terciario)' }}><p>Nenhum local específico cadastrado ainda. Use o formulário acima para adicionar Rio de Janeiro, Niterói, São Paulo, etc.</p></div>
          ) : (<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
            {modalLocais.locais.map((local) => {
              const tag = getTag(local.status);
              return (<div key={local.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--cor-fundo-card)', borderRadius: 'var(--raio-md)', border: '1px solid var(--cor-borda)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><strong style={{ fontSize: 'var(--texto-base)' }}>{local.nomeLocal}</strong><span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-dourado)', fontWeight: 600 }}>({local.cidade})</span><span className={`tag ${tag.classe}`} style={{ fontSize: '10px', padding: '1px 6px' }}>{tag.texto}</span></div>
                  <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>📍 {local.endereco}</div>
                  <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', marginTop: '2px' }}>
                    {local.dataEstreia && `📅 De ${new Date(local.dataEstreia + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                    {local.dataFim && ` até ${new Date(local.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                    {local.horario && ` • ⏰ ${local.horario}`}
                  </div>
                </div>
                <div className="admin-acoes"><button className="admin-acao-btn" onClick={() => handleEditarLocal(local)} title="Editar local">✏️</button><button className="admin-acao-btn perigo" onClick={() => handleDeletarLocal(local.id)} title="Excluir local">🗑</button></div>
              </div>);
            })}
          </div>)}
        </div>
      </Modal>

      {/* Modal de Fotos e Vídeos */}
      <Modal aberto={modalMidias.aberto} onFechar={() => setModalMidias({ ...modalMidias, aberto: false })} titulo={`🖼️ Fotos e Vídeos: ${modalMidias.peca?.titulo || ''}`}
        rodape={<button className="btn btn-primario" onClick={() => setModalMidias({ ...modalMidias, aberto: false })}>Concluir</button>}
      >
        {modalMidias.erro && <div className="alerta alerta-erro">⚠ {modalMidias.erro}</div>}
        <div style={{ marginBottom: '24px' }}>
          <label className="upload-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="upload-area-icone">📤</div>
            <div style={{ fontWeight: 600, color: 'var(--cor-texto)', marginBottom: '4px' }}>{modalMidias.enviando ? 'Enviando arquivos...' : 'Clique para selecionar fotos e vídeos'}</div>
            <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>Formatos suportados: JPG, PNG, WebP, GIF, MP4, WebM (Max 50MB)</div>
            <input type="file" multiple accept="image/*,video/*" onChange={handleUploadFotos} disabled={modalMidias.enviando} style={{ display: 'none' }} />
          </label>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: 'var(--texto-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--cor-texto-secundario)', margin: 0 }}>Mídias Cadastradas ({modalMidias.fotos.length})</h4>
            <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>A 1ª foto é a <strong>Capa</strong> exibida no carrossel da Home</span>
          </div>
          {modalMidias.carregando ? (<div className="carregando-container" style={{ padding: '24px 0' }}><div className="spinner" /><p>Carregando mídias...</p></div>
          ) : modalMidias.fotos.length === 0 ? (<div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--cor-fundo-card)', borderRadius: 'var(--raio-lg)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-terciario)' }}><div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div><p>Nenhuma foto ou vídeo cadastrado ainda para esta peça.</p><p style={{ fontSize: 'var(--texto-xs)', marginTop: '4px' }}>Envie imagens para escolher a capa e montar a galeria do espetáculo.</p></div>
          ) : (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
            {modalMidias.fotos.map((foto, index) => (
              <div key={foto.id} style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--raio-lg)', overflow: 'hidden', border: index === 0 ? '2px solid var(--cor-dourado)' : '1px solid var(--cor-borda)', background: 'var(--cor-fundo-card)', boxShadow: index === 0 ? '0 0 12px rgba(212, 168, 67, 0.2)' : 'none', transition: 'all var(--transicao-rapida)' }}>
                <div style={{ position: 'relative', width: '100%', height: '120px', background: '#000' }}>
                  {foto.tipo === 'VIDEO' ? <video src={foto.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={foto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', top: '6px', left: '6px', background: index === 0 ? 'var(--cor-dourado)' : 'rgba(0, 0, 0, 0.75)', color: index === 0 ? 'var(--cor-texto-inverso)' : 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--raio-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>{index === 0 ? '⭐ CAPA (1º)' : `${index + 1}º`}</div>
                  <button type="button" onClick={() => handleDeletarFoto(foto.id)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0, 0, 0, 0.75)', color: 'var(--cor-erro)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }} title="Excluir mídia">🗑️</button>
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--cor-fundo-elevado)', borderTop: '1px solid var(--cor-borda)' }}>
                  {index !== 0 ? (<button type="button" className="btn btn-dourado btn-sm" onClick={() => handleDefinirCapa(foto.id)} style={{ fontSize: '11px', padding: '4px 6px', width: '100%', justifyContent: 'center' }}>⭐ Tornar Capa</button>) : (<div style={{ fontSize: '11px', color: 'var(--cor-dourado)', fontWeight: 600, textAlign: 'center', padding: '4px 0' }}>✓ Capa Atual do Banner</div>)}
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'space-between' }}>
                    <button type="button" className="btn btn-fantasma btn-sm" onClick={() => handleMoverFoto(index, -1)} disabled={index === 0} style={{ fontSize: '12px', padding: '3px 8px', flex: 1, justifyContent: 'center', opacity: index === 0 ? 0.3 : 1 }} title="Mover para antes">◀ Mover</button>
                    <button type="button" className="btn btn-fantasma btn-sm" onClick={() => handleMoverFoto(index, 1)} disabled={index === modalMidias.fotos.length - 1} style={{ fontSize: '12px', padding: '3px 8px', flex: 1, justifyContent: 'center', opacity: index === modalMidias.fotos.length - 1 ? 0.3 : 1 }} title="Mover para depois">Mover ▶</button>
                  </div>
                </div>
              </div>
            ))}
          </div>)}
        </div>
      </Modal>
    </div>
  );
}
