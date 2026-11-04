// =============================================================================
// Página do Colaborador — Formulário de cadastro público
// Campos estendidos da Ata #02 com conformidade LGPD e gerenciamento de memória
// =============================================================================

import { useState, useEffect } from 'react';
import { colaboradoresAPI } from '../services/api';

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function ColaboradorPage() {
  const [formulario, setFormulario] = useState({
    nome: '',
    nomeArtistico: '',
    funcao: '',
    idade: '',
    dataNascimento: '',
    genero: '',
    etniaRaca: '',
    orientacaoSexual: '',
    celular: '',
    email: '',
    redeSocial: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'RJ',
    cep: '',
    drtOmb: '',
    habilitacao: '',
    tipoSanguineo: '',
    peso: '',
    altura: '',
    manequim: '',
    sapato: '',
    saude: '',
    historico: '',
  });

  const [mostrarCamposAvancados, setMostrarCamposAvancados] = useState(false);
  const [consentimentoLGPD, setConsentimentoLGPD] = useState(true);
  const [outraFuncao, setOutraFuncao] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  // Cleanup de memória do preview de foto
  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  function atualizarCampo(campo, valor) {
    setFormulario({ ...formulario, [campo]: valor });
    setErro('');
  }

  function handleFoto(e) {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
      setFoto(arquivo);
      setFotoPreview(URL.createObjectURL(arquivo));
    }
  }

  async function enviarFormulario(e) {
    e.preventDefault();

    // Validação de campos obrigatórios
    const camposObrigatorios = ['nome', 'funcao', 'idade', 'celular', 'email', 'endereco', 'genero'];
    for (const campo of camposObrigatorios) {
      if (!formulario[campo] || String(formulario[campo]).trim() === '') {
        setErro(`O campo "${campo}" é obrigatório`);
        return;
      }
    }

    if (formulario.funcao === 'Outro' && !outraFuncao.trim()) {
      setErro('Por favor, especifique qual é a sua função / cargo');
      return;
    }

    const idadeNum = parseInt(formulario.idade, 10);
    if (isNaN(idadeNum) || idadeNum < 1 || idadeNum > 120) {
      setErro('Idade inválida (deve estar entre 1 e 120)');
      return;
    }

    if (!consentimentoLGPD) {
      setErro('É necessário autorizar o tratamento de dados pessoais conforme a LGPD');
      return;
    }

    try {
      setEnviando(true);
      setErro('');

      const formData = new FormData();
      Object.entries(formulario).forEach(([chave, valor]) => {
        if (chave === 'funcao' && valor === 'Outro') {
          formData.append('funcao', outraFuncao.trim());
        } else if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
          formData.append(chave, String(valor).trim());
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

  if (sucesso) {
    return (
      <div className="pagina-conteudo">
        <div className="colab-form-container animar-entrada">
          <div className="colab-sucesso card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h2>Cadastro Enviado com Sucesso!</h2>
            <p style={{ color: 'var(--cor-texto-secundario)', maxWidth: '440px', margin: '12px auto' }}>
              Obrigado por querer fazer parte da Theatrum Mundi. Seus dados foram recebidos com segurança e nossa produção entrará em contato quando surgirem oportunidades em nossas montagens.
            </p>
            <button
              className="btn btn-primario"
              onClick={() => {
                setSucesso(false);
                setFormulario({
                  nome: '',
                  nomeArtistico: '',
                  funcao: '',
                  idade: '',
                  dataNascimento: '',
                  genero: '',
                  etniaRaca: '',
                  orientacaoSexual: '',
                  celular: '',
                  email: '',
                  redeSocial: '',
                  endereco: '',
                  bairro: '',
                  cidade: '',
                  estado: 'RJ',
                  cep: '',
                  drtOmb: '',
                  habilitacao: '',
                  tipoSanguineo: '',
                  peso: '',
                  altura: '',
                  manequim: '',
                  sapato: '',
                  saude: '',
                  historico: '',
                });
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
            Preencha o formulário abaixo para fazer parte da nossa equipe artística e técnica
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

          {/* 1. DADOS OBRIGATÓRIOS PRINCIPAIS */}
          <div className="colab-form-grid">
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

            <div className="campo-grupo">
              <label className="campo-label">Nome Artístico / Como prefere ser chamado</label>
              <input
                type="text"
                className="campo-input"
                placeholder="Ex: Nome de palco"
                value={formulario.nomeArtistico}
                onChange={(e) => atualizarCampo('nomeArtistico', e.target.value)}
              />
            </div>

            <div className="campo-grupo">
              <label className="campo-label">Função / Cargo Principal *</label>
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

            {formulario.funcao === 'Outro' && (
              <div className="campo-grupo animar-entrada">
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
                <option value="Cisgênero">Cisgênero</option>
                <option value="Transgênero">Transgênero</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>
            </div>

            <div className="campo-grupo">
              <label className="campo-label">Celular / WhatsApp *</label>
              <input
                type="tel"
                className="campo-input"
                placeholder="(21) 99999-9999"
                value={formulario.celular}
                onChange={(e) => atualizarCampo('celular', e.target.value)}
                required
              />
            </div>

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

            <div className="campo-grupo colab-form-full">
              <label className="campo-label">Endereço (Rua, número) *</label>
              <input
                type="text"
                className="campo-input"
                placeholder="Rua, número, complemento"
                value={formulario.endereco}
                onChange={(e) => atualizarCampo('endereco', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Toggle para Dados Estendidos / Artísticos (Opcionais) */}
          <div style={{ margin: '20px 0 10px 0' }}>
            <button
              type="button"
              className="btn btn-fantasma btn-sm"
              onClick={() => setMostrarCamposAvancados(!mostrarCamposAvancados)}
            >
              {mostrarCamposAvancados ? '▲ Ocultar informações artísticas adicionais' : '▼ Preencher ficha artística e técnica completa (opcional)'}
            </button>
          </div>

          {mostrarCamposAvancados && (
            <div className="colab-form-grid animar-entrada" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--cor-borda)' }}>
              <div className="campo-grupo">
                <label className="campo-label">Bairro</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Seu bairro"
                  value={formulario.bairro}
                  onChange={(e) => atualizarCampo('bairro', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Cidade</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Ex: Niterói, Rio de Janeiro, Maricá"
                  value={formulario.cidade}
                  onChange={(e) => atualizarCampo('cidade', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Estado</label>
                <select
                  className="campo-select"
                  value={formulario.estado}
                  onChange={(e) => atualizarCampo('estado', e.target.value)}
                >
                  {ESTADOS_BR.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Rede Social / Instagram</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="@seu.perfil"
                  value={formulario.redeSocial}
                  onChange={(e) => atualizarCampo('redeSocial', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">DRT / Registro Profissional</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Número de registro"
                  value={formulario.drtOmb}
                  onChange={(e) => atualizarCampo('drtOmb', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Habilitação (CNH)</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Ex: Carro, Moto, Não possui"
                  value={formulario.habilitacao}
                  onChange={(e) => atualizarCampo('habilitacao', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Tipo Sanguíneo</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Ex: O+, A+, etc."
                  value={formulario.tipoSanguineo}
                  onChange={(e) => atualizarCampo('tipoSanguineo', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Altura & Peso</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Ex: 1,75 m / 70 kg"
                  value={formulario.altura}
                  onChange={(e) => atualizarCampo('altura', e.target.value)}
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">Manequim & Calçado</label>
                <input
                  type="text"
                  className="campo-input"
                  placeholder="Ex: 38 / 40"
                  value={formulario.manequim}
                  onChange={(e) => atualizarCampo('manequim', e.target.value)}
                />
              </div>

              <div className="campo-grupo colab-form-full">
                <label className="campo-label">Condições de Saúde ou Alergias (Sigiloso)</label>
                <textarea
                  className="campo-textarea"
                  rows="2"
                  placeholder="Informe alergias medicamentosas, alimentares ou restrições de esforço físico..."
                  value={formulario.saude}
                  onChange={(e) => atualizarCampo('saude', e.target.value)}
                />
              </div>

              <div className="campo-grupo colab-form-full">
                <label className="campo-label">Histórico de Atuações & Formação Artística</label>
                <textarea
                  className="campo-textarea"
                  rows="3"
                  placeholder="Conte um pouco sobre suas experiências prévias no teatro ou audiovisual..."
                  value={formulario.historico}
                  onChange={(e) => atualizarCampo('historico', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Consentimento LGPD */}
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--cor-fundo-elevado)', borderRadius: 'var(--raio-md)', border: '1px solid var(--cor-borda)' }}>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', fontSize: 'var(--texto-xs)' }}>
              <input
                type="checkbox"
                checked={consentimentoLGPD}
                onChange={(e) => setConsentimentoLGPD(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span>
                Declaro que as informações acima são verdadeiras e autorizo a <strong>Theatrum Mundi</strong> a realizar o tratamento dos meus dados pessoais para fins de escalação de elenco, produção e contato, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </span>
            </label>
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
