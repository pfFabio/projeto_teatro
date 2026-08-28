// =============================================================================
// Theatrum — Modal de Criação e Edição de Propagandas / Anúncios
// Permite editar todos os textos, links, status e enviar fotos
// =============================================================================

import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { propagandasAPI } from '../../services/api';

export default function ModalPropagandaForm({
  aberto,
  propaganda,
  onFechar,
  onSalvo,
  onAbrirFotos,
}) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    link: '',
    textoBotao: 'Saiba Mais',
    ativo: true,
    ordem: 0,
  });
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (propaganda) {
      setForm({
        titulo: propaganda.titulo || '',
        descricao: propaganda.descricao || '',
        link: propaganda.link || '',
        textoBotao: propaganda.textoBotao || 'Saiba Mais',
        ativo: propaganda.ativo !== undefined ? propaganda.ativo : true,
        ordem: propaganda.ordem || 0,
      });
    } else {
      setForm({
        titulo: '',
        descricao: '',
        link: '',
        textoBotao: 'Saiba Mais',
        ativo: true,
        ordem: 0,
      });
    }
    setArquivosSelecionados([]);
    setErro('');
  }, [propaganda, aberto]);

  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setArquivosSelecionados(Array.from(e.target.files));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setErro('O título da propaganda é obrigatório.');
      return;
    }
    if (!form.descricao.trim()) {
      setErro('A descrição/texto da propaganda é obrigatória.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      let propagandaSalva;

      if (propaganda) {
        // Atualização de textos e status
        const res = await propagandasAPI.atualizar(propaganda.id, form);
        propagandaSalva = res.data;
      } else {
        // Criação (com ou sem fotos)
        if (arquivosSelecionados.length > 0) {
          const formData = new FormData();
          formData.append('titulo', form.titulo);
          formData.append('descricao', form.descricao);
          if (form.link) formData.append('link', form.link);
          formData.append('textoBotao', form.textoBotao || 'Saiba Mais');
          formData.append('ativo', form.ativo);
          formData.append('ordem', form.ordem);

          for (let i = 0; i < arquivosSelecionados.length; i++) {
            formData.append('fotos', arquivosSelecionados[i]);
          }

          const res = await propagandasAPI.criar(formData);
          propagandaSalva = res.data;
        } else {
          const res = await propagandasAPI.criar(form);
          propagandaSalva = res.data;
        }
      }

      onSalvo(propagandaSalva);
      onFechar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao salvar propaganda');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={propaganda ? `📢 Editar Propaganda: ${propaganda.titulo}` : '📢 Nova Publicação de Propaganda'}
      largura="650px"
    >
      <form onSubmit={handleSubmit} className="admin-form">
        {erro && <div className="alerta alerta-erro">⚠ {erro}</div>}

        <div className="campo-grupo">
          <label className="campo-label" htmlFor="propaganda-titulo">
            Título da Propaganda <span className="campo-obrigatorio">*</span>
          </label>
          <input
            id="propaganda-titulo"
            type="text"
            className="campo-input"
            placeholder="Ex: Matrículas Abertas para Aulas de Teatro"
            value={form.titulo}
            maxLength={150}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
          <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)', textAlign: 'right' }}>
            {form.titulo.length}/150
          </span>
        </div>

        <div className="campo-grupo">
          <label className="campo-label" htmlFor="propaganda-descricao">
            Texto / Descrição da Propaganda <span className="campo-obrigatorio">*</span>
          </label>
          <textarea
            id="propaganda-descricao"
            className="campo-textarea"
            rows="4"
            placeholder="Escreva a mensagem completa do anúncio, detalhes dos cursos, workshops ou novidades..."
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
            style={{ resize: 'vertical', minHeight: '100px' }}
          />
        </div>

        <div className="grid-2 gap-4">
          <div className="campo-grupo">
            <label className="campo-label" htmlFor="propaganda-link">
              Link de Redirecionamento (Opcional)
            </label>
            <input
              id="propaganda-link"
              type="text"
              className="campo-input"
              placeholder="Ex: #contato, /pecas ou https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
            <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
              Para onde o visitante vai ao clicar no botão
            </span>
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="propaganda-texto-botao">
              Texto do Botão
            </label>
            <input
              id="propaganda-texto-botao"
              type="text"
              className="campo-input"
              placeholder="Ex: Saiba Mais, Inscreva-se"
              value={form.textoBotao}
              maxLength={60}
              onChange={(e) => setForm({ ...form, textoBotao: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2 gap-4" style={{ alignItems: 'center' }}>
          <div className="campo-grupo">
            <label className="campo-label" htmlFor="propaganda-ordem">
              Ordem de Prioridade
            </label>
            <input
              id="propaganda-ordem"
              type="number"
              className="campo-input"
              placeholder="0"
              value={form.ordem}
              onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div className="campo-grupo" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
            <label
              htmlFor="propaganda-ativo"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                fontWeight: 600,
              }}
            >
              <input
                id="propaganda-ativo"
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--cor-primaria)' }}
              />
              <span>Ativo (Exibir na Home)</span>
            </label>
          </div>
        </div>

        {!propaganda && (
          <div className="campo-grupo" style={{ marginTop: 'var(--espaco-2)' }}>
            <label className="campo-label">
              Fotos da Propaganda (Opcional no cadastro)
            </label>
            <label
              className="upload-area"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div className="upload-area-icone">📷</div>
              <div style={{ fontWeight: 600, color: 'var(--cor-texto)', marginBottom: '4px' }}>
                {arquivosSelecionados.length > 0
                  ? `${arquivosSelecionados.length} foto(s) selecionada(s)`
                  : 'Clique para selecionar imagens'}
              </div>
              <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-terciario)' }}>
                JPG, PNG, WebP ou GIF (Pode adicionar mais depois)
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

        {propaganda && onAbrirFotos && (
          <div
            style={{
              marginTop: 'var(--espaco-4)',
              padding: 'var(--espaco-4)',
              background: 'var(--cor-fundo-elevado)',
              borderRadius: 'var(--raio-lg)',
              border: '1px solid var(--cor-borda)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--texto-sm)' }}>
                🖼️ Fotos desta Propaganda ({propaganda.fotos?.length || 0})
              </div>
              <div style={{ fontSize: 'var(--texto-xs)', color: 'var(--cor-texto-secundario)' }}>
                Adicione ou exclua imagens da galeria deste anúncio
              </div>
            </div>
            <button
              type="button"
              className="btn btn-dourado btn-sm"
              onClick={() => {
                onFechar();
                onAbrirFotos(propaganda);
              }}
            >
              Gerenciar Fotos ➜
            </button>
          </div>
        )}

        <div className="modal-rodape" style={{ marginTop: 'var(--espaco-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--espaco-3)' }}>
          <button type="button" className="btn btn-fantasma" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : propaganda ? 'Salvar Alterações' : 'Publicar Propaganda'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
