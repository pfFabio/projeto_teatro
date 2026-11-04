// =============================================================================
// Rotas de Memória da Companhia
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const {
  listarMemoria,
  criarItem,
  atualizarItem,
  deletarItem,
} = require('../controllers/memoriaController');

// GET /api/memoria — Listagem pública da trajetória e acervo
router.get('/', listarMemoria);

// Rotas administrativas
router.post('/', autenticar, apenasAdmin, criarItem);
router.put('/:id', autenticar, apenasAdmin, validateId('id'), atualizarItem);
router.delete('/:id', autenticar, apenasAdmin, validateId('id'), deletarItem);

module.exports = router;

