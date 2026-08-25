// =============================================================================
// Aba de Colaboradores — CRUD de colaboradores (Painel Admin)
// Single Responsibility: apenas gerenciamento de colaboradores
// =============================================================================

import { useState } from 'react';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { colaboradoresAPI, getMediaUrl } from '../../services/api';

export default function AbaColaboradores({
  colaboradores,
  busca,
  setBusca,
  filtroFuncao,
  setFiltroFuncao,
  onRecarregar,
  modalColab,
  setModalColab,
}) {
  const [formColab, setFormColab] = useState({
    nome: '',
    funcao: '',
    idade: '',
    celular: '',
    email: '',
    endereco: '',
    genero: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, colabId: null });

  function abrirEditar(colab) {
    setFormColab({
      nome: colab.nome || '',
      funcao: colab.funcao || '',
      idade: colab.idade ? colab.idade.toString() : '',
      celular: colab.celular || '',
      email: colab.email || '',
      endereco: colab.endereco || '',
      genero: colab.genero || '',
    });
    setErro('');
    setModalColab({ aberto: true, colab });
  }

  async function salvarColab(e) {
    e.preventDefault();
    try {
      setSalvando(true);
      const formData = new FormData();
      Object.entries(formColab).forEach(([k, v]) => formData.append(k, v));
      await colaboradoresAPI.atualizar(modalColab.colab.id, formData);
      setModalColab({ aberto: false, colab: null });
      onRecarregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar colaborador');
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletarColabConfirmado() {
    if (!confirmacaoExcluir.colabId) return;
    try {
      await colaboradoresAPI.deletar(confirmacaoExcluir.colabId);
      onRecarregar();
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao deletar colaborador');
    }
  }

  const funcoesUnicas = [...new Set(colaboradores.map(c => c.funcao))].filter(Boolean).sort();

  const colabsFiltrados = colaboradores.filter(c => {
    if (filtroFuncao && c.funcao !== filtroFuncao) return false;
    if (busca) {
      const termo = busca.toLowerCase();
      return (
        c.nome?.toLowerCase().includes(termo) ||
        c.email?.toLowerCase().includes(termo) ||
        c.funcao?.toLowerCase().includes(termo)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="admin-toolbar">
        <input
          type="text"
          className="campo-input"
          placeholder="🔍 Buscar colaborador..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select
          className="campo-select"
          value={filtroFuncao}
          onChange={e => setFiltroFuncao(e.target.value)}
          style={{ maxWidth: '200px' }}
        >
          <option value="">Todas as funções</option>
          {funcoesUnicas.map(f => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Gênero</th>
              <th>Peças</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colabsFiltrados.map(colab => (
              <tr key={colab.id}>
                <td>
                  <div className="flex items-center gap-2">
                    {colab.fotoUrl ? (
                      <img
                        src={getMediaUrl(colab.fotoUrl)}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--cor-primaria)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {colab.nome
                          ?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                    )}
                    <span style={{ fontWeight: 500 }}>{colab.nome}</span>
                  </div>
                </td>
                <td>{colab.funcao}</td>
                <td style={{ fontSize: 'var(--texto-xs)' }}>{colab.email || '—'}</td>
                <td style={{ fontSize: 'var(--texto-xs)' }}>{colab.celular || '—'}</td>
                <td>{colab.genero}</td>
                <td>{colab.pecas?.length || 0}</td>
                <td>
                  <div className="admin-acoes">
                    <button className="admin-acao-btn" onClick={() => abrirEditar(colab)} title="Editar">
                      ✏️
                    </button>
                    <button
                      className="admin-acao-btn perigo"
                      onClick={() => setConfirmacaoExcluir({ aberto: true, colabId: colab.id })}
                      title="Deletar"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {colabsFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', padding: '32px', color: 'var(--cor-texto-terciario)' }}
                >
                  Nenhum colaborador encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        aberto={modalColab.aberto}
        onFechar={() => setModalColab({ aberto: false, colab: null })}
        titulo="✏️ Editar Colaborador"
        rodape={
          <>
            <button className="btn btn-fantasma" onClick={() => setModalColab({ aberto: false, colab: null })}>
              Cancelar
            </button>
            <button className="btn btn-primario" onClick={salvarColab} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="campo-grupo">
            <label className="campo-label">Nome</label>
            <input
              className="campo-input"
              value={formColab.nome}
              onChange={e => setFormColab({ ...formColab, nome: e.target.value })}
            />
          </div>
          <div className="campo-grupo">
            <label className="campo-label">Função</label>
            <input
              className="campo-input"
              value={formColab.funcao}
              onChange={e => setFormColab({ ...formColab, funcao: e.target.value })}
            />
          </div>
          <div className="campo-grupo">
            <label className="campo-label">Idade</label>
            <input
              className="campo-input"
              type="number"
              value={formColab.idade}
              onChange={e => setFormColab({ ...formColab, idade: e.target.value })}
            />
          </div>
          <div className="campo-grupo">
            <label className="campo-label">Gênero</label>
            <select
              className="campo-select"
              value={formColab.genero}
              onChange={e => setFormColab({ ...formColab, genero: e.target.value })}
            >
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Não-binário">Não-binário</option>
              <option value="Prefiro não dizer">Prefiro não dizer</option>
            </select>
          </div>
          <div className="campo-grupo">
            <label className="campo-label">Celular</label>
            <input
              className="campo-input"
              value={formColab.celular}
              onChange={e => setFormColab({ ...formColab, celular: e.target.value })}
            />
          </div>
          <div className="campo-grupo">
            <label className="campo-label">Email</label>
            <input
              className="campo-input"
              value={formColab.email}
              onChange={e => setFormColab({ ...formColab, email: e.target.value })}
            />
          </div>
        </div>
        <div className="campo-grupo">
          <label className="campo-label">Endereço</label>
          <input
            className="campo-input"
            value={formColab.endereco}
            onChange={e => setFormColab({ ...formColab, endereco: e.target.value })}
          />
        </div>
      </Modal>

      <ConfirmModal
        aberto={confirmacaoExcluir.aberto}
        onFechar={() => setConfirmacaoExcluir({ aberto: false, colabId: null })}
        onConfirmar={handleDeletarColabConfirmado}
        titulo="Excluir Colaborador"
        mensagem="Tem certeza que deseja excluir permanentemente este colaborador?"
        textoConfirmar="Sim, Excluir"
      />
    </div>
  );
}
