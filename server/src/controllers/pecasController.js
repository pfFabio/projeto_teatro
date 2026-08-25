// =============================================================================
// Controller de Peças de Teatro
// Single Responsibility: mapeamento HTTP/REST delegando para PecaService
// =============================================================================

const PecaService = require('../services/pecaService');

// GET /api/pecas — Listar todas as peças (com filtros)
async function listarPecas(req, res, next) {
  try {
    const { status, busca, cidade, pagina, limite } = req.query;
    const resultado = await PecaService.listar({ status, busca, cidade, pagina, limite });
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/pecas/:id — Detalhes de uma peça
async function buscarPeca(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const peca = await PecaService.buscarPorId(id);
    res.json(peca);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/pecas — Criar nova peça (admin only)
async function criarPeca(req, res, next) {
  try {
    const peca = await PecaService.criar(req.body);
    res.status(201).json(peca);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/pecas/:id — Atualizar peça (admin only)
async function atualizarPeca(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const peca = await PecaService.atualizar(id, req.body);
    res.json(peca);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/pecas/:id — Deletar peça (admin only)
async function deletarPeca(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const resultado = await PecaService.deletar(id);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/pecas/:id/colaboradores — Alocar colaborador à peça (admin only)
async function alocarColaborador(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const alocacao = await PecaService.alocarColaborador(id, req.body);
    res.status(201).json(alocacao);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/pecas/:id/colaboradores/:colabId — Remover colaborador da peça
async function removerColaborador(req, res, next) {
  try {
    const pecaId = req.params.idNum || parseInt(req.params.id, 10);
    const colabId = req.params.colabIdNum || parseInt(req.params.colabId, 10);
    const resultado = await PecaService.removerColaborador(pecaId, colabId);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  listarPecas,
  buscarPeca,
  criarPeca,
  atualizarPeca,
  deletarPeca,
  alocarColaborador,
  removerColaborador,
};
