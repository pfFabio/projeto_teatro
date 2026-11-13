// =============================================================================
// Rotas de Autenticação
// =============================================================================

const express = require('express');
const router = express.Router();
const {
  login,
  buscarPerfil,
  atualizarPerfil,
  alterarSenha,
  esqueciSenha,
  redefinirSenha,
} = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

// POST /api/auth/login — Login do admin
router.post('/login', login);

// GET /api/auth/me — Perfil do usuário autenticado
router.get('/me', autenticar, buscarPerfil);

// PUT /api/auth/perfil — Atualização do perfil do administrador
router.put('/perfil', autenticar, atualizarPerfil);

// POST /api/auth/alterar-senha — Altera a senha do admin logado
router.post('/alterar-senha', autenticar, alterarSenha);

// POST /api/auth/esqueci-senha — Solicita recuperação de senha
router.post('/esqueci-senha', esqueciSenha);

// POST /api/auth/redefinir-senha — Redefine senha com token
router.post('/redefinir-senha', redefinirSenha);

module.exports = router;
