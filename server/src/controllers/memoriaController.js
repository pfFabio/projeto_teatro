// =============================================================================
// Controller de Memória da Companhia
// =============================================================================

const MemoriaService = require('../services/memoriaService');

async function listarMemoria(req, res, next) {
  try {
    const dados = await MemoriaService.listar();
    res.json(dados);
  } catch (erro) {
    next(erro);
  }
}

async function criarItem(req, res, next) {
  try {
    const item = await MemoriaService.criar(req.body);
    res.status(201).json(item);
  } catch (erro) {
    next(erro);
  }
}

async function atualizarItem(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await MemoriaService.atualizar(id, req.body);
    res.json(item);
  } catch (erro) {
    next(erro);
  }
}

async function deletarItem(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const resultado = await MemoriaService.deletar(id);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  listarMemoria,
  criarItem,
  atualizarItem,
  deletarItem,
};

