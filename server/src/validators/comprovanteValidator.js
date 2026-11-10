// =============================================================================
// Theatrum — Validador de Comprovantes de Despesa
// Validação defensiva pura (zero external dependencies)
// =============================================================================

const CATEGORIAS_COMPROVANTE = [
  'TRANSPORTE',
  'ALIMENTACAO',
  'CACHE',
  'CENOGRAFIA_FIGURINO',
  'DIVULGACAO',
  'INFRAESTRUTURA',
  'OUTROS',
];

function isTextoVazio(valor) {
  return valor === undefined || valor === null || String(valor).trim() === '';
}

function isValorInvalido(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') return true;
  const num = Number(valor);
  return Number.isNaN(num) || num <= 0;
}

function isDataInvalida(data) {
  if (isTextoVazio(data)) return true;
  // Aceita formatos YYYY-MM-DD ou DD/MM/AAAA
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  const brPattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!isoPattern.test(data) && !brPattern.test(data)) return true;

  const d = new Date(isoPattern.test(data) ? data : data.split('/').reverse().join('-'));
  return Number.isNaN(d.getTime());
}

/**
 * Valida a criação de um novo comprovante
 * @param {Object} dados - Campos do formulário
 * @param {Object} arquivo - Arquivo req.file
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoComprovante(dados = {}, arquivo = null) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados do comprovante não fornecidos.' };
  }

  if (isTextoVazio(dados.titulo)) {
    return { valido: false, mensagem: 'O título do comprovante é obrigatório.' };
  }

  if (isValorInvalido(dados.valor)) {
    return { valido: false, mensagem: 'O valor da despesa deve ser um número maior que zero.' };
  }

  if (isDataInvalida(dados.dataComprovante)) {
    return { valido: false, mensagem: 'A data do comprovante deve ser válida (formato YYYY-MM-DD).' };
  }

  if (dados.categoria && !CATEGORIAS_COMPROVANTE.includes(dados.categoria)) {
    return {
      valido: false,
      mensagem: `Categoria inválida. Categorias permitidas: ${CATEGORIAS_COMPROVANTE.join(', ')}.`,
    };
  }

  if (!arquivo) {
    return { valido: false, mensagem: 'É obrigatório anexar o arquivo do comprovante (PDF ou Imagem).' };
  }

  return { valido: true };
}

/**
 * Valida a atualização de um comprovante existente
 * @param {Object} dados - Campos parciais a atualizar
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarAtualizacaoComprovante(dados = {}) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados de atualização inválidos.' };
  }

  if (dados.titulo !== undefined && isTextoVazio(dados.titulo)) {
    return { valido: false, mensagem: 'O título não pode ser vazio.' };
  }

  if (dados.valor !== undefined && isValorInvalido(dados.valor)) {
    return { valido: false, mensagem: 'O valor da despesa deve ser maior que zero.' };
  }

  if (dados.dataComprovante !== undefined && isDataInvalida(dados.dataComprovante)) {
    return { valido: false, mensagem: 'Data do comprovante inválida.' };
  }

  if (dados.categoria !== undefined && !CATEGORIAS_COMPROVANTE.includes(dados.categoria)) {
    return {
      valido: false,
      mensagem: `Categoria inválida. Categorias permitidas: ${CATEGORIAS_COMPROVANTE.join(', ')}.`,
    };
  }

  return { valido: true };
}

module.exports = {
  CATEGORIAS_COMPROVANTE,
  validarCriacaoComprovante,
  validarAtualizacaoComprovante,
};
