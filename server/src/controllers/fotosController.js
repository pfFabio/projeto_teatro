// =============================================================================
// Controller de Fotos/Mídias de Peças
// Single Responsibility: mapeamento HTTP delegando para FotoService
// =============================================================================

const FotoService = require('../services/fotoService');

// POST /api/pecas/:id/fotos — Upload de fotos/vídeos da peça (admin only)
async function adicionarFotos(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const { descricao } = req.body;
    const fotos = await FotoService.adicionarFotos(pecaId, req.files, descricao);
    res.status(201).json(fotos);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/pecas/:pecaId/fotos/:fotoId — Deletar foto (admin only)
async function deletarFoto(req, res, next) {
  try {
    const pecaId = req.params.pecaIdNum || parseInt(req.params.pecaId, 10);
    const fotoId = req.params.fotoIdNum || parseInt(req.params.fotoId, 10);
    const resultado = await FotoService.deletarFoto(pecaId, fotoId);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/pecas/:id/fotos/reordenar — Alterar ordem das fotos da peça (admin only)
async function reordenarFotos(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const { fotosIds } = req.body;
    const fotosAtualizadas = await FotoService.reordenarFotos(pecaId, fotosIds);
    res.json(fotosAtualizadas);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/pecas/:id/fotos/:fotoId/capa — Definir foto como capa principal (admin only)
async function definirFotoCapa(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const fotoId = req.params.fotoIdNum || parseInt(req.params.fotoId, 10);
    const fotosAtualizadas = await FotoService.definirFotoCapa(pecaId, fotoId);
    res.json(fotosAtualizadas);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  adicionarFotos,
  deletarFoto,
  reordenarFotos,
  definirFotoCapa,
};
