// =============================================================================
// Theatrum — Rotas de Comprovantes de Despesa (/api/comprovantes)
// Blindagem de segurança: Acesso 100% exclusivo para administradores autenticados
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const { uploadComprovante } = require('../middleware/upload');
const {
  listarComprovantes,
  buscarComprovante,
  baixarArquivoComprovante,
  criarComprovante,
  atualizarComprovante,
  deletarComprovante,
  extrairDadosComprovante,
} = require('../controllers/comprovantesController');

// Todas as rotas de comprovantes exigem autenticação de Administrador
router.use(autenticar, apenasAdmin);

router.post('/extrair', uploadComprovante.single('arquivo'), extrairDadosComprovante);
router.get('/', listarComprovantes);
router.get('/:id', validateId('id'), buscarComprovante);
router.get('/:id/arquivo', validateId('id'), baixarArquivoComprovante);
router.post('/', uploadComprovante.single('arquivo'), criarComprovante);
router.put('/:id', validateId('id'), uploadComprovante.single('arquivo'), atualizarComprovante);
router.delete('/:id', validateId('id'), deletarComprovante);

module.exports = router;

