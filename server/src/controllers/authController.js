// =============================================================================
// Controller de Autenticação
// Gerencia requisições HTTP e delega para AuthService (SOLID - Single Responsibility)
// =============================================================================

const AuthService = require('../services/authService');

// POST /api/auth/login — Login do administrador
async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const resultado = await AuthService.login({ email, senha });
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

module.exports = { login, buscarPerfil };
