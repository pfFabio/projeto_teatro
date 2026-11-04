// =============================================================================
// Validador de Autenticação — Funções puras de validação
// Single Responsibility: apenas validação, sem acesso a dados ou HTTP
// =============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida dados de login.
 * Aceita email OU nome de usuário da companhia.
 * @param {Object} dados - { email, login, usuario, senha }
 * @returns {{ valido: boolean, mensagem?: string }}
 */
function validarLogin(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Email e senha são obrigatórios' };
  }

  const { senha } = dados;
  const loginIdentifier = dados.login || dados.email || dados.usuario;

  if (!loginIdentifier || typeof loginIdentifier !== 'string' || loginIdentifier.trim().length === 0) {
    return { valido: false, mensagem: 'Email é obrigatório' };
  }

  if (!senha || typeof senha !== 'string' || senha.trim().length === 0) {
    return { valido: false, mensagem: 'Senha é obrigatória' };
  }

  // Se o campo passado foi explicitamente 'email' e não 'login', valida formato para compatibilidade
  if (dados.email !== undefined && !dados.login && !dados.usuario) {
    if (!EMAIL_REGEX.test(dados.email)) {
      return { valido: false, mensagem: 'Formato de email inválido' };
    }
  }

  return { valido: true };
}

/**
 * Valida alteração de senha autenticada
 */
function validarAlteracaoSenha(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados para alteração de senha não informados' };
  }

  const { senhaAtual, novaSenha } = dados;

  if (!senhaAtual || typeof senhaAtual !== 'string' || senhaAtual.trim().length === 0) {
    return { valido: false, mensagem: 'Senha atual é obrigatória' };
  }

  if (!novaSenha || typeof novaSenha !== 'string' || novaSenha.trim().length < 6) {
    return { valido: false, mensagem: 'A nova senha deve ter no mínimo 6 caracteres' };
  }

  if (senhaAtual === novaSenha) {
    return { valido: false, mensagem: 'A nova senha deve ser diferente da senha atual' };
  }

  return { valido: true };
}

/**
 * Valida solicitação de recuperação de senha
 */
function validarSolicitacaoRecuperacao(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Identificador (email ou usuário) é obrigatório' };
  }

  const id = dados.email || dados.login || dados.identificador;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return { valido: false, mensagem: 'Informe seu email ou nome de usuário cadastrado' };
  }

  return { valido: true };
}

/**
 * Valida redefinição de senha com token
 */
function validarRedefinicaoSenha(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Token e nova senha são obrigatórios' };
  }

  const { token, novaSenha } = dados;

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { valido: false, mensagem: 'Token de recuperação é obrigatório' };
  }

  if (!novaSenha || typeof novaSenha !== 'string' || novaSenha.trim().length < 6) {
    return { valido: false, mensagem: 'A nova senha deve ter no mínimo 6 caracteres' };
  }

  return { valido: true };
}

module.exports = {
  validarLogin,
  validarAlteracaoSenha,
  validarSolicitacaoRecuperacao,
  validarRedefinicaoSenha,
};
