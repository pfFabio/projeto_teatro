// =============================================================================
// Middleware de Autenticação JWT
// Verifica o token no header Authorization: Bearer <token>
// =============================================================================

const jwt = require('jsonwebtoken');
const { ENV } = require('../config/env');
const AppError = require('../errors/AppError');

// Middleware que exige autenticação
function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Token de autenticação não fornecido'));
  }

  const token = cabecalho.split(' ')[1];

  try {
    const dados = jwt.verify(token, ENV.JWT_SECRET);
    req.usuario = dados; // { id, email, nome, papel }
    next();
  } catch (erro) {
    return next(AppError.unauthorized('Token inválido ou expirado'));
  }
}

// Middleware opcional: se o token existir e for válido, preenche req.usuario
function autenticarOpcional(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (cabecalho && cabecalho.startsWith('Bearer ')) {
    const token = cabecalho.split(' ')[1];
    try {
      const dados = jwt.verify(token, ENV.JWT_SECRET);
      req.usuario = dados;
    } catch {
      // Ignora erro se for opcional
    }
  }
  next();
}

// Middleware que exige papel de admin
function apenasAdmin(req, res, next) {
  if (!req.usuario || req.usuario.papel !== 'ADMIN') {
    return next(AppError.forbidden('Acesso restrito a administradores'));
  }
  next();
}

module.exports = { autenticar, autenticarOpcional, apenasAdmin };
