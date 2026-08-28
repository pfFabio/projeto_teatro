// =============================================================================
// Theatrum — Service de Propagandas / Anúncios
// Regras de negócio, persistência no PostgreSQL, fotos e ciclo de vida
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const FileService = require('./fileService');
const {
  validarCriacaoPropaganda,
  validarAtualizacaoPropaganda,
  validarReordenacaoFotos,
} = require('../validators/propagandaValidator');

class PropagandaService {
  /**
   * Lista propagandas com filtros e paginação
   * @param {Object} params - { limite, ativo, busca, pagina }
   */
  static async listar({ limite = 20, ativo, busca, pagina = 1 } = {}) {
    const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 20));

    const where = {};

    if (ativo !== undefined && ativo !== null && ativo !== '') {
      where.ativo = String(ativo) === 'true';
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      where.OR = [
        { titulo: { contains: termo, mode: 'insensitive' } },
        { descricao: { contains: termo, mode: 'insensitive' } },
      ];
    }

    const [propagandas, total] = await Promise.all([
      prisma.propaganda.findMany({
        where,
        include: {
          fotos: {
            orderBy: { ordem: 'asc' },
          },
        },
        orderBy: [
          { ordem: 'asc' },
          { criadoEm: 'desc' },
        ],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.propaganda.count({ where }),
    ]);

    return {
      propagandas,
      total,
      pagina: pageNum,
      totalPaginas: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Busca propaganda por ID com fotos
   * @param {number} id
   */
  static async buscarPorId(id) {
    const idNum = parseInt(id, 10);
    const propaganda = await prisma.propaganda.findUnique({
      where: { id: idNum },
      include: {
        fotos: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!propaganda) {
      throw AppError.notFound(`Propaganda com ID ${id} não encontrada`);
    }

    return propaganda;
  }

  /**
   * Cria nova propaganda, opcionalmente com fotos anexadas
   * @param {Object} dados
   * @param {Object[]} arquivos - Array de arquivos do Multer
   */
  static async criar(dados = {}, arquivos = []) {
    const validacao = validarCriacaoPropaganda(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const { titulo, descricao, link, textoBotao, ativo, ordem } = dados;

    const propaganda = await prisma.propaganda.create({
      data: {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        link: link ? link.trim() : null,
        textoBotao: textoBotao ? textoBotao.trim() : 'Saiba Mais',
        ativo: ativo !== undefined ? (String(ativo) === 'true') : true,
        ordem: ordem !== undefined ? parseInt(ordem, 10) || 0 : 0,
      },
    });

    // Se houver arquivos enviados no momento da criação
    if (Array.isArray(arquivos) && arquivos.length > 0) {
      const fotosSalvas = await FileService.salvarMultiplosArquivos(arquivos);
      if (fotosSalvas.length > 0) {
        await prisma.fotoPropaganda.createMany({
          data: fotosSalvas.map((foto, index) => ({
            propagandaId: propaganda.id,
            url: foto.url,
            ordem: index,
          })),
        });
      }
    }

    return PropagandaService.buscarPorId(propaganda.id);
  }

  /**
   * Atualiza dados de texto e status da propaganda
   * @param {number} id
   * @param {Object} dados
   */
  static async atualizar(id, dados = {}) {
    const idNum = parseInt(id, 10);
    const validacao = validarAtualizacaoPropaganda(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const propagandaExistente = await prisma.propaganda.findUnique({
      where: { id: idNum },
    });

    if (!propagandaExistente) {
      throw AppError.notFound(`Propaganda com ID ${id} não encontrada`);
    }

    const dadosAtualizacao = {};
    if (dados.titulo !== undefined) dadosAtualizacao.titulo = dados.titulo.trim();
    if (dados.descricao !== undefined) dadosAtualizacao.descricao = dados.descricao.trim();
    if (dados.link !== undefined) dadosAtualizacao.link = dados.link ? dados.link.trim() : null;
    if (dados.textoBotao !== undefined) dadosAtualizacao.textoBotao = dados.textoBotao ? dados.textoBotao.trim() : 'Saiba Mais';
    if (dados.ativo !== undefined) dadosAtualizacao.ativo = String(dados.ativo) === 'true';
    if (dados.ordem !== undefined) dadosAtualizacao.ordem = parseInt(dados.ordem, 10) || 0;

    await prisma.propaganda.update({
      where: { id: idNum },
      data: dadosAtualizacao,
    });

    return PropagandaService.buscarPorId(idNum);
  }

  /**
   * Deleta propaganda e todos os seus arquivos de imagem assincronamente
   * @param {number} id
   */
  static async deletar(id) {
    const idNum = parseInt(id, 10);
    const propaganda = await prisma.propaganda.findUnique({
      where: { id: idNum },
      include: { fotos: true },
    });

    if (!propaganda) {
      throw AppError.notFound(`Propaganda com ID ${id} não encontrada`);
    }

    const urlsArquivos = propaganda.fotos.map(f => f.url);

    // Deleta do banco (onDelete: Cascade remove fotos_propagandas)
    await prisma.propaganda.delete({
      where: { id: idNum },
    });

    // Remove do disco e do PostgreSQL Arquivo
    await FileService.removerMultiplosArquivos(urlsArquivos);

    return { mensagem: 'Propaganda e fotos excluídas com sucesso' };
  }

  /**
   * Adiciona novas fotos a uma propaganda existente
   * @param {number} propagandaId
   * @param {Object[]} arquivos
   */
  static async adicionarFotos(propagandaId, arquivos = []) {
    const idNum = parseInt(propagandaId, 10);
    const propaganda = await prisma.propaganda.findUnique({
      where: { id: idNum },
    });

    if (!propaganda) {
      throw AppError.notFound(`Propaganda com ID ${propagandaId} não encontrada`);
    }

    if (!Array.isArray(arquivos) || arquivos.length === 0) {
      throw AppError.badRequest('Nenhum arquivo enviado para upload');
    }

    const fotosSalvas = await FileService.salvarMultiplosArquivos(arquivos);
    if (fotosSalvas.length === 0) {
      throw AppError.badRequest('Falha ao processar arquivos enviados');
    }

    const agregacao = await prisma.fotoPropaganda.aggregate({
      where: { propagandaId: idNum },
      _max: { ordem: true },
    });
    const proximaOrdem = (agregacao._max.ordem !== null ? agregacao._max.ordem : -1) + 1;

    await prisma.fotoPropaganda.createMany({
      data: fotosSalvas.map((foto, index) => ({
        propagandaId: idNum,
        url: foto.url,
        ordem: proximaOrdem + index,
      })),
    });

    return prisma.fotoPropaganda.findMany({
      where: { propagandaId: idNum },
      orderBy: { ordem: 'asc' },
    });
  }

  /**
   * Deleta uma foto específica da propaganda
   * @param {number} propagandaId
   * @param {number} fotoId
   */
  static async deletarFoto(propagandaId, fotoId) {
    const pId = parseInt(propagandaId, 10);
    const fId = parseInt(fotoId, 10);

    const foto = await prisma.fotoPropaganda.findFirst({
      where: {
        id: fId,
        propagandaId: pId,
      },
    });

    if (!foto) {
      throw AppError.notFound('Foto não encontrada para esta propaganda');
    }

    await prisma.fotoPropaganda.delete({
      where: { id: fId },
    });

    await FileService.removerArquivo(foto.url);

    return { mensagem: 'Foto excluída com sucesso' };
  }

  /**
   * Reordena as fotos de uma propaganda
   * @param {number} propagandaId
   * @param {number[]} fotosIds
   */
  static async reordenarFotos(propagandaId, fotosIds) {
    const pId = parseInt(propagandaId, 10);
    const validacao = validarReordenacaoFotos(fotosIds);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const propaganda = await prisma.propaganda.findUnique({
      where: { id: pId },
    });

    if (!propaganda) {
      throw AppError.notFound(`Propaganda com ID ${propagandaId} não encontrada`);
    }

    const updates = fotosIds.map((fotoId, index) =>
      prisma.fotoPropaganda.updateMany({
        where: { id: Number(fotoId), propagandaId: pId },
        data: { ordem: index },
      })
    );

    await prisma.$transaction(updates);

    return prisma.fotoPropaganda.findMany({
      where: { propagandaId: pId },
      orderBy: { ordem: 'asc' },
    });
  }
}

module.exports = PropagandaService;
