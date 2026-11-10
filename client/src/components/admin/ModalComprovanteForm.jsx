// =============================================================================
// Theatrum — Modal de Cadastro e Edição de Comprovante de Despesa
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

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
  const [erro, setErro] = useState('');

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
    }
    setErro('');
  }, [comprovanteParaEditar, aberto]);

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

      if (form.pecaId) formData.append('pecaId', form.pecaId);
      if (form.colaboradorId) formData.append('colaboradorId', form.colaboradorId);
      if (arquivo) formData.append('arquivo', arquivo);

      await onSalvar(formData, comprovanteParaEditar?.id);
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar comprovante.');
    } finally {
      setSalvando(false);
    }
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="campo-grupo">
          <label htmlFor="comp-titulo" className="campo-label">Título do Comprovante *</label>
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
            <label htmlFor="comp-valor" className="campo-label">Valor (R$) *</label>
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
            <label htmlFor="comp-data" className="campo-label">Data da Despesa *</label>
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
          <label htmlFor="comp-categoria" className="campo-label">Categoria de Despesa *</label>
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

        <div className="campo-grupo">
          <label htmlFor="comp-arquivo" className="campo-label">
            {comprovanteParaEditar ? 'Substituir Arquivo Anexo (Opcional)' : 'Arquivo do Comprovante (PDF ou Imagem) *'}
          </label>
          <input
            id="comp-arquivo"
            type="file"
            className="campo-input"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setArquivo(e.target.files[0] || null)}
          />
          <small style={{ color: 'var(--cor-texto-terciario)', fontSize: 'var(--texto-xs)', marginTop: '4px' }}>
            Formatos aceitos: PDF, JPG, PNG e WebP (até 10 MB).
          </small>
          {comprovanteParaEditar?.arquivoNome && !arquivo && (
            <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-primaria)', marginTop: '4px' }}>
              📄 Arquivo atual: <strong>{comprovanteParaEditar.arquivoNome}</strong>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
