// =============================================================================
// Theatrum — Service de Locais de Apresentação e Temporadas
// Gerenciamento de turnês, teatros e horários
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const { validarCriacaoLocal } = require('../validators/pecaValidator');

class LocalService {
  /**
   * Adiciona local/temporada a uma peça
   */
  static async adicionarLocal(pecaId, dados) {
    const validacao = validarCriacaoLocal(dados);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const peca = await prisma.peca.findUnique({ where: { id: pecaId } });
    if (!peca) {
      throw AppError.notFound(`Peça com ID ${pecaId} não encontrada`);
    }

    const { nomeLocal, cidade, endereco, latitude, longitude, dataEstreia, dataFim, horario, status } = dados;

    const local = await prisma.localPeca.create({
      data: {
        pecaId,
        nomeLocal: nomeLocal.trim(),
        cidade: cidade.trim(),
        endereco: endereco.trim(),
        latitude: latitude !== undefined && latitude !== null && latitude !== '' ? parseFloat(latitude) : null,
        longitude: longitude !== undefined && longitude !== null && longitude !== '' ? parseFloat(longitude) : null,
        dataEstreia: dataEstreia || null,
        dataFim: dataFim || null,
        horario: horario ? horario.trim() : null,
        status: status || 'PROGRAMADA',
      },
    });

    return local;
  }

  /**
   * Atualiza local/temporada existente
   */
  static async atualizarLocal(pecaId, localId, dados) {
    const localExistente = await prisma.localPeca.findUnique({ where: { id: localId } });
    if (!localExistente) {
      throw AppError.notFound('Local de apresentação não encontrado');
    }

    if (localExistente.pecaId !== pecaId) {
      throw AppError.badRequest('O local informado não pertence a esta peça');
    }

    const { nomeLocal, cidade, endereco, latitude, longitude, dataEstreia, dataFim, horario, status } = dados;

    const dadosAtualizacao = {};
    if (nomeLocal !== undefined) dadosAtualizacao.nomeLocal = nomeLocal.trim();
    if (cidade !== undefined) dadosAtualizacao.cidade = cidade.trim();
    if (endereco !== undefined) dadosAtualizacao.endereco = endereco.trim();
    if (latitude !== undefined) {
      dadosAtualizacao.latitude = latitude !== null && latitude !== '' ? parseFloat(latitude) : null;
    }
    if (longitude !== undefined) {
      dadosAtualizacao.longitude = longitude !== null && longitude !== '' ? parseFloat(longitude) : null;
    }
    if (dataEstreia !== undefined) dadosAtualizacao.dataEstreia = dataEstreia || null;
    if (dataFim !== undefined) dadosAtualizacao.dataFim = dataFim || null;
    if (horario !== undefined) dadosAtualizacao.horario = horario ? horario.trim() : null;
    if (status !== undefined) dadosAtualizacao.status = status;

    const localAtualizado = await prisma.localPeca.update({
      where: { id: localId },
      data: dadosAtualizacao,
    });

    return localAtualizado;
  }

  /**
   * Remove local de apresentação
   */
  static async deletarLocal(pecaId, localId) {
    const local = await prisma.localPeca.findUnique({ where: { id: localId } });
    if (!local) {
      throw AppError.notFound('Local de apresentação não encontrado');
    }

    if (local.pecaId !== pecaId) {
      throw AppError.badRequest('O local informado não pertence a esta peça');
    }

    await prisma.localPeca.delete({ where: { id: localId } });

    return { mensagem: 'Local de apresentação removido com sucesso' };
  }
}

module.exports = LocalService;
