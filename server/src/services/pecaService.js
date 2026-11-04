// =============================================================================
// Theatrum — Service de Peças de Teatro
// Regras de negócio, busca, paginação, CRUD, alocação de equipe e downloads técnicos
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const FileService = require('./fileService');
const { validarCriacaoPeca, validarAtualizacaoPeca, validarAlocacao } = require('../validators/pecaValidator');

class PecaService {
  /**
   * Lista peças com filtros e paginação
   */
  static async listar({ status, busca, cidade, pagina = 1, limite = 20 }) {
    const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 20));

    const where = {};

    if (status) {
      where.status = status;
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      where.OR = [
        { titulo: { contains: termo, mode: 'insensitive' } },
        { resumo: { contains: termo, mode: 'insensitive' } },
        { endereco: { contains: termo, mode: 'insensitive' } },
        {
          locais: {
            some: {
              OR: [
                { cidade: { contains: termo, mode: 'insensitive' } },
                { nomeLocal: { contains: termo, mode: 'insensitive' } },
                { endereco: { contains: termo, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    if (cidade && cidade.trim()) {
      where.locais = { some: { cidade: { contains: cidade.trim(), mode: 'insensitive' } } };
    }

    const [pecas, total] = await Promise.all([
      prisma.peca.findMany({
        where,
        include: {
          fotos: { orderBy: { ordem: 'asc' }, take: 1 },
          locais: { orderBy: { dataEstreia: 'asc' } },
          _count: { select: { colaboradores: true } },
        },
        orderBy: { criadoEm: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.peca.count({ where }),
    ]);

    return {
      pecas,
      total,
      pagina: pageNum,
      totalPaginas: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Busca peça por ID com todos os relacionamentos
   */
  static async buscarPorId(id) {
    const peca = await prisma.peca.findUnique({
      where: { id },
      include: {
        fotos: { orderBy: { ordem: 'asc' } },
        locais: { orderBy: { dataEstreia: 'asc' } },
        downloadsTecnicos: { orderBy: { ordem: 'asc' } },
        colaboradores: {
          include: {
            colaborador: {
              select: {
                id: true,
                nome: true,
                nomeArtistico: true,
                funcao: true,
                fotoUrl: true,
                redeSocial: true,
              },
            },
          },
          orderBy: { funcaoNaPeca: 'asc' },
        },
      },
    });

    if (!peca) {
      throw AppError.notFound(`Peça com ID ${id} não encontrada`);
    }

    return peca;
  }

  /**
   * Cria nova peça
   */
  static async criar(dados) {
    const validacao = validarCriacaoPeca(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const { titulo, resumo, endereco, latitude, longitude, dataEstreia, status, linkIngresso } = dados;

    const peca = await prisma.peca.create({
      data: {
        titulo: titulo.trim(),
        resumo: resumo.trim(),
        endereco: endereco.trim(),
        latitude: latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(latitude) : null,
        longitude: longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(longitude) : null,
        dataEstreia: dataEstreia || null,
        status: status || 'PROGRAMADA',
        linkIngresso: linkIngresso ? linkIngresso.trim() : null,
      },
    });

    return peca;
  }

  /**
   * Atualiza peça existente
   */
  static async atualizar(id, dados) {
    const validacao = validarAtualizacaoPeca(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    // Verifica existência
    const pecaExistente = await prisma.peca.findUnique({ where: { id } });
    if (!pecaExistente) {
      throw AppError.notFound(`Peça com ID ${id} não encontrada`);
    }

    const { titulo, resumo, endereco, latitude, longitude, dataEstreia, status, linkIngresso } = dados;

    const dadosAtualizacao = {};
    if (titulo !== undefined) dadosAtualizacao.titulo = titulo.trim();
    if (resumo !== undefined) dadosAtualizacao.resumo = resumo.trim();
    if (endereco !== undefined) dadosAtualizacao.endereco = endereco.trim();
    if (latitude !== undefined) {
      dadosAtualizacao.latitude = latitude !== null && latitude !== '' ? parseFloat(latitude) : null;
    }
    if (longitude !== undefined) {
      dadosAtualizacao.longitude = longitude !== null && longitude !== '' ? parseFloat(longitude) : null;
    }
    if (dataEstreia !== undefined) dadosAtualizacao.dataEstreia = dataEstreia || null;
    if (status !== undefined) dadosAtualizacao.status = status;
    if (linkIngresso !== undefined) dadosAtualizacao.linkIngresso = linkIngresso ? linkIngresso.trim() : null;

    const pecaAtualizada = await prisma.peca.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        fotos: { orderBy: { ordem: 'asc' } },
        locais: { orderBy: { dataEstreia: 'asc' } },
        downloadsTecnicos: { orderBy: { ordem: 'asc' } },
      },
    });

    return pecaAtualizada;
  }

  /**
   * Deleta peça e remove seus arquivos físicos em disco assincronamente
   */
  static async deletar(id) {
    const peca = await prisma.peca.findUnique({
      where: { id },
      include: { fotos: true, downloadsTecnicos: true },
    });

    if (!peca) {
      throw AppError.notFound(`Peça com ID ${id} não encontrada`);
    }

    if (peca.fotos && peca.fotos.length > 0) {
      const urls = peca.fotos.map((f) => f.url);
      FileService.removerMultiplosArquivos(urls).catch(() => {});
    }

    await prisma.peca.delete({ where: { id } });

    return { mensagem: 'Peça deletada com sucesso' };
  }

  /**
   * Adiciona download técnico a uma peça
   */
  static async adicionarDownloadTecnico(pecaId, { titulo, descricao, url, tamanho, formato }) {
    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      throw AppError.badRequest('Título do material é obrigatório');
    }
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw AppError.badRequest('URL ou link do arquivo é obrigatório');
    }

    const peca = await prisma.peca.findUnique({ where: { id: pecaId } });
    if (!peca) {
      throw AppError.notFound(`Peça com ID ${pecaId} não encontrada`);
    }

    const download = await prisma.downloadTecnico.create({
      data: {
        pecaId,
        titulo: titulo.trim(),
        descricao: descricao ? descricao.trim() : null,
        url: url.trim(),
        tamanho: tamanho ? tamanho.trim() : null,
        formato: formato ? formato.trim().toUpperCase() : 'PDF',
      },
    });

    return download;
  }

  /**
   * Remove download técnico
   */
  static async removerDownloadTecnico(downloadId) {
    const download = await prisma.downloadTecnico.findUnique({ where: { id: downloadId } });
    if (!download) {
      throw AppError.notFound(`Download técnico ${downloadId} não encontrado`);
    }

    await prisma.downloadTecnico.delete({ where: { id: downloadId } });
    return { mensagem: 'Download técnico removido com sucesso' };
  }

  /**
   * Aloca colaborador em uma peça
   */
  static async alocarColaborador(pecaId, dados) {
    const validacao = validarAlocacao(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const { colaboradorId, funcaoNaPeca } = dados;
    const colabIdNum = parseInt(colaboradorId, 10);

    const [peca, colaborador] = await Promise.all([
      prisma.peca.findUnique({ where: { id: pecaId } }),
      prisma.colaborador.findUnique({ where: { id: colabIdNum } }),
    ]);

    if (!peca) throw AppError.notFound(`Peça com ID ${pecaId} não encontrada`);
    if (!colaborador) throw AppError.notFound(`Colaborador com ID ${colabIdNum} não encontrado`);

    const alocacaoExistente = await prisma.pecaColaborador.findUnique({
      where: { pecaId_colaboradorId: { pecaId, colaboradorId: colabIdNum } },
    });

    if (alocacaoExistente) {
      const atualizada = await prisma.pecaColaborador.update({
        where: { id: alocacaoExistente.id },
        data: { funcaoNaPeca: funcaoNaPeca.trim() },
        include: { colaborador: true },
      });
      return atualizada;
    }

    const alocacao = await prisma.pecaColaborador.create({
      data: {
        pecaId,
        colaboradorId: colabIdNum,
        funcaoNaPeca: funcaoNaPeca.trim(),
      },
      include: { colaborador: true },
    });

    return alocacao;
  }

  /**
   * Desaloca colaborador de uma peça
   */
  static async desalocarColaborador(pecaId, colaboradorId) {
    const colabIdNum = parseInt(colaboradorId, 10);

    const alocacao = await prisma.pecaColaborador.findUnique({
      where: { pecaId_colaboradorId: { pecaId, colaboradorId: colabIdNum } },
    });

    if (!alocacao) {
      throw AppError.notFound('Colaborador não está alocado nesta peça');
    }

    await prisma.pecaColaborador.delete({ where: { id: alocacao.id } });

    return { mensagem: 'Colaborador desalocado com sucesso' };
  }
}

module.exports = PecaService;
