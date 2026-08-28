// =============================================================================
// Theatrum — Controller de Propagandas / Anúncios
// Processamento de requisições HTTP e invocação de services
// =============================================================================

const PropagandaService = require('../services/propagandaService');

/**
 * GET /api/propagandas
 * Lista propagandas (suporta filtros: ?limite=5&ativo=true&busca=texto)
 */
async function listarPropagandas(req, res, next) {
  try {
    const resultado = await PropagandaService.listar(req.query);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

/**
 * GET /api/propagandas/:id
 * Busca detalhes de uma propaganda específica
 */
async function buscarPropaganda(req, res, next) {
  try {
    const propaganda = await PropagandaService.buscarPorId(req.params.id);
    res.json(propaganda);
  } catch (erro) {
    next(erro);
  }
}

/**
 * POST /api/propagandas
 * Cria uma nova propaganda (com upload opcional de fotos)
 */
async function criarPropaganda(req, res, next) {
  try {
    const arquivos = req.files || (req.file ? [req.file] : []);
    const propaganda = await PropagandaService.criar(req.body, arquivos);
    res.status(201).json(propaganda);
  } catch (erro) {
    next(erro);
  }
}

/**
 * PUT /api/propagandas/:id
 * Atualiza textos e status de uma propaganda
 */
async function atualizarPropaganda(req, res, next) {
  try {
    const propaganda = await PropagandaService.atualizar(req.params.id, req.body);
    res.json(propaganda);
  } catch (erro) {
    next(erro);
  }
}

/**
 * DELETE /api/propagandas/:id
 * Exclui uma propaganda e todos os seus arquivos
 */
async function deletarPropaganda(req, res, next) {
  try {
    const resultado = await PropagandaService.deletar(req.params.id);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

/**
 * POST /api/propagandas/:id/fotos
 * Adiciona fotos a uma propaganda existente
 */
async function adicionarFotos(req, res, next) {
  try {
    const arquivos = req.files || (req.file ? [req.file] : []);
    const fotos = await PropagandaService.adicionarFotos(req.params.id, arquivos);
    res.status(201).json(fotos);
  } catch (erro) {
    next(erro);
  }
}

/**
 * DELETE /api/propagandas/:id/fotos/:fotoId
 * Exclui uma foto de uma propaganda
 */
async function deletarFoto(req, res, next) {
  try {
    const resultado = await PropagandaService.deletarFoto(req.params.id, req.params.fotoId);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

/**
 * PUT /api/propagandas/:id/fotos/reordenar
 * Reordena as fotos de uma propaganda
 */
async function reordenarFotos(req, res, next) {
  try {
    const fotos = await PropagandaService.reordenarFotos(req.params.id, req.body.fotosIds);
    res.json(fotos);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  listarPropagandas,
  buscarPropaganda,
  criarPropaganda,
  atualizarPropaganda,
  deletarPropaganda,
  adicionarFotos,
  deletarFoto,
  reordenarFotos,
};
