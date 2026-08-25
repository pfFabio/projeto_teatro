// =============================================================================
// Rotas de Peças de Teatro
// Inclui validação de IDs de rota e autenticação
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateId = require('../middleware/validateId');
const {
  listarPecas,
  buscarPeca,
  criarPeca,
  atualizarPeca,
  deletarPeca,
  alocarColaborador,
  removerColaborador,
} = require('../controllers/pecasController');
const {
  adicionarFotos,
  deletarFoto,
  reordenarFotos,
  definirFotoCapa,
} = require('../controllers/fotosController');
const {
  adicionarLocal,
  atualizarLocal,
  deletarLocal,
} = require('../controllers/locaisController');

// --- Rotas públicas ---
router.get('/', listarPecas);
router.get('/:id', validateId('id'), buscarPeca);

// --- Rotas protegidas (admin) ---
router.post('/', autenticar, apenasAdmin, criarPeca);
router.put('/:id', autenticar, apenasAdmin, validateId('id'), atualizarPeca);
router.delete('/:id', autenticar, apenasAdmin, validateId('id'), deletarPeca);

// Fotos/vídeos e ordenação/capa
router.post('/:id/fotos', autenticar, apenasAdmin, validateId('id'), upload.array('arquivos', 10), adicionarFotos);
router.put('/:id/fotos/reordenar', autenticar, apenasAdmin, validateId('id'), reordenarFotos);
router.put('/:id/fotos/:fotoId/capa', autenticar, apenasAdmin, validateId('id', 'fotoId'), definirFotoCapa);
router.delete('/:pecaId/fotos/:fotoId', autenticar, apenasAdmin, validateId('pecaId', 'fotoId'), deletarFoto);

// Alocação de colaboradores
router.post('/:id/colaboradores', autenticar, apenasAdmin, validateId('id'), alocarColaborador);
router.delete('/:id/colaboradores/:colabId', autenticar, apenasAdmin, validateId('id', 'colabId'), removerColaborador);

// Locais e apresentações por cidade
router.post('/:id/locais', autenticar, apenasAdmin, validateId('id'), adicionarLocal);
router.put('/:id/locais/:localId', autenticar, apenasAdmin, validateId('id', 'localId'), atualizarLocal);
router.delete('/:id/locais/:localId', autenticar, apenasAdmin, validateId('id', 'localId'), deletarLocal);

module.exports = router;
