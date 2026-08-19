// =============================================================================
// Validador de Autenticação — Funções puras de validação
// Single Responsibility: apenas validação, sem acesso a dados ou HTTP
// =============================================================================

/**
 * Valida dados de login.
 * @param {Object} dados - { email, senha }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarLogin({ email, senha }) {
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { valido: false, mensagem: 'Email é obrigatório' };
  }

  if (!senha || typeof senha !== 'string' || senha.trim().length === 0) {
    return { valido: false, mensagem: 'Senha é obrigatória' };
  }

  // Validação básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valido: false, mensagem: 'Formato de email inválido' };
  }

  return { valido: true };
}

module.exports = { validarLogin };
