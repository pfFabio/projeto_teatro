// =============================================================================
// Validador de Colaboradores — Funções puras de validação
// Single Responsibility: apenas validação, sem acesso a dados ou HTTP
// =============================================================================

const CAMPOS_OBRIGATORIOS = ['nome', 'funcao', 'idade', 'celular', 'email', 'endereco', 'genero'];

/**
 * Valida dados para criação de um colaborador.
 * @param {Object} dados
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarCriacaoColaborador(dados) {
  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (!dados[campo] || (typeof dados[campo] === 'string' && dados[campo].trim().length === 0)) {
      return {
        valido: false,
        mensagem: `Todos os campos são obrigatórios: ${CAMPOS_OBRIGATORIOS.join(', ')}`,
      };
    }
  }

  const idade = parseInt(dados.idade);
  if (isNaN(idade) || idade < 1 || idade > 120) {
    return { valido: false, mensagem: 'Idade inválida (deve estar entre 1 e 120)' };
  }

  return { valido: true };
}

module.exports = {
  validarCriacaoColaborador,
  CAMPOS_OBRIGATORIOS,
};
