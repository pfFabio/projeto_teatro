// =============================================================================
// Rotas de Peças de Teatro
// Atualizado para usar controllers separados (fotos, locais)
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
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
router.get('/:id', buscarPeca);

// --- Rotas protegidas (admin) ---
router.post('/', autenticar, apenasAdmin, criarPeca);
router.put('/:id', autenticar, apenasAdmin, atualizarPeca);
router.delete('/:id', autenticar, apenasAdmin, deletarPeca);

// Fotos/vídeos e ordenação/capa
router.post('/:id/fotos', autenticar, apenasAdmin, upload.array('arquivos', 10), adicionarFotos);
router.put('/:id/fotos/reordenar', autenticar, apenasAdmin, reordenarFotos);
router.put('/:id/fotos/:fotoId/capa', autenticar, apenasAdmin, definirFotoCapa);
router.delete('/:pecaId/fotos/:fotoId', autenticar, apenasAdmin, deletarFoto);

// Alocação de colaboradores
router.post('/:id/colaboradores', autenticar, apenasAdmin, alocarColaborador);
router.delete('/:id/colaboradores/:colabId', autenticar, apenasAdmin, removerColaborador);

// Locais e apresentações por cidade
router.post('/:id/locais', autenticar, apenasAdmin, adicionarLocal);
router.put('/:id/locais/:localId', autenticar, apenasAdmin, atualizarLocal);
router.delete('/:id/locais/:localId', autenticar, apenasAdmin, deletarLocal);

module.exports = router;
