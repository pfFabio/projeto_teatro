// =============================================================================
// Controller de Locais de Apresentação
// Single Responsibility: mapeamento HTTP delegando para LocalService
// =============================================================================

const LocalService = require('../services/localService');

// POST /api/pecas/:id/locais — Adicionar novo local/apresentação à peça (admin only)
async function adicionarLocal(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const local = await LocalService.adicionarLocal(pecaId, req.body);
    res.status(201).json(local);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/pecas/:id/locais/:localId — Atualizar local/apresentação (admin only)
async function atualizarLocal(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const localId = req.params.localIdNum || parseInt(req.params.localId, 10);
    const local = await LocalService.atualizarLocal(pecaId, localId, req.body);
    res.json(local);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/pecas/:id/locais/:localId — Deletar local/apresentação (admin only)
async function deletarLocal(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const localId = req.params.localIdNum || parseInt(req.params.localId, 10);
    const resultado = await LocalService.deletarLocal(pecaId, localId);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  adicionarLocal,
  atualizarLocal,
  deletarLocal,
};
