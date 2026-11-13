// =============================================================================
// Theatrum — Controller de Comprovantes de Despesa
// Single Responsibility: Tratamento de requisições HTTP e serialização de respostas
// =============================================================================

const ComprovanteService = require('../services/comprovanteService');
const { obterExtratorIA } = require('../services/ai');
const AppError = require('../errors/AppError');
const logger = require('../lib/logger');

async function extrairDadosComprovante(req, res, next) {
  try {
    if (!req.file) {
      throw AppError.badRequest('Arquivo do comprovante é obrigatório para extração assistida.');
    }

    const extrator = obterExtratorIA();
    try {
      const resultado = await extrator.extrair(req.file);
      return res.json({
        sucesso: true,
        ...resultado,
      });
    } catch (errIA) {
      logger.warn('Falha na extração por IA, acionando fallback manual:', errIA.message);
      return res.json({
        sucesso: false,
        mensagem: 'Não foi possível extrair os dados automaticamente. Prossiga com o preenchimento manual.',
        fallbackManual: true,
        dados: null,
      });
    }
  } catch (erro) {
    next(erro);
  }
}

async function listarComprovantes(req, res, next) {
  try {
    const { pecaId, colaboradorId, categoria, busca } = req.query;
    const resultado = await ComprovanteService.listar({
      pecaId,
      colaboradorId,
      categoria,
      busca,
    });
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
}

async function buscarComprovante(req, res, next) {
  try {
    const comprovante = await ComprovanteService.buscarPorId(req.params.id);
    res.json(comprovante);
  } catch (erro) {
    next(erro);
  }
}

async function baixarArquivoComprovante(req, res, next) {
  try {
    const { buffer, mimetype, nomeOriginal } = await ComprovanteService.obterArquivo(req.params.id);
    const nomeCodificado = encodeURIComponent(nomeOriginal);
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${nomeCodificado}"; filename*=UTF-8''${nomeCodificado}`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(buffer);
  } catch (erro) {
    next(erro);
  }
}

async function criarComprovante(req, res, next) {
  try {
    const novo = await ComprovanteService.criar(req.body, req.file);
    res.status(201).json(novo);
  } catch (erro) {
    next(erro);
  }
}

async function atualizarComprovante(req, res, next) {
  try {
    const atualizado = await ComprovanteService.atualizar(req.params.id, req.body, req.file);
    res.json(atualizado);
  } catch (erro) {
    next(erro);
  }
}

async function deletarComprovante(req, res, next) {
  try {
    await ComprovanteService.deletar(req.params.id);
    res.json({ sucesso: true, mensagem: 'Comprovante excluído com sucesso' });
  } catch (erro) {
    next(erro);
  }
}

module.exports = {
  listarComprovantes,
  buscarComprovante,
  baixarArquivoComprovante,
  criarComprovante,
  atualizarComprovante,
  deletarComprovante,
  extrairDadosComprovante,
};

