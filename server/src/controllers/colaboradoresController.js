// =============================================================================
// Controller de Colaboradores
// Mapeamento HTTP/REST delegando para ColaboradorService
// =============================================================================

const ColaboradorService = require('../services/colaboradorService');

// GET /api/colaboradores — Listar todos (com filtros e proteção de dados sensíveis)
async function listarColaboradores(req, res, next) {
  try {
    const { funcao, genero, busca, pagina, limite } = req.query;
    const ehAdmin = req.usuario?.papel === 'ADMIN';
    const resultado = await ColaboradorService.listar({ funcao, genero, busca, pagina, limite }, ehAdmin);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// GET /api/colaboradores/:id — Detalhes de um colaborador
async function buscarColaborador(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const ehAdmin = req.usuario?.papel === 'ADMIN';
    const colaborador = await ColaboradorService.buscarPorId(id, ehAdmin);
    res.json(colaborador);
  } catch (erro) {
    next(erro);
  }
}

// POST /api/colaboradores — Cadastrar novo colaborador (acesso público)
async function criarColaborador(req, res, next) {
  try {
    const colaborador = await ColaboradorService.criar(req.body, req.file);
    res.status(201).json(colaborador);
  } catch (erro) {
    next(erro);
  }
}

// PUT /api/colaboradores/:id — Atualizar colaborador (admin only)
async function atualizarColaborador(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const colaborador = await ColaboradorService.atualizar(id, req.body, req.file);
    res.json(colaborador);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /api/colaboradores/:id — Deletar colaborador (admin only)
async function deletarColaborador(req, res, next) {
  try {
    const id = req.params.idNum || parseInt(req.params.id, 10);
    const resultado = await ColaboradorService.deletar(id);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  listarColaboradores,
  buscarColaborador,
  criarColaborador,
  atualizarColaborador,
  deletarColaborador,
};
