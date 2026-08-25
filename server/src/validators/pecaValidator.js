// =============================================================================
// Validador de Peças — Funções puras de validação
// Single Responsibility: apenas validação, sem acesso a dados ou HTTP
// =============================================================================

const { STATUS_PERMITIDOS } = require('../constants/statusPeca');

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida dados para criação de uma peça.
 * @param {Object} dados - { titulo, resumo, endereco, dataEstreia, status }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoPeca({ titulo, resumo, endereco, dataEstreia, status }) {
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return { valido: false, mensagem: 'Título é obrigatório' };
  }

  if (!resumo || typeof resumo !== 'string' || resumo.trim().length === 0) {
    return { valido: false, mensagem: 'Resumo é obrigatório' };
  }

  if (!endereco || typeof endereco !== 'string' || endereco.trim().length === 0) {
    return { valido: false, mensagem: 'Endereço é obrigatório' };
  }

  if (dataEstreia && !DATA_REGEX.test(dataEstreia)) {
    return { valido: false, mensagem: 'Data de estreia inválida. Use o formato AAAA-MM-DD' };
  }

  if (status && !STATUS_PERMITIDOS.includes(status)) {
    return { valido: false, mensagem: `Status inválido. Opções permitidas: ${STATUS_PERMITIDOS.join(', ')}` };
  }

  return { valido: true };
}

/**
 * Valida dados para atualização de uma peça.
 * @param {Object} dados
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarAtualizacaoPeca(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados para atualização não informados' };
  }

  if (dados.titulo !== undefined && (typeof dados.titulo !== 'string' || dados.titulo.trim().length === 0)) {
    return { valido: false, mensagem: 'Título não pode ser vazio' };
  }

  if (dados.resumo !== undefined && (typeof dados.resumo !== 'string' || dados.resumo.trim().length === 0)) {
    return { valido: false, mensagem: 'Resumo não pode ser vazio' };
  }

  if (dados.endereco !== undefined && (typeof dados.endereco !== 'string' || dados.endereco.trim().length === 0)) {
    return { valido: false, mensagem: 'Endereço não pode ser vazio' };
  }

  if (dados.dataEstreia && !DATA_REGEX.test(dados.dataEstreia)) {
    return { valido: false, mensagem: 'Data de estreia inválida. Use o formato AAAA-MM-DD' };
  }

  if (dados.status && !STATUS_PERMITIDOS.includes(dados.status)) {
    return { valido: false, mensagem: `Status inválido. Opções permitidas: ${STATUS_PERMITIDOS.join(', ')}` };
  }

  return { valido: true };
}

/**
 * Valida dados para criação ou atualização de um local de apresentação.
 * @param {Object} dados - { nomeLocal, cidade, endereco, dataEstreia, dataFim, status }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoLocal({ nomeLocal, cidade, endereco, dataEstreia, dataFim, status }) {
  if (!nomeLocal || typeof nomeLocal !== 'string' || nomeLocal.trim().length === 0) {
    return { valido: false, mensagem: 'Nome do local é obrigatório' };
  }

  if (!cidade || typeof cidade !== 'string' || cidade.trim().length === 0) {
    return { valido: false, mensagem: 'Cidade é obrigatória' };
  }

  if (!endereco || typeof endereco !== 'string' || endereco.trim().length === 0) {
    return { valido: false, mensagem: 'Endereço é obrigatório' };
  }

  if (dataEstreia && !DATA_REGEX.test(dataEstreia)) {
    return { valido: false, mensagem: 'Data de estreia inválida. Use o formato AAAA-MM-DD' };
  }

  if (dataFim && !DATA_REGEX.test(dataFim)) {
    return { valido: false, mensagem: 'Data de fim inválida. Use o formato AAAA-MM-DD' };
  }

  if (status && !STATUS_PERMITIDOS.includes(status)) {
    return { valido: false, mensagem: `Status inválido. Opções permitidas: ${STATUS_PERMITIDOS.join(', ')}` };
  }

  return { valido: true };
}

/**
 * Valida dados para alocação de colaborador em uma peça.
 * @param {Object} dados - { colaboradorId, funcaoNaPeca }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarAlocacao({ colaboradorId, funcaoNaPeca }) {
  if (!colaboradorId || isNaN(parseInt(colaboradorId, 10))) {
    return { valido: false, mensagem: 'colaboradorId válido é obrigatório' };
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
    return { valido: false, mensagem: 'fotosIds deve ser um array não vazio com os IDs das fotos' };
  }

  const contemValoresValidos = fotosIds.every(id => Number.isInteger(Number(id)) && Number(id) > 0);
  if (!contemValoresValidos) {
    return { valido: false, mensagem: 'Todos os IDs em fotosIds devem ser números inteiros válidos' };
  }

  return { valido: true };
}

module.exports = {
  validarCriacaoPeca,
  validarAtualizacaoPeca,
  validarCriacaoLocal,
  validarAlocacao,
  validarReordenacaoFotos,
};
