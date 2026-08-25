// =============================================================================
// Controller de Configurações do Site
// Single Responsibility: mapeamento HTTP delegando para ConfigService
// =============================================================================

const ConfigService = require('../services/configService');

// GET /api/config — Retorna todas as configurações (acesso público)
async function listarConfigs(req, res, next) {
  try {
    const configs = await ConfigService.listar();
    res.json(configs);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/config/:chave — Atualizar ou criar configuração (admin only)
async function atualizarConfig(req, res, next) {
  try {
    const { chave } = req.params;
    const { valor, tipo } = req.body;
    const config = await ConfigService.atualizar(chave, valor, tipo, req.file);
    res.json(config);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listarConfigs, atualizarConfig };
