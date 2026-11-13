// =============================================================================
// Theatrum — Modal de Cadastro e Edição de Comprovante de Despesa
// Com Extração Assistida por IA (Human-in-the-Loop) & Upload no Topo
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { comprovantesAPI } from '../../services/api';

export const CATEGORIAS_COMPROVANTE = [
  { valor: 'TRANSPORTE', label: 'Transporte (Van, Combustível, Passagens)' },
  { valor: 'ALIMENTACAO', label: 'Alimentação & Diárias de Ensaio' },
  { valor: 'CACHE', label: 'Cachês Artísticos e Equipe Técnica' },
  { valor: 'CENOGRAFIA_FIGURINO', label: 'Cenografia, Adereços e Figurinos' },
  { valor: 'DIVULGACAO', label: 'Divulgação, Impressões e Mídia' },
  { valor: 'INFRAESTRUTURA', label: 'Locação de Equipamentos e Palco' },
  { valor: 'OUTROS', label: 'Outras Despesas de Produção' },
];

export default function ModalComprovanteForm({
  aberto,
  onFechar,
  comprovanteParaEditar,
  onSalvar,
  pecas = [],
  colaboradores = [],
}) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    dataComprovante: new Date().toISOString().split('T')[0],
    categoria: 'TRANSPORTE',
    pecaId: '',
    colaboradorId: '',
  });

  const [arquivo, setArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [extraindoIA, setExtraindoIA] = useState(false);
  const [infoIA, setInfoIA] = useState(null);
  const [erro, setErro] = useState('');
  const [avisoIA, setAvisoIA] = useState('');

  useEffect(() => {
    if (comprovanteParaEditar) {
      setForm({
        titulo: comprovanteParaEditar.titulo || '',
        descricao: comprovanteParaEditar.descricao || '',
        valor: comprovanteParaEditar.valor ? String(comprovanteParaEditar.valor) : '',
        dataComprovante: comprovanteParaEditar.dataComprovante || new Date().toISOString().split('T')[0],
        categoria: comprovanteParaEditar.categoria || 'OUTROS',
        pecaId: comprovanteParaEditar.pecaId ? String(comprovanteParaEditar.pecaId) : '',
        colaboradorId: comprovanteParaEditar.colaboradorId ? String(comprovanteParaEditar.colaboradorId) : '',
      });
      setArquivo(null);
      setInfoIA(comprovanteParaEditar.extraidoPorIA ? { confianca: {}, dados: {} } : null);
    } else {
      setForm({
        titulo: '',
        descricao: '',
        valor: '',
        dataComprovante: new Date().toISOString().split('T')[0],
        categoria: 'TRANSPORTE',
        pecaId: '',
        colaboradorId: '',
      });
      setArquivo(null);
      setInfoIA(null);
    }
    setErro('');
    setAvisoIA('');
  }, [comprovanteParaEditar, aberto]);

  async function handleArquivoSelecionado(file) {
    if (!file) {
      setArquivo(null);
      return;
    }

    setArquivo(file);
    setErro('');
    setAvisoIA('');

    // Dispara extração assistida por IA
    try {
      setExtraindoIA(true);
      const formData = new FormData();
      formData.append('arquivo', file);

      const res = await comprovantesAPI.extrairDados(formData);
      if (res.data?.sucesso && res.data?.dados) {
        const extraido = res.data.dados;
        setForm((prev) => ({
          ...prev,
          titulo: extraido.titulo || prev.titulo,
          descricao: extraido.descricao || prev.descricao,
          valor: extraido.valor ? String(extraido.valor) : prev.valor,
          dataComprovante: extraido.dataComprovante || prev.dataComprovante,
          categoria: extraido.categoria || prev.categoria,
        }));
        setInfoIA({
          confianca: res.data.confianca || {},
          alertas: res.data.alertas || [],
        });
      } else {
        setAvisoIA(
          res.data?.mensagem ||
            'Não foi possível extrair os dados automaticamente. Prossiga com o preenchimento manual.'
        );
      }
    } catch {
      setAvisoIA(
        'Não foi possível extrair os dados automaticamente devido a lentidão ou falha na IA. Prossiga com o preenchimento manual.'
      );
    } finally {
      setExtraindoIA(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!form.titulo.trim()) {
      setErro('Informe o título do comprovante.');
      return;
    }

    const valorNum = parseFloat(form.valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setErro('Informe um valor válido maior que zero.');
      return;
    }

    if (!form.dataComprovante) {
      setErro('Informe a data da despesa.');
      return;
    }

    if (!comprovanteParaEditar && !arquivo) {
      setErro('É obrigatório anexar o arquivo do comprovante (PDF ou Imagem).');
      return;
    }

    try {
      setSalvando(true);
      const formData = new FormData();
      formData.append('titulo', form.titulo.trim());
      formData.append('descricao', form.descricao.trim());
      formData.append('valor', String(valorNum));
      formData.append('dataComprovante', form.dataComprovante);
      formData.append('categoria', form.categoria);
      formData.append('pecaId', form.pecaId || '');
      formData.append('colaboradorId', form.colaboradorId || '');
      formData.append('extraidoPorIA', infoIA ? 'true' : 'false');
      if (arquivo) formData.append('arquivo', arquivo);

      await onSalvar(formData, comprovanteParaEditar?.id);
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar comprovante.');
    } finally {
      setSalvando(false);
    }
  }

  function renderBadgeConfianca(campo) {
    if (!infoIA || !infoIA.confianca || infoIA.confianca[campo] === undefined) return null;
    const score = infoIA.confianca[campo];
    if (score < 0.85) {
      return (
        <span
          className="badge"
          style={{
            fontSize: '10px',
            background: 'rgba(234, 179, 8, 0.2)',
            color: '#eab308',
            marginLeft: '8px',
          }}
        >
          ⚠️ Revisão sugerida ({Math.round(score * 100)}%)
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{
          fontSize: '10px',
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
          marginLeft: '8px',
        }}
      >
        ✓ IA ({Math.round(score * 100)}%)
      </span>
    );
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={comprovanteParaEditar ? '✏️ Editar Comprovante' : '🧾 Cadastrar Comprovante de Despesa'}
      rodape={
        <>
          <button type="button" className="btn btn-fantasma" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primario" onClick={handleSubmit} disabled={salvando}>
            {salvando ? 'Salvando...' : comprovanteParaEditar ? 'Salvar Alterações' : 'Cadastrar Comprovante'}
          </button>
        </>
      }
    >
      {erro && (
        <div className="alerta alerta-erro" style={{ marginBottom: '16px' }}>
          ⚠ {erro}
        </div>
      )}

      {avisoIA && (
        <div
          className="alerta"
          style={{
            marginBottom: '16px',
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid #eab308',
            color: 'var(--cor-texto-primario)',
          }}
        >
          ℹ️ {avisoIA}
        </div>
      )}

      {infoIA && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--raio-md)',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--texto-xs)',
          }}
        >
          <span>✨ <strong>Extração assistida por IA:</strong> Os dados foram sugeridos automaticamente. Por favor, revise antes de salvar.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 1º PASSO: UPLOAD DO COMPROVANTE (NO TOPO) */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--raio-md)',
            background: 'var(--cor-superficie-elevada)',
            border: extraindoIA ? '2px dashed var(--cor-primaria)' : '1px dashed var(--cor-borda)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="comp-arquivo" className="campo-label" style={{ fontWeight: 600, marginBottom: 0 }}>
              📁 1º Passo: Anexe o Comprovante (PDF ou Imagem) *
            </label>
            {extraindoIA && (
              <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-primaria)', fontWeight: 500 }}>
                ⏳ Analisando comprovante com IA...
              </span>
            )}
          </div>

          <input
            id="comp-arquivo"
            type="file"
            className="campo-input"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => handleArquivoSelecionado(e.target.files[0] || null)}
            disabled={extraindoIA}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
            <span>Formatos: PDF, JPG, PNG e WebP (até 10 MB).</span>
            {arquivo && (
              <span style={{ color: 'var(--cor-primaria)' }}>
                📎 {arquivo.name}
              </span>
            )}
          </div>

          {comprovanteParaEditar?.arquivoNome && !arquivo && (
            <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-primaria)', marginTop: '4px' }}>
              📄 Arquivo atual: <strong>{comprovanteParaEditar.arquivoNome}</strong>
            </div>
          )}
        </div>

        {/* 2º PASSO: CAMPOS FORMULÁRIO SUJEITOS A REVISÃO */}
        <div className="campo-grupo">
          <label htmlFor="comp-titulo" className="campo-label">
            Título do Comprovante * {renderBadgeConfianca('titulo')}
          </label>
          <input
            id="comp-titulo"
            className="campo-input"
            placeholder="Ex: Recibo de Van — Circulação Niterói"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="campo-grupo">
            <label htmlFor="comp-valor" className="campo-label">
              Valor (R$) * {renderBadgeConfianca('valor')}
            </label>
            <input
              id="comp-valor"
              type="number"
              step="0.01"
              min="0.01"
              className="campo-input"
              placeholder="0,00"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
          </div>

          <div className="campo-grupo">
            <label htmlFor="comp-data" className="campo-label">
              Data da Despesa * {renderBadgeConfianca('dataComprovante')}
            </label>
            <input
              id="comp-data"
              type="date"
              className="campo-input"
              value={form.dataComprovante}
              onChange={(e) => setForm({ ...form, dataComprovante: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="campo-grupo">
          <label htmlFor="comp-categoria" className="campo-label">
            Categoria de Despesa * {renderBadgeConfianca('categoria')}
          </label>
          <select
            id="comp-categoria"
            className="campo-select"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {CATEGORIAS_COMPROVANTE.map((cat) => (
              <option key={cat.valor} value={cat.valor}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="campo-grupo">
            <label htmlFor="comp-peca" className="campo-label">Espetáculo Relacionado</label>
            <select
              id="comp-peca"
              className="campo-select"
              value={form.pecaId}
              onChange={(e) => setForm({ ...form, pecaId: e.target.value })}
            >
              <option value="">Despesa Geral da Companhia</option>
              {pecas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-grupo">
            <label htmlFor="comp-colab" className="campo-label">Colaborador Relacionado</label>
            <select
              id="comp-colab"
              className="campo-select"
              value={form.colaboradorId}
              onChange={(e) => setForm({ ...form, colaboradorId: e.target.value })}
            >
              <option value="">Nenhum colaborador específico</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.funcao ? `(${c.funcao})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="campo-grupo">
          <label htmlFor="comp-desc" className="campo-label">Descrição / Observações</label>
          <textarea
            id="comp-desc"
            className="campo-textarea"
            rows="3"
            placeholder="Detalhes adicionais, fornecedor, número da nota fiscal ou diárias..."
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
