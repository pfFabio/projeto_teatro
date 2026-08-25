// =============================================================================
// Validador de Colaboradores — Funções puras de validação
// Single Responsibility: apenas validação, sem acesso a dados ou HTTP
// =============================================================================

const CAMPOS_OBRIGATORIOS = ['nome', 'funcao', 'idade', 'celular', 'email', 'endereco', 'genero'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida dados para criação de um colaborador.
 * @param {Object} dados
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoColaborador(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados do colaborador não informados' };
  }

  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (
      dados[campo] === undefined ||
      dados[campo] === null ||
      (typeof dados[campo] === 'string' && dados[campo].trim().length === 0)
    ) {
      return {
        valido: false,
        mensagem: `Todos os campos são obrigatórios: ${CAMPOS_OBRIGATORIOS.join(', ')}`,
      };
    }
  }

  const email = String(dados.email).trim();
  if (!EMAIL_REGEX.test(email)) {
    return { valido: false, mensagem: 'Formato de email inválido' };
  }

  const idade = parseInt(dados.idade, 10);
  if (isNaN(idade) || idade < 1 || idade > 120) {
    return { valido: false, mensagem: 'Idade inválida (deve estar entre 1 e 120)' };
  }

  const celularLimpo = String(dados.celular).replace(/\D/g, '');
  if (celularLimpo.length < 8 || celularLimpo.length > 15) {
    return { valido: false, mensagem: 'Número de celular inválido (deve conter entre 8 e 15 dígitos)' };
  }

  return { valido: true };
}

/**
 * Valida dados para atualização de um colaborador.
 * @param {Object} dados
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarAtualizacaoColaborador(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados para atualização não informados' };
  }

  if (dados.email !== undefined) {
    const email = String(dados.email).trim();
    if (!EMAIL_REGEX.test(email)) {
      return { valido: false, mensagem: 'Formato de email inválido' };
    }
  }

  if (dados.idade !== undefined) {
    const idade = parseInt(dados.idade, 10);
    if (isNaN(idade) || idade < 1 || idade > 120) {
      return { valido: false, mensagem: 'Idade inválida (deve estar entre 1 e 120)' };
    }
  }

  if (dados.celular !== undefined) {
    const celularLimpo = String(dados.celular).replace(/\D/g, '');
    if (celularLimpo.length < 8 || celularLimpo.length > 15) {
      return { valido: false, mensagem: 'Número de celular inválido (deve conter entre 8 e 15 dígitos)' };
    }
  }

  return { valido: true };
}

module.exports = {
  validarCriacaoColaborador,
  validarAtualizacaoColaborador,
  CAMPOS_OBRIGATORIOS,
};
