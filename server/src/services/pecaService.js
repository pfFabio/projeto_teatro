// =============================================================================
// Theatrum — Service de Peças de Teatro
// Regras de negócio, busca, paginação, CRUD e alocação de equipe
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
        colaboradores: {
          include: {
            colaborador: {
              select: {
                id: true,
                nome: true,
                funcao: true,
                fotoUrl: true,
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

    const { titulo, resumo, endereco, latitude, longitude, dataEstreia, status } = dados;

    const peca = await prisma.peca.create({
      data: {
        titulo: titulo.trim(),
        resumo: resumo.trim(),
        endereco: endereco.trim(),
        latitude: latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(latitude) : null,
        longitude: longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(longitude) : null,
        dataEstreia: dataEstreia || null,
        status: status || 'PROGRAMADA',
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

    const { titulo, resumo, endereco, latitude, longitude, dataEstreia, status } = dados;

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

    const pecaAtualizada = await prisma.peca.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        fotos: { orderBy: { ordem: 'asc' } },
        locais: { orderBy: { dataEstreia: 'asc' } },
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
      include: { fotos: true },
    });

    if (!peca) {
      throw AppError.notFound(`Peça com ID ${id} não encontrada`);
    }

    // Coleta arquivos para remoção assíncrona
    const urlsArquivos = peca.fotos.map(f => f.url);

    // Deleta do banco (cascade cuidará de fotos_pecas, locais_pecas, peca_colaboradores)
    await prisma.peca.delete({
      where: { id },
    });

    // Remove do disco de forma não-bloqueante
    await FileService.removerMultiplosArquivos(urlsArquivos);

    return { mensagem: 'Peça deletada com sucesso' };
  }

  /**
   * Aloca colaborador em uma peça
   */
  static async alocarColaborador(pecaId, { colaboradorId, funcaoNaPeca }) {
    const validacao = validarAlocacao({ colaboradorId, funcaoNaPeca });
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const cId = parseInt(colaboradorId, 10);

    // Verifica existência de peça e colaborador
    const [peca, colaborador] = await Promise.all([
      prisma.peca.findUnique({ where: { id: pecaId } }),
      prisma.colaborador.findUnique({ where: { id: cId } }),
    ]);

    if (!peca) throw AppError.notFound(`Peça com ID ${pecaId} não encontrada`);
    if (!colaborador) throw AppError.notFound(`Colaborador com ID ${cId} não encontrado`);

    // Verifica se já está alocado
    const alocacaoExistente = await prisma.pecaColaborador.findUnique({
      where: {
        pecaId_colaboradorId: {
          pecaId,
          colaboradorId: cId,
        },
      },
    });

    if (alocacaoExistente) {
      throw AppError.conflict('Este colaborador já está alocado nesta peça');
    }

    const alocacao = await prisma.pecaColaborador.create({
      data: {
        pecaId,
        colaboradorId: cId,
        funcaoNaPeca: funcaoNaPeca.trim(),
      },
      include: { colaborador: true },
    });

    return alocacao;
  }

  /**
   * Remove colaborador de uma peça
   */
  static async removerColaborador(pecaId, colaboradorId) {
    const cId = parseInt(colaboradorId, 10);

    const alocacao = await prisma.pecaColaborador.findUnique({
      where: {
        pecaId_colaboradorId: {
          pecaId,
          colaboradorId: cId,
        },
      },
    });

    if (!alocacao) {
      throw AppError.notFound('Alocação não encontrada');
    }

    await prisma.pecaColaborador.delete({
      where: {
        pecaId_colaboradorId: {
          pecaId,
          colaboradorId: cId,
        },
      },
    });

    return { mensagem: 'Colaborador removido da peça com sucesso' };
  }
}

module.exports = PecaService;
