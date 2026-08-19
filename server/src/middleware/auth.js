// =============================================================================
// Middleware de Autenticação JWT
// Verifica o token no header Authorization: Bearer <token>
// =============================================================================

const jwt = require('jsonwebtoken');

// Middleware que exige autenticação (somente admin)
function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: true,
      mensagem: 'Token de autenticação não fornecido',
    });
  }

  const token = cabecalho.split(' ')[1];

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = dados; // { id, email, nome, papel }
    next();
  } catch (erro) {
    return res.status(401).json({
      erro: true,
      mensagem: 'Token inválido ou expirado',
    });
  }
}

// Middleware que exige papel de admin
function apenasAdmin(req, res, next) {
  if (!req.usuario || req.usuario.papel !== 'ADMIN') {
    return res.status(403).json({
      erro: true,
      mensagem: 'Acesso restrito a administradores',
    });
  }
  next();
}

module.exports = { autenticar, apenasAdmin };
