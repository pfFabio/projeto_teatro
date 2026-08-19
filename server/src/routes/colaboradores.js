// =============================================================================
// Rotas de Colaboradores
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  listarColaboradores,
  buscarColaborador,
  criarColaborador,
  atualizarColaborador,
  deletarColaborador,
} = require('../controllers/colaboradoresController');

// --- Rotas públicas ---
router.get('/', listarColaboradores);
router.get('/:id', buscarColaborador);

// Cadastro de colaborador (público, com upload de foto)
router.post('/', upload.single('foto'), criarColaborador);

// --- Rotas protegidas (admin) ---
router.put('/:id', autenticar, apenasAdmin, upload.single('foto'), atualizarColaborador);
router.delete('/:id', autenticar, apenasAdmin, deletarColaborador);

module.exports = router;
