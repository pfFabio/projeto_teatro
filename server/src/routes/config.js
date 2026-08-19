// =============================================================================
// Rotas de Configuração do Site
// =============================================================================

const express = require('express');
const router = express.Router();
const { autenticar, apenasAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { listarConfigs, atualizarConfig } = require('../controllers/configController');

// GET /api/config — Listar todas (público)
router.get('/', listarConfigs);

// PUT /api/config/:chave — Atualizar (admin only, com suporte a upload)
router.put('/:chave', autenticar, apenasAdmin, upload.single('arquivo'), atualizarConfig);

module.exports = router;
