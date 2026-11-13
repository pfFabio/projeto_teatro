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
  const str = String(data).trim();
  const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = str.match(isoPattern);
  if (!match) return true;

  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return true;

  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    Number.isNaN(d.getTime()) ||
    d.getUTCFullYear() !== ano ||
    d.getUTCMonth() + 1 !== mes ||
    d.getUTCDate() !== dia
  );
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

