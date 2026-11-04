// =============================================================================
// Validador de Ideias e Propostas (Formulário Público)
// =============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarCriacaoIdeia(dados) {
  if (!dados || typeof dados !== 'object') {
    return { valido: false, mensagem: 'Dados da ideia não informados' };
  }

  const { nome, email, descricao } = dados;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return { valido: false, mensagem: 'Seu nome é obrigatório' };
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { valido: false, mensagem: 'Seu email é obrigatório' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { valido: false, mensagem: 'Formato de email inválido' };
  }

  if (!descricao || typeof descricao !== 'string' || descricao.trim().length < 10) {
    return { valido: false, mensagem: 'Por favor, descreva sua ideia com pelo menos 10 caracteres' };
  }

  return { valido: true };
}

module.exports = { validarCriacaoIdeia };

