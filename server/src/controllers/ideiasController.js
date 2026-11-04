// =============================================================================
// Controller de Ideias e Mensagens Públicas
// =============================================================================

const IdeiaService = require('../services/ideiaService');

async function criarIdeia(req, res, next) {
  try {
    const resultado = await IdeiaService.criar(req.body);
    res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function listarIdeias(req, res, next) {
  try {
    const { status, busca, pagina, limite } = req.query;
    const resultado = await IdeiaService.listar({ status, busca, pagina, limite });
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function atualizarStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    const resultado = await IdeiaService.atualizarStatus(id, status);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function deletarIdeia(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const resultado = await IdeiaService.deletar(id);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  criarIdeia,
  listarIdeias,
  atualizarStatus,
  deletarIdeia,
};

