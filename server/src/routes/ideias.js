// =============================================================================
// Rotas de Ideias e Mensagens
// =============================================================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { autenticar, apenasAdmin } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const {
  criarIdeia,
  listarIdeias,
  atualizarStatus,
  deletarIdeia,
} = require('../controllers/ideiasController');
const { ENV } = require('../config/env');

// Rate limit anti-spam para envio de ideias (10 por hora por IP)
const limiterIdeias = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  skip: () => ENV.NODE_ENV !== 'production',
  message: {
    erro: true,
    mensagem: 'Muitas mensagens enviadas recentemente. Por favor, aguarde antes de enviar novamente.',
  },
});

// POST /api/ideias — Envio público de ideias
router.post('/', limiterIdeias, criarIdeia);

// Rotas protegidas (apenas admin)
router.get('/', autenticar, apenasAdmin, listarIdeias);
router.patch('/:id/status', autenticar, apenasAdmin, validateId('id'), atualizarStatus);
router.delete('/:id', autenticar, apenasAdmin, validateId('id'), deletarIdeia);

module.exports = router;

