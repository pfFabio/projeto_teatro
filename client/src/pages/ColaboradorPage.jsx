// =============================================================================
// Página do Colaborador — Formulário de cadastro público
// =============================================================================

import { useState } from 'react';
import { colaboradoresAPI } from '../services/api';

export default function ColaboradorPage() {
  const [formulario, setFormulario] = useState({
    nome: '',
    funcao: '',
    idade: '',
    celular: '',
    email: '',
    endereco: '',
    genero: '',
  });
  const [outraFuncao, setOutraFuncao] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  function atualizarCampo(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor });
    setErro('');
  }

  function handleFoto(e) {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setFoto(arquivo);
      setFotoPreview(URL.createObjectURL(arquivo));
    }
  }

  async function enviarFormulario(e) {
    e.preventDefault();

    // Validação
    const camposObrigatorios = ['nome', 'funcao', 'idade', 'celular', 'email', 'endereco', 'genero'];
    for (const campo of camposObrigatorios) {
      if (!formulario[campo]) {
        setErro(`O campo "${campo}" é obrigatório`);
        return;
      }
    }

    if (formulario.funcao === 'Outro' && !outraFuncao.trim()) {
      setErro('Por favor, especifique qual é a sua função / cargo');
      return;
    }

    if (parseInt(formulario.idade) < 1 || parseInt(formulario.idade) > 120) {
      setErro('Idade inválida');
      return;
    }

    try {
      setEnviando(true);
      setErro('');

      const formData = new FormData();
      Object.entries(formulario).forEach(([chave, valor]) => {
        if (chave === 'funcao' && valor === 'Outro') {
          formData.append('funcao', outraFuncao.trim());
        } else {
          formData.append(chave, valor);
        }
      });

      if (foto) {
        formData.append('foto', foto);
      }

      await colaboradoresAPI.criar(formData);
      setSucesso(true);
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 'Erro ao enviar cadastro. Tente novamente.';
      setErro(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  // Tela de sucesso
  if (sucesso) {
    return (
      <div className="pagina-conteudo">
        <div className="colab-form-container">
          <div className="colab-form colab-sucesso animar-entrada">
            <div className="colab-sucesso-icone">🎉</div>
            <h2>Cadastro Realizado!</h2>
            <p style={{ color: 'var(--cor-texto-secundario)', fontSize: 'var(--texto-lg)' }}>
              Obrigado por se cadastrar como colaborador do Theatrum!<br />
              Nossa equipe entrará em contato em breve.
            </p>
            <button
              className="btn btn-primario btn-lg"
              onClick={() => {
                setSucesso(false);
                setFormulario({ nome: '', funcao: '', idade: '', celular: '', email: '', endereco: '', genero: '' });
                setOutraFuncao('');
                setFoto(null);
                setFotoPreview(null);
              }}
              style={{ marginTop: '24px' }}
            >
              Fazer Novo Cadastro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-conteudo">
      <div className="colab-form-container">
        <form className="colab-form animar-entrada" onSubmit={enviarFormulario}>
          <h2 className="colab-form-titulo">🎭 Seja um Colaborador</h2>
          <p className="colab-form-desc">
            Preencha o formulário abaixo para fazer parte da nossa equipe de teatro
          </p>

          {erro && (
            <div className="alerta alerta-erro">
              ⚠ {erro}
            </div>
          )}

          {/* Upload de Foto */}
          <div className="colab-form-foto">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview" className="upload-preview" />
            ) : (
              <div className="upload-preview" style={{
                background: 'var(--cor-fundo-elevado)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}>
                📷
              </div>
            )}
            <label className="btn btn-fantasma btn-sm" style={{ cursor: 'pointer' }}>
              {fotoPreview ? 'Trocar Foto' : 'Enviar Foto'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFoto}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="colab-form-grid">
            {/* Nome */}
            <div className="campo-grupo">
              <label className="campo-label">Nome Completo *</label>
              <input
                type="text"
                className="campo-input"
                placeholder="Seu nome completo"
                value={formulario.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                required
              />
            </div>

            {/* Função/Cargo */}
            <div className="campo-grupo">
              <label className="campo-label">Função / Cargo *</label>
              <select
                className="campo-select"
                value={formulario.funcao}
                onChange={(e) => {
                  atualizarCampo('funcao', e.target.value);
                  if (e.target.value !== 'Outro') setOutraFuncao('');
                }}
                required
              >
                <option value="">Selecione...</option>
                <option value="Ator">Ator / Atriz</option>
                <option value="Diretor">Diretor(a)</option>
                <option value="Produtor">Produtor(a)</option>
                <option value="Técnico de Iluminação">Técnico de Iluminação</option>
                <option value="Técnico de Som">Técnico de Som</option>
                <option value="Figurinista">Figurinista</option>
                <option value="Cenógrafo">Cenógrafo(a)</option>
                <option value="Maquiador">Maquiador(a)</option>
                <option value="Dramaturgo">Dramaturgo(a)</option>
                <option value="Coreógrafo">Coreógrafo(a)</option>
                <option value="Assistente">Assistente</option>
                <option value="Outro">Outro (especificar)</option>
              </select>
            </div>

            {/* Campo condicional para Outro */}
            {formulario.funcao === 'Outro' && (
              <div className="campo-grupo colab-form-full animar-entrada">
                <label className="campo-label">Qual é a sua Função / Cargo? *</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Ex: Aderecista, Produtor Executivo, Sonoplasta..."
                  value={outraFuncao}
                  onChange={(e) => {
                    setOutraFuncao(e.target.value);
                    setErro('');
                  }}
                  autoFocus
                  required
                />
              </div>
            )}

            {/* Idade */}
            <div className="campo-grupo">
              <label className="campo-label">Idade *</label>
              <input
                type="number"
                className="campo-input"
                placeholder="25"
                min="1"
                max="120"
                value={formulario.idade}
                onChange={(e) => atualizarCampo('idade', e.target.value)}
                required
              />
            </div>

            {/* Gênero */}
            <div className="campo-grupo">
              <label className="campo-label">Gênero *</label>
              <select
                className="campo-select"
                value={formulario.genero}
                onChange={(e) => atualizarCampo('genero', e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não-binário">Não-binário</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>
            </div>

            {/* Celular */}
            <div className="campo-grupo">
              <label className="campo-label">Celular *</label>
              <input
                type="tel"
                className="campo-input"
                placeholder="(11) 99999-9999"
                value={formulario.celular}
                onChange={(e) => atualizarCampo('celular', e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="campo-grupo">
              <label className="campo-label">Email *</label>
              <input
                type="email"
                className="campo-input"
                placeholder="seu@email.com"
                value={formulario.email}
                onChange={(e) => atualizarCampo('email', e.target.value)}
                required
              />
            </div>

            {/* Endereço */}
            <div className="campo-grupo colab-form-full">
              <label className="campo-label">Endereço *</label>
              <input
                type="text"
                className="campo-input"
                placeholder="Rua, número, bairro — Cidade, Estado"
                value={formulario.endereco}
                onChange={(e) => atualizarCampo('endereco', e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primario btn-lg btn-bloco"
            disabled={enviando}
            style={{ marginTop: 'var(--espaco-4)' }}
          >
            {enviando ? 'Enviando...' : '🎭 Enviar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}
