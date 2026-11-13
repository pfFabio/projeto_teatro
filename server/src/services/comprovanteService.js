// =============================================================================
// Theatrum — ComprovanteService (Gestão Financeira e Prestação de Contas)
// Single Responsibility: Lógica de negócio, auditoria e persistência de comprovantes
// =============================================================================

const prisma = require('../lib/prisma');
const FileService = require('./fileService');
const AppError = require('../errors/AppError');
const {
  validarCriacaoComprovante,
  validarAtualizacaoComprovante,
} = require('../validators/comprovanteValidator');

class ComprovanteService {
  /**
   * Lista todos os comprovantes aplicando filtros e calculando o somatório total
   */
  static async listar({ pecaId, colaboradorId, categoria, busca } = {}) {
    const where = {};

    if (pecaId) {
      where.pecaId = Number(pecaId);
    }

    if (colaboradorId) {
      where.colaboradorId = Number(colaboradorId);
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      where.OR = [
        { titulo: { contains: termo } },
        { descricao: { contains: termo } },
      ];
    }

    const comprovantes = await prisma.comprovante.findMany({
      where,
      include: {
        peca: {
          select: { id: true, titulo: true },
        },
        colaborador: {
          select: { id: true, nome: true, nomeArtistico: true, funcao: true },
        },
      },
      orderBy: [{ dataComprovante: 'desc' }, { criadoEm: 'desc' }],
    });

    const valorTotal = comprovantes.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

    return {
      comprovantes,
      total: comprovantes.length,
      valorTotal: Math.round(valorTotal * 100) / 100,
    };
  }

  /**
   * Busca um comprovante por ID
   */
  static async buscarPorId(id) {
    const comprovante = await prisma.comprovante.findUnique({
      where: { id: Number(id) },
      include: {
        peca: {
          select: { id: true, titulo: true },
        },
        colaborador: {
          select: { id: true, nome: true, nomeArtistico: true, funcao: true },
        },
      },
    });

    if (!comprovante) {
      throw AppError.notFound('Comprovante não encontrado');
    }

    return comprovante;
  }

  /**
   * Obtém os bytes do arquivo para download autenticado
   */
  static async obterArquivo(id) {
    const comprovante = await this.buscarPorId(id);
    const buffer = await FileService.obterBufferArquivo(comprovante.arquivoUrl);

    if (!buffer) {
      throw AppError.notFound('Arquivo físico do comprovante não encontrado');
    }

    return {
      buffer,
      mimetype: comprovante.mimetype || 'application/pdf',
      nomeOriginal: comprovante.arquivoNome || 'comprovante.pdf',
    };
  }

  /**
   * Cria um novo comprovante salvando o arquivo e persistindo metadados
   */
  static async criar(dados, arquivo) {
    const validacao = validarCriacaoComprovante(dados, arquivo);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    // Prefixo comprovante- no arquivo
    arquivo.fieldname = 'comprovante';
    const arquivoSalvo = await FileService.salvarArquivo(arquivo);

    try {
      const novo = await prisma.comprovante.create({
        data: {
          titulo: dados.titulo.trim(),
          descricao: dados.descricao ? dados.descricao.trim() : null,
          valor: Number(dados.valor),
          dataComprovante: dados.dataComprovante.trim(),
          categoria: dados.categoria || 'OUTROS',
          arquivoUrl: arquivoSalvo.url,
          arquivoNome: arquivo.originalname || arquivoSalvo.nomeArquivo,
          mimetype: arquivoSalvo.mimetype,
          tamanho: arquivoSalvo.tamanho,
          pecaId: dados.pecaId ? Number(dados.pecaId) : null,
          colaboradorId: dados.colaboradorId ? Number(dados.colaboradorId) : null,
          extraidoPorIA: Boolean(dados.extraidoPorIA),
          revisadoPor: dados.revisadoPor ? String(dados.revisadoPor).trim() : null,
        },
        include: {
          peca: { select: { id: true, titulo: true } },
          colaborador: { select: { id: true, nome: true, nomeArtistico: true, funcao: true } },
        },
      });

      return novo;
    } catch (erro) {
      if (arquivoSalvo?.url) {
        await FileService.removerArquivo(arquivoSalvo.url);
      }
      throw erro;
    }
  }

  /**
   * Atualiza dados de um comprovante existente e opcionalmente substitui o arquivo
   */
  static async atualizar(id, dados = {}, novoArquivo = null) {
    const comprovanteExistente = await this.buscarPorId(id);

    const validacao = validarAtualizacaoComprovante(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const dataUpdate = {};

    if (dados.titulo !== undefined) dataUpdate.titulo = dados.titulo.trim();
    if (dados.descricao !== undefined) dataUpdate.descricao = dados.descricao ? dados.descricao.trim() : null;
    if (dados.valor !== undefined) dataUpdate.valor = Number(dados.valor);
    if (dados.dataComprovante !== undefined) dataUpdate.dataComprovante = dados.dataComprovante.trim();
    if (dados.categoria !== undefined) dataUpdate.categoria = dados.categoria;
    if (dados.pecaId !== undefined) dataUpdate.pecaId = dados.pecaId ? Number(dados.pecaId) : null;
    if (dados.colaboradorId !== undefined) dataUpdate.colaboradorId = dados.colaboradorId ? Number(dados.colaboradorId) : null;
    if (dados.extraidoPorIA !== undefined) dataUpdate.extraidoPorIA = Boolean(dados.extraidoPorIA);
    if (dados.revisadoPor !== undefined) dataUpdate.revisadoPor = dados.revisadoPor ? String(dados.revisadoPor).trim() : null;

    let arquivoSalvo = null;
    if (novoArquivo) {
      novoArquivo.fieldname = 'comprovante';
      arquivoSalvo = await FileService.salvarArquivo(novoArquivo);
      dataUpdate.arquivoUrl = arquivoSalvo.url;
      dataUpdate.arquivoNome = novoArquivo.originalname || arquivoSalvo.nomeArquivo;
      dataUpdate.mimetype = arquivoSalvo.mimetype;
      dataUpdate.tamanho = arquivoSalvo.tamanho;
    }

    try {
      const atualizado = await prisma.comprovante.update({
        where: { id: Number(id) },
        data: dataUpdate,
        include: {
          peca: { select: { id: true, titulo: true } },
          colaborador: { select: { id: true, nome: true, nomeArtistico: true, funcao: true } },
        },
      });

      if (arquivoSalvo && comprovanteExistente.arquivoUrl) {
        await FileService.removerArquivo(comprovanteExistente.arquivoUrl);
      }

      return atualizado;
    } catch (erro) {
      if (arquivoSalvo?.url) {
        await FileService.removerArquivo(arquivoSalvo.url);
      }
      throw erro;
    }
  }

  /**
   * Remove comprovante e deleta arquivo correspondente
   */
  static async deletar(id) {
    const comprovante = await this.buscarPorId(id);

    await prisma.comprovante.delete({
      where: { id: Number(id) },
    });

    if (comprovante.arquivoUrl) {
      await FileService.removerArquivo(comprovante.arquivoUrl);
    }

    return true;
  }
}

module.exports = ComprovanteService;
