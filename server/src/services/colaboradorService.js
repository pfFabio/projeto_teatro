// =============================================================================
// Theatrum — Service de Colaboradores
// Gestão de colaboradores com proteção de dados pessoais (ISO 25010 / LGPD)
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const FileService = require('./fileService');
const { validarCriacaoColaborador, validarAtualizacaoColaborador } = require('../validators/colaboradorValidator');

class ColaboradorService {
  /**
   * Lista colaboradores (filtragem e paginação)
   * @param {Object} params - Filtros e paginação
   * @param {boolean} ehAdmin - Se true, inclui dados de contato sensíveis (celular, email, endereço)
   */
  static async listar({ funcao, genero, busca, pagina = 1, limite = 20 }, ehAdmin = false) {
    const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 20));

    const where = {};

    if (funcao && funcao.trim()) {
      where.funcao = { contains: funcao.trim(), mode: 'insensitive' };
    }

    if (genero && genero.trim()) {
      where.genero = genero.trim();
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      const condicoes = [
        { nome: { contains: termo, mode: 'insensitive' } },
        { funcao: { contains: termo, mode: 'insensitive' } },
      ];
      if (ehAdmin) {
        condicoes.push({ email: { contains: termo, mode: 'insensitive' } });
      }
      where.OR = condicoes;
    }

    const select = {
      id: true,
      nome: true,
      funcao: true,
      idade: true,
      genero: true,
      fotoUrl: true,
      criadoEm: true,
      pecas: {
        include: { peca: { select: { id: true, titulo: true, status: true } } },
      },
    };

    // Dados sensíveis liberados apenas para perfil autenticado de admin
    if (ehAdmin) {
      select.celular = true;
      select.email = true;
      select.endereco = true;
    }

    const [colaboradores, total] = await Promise.all([
      prisma.colaborador.findMany({
        where,
        select,
        orderBy: { criadoEm: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.colaborador.count({ where }),
    ]);

    return {
      colaboradores,
      total,
      pagina: pageNum,
      totalPaginas: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Busca colaborador por ID
   */
  static async buscarPorId(id, ehAdmin = false) {
    const select = {
      id: true,
      nome: true,
      funcao: true,
      idade: true,
      genero: true,
      fotoUrl: true,
      criadoEm: true,
      pecas: {
        include: {
          peca: true,
        },
      },
    };

    if (ehAdmin) {
      select.celular = true;
      select.email = true;
      select.endereco = true;
    }

    const colaborador = await prisma.colaborador.findUnique({
      where: { id },
      select,
    });

    if (!colaborador) {
      throw AppError.notFound(`Colaborador com ID ${id} não encontrado`);
    }

    return colaborador;
  }

  /**
   * Cadastra novo colaborador (público)
   */
  static async criar(dados, arquivoFoto = null) {
    const validacao = validarCriacaoColaborador(dados);
    if (!validacao.valido) {
      // Se foi feito upload mas validação falhou, remove arquivo temporário
      if (arquivoFoto) {
        await FileService.removerArquivo(`/uploads/${arquivoFoto.filename}`);
      }
      throw AppError.badRequest(validacao.mensagem);
    }

    const emailNormalizado = dados.email.trim().toLowerCase();

    // Verifica se email já está cadastrado
    const existente = await prisma.colaborador.findUnique({ where: { email: emailNormalizado } });
    if (existente) {
      if (arquivoFoto) {
        await FileService.removerArquivo(`/uploads/${arquivoFoto.filename}`);
      }
      throw AppError.conflict('Já existe um colaborador cadastrado com este email');
    }

    let fotoUrl = null;
    if (arquivoFoto) {
      fotoUrl = `/uploads/${arquivoFoto.filename}`;
    }

    const colaborador = await prisma.colaborador.create({
      data: {
        nome: dados.nome.trim(),
        funcao: dados.funcao.trim(),
        idade: parseInt(dados.idade, 10),
        celular: dados.celular.trim(),
        email: emailNormalizado,
        endereco: dados.endereco.trim(),
        genero: dados.genero.trim(),
        fotoUrl,
      },
    });

    return colaborador;
  }

  /**
   * Atualiza dados de colaborador (admin)
   */
  static async atualizar(id, dados, novoArquivoFoto = null) {
    const validacao = validarAtualizacaoColaborador(dados);
    if (!validacao.valido) {
      if (novoArquivoFoto) {
        await FileService.removerArquivo(`/uploads/${novoArquivoFoto.filename}`);
      }
      throw AppError.badRequest(validacao.mensagem);
    }

    const antigo = await prisma.colaborador.findUnique({ where: { id } });
    if (!antigo) {
      if (novoArquivoFoto) {
        await FileService.removerArquivo(`/uploads/${novoArquivoFoto.filename}`);
      }
      throw AppError.notFound(`Colaborador com ID ${id} não encontrado`);
    }

    const dadosAtualizacao = {};
    if (dados.nome !== undefined) dadosAtualizacao.nome = dados.nome.trim();
    if (dados.funcao !== undefined) dadosAtualizacao.funcao = dados.funcao.trim();
    if (dados.idade !== undefined) dadosAtualizacao.idade = parseInt(dados.idade, 10);
    if (dados.celular !== undefined) dadosAtualizacao.celular = dados.celular.trim();
    if (dados.endereco !== undefined) dadosAtualizacao.endereco = dados.endereco.trim();
    if (dados.genero !== undefined) dadosAtualizacao.genero = dados.genero.trim();

    if (dados.email !== undefined) {
      const emailNorm = dados.email.trim().toLowerCase();
      if (emailNorm !== antigo.email) {
        const outroComEmail = await prisma.colaborador.findUnique({ where: { email: emailNorm } });
        if (outroComEmail) {
          if (novoArquivoFoto) {
            await FileService.removerArquivo(`/uploads/${novoArquivoFoto.filename}`);
          }
          throw AppError.conflict('Já existe outro colaborador cadastrado com este email');
        }
        dadosAtualizacao.email = emailNorm;
      }
    }

    // Se uma nova foto foi enviada, deleta a foto anterior do disco
    if (novoArquivoFoto) {
      if (antigo.fotoUrl) {
        await FileService.removerArquivo(antigo.fotoUrl);
      }
      dadosAtualizacao.fotoUrl = `/uploads/${novoArquivoFoto.filename}`;
    }

    const colaboradorAtualizado = await prisma.colaborador.update({
      where: { id },
      data: dadosAtualizacao,
    });

    return colaboradorAtualizado;
  }

  /**
   * Deleta colaborador e remove foto física associada
   */
  static async deletar(id) {
    const colaborador = await prisma.colaborador.findUnique({ where: { id } });
    if (!colaborador) {
      throw AppError.notFound(`Colaborador com ID ${id} não encontrado`);
    }

    if (colaborador.fotoUrl) {
      await FileService.removerArquivo(colaborador.fotoUrl);
    }

    await prisma.colaborador.delete({ where: { id } });

    return { mensagem: 'Colaborador deletado com sucesso' };
  }
}

module.exports = ColaboradorService;
