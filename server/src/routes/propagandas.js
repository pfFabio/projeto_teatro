// =============================================================================
// Theatrum — Rotas de Propagandas / Anúncios
// Proteção JWT, validação de parâmetros de ID e uploads via Multer
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateId = require('../middleware/validateId');
const {
  listarPropagandas,
  buscarPropaganda,
  criarPropaganda,
  atualizarPropaganda,
  deletarPropaganda,
  adicionarFotos,
  deletarFoto,
  reordenarFotos,
} = require('../controllers/propagandasController');

// --- Rotas públicas ---
router.get('/', listarPropagandas);
router.get('/:id', validateId('id'), buscarPropaganda);

// --- Rotas protegidas (apenas admin) ---
router.post('/', autenticar, apenasAdmin, upload.array('fotos', 10), criarPropaganda);
router.put('/:id', autenticar, apenasAdmin, validateId('id'), atualizarPropaganda);
router.delete('/:id', autenticar, apenasAdmin, validateId('id'), deletarPropaganda);

// --- Gestão de fotos da propaganda ---
router.post('/:id/fotos', autenticar, apenasAdmin, validateId('id'), upload.array('fotos', 10), adicionarFotos);
router.delete('/:id/fotos/:fotoId', autenticar, apenasAdmin, validateId('id', 'fotoId'), deletarFoto);
router.put('/:id/fotos/reordenar', autenticar, apenasAdmin, validateId('id'), reordenarFotos);

module.exports = router;
