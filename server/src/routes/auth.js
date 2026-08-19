// =============================================================================
// Rotas de Autenticação
// =============================================================================

const express = require('express');
const router = express.Router();
const { login, buscarPerfil } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

// POST /api/auth/login — Login do admin
router.post('/login', login);

// GET /api/auth/me — Perfil do usuário autenticado
router.get('/me', autenticar, buscarPerfil);

module.exports = router;
