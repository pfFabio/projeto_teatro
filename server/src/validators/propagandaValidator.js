// =============================================================================
// Validador de Propagandas — Funções puras de validação
// Single Responsibility: apenas validação de dados
// =============================================================================

/**
 * Valida dados para criação de uma propaganda.
 * @param {Object} dados - { titulo, descricao, link, textoBotao, ativo }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoPropaganda(dados = {}) {
  const { titulo, descricao, link, textoBotao, ativo } = dados;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return { valido: false, mensagem: 'Título da propaganda é obrigatório' };
  }

  if (titulo.trim().length > 150) {
    return { valido: false, mensagem: 'Título da propaganda deve ter no máximo 150 caracteres' };
  }

  if (!descricao || typeof descricao !== 'string' || descricao.trim().length === 0) {
    return { valido: false, mensagem: 'Descrição/texto da propaganda é obrigatório' };
  }

  if (link !== undefined && link !== null && typeof link === 'string' && link.trim().length > 500) {
    return { valido: false, mensagem: 'Link de destino deve ter no máximo 500 caracteres' };
  }

  if (textoBotao !== undefined && textoBotao !== null && typeof textoBotao === 'string' && textoBotao.trim().length > 60) {
    return { valido: false, mensagem: 'Texto do botão deve ter no máximo 60 caracteres' };
  }

  if (ativo !== undefined && typeof ativo !== 'boolean' && ativo !== 'true' && ativo !== 'false') {
    return { valido: false, mensagem: 'Status ativo deve ser um valor booleano' };
  }

  return { valido: true };
}

/**
 * Valida dados para atualização de uma propaganda.
 * @param {Object} dados
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarAtualizacaoPropaganda(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados para atualização não informados' };
  }

  if (dados.titulo !== undefined) {
    if (typeof dados.titulo !== 'string' || dados.titulo.trim().length === 0) {
      return { valido: false, mensagem: 'Título não pode ser vazio' };
    }
    if (dados.titulo.trim().length > 150) {
      return { valido: false, mensagem: 'Título da propaganda deve ter no máximo 150 caracteres' };
    }
  }

  if (dados.descricao !== undefined) {
    if (typeof dados.descricao !== 'string' || dados.descricao.trim().length === 0) {
      return { valido: false, mensagem: 'Descrição/texto não pode ser vazio' };
    }
  }

  if (dados.link !== undefined && dados.link !== null && typeof dados.link === 'string' && dados.link.trim().length > 500) {
    return { valido: false, mensagem: 'Link de destino deve ter no máximo 500 caracteres' };
  }

  if (dados.textoBotao !== undefined && dados.textoBotao !== null && typeof dados.textoBotao === 'string' && dados.textoBotao.trim().length > 60) {
    return { valido: false, mensagem: 'Texto do botão deve ter no máximo 60 caracteres' };
  }

  if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean' && dados.ativo !== 'true' && dados.ativo !== 'false') {
    return { valido: false, mensagem: 'Status ativo deve ser um valor booleano' };
  }

  return { valido: true };
}

/**
 * Valida array de IDs de fotos para reordenação.
 * @param {*} fotosIds
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarReordenacaoFotos(fotosIds) {
  if (!Array.isArray(fotosIds) || fotosIds.length === 0) {
    return { valido: false, mensagem: 'fotosIds deve ser um array não vazio com os IDs das fotos' };
  }

  const contemValoresValidos = fotosIds.every(id => Number.isInteger(Number(id)) && Number(id) > 0);
  if (!contemValoresValidos) {
    return { valido: false, mensagem: 'Todos os IDs em fotosIds devem ser números inteiros válidos' };
  }

  return { valido: true };
}

module.exports = {
  validarCriacaoPropaganda,
  validarAtualizacaoPropaganda,
  validarReordenacaoFotos,
};
