// =============================================================================
// Validador de Peças — Funções puras de validação
// Single Responsibility: apenas validação, sem acesso a dados ou HTTP
// =============================================================================

/**
 * Valida dados para criação de uma peça.
 * @param {Object} dados - { titulo, resumo, endereco }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoPeca({ titulo, resumo, endereco }) {
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return { valido: false, mensagem: 'Título é obrigatório' };
  }

  if (!resumo || typeof resumo !== 'string' || resumo.trim().length === 0) {
    return { valido: false, mensagem: 'Resumo é obrigatório' };
  }

  if (!endereco || typeof endereco !== 'string' || endereco.trim().length === 0) {
    return { valido: false, mensagem: 'Endereço é obrigatório' };
  }

  return { valido: true };
}

/**
 * Valida dados para criação de um local de apresentação.
 * @param {Object} dados - { nomeLocal, cidade, endereco }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoLocal({ nomeLocal, cidade, endereco }) {
  if (!nomeLocal || typeof nomeLocal !== 'string' || nomeLocal.trim().length === 0) {
    return { valido: false, mensagem: 'Nome do local é obrigatório' };
  }

  if (!cidade || typeof cidade !== 'string' || cidade.trim().length === 0) {
    return { valido: false, mensagem: 'Cidade é obrigatória' };
  }

  if (!endereco || typeof endereco !== 'string' || endereco.trim().length === 0) {
    return { valido: false, mensagem: 'Endereço é obrigatório' };
  }

  return { valido: true };
}

/**
 * Valida dados para alocação de colaborador em uma peça.
 * @param {Object} dados - { colaboradorId, funcaoNaPeca }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarAlocacao({ colaboradorId, funcaoNaPeca }) {
  if (!colaboradorId) {
    return { valido: false, mensagem: 'colaboradorId é obrigatório' };
  }

  if (!funcaoNaPeca || typeof funcaoNaPeca !== 'string' || funcaoNaPeca.trim().length === 0) {
    return { valido: false, mensagem: 'funcaoNaPeca é obrigatória' };
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
    return { valido: false, mensagem: 'fotosIds deve ser um array com os IDs das fotos' };
  }

  return { valido: true };
}

module.exports = {
  validarCriacaoPeca,
  validarCriacaoLocal,
  validarAlocacao,
  validarReordenacaoFotos,
};
