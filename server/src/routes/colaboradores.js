// =============================================================================
// Rotas de Colaboradores
// Proteção de dados sensíveis LGPD + validação de IDs
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, autenticarOpcional, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateId = require('../middleware/validateId');
const {
  listarColaboradores,
  buscarColaborador,
  criarColaborador,
  atualizarColaborador,
  deletarColaborador,
} = require('../controllers/colaboradoresController');

// --- Rotas públicas (com enriquecimento seguro se autenticado) ---
router.get('/', autenticarOpcional, listarColaboradores);
router.get('/:id', validateId('id'), autenticarOpcional, buscarColaborador);

// Cadastro de colaborador (público, com upload de foto)
router.post('/', upload.single('foto'), criarColaborador);

// --- Rotas protegidas (admin) ---
router.put('/:id', autenticar, apenasAdmin, validateId('id'), upload.single('foto'), atualizarColaborador);
router.delete('/:id', autenticar, apenasAdmin, validateId('id'), deletarColaborador);

module.exports = router;
