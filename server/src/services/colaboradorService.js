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
   * @param {boolean} ehAdmin - Se true, inclui dados sensíveis e confidenciais
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

    // Campos públicos — Princípio da Minimização de Dados (LGPD)
    const select = {
      id: true,
      nome: true,
      nomeArtistico: true,
      funcao: true,
      idade: true,
      genero: true,
      fotoUrl: true,
      redeSocial: true,
      criadoEm: true,
      pecas: {
        include: { peca: { select: { id: true, titulo: true, status: true } } },
      },
    };

    // Dados sensíveis e fiscais liberados APENAS para administrador autenticado
    if (ehAdmin) {
      select.celular = true;
      select.email = true;
      select.endereco = true;
      select.dataNascimento = true;
      select.etniaRaca = true;
      select.orientacaoSexual = true;
      select.cpf = true;
      select.rg = true;
      select.drtOmb = true;
      select.bairro = true;
      select.cidade = true;
      select.estado = true;
      select.cep = true;
      select.habilitacao = true;
      select.tipoSanguineo = true;
      select.peso = true;
      select.altura = true;
      select.manequim = true;
      select.sapato = true;
      select.saude = true;
      select.mei = true;
      select.nit = true;
      select.pagamentos = true;
      select.historico = true;
      select.dataAdmissao = true;
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
      nomeArtistico: true,
      funcao: true,
      idade: true,
      genero: true,
      fotoUrl: true,
      redeSocial: true,
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
      select.dataNascimento = true;
      select.etniaRaca = true;
      select.orientacaoSexual = true;
      select.cpf = true;
      select.rg = true;
      select.drtOmb = true;
      select.bairro = true;
      select.cidade = true;
      select.estado = true;
      select.cep = true;
      select.habilitacao = true;
      select.tipoSanguineo = true;
      select.peso = true;
      select.altura = true;
      select.manequim = true;
      select.sapato = true;
      select.saude = true;
      select.mei = true;
      select.nit = true;
      select.pagamentos = true;
      select.historico = true;
      select.dataAdmissao = true;
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
   * Cadastra novo colaborador (público ou admin)
   */
  static async criar(dados, arquivoFoto = null) {
    const validacao = validarCriacaoColaborador(dados);
    if (!validacao.valido) {
      if (arquivoFoto) {
        await FileService.removerArquivo(`/uploads/${arquivoFoto.filename}`);
      }
      throw AppError.badRequest(validacao.mensagem);
    }

    const emailNormalizado = dados.email.trim().toLowerCase();

    // Verifica se email já está cadastrado
    const existente = await prisma.colaborador.findUnique({ where: { email: emailNormalizado } });
    if (existente) {
      throw AppError.conflict('Já existe um colaborador cadastrado com este email');
    }

    let fotoUrl = null;
    if (arquivoFoto) {
      const salvo = await FileService.salvarArquivo(arquivoFoto);
      if (salvo) fotoUrl = salvo.url;
    }

    const dadosCriacao = {
      nome: dados.nome.trim(),
      funcao: dados.funcao.trim(),
      idade: parseInt(dados.idade, 10),
      celular: dados.celular.trim(),
      email: emailNormalizado,
      endereco: dados.endereco.trim(),
      genero: dados.genero.trim(),
      fotoUrl,
    };

    // Campos estendidos opcionais (conforme formulário da Ata #02)
    const camposOpcionais = [
      'nomeArtistico', 'dataNascimento', 'etniaRaca', 'orientacaoSexual',
      'cpf', 'rg', 'drtOmb', 'redeSocial', 'bairro', 'cidade', 'estado',
      'cep', 'habilitacao', 'tipoSanguineo', 'peso', 'altura', 'manequim',
      'sapato', 'saude', 'mei', 'nit', 'pagamentos', 'historico', 'dataAdmissao'
    ];

    for (const campo of camposOpcionais) {
      if (dados[campo] !== undefined && dados[campo] !== null) {
        dadosCriacao[campo] = String(dados[campo]).trim();
      }
    }

    const colaborador = await prisma.colaborador.create({
      data: dadosCriacao,
    });

    return colaborador;
  }

  /**
   * Atualiza dados de colaborador (admin)
   */
  static async atualizar(id, dados, novoArquivoFoto = null) {
    const validacao = validarAtualizacaoColaborador(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const antigo = await prisma.colaborador.findUnique({ where: { id } });
    if (!antigo) {
      throw AppError.notFound(`Colaborador com ID ${id} não encontrado`);
    }

    const dadosAtualizacao = {};
    if (dados.nome !== undefined) dadosAtualizacao.nome = dados.nome.trim();
    if (dados.funcao !== undefined) dadosAtualizacao.funcao = dados.funcao.trim();
    if (dados.idade !== undefined) dadosAtualizacao.idade = parseInt(dados.idade, 10);
    if (dados.celular !== undefined) dadosAtualizacao.celular = dados.celular.trim();
    if (dados.endereco !== undefined) dadosAtualizacao.endereco = dados.endereco.trim();
    if (dados.genero !== undefined) dadosAtualizacao.genero = dados.genero.trim();

    const camposOpcionais = [
      'nomeArtistico', 'dataNascimento', 'etniaRaca', 'orientacaoSexual',
      'cpf', 'rg', 'drtOmb', 'redeSocial', 'bairro', 'cidade', 'estado',
      'cep', 'habilitacao', 'tipoSanguineo', 'peso', 'altura', 'manequim',
      'sapato', 'saude', 'mei', 'nit', 'pagamentos', 'historico', 'dataAdmissao'
    ];

    for (const campo of camposOpcionais) {
      if (dados[campo] !== undefined) {
        dadosAtualizacao[campo] = dados[campo] ? String(dados[campo]).trim() : null;
      }
    }

    if (dados.email !== undefined) {
      const emailNorm = dados.email.trim().toLowerCase();
      if (emailNorm !== antigo.email) {
        const outroComEmail = await prisma.colaborador.findUnique({ where: { email: emailNorm } });
        if (outroComEmail) {
          throw AppError.conflict('Já existe outro colaborador cadastrado com este email');
        }
        dadosAtualizacao.email = emailNorm;
      }
    }

    // Se uma nova foto foi enviada, deleta a foto anterior e salva a nova
    if (novoArquivoFoto) {
      if (antigo.fotoUrl) {
        await FileService.removerArquivo(antigo.fotoUrl);
      }
      const salvo = await FileService.salvarArquivo(novoArquivoFoto);
      if (salvo) dadosAtualizacao.fotoUrl = salvo.url;
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
