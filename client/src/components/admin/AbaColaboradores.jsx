// =============================================================================
// Aba de Colaboradores — CRUD de colaboradores (Painel Admin)
// Single Responsibility: gerenciamento completo com campos estendidos (Ata #02)
// =============================================================================

import { useState } from 'react';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';
import { colaboradoresAPI, getMediaUrl } from '../../services/api';

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

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
  const [secaoModal, setSecaoModal] = useState('BASICO'); // BASICO | CONTATO | DOCUMENTOS | CENICO | HISTORICO
  const [formColab, setFormColab] = useState({
    nome: '',
    nomeArtistico: '',
    funcao: '',
    idade: '',
    dataNascimento: '',
    dataAdmissao: '',
    genero: '',
    orientacaoSexual: '',
    etniaRaca: '',
    celular: '',
    email: '',
    redeSocial: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'RJ',
    cep: '',
    cpf: '',
    rg: '',
    drtOmb: '',
    habilitacao: '',
    mei: '',
    nit: '',
    tipoSanguineo: '',
    peso: '',
    altura: '',
    manequim: '',
    sapato: '',
    saude: '',
    pagamentos: '',
    historico: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState({ aberto: false, colabId: null });

  function abrirEditar(colab) {
    setFormColab({
      nome: colab.nome || '',
      nomeArtistico: colab.nomeArtistico || '',
      funcao: colab.funcao || '',
      idade: colab.idade ? colab.idade.toString() : '',
      dataNascimento: colab.dataNascimento || '',
      dataAdmissao: colab.dataAdmissao || '',
      genero: colab.genero || '',
      orientacaoSexual: colab.orientacaoSexual || '',
      etniaRaca: colab.etniaRaca || '',
      celular: colab.celular || '',
      email: colab.email || '',
      redeSocial: colab.redeSocial || '',
      endereco: colab.endereco || '',
      bairro: colab.bairro || '',
      cidade: colab.cidade || '',
      estado: colab.estado || 'RJ',
      cep: colab.cep || '',
      cpf: colab.cpf || '',
      rg: colab.rg || '',
      drtOmb: colab.drtOmb || '',
      habilitacao: colab.habilitacao || '',
      mei: colab.mei || '',
      nit: colab.nit || '',
      tipoSanguineo: colab.tipoSanguineo || '',
      peso: colab.peso || '',
      altura: colab.altura || '',
      manequim: colab.manequim || '',
      sapato: colab.sapato || '',
      saude: colab.saude || '',
      pagamentos: colab.pagamentos || '',
      historico: colab.historico || '',
    });
    setSecaoModal('BASICO');
    setErro('');
    setModalColab({ aberto: true, colab });
  }

  async function salvarColab(e) {
    e.preventDefault();
    try {
      setSalvando(true);
      const formData = new FormData();
      Object.entries(formColab).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });
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
        c.nomeArtistico?.toLowerCase().includes(termo) ||
        c.email?.toLowerCase().includes(termo) ||
        c.funcao?.toLowerCase().includes(termo) ||
        c.cidade?.toLowerCase().includes(termo)
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
          placeholder="🔍 Buscar por nome, email, função ou cidade..."
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
              <th>Colaborador</th>
              <th>Função</th>
              <th>Contato</th>
              <th>Cidade/UF</th>
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
                    <div>
                      <div style={{ fontWeight: 600 }}>{colab.nome}</div>
                      {colab.nomeArtistico && colab.nomeArtistico !== colab.nome && (
                        <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>
                          &quot;{colab.nomeArtistico}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{colab.funcao}</td>
                <td style={{ fontSize: 'var(--texto-xs)' }}>
                  <div>{colab.email || '—'}</div>
                  {colab.celular && <div style={{ color: 'var(--cor-texto-terciario)' }}>{colab.celular}</div>}
                </td>
                <td style={{ fontSize: 'var(--texto-xs)' }}>
                  {colab.cidade ? `${colab.cidade}${colab.estado ? `/${colab.estado}` : ''}` : '—'}
                </td>
                <td>{colab.genero || '—'}</td>
                <td>{colab.pecas?.length || 0}</td>
                <td>
                  <div className="admin-acoes">
                    <button className="admin-acao-btn" onClick={() => abrirEditar(colab)} title="Editar Ficha Completa">
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

      {/* Modal Ficha Completa do Colaborador */}
      <Modal
        aberto={modalColab.aberto}
        onFechar={() => setModalColab({ aberto: false, colab: null })}
        titulo={`✏️ Ficha Cadastral: ${formColab.nome || 'Colaborador'}`}
        rodape={
          <>
            <button className="btn btn-fantasma" onClick={() => setModalColab({ aberto: false, colab: null })}>
              Cancelar
            </button>
            <button className="btn btn-primario" onClick={salvarColab} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </>
        }
      >
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

        {/* Sub-abas de organização do formulário */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--cor-borda)', paddingBottom: '12px', marginBottom: '16px', overflowX: 'auto' }}>
          <button
            type="button"
            className={`btn btn-sm ${secaoModal === 'BASICO' ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => setSecaoModal('BASICO')}
          >
            👤 Identificação
          </button>
          <button
            type="button"
            className={`btn btn-sm ${secaoModal === 'CONTATO' ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => setSecaoModal('CONTATO')}
          >
            📍 Contato & Endereço
          </button>
          <button
            type="button"
            className={`btn btn-sm ${secaoModal === 'DOCUMENTOS' ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => setSecaoModal('DOCUMENTOS')}
          >
            🔒 Documentos (Sensíveis)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${secaoModal === 'CENICO' ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => setSecaoModal('CENICO')}
          >
            🎭 Cênico & Saúde
          </button>
          <button
            type="button"
            className={`btn btn-sm ${secaoModal === 'HISTORICO' ? 'btn-primario' : 'btn-fantasma'}`}
            onClick={() => setSecaoModal('HISTORICO')}
          >
            💼 Histórico & Pagamentos
          </button>
        </div>

        {/* 1. SEÇÃO BÁSICA */}
        {secaoModal === 'BASICO' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="campo-grupo">
              <label className="campo-label">Nome Completo *</label>
              <input
                className="campo-input"
                value={formColab.nome}
                onChange={e => setFormColab({ ...formColab, nome: e.target.value })}
                required
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Nome Artístico</label>
              <input
                className="campo-input"
                value={formColab.nomeArtistico}
                onChange={e => setFormColab({ ...formColab, nomeArtistico: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Função Principal *</label>
              <input
                className="campo-input"
                value={formColab.funcao}
                onChange={e => setFormColab({ ...formColab, funcao: e.target.value })}
                required
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
              <label className="campo-label">Data de Nascimento</label>
              <input
                className="campo-input"
                placeholder="DD/MM/AAAA"
                value={formColab.dataNascimento}
                onChange={e => setFormColab({ ...formColab, dataNascimento: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Data de Admissão na Companhia</label>
              <input
                className="campo-input"
                placeholder="DD/MM/AAAA"
                value={formColab.dataAdmissao}
                onChange={e => setFormColab({ ...formColab, dataAdmissao: e.target.value })}
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
                <option value="Cisgênero">Cisgênero</option>
                <option value="Transgênero">Transgênero</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Etnia / Raça</label>
              <input
                className="campo-input"
                placeholder="Ex: Branco, Preto, Pardo, Indígena"
                value={formColab.etniaRaca}
                onChange={e => setFormColab({ ...formColab, etniaRaca: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ gridColumn: 'span 2' }}>
              <label className="campo-label">Orientação Sexual</label>
              <input
                className="campo-input"
                placeholder="Ex: Heterossexual, Homossexual, Bissexual, etc."
                value={formColab.orientacaoSexual}
                onChange={e => setFormColab({ ...formColab, orientacaoSexual: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* 2. CONTATO E ENDEREÇO */}
        {secaoModal === 'CONTATO' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="campo-grupo">
              <label className="campo-label">Celular / WhatsApp *</label>
              <input
                className="campo-input"
                placeholder="(21) 99999-9999"
                value={formColab.celular}
                onChange={e => setFormColab({ ...formColab, celular: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Email *</label>
              <input
                className="campo-input"
                type="email"
                placeholder="colaborador@email.com"
                value={formColab.email}
                onChange={e => setFormColab({ ...formColab, email: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ gridColumn: 'span 2' }}>
              <label className="campo-label">Rede Social / Instagram</label>
              <input
                className="campo-input"
                placeholder="@usuario"
                value={formColab.redeSocial}
                onChange={e => setFormColab({ ...formColab, redeSocial: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ gridColumn: 'span 2' }}>
              <label className="campo-label">Endereço (Logradouro e número)</label>
              <input
                className="campo-input"
                value={formColab.endereco}
                onChange={e => setFormColab({ ...formColab, endereco: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Bairro</label>
              <input
                className="campo-input"
                value={formColab.bairro}
                onChange={e => setFormColab({ ...formColab, bairro: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Cidade</label>
              <input
                className="campo-input"
                value={formColab.cidade}
                onChange={e => setFormColab({ ...formColab, cidade: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Estado</label>
              <select
                className="campo-select"
                value={formColab.estado}
                onChange={e => setFormColab({ ...formColab, estado: e.target.value })}
              >
                {ESTADOS_BR.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="campo-grupo">
              <label className="campo-label">CEP</label>
              <input
                className="campo-input"
                placeholder="00000-000"
                value={formColab.cep}
                onChange={e => setFormColab({ ...formColab, cep: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* 3. DOCUMENTOS E DADOS SENSÍVEIS (LGPD) */}
        {secaoModal === 'DOCUMENTOS' && (
          <div>
            <div className="alerta alerta-info" style={{ marginBottom: '16px', fontSize: 'var(--texto-xs)' }}>
              🔒 <strong>Proteção LGPD:</strong> Estes dados são confidenciais e visíveis exclusivamente para administradores autenticados. Jamais são expostos nas APIs públicas.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="campo-grupo">
                <label className="campo-label">CPF</label>
                <input
                  className="campo-input"
                  placeholder="000.000.000-00"
                  value={formColab.cpf}
                  onChange={e => setFormColab({ ...formColab, cpf: e.target.value })}
                />
              </div>
              <div className="campo-grupo">
                <label className="campo-label">RG</label>
                <input
                  className="campo-input"
                  placeholder="00.000.000-0"
                  value={formColab.rg}
                  onChange={e => setFormColab({ ...formColab, rg: e.target.value })}
                />
              </div>
              <div className="campo-grupo">
                <label className="campo-label">DRT / OMB (Registro Profissional)</label>
                <input
                  className="campo-input"
                  placeholder="Número de registro"
                  value={formColab.drtOmb}
                  onChange={e => setFormColab({ ...formColab, drtOmb: e.target.value })}
                />
              </div>
              <div className="campo-grupo">
                <label className="campo-label">Habilitação (CNH)</label>
                <input
                  className="campo-input"
                  placeholder="Ex: Carro (B), Moto (A), Não possui"
                  value={formColab.habilitacao}
                  onChange={e => setFormColab({ ...formColab, habilitacao: e.target.value })}
                />
              </div>
              <div className="campo-grupo">
                <label className="campo-label">MEI / CNPJ</label>
                <input
                  className="campo-input"
                  placeholder="00.000.000/0001-00"
                  value={formColab.mei}
                  onChange={e => setFormColab({ ...formColab, mei: e.target.value })}
                />
              </div>
              <div className="campo-grupo">
                <label className="campo-label">NIT / PIS / PASEP</label>
                <input
                  className="campo-input"
                  placeholder="Número de inscrição"
                  value={formColab.nit}
                  onChange={e => setFormColab({ ...formColab, nit: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. CÊNICO E SAÚDE */}
        {secaoModal === 'CENICO' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="campo-grupo">
              <label className="campo-label">Tipo Sanguíneo</label>
              <input
                className="campo-input"
                placeholder="Ex: O+, A+, AB-"
                value={formColab.tipoSanguineo}
                onChange={e => setFormColab({ ...formColab, tipoSanguineo: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Peso (kg)</label>
              <input
                className="campo-input"
                placeholder="Ex: 70 kg"
                value={formColab.peso}
                onChange={e => setFormColab({ ...formColab, peso: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Altura (m)</label>
              <input
                className="campo-input"
                placeholder="Ex: 1,75 m"
                value={formColab.altura}
                onChange={e => setFormColab({ ...formColab, altura: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Manequim (Figurino)</label>
              <input
                className="campo-input"
                placeholder="Ex: 38, 40, M"
                value={formColab.manequim}
                onChange={e => setFormColab({ ...formColab, manequim: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Sapato / Calçado</label>
              <input
                className="campo-input"
                placeholder="Ex: 40, 41"
                value={formColab.sapato}
                onChange={e => setFormColab({ ...formColab, sapato: e.target.value })}
              />
            </div>
            <div className="campo-grupo" style={{ gridColumn: 'span 3' }}>
              <label className="campo-label">Condições de Saúde, Alergias ou Restrições Físicas</label>
              <textarea
                className="campo-textarea"
                rows="3"
                placeholder="Ex: Alergia a medicamentos ou poeira, restrições articulares, alimentação especial..."
                value={formColab.saude}
                onChange={e => setFormColab({ ...formColab, saude: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* 5. HISTÓRICO E FINANCEIRO */}
        {secaoModal === 'HISTORICO' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="campo-grupo">
              <label className="campo-label">Histórico de Atuações & Biografia Breve</label>
              <textarea
                className="campo-textarea"
                rows="4"
                placeholder="Principais trabalhos, peças anteriores, formação em artes cênicas..."
                value={formColab.historico}
                onChange={e => setFormColab({ ...formColab, historico: e.target.value })}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Histórico de Pagamentos & Cachês (Acesso Restrito)</label>
              <textarea
                className="campo-textarea"
                rows="3"
                placeholder="Notas fiscais emitidas, diárias, histórico de cachês..."
                value={formColab.pagamentos}
                onChange={e => setFormColab({ ...formColab, pagamentos: e.target.value })}
              />
            </div>
          </div>
        )}
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
