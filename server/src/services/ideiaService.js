// =============================================================================
// Theatrum — Service de Ideias e Propostas de Parcerias
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const { validarCriacaoIdeia } = require('../validators/ideiaValidator');

class IdeiaService {
  /**
   * Envia uma nova ideia/proposta de espetáculo (público)
   */
  static async criar(dados) {
    const validacao = validarCriacaoIdeia(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const { nome, email, telefone, titulo, descricao, consentimento } = dados;

    const ideia = await prisma.mensagemIdeia.create({
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone ? telefone.trim() : null,
        titulo: titulo ? titulo.trim() : null,
        descricao: descricao.trim(),
        consentimento: consentimento !== false,
        status: 'NOVA',
      },
    });

    return {
      sucesso: true,
      mensagem: 'Sua ideia foi enviada com sucesso para a Theatrum! Obrigado por compartilhar conosco.',
      ideiaId: ideia.id,
    };
  }

  /**
   * Lista mensagens de ideias (admin)
   */
  static async listar({ status, busca, pagina = 1, limite = 20 }) {
    const pageNum = Math.max(1, parseInt(pagina, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 20));

    const where = {};
    if (status) {
      where.status = status;
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      where.OR = [
        { nome: { contains: termo, mode: 'insensitive' } },
        { email: { contains: termo, mode: 'insensitive' } },
        { titulo: { contains: termo, mode: 'insensitive' } },
        { descricao: { contains: termo, mode: 'insensitive' } },
      ];
    }

    const [ideias, total] = await Promise.all([
      prisma.mensagemIdeia.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.mensagemIdeia.count({ where }),
    ]);

    return {
      ideias,
      total,
      pagina: pageNum,
      totalPaginas: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Atualiza status da mensagem de ideia (admin)
   */
  static async atualizarStatus(id, status) {
    const permitidos = ['NOVA', 'LIDA', 'RESPONDIDA', 'ARQUIVADA'];
    if (!permitidos.includes(status)) {
      throw AppError.badRequest(`Status inválido. Permitidos: ${permitidos.join(', ')}`);
    }

    const ideia = await prisma.mensagemIdeia.findUnique({ where: { id } });
    if (!ideia) {
      throw AppError.notFound(`Mensagem de ideia com ID ${id} não encontrada`);
    }

    const atualizada = await prisma.mensagemIdeia.update({
      where: { id },
      data: { status },
    });

    return atualizada;
  }

  /**
   * Deleta uma mensagem de ideia (admin)
   */
  static async deletar(id) {
    const ideia = await prisma.mensagemIdeia.findUnique({ where: { id } });
    if (!ideia) {
      throw AppError.notFound(`Mensagem de ideia com ID ${id} não encontrada`);
    }

    await prisma.mensagemIdeia.delete({ where: { id } });
    return { mensagem: 'Mensagem deletada com sucesso' };
  }
}

module.exports = IdeiaService;

