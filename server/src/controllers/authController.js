// =============================================================================
// Controller de Autenticação
// Gerencia requisições HTTP e delega para AuthService (SOLID - Single Responsibility)
// =============================================================================

const AuthService = require('../services/authService');

// POST /api/auth/login — Login do administrador
async function login(req, res, next) {
  try {
    const resultado = await AuthService.login(req.body);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/auth/me — Retorna dados do usuário autenticado
async function buscarPerfil(req, res, next) {
  try {
    const usuario = await AuthService.buscarPerfil(req.usuario.id);
    res.json(usuario);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/auth/alterar-senha — Altera senha de usuário logado
async function alterarSenha(req, res, next) {
  try {
    const resultado = await AuthService.alterarSenha(req.usuario.id, req.body);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/auth/esqueci-senha — Solicita token de recuperação
async function esqueciSenha(req, res, next) {
  try {
    const resultado = await AuthService.solicitarRecuperacaoSenha(req.body);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/auth/redefinir-senha — Redefine a senha com o token
async function redefinirSenha(req, res, next) {
  try {
    const resultado = await AuthService.redefinirSenha(req.body);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  login,
  buscarPerfil,
  alterarSenha,
  esqueciSenha,
  redefinirSenha,
};
