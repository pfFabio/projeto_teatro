// =============================================================================
// Theatrum — Service de Fotos e Mídias de Peças
// Gerenciamento, reordenação e capa de mídias de espetáculos
// =============================================================================

const prisma = require('../lib/prisma');
const AppError = require('../errors/AppError');
const FileService = require('./fileService');
const { validarReordenacaoFotos } = require('../validators/pecaValidator');

class FotoService {
  /**
   * Adiciona fotos/vídeos a uma peça
   */
  static async adicionarFotos(pecaId, arquivos, descricao = '') {
    if (!arquivos || arquivos.length === 0) {
      throw AppError.badRequest('Nenhum arquivo enviado');
    }

    const peca = await prisma.peca.findUnique({ where: { id: pecaId } });
    if (!peca) {
      // Remove arquivos enviados se a peça não existir
      await FileService.removerMultiplosArquivos(arquivos.map(a => `/uploads/${a.filename}`));
      throw AppError.notFound(`Peça com ID ${pecaId} não encontrada`);
    }

    const totalFotos = await prisma.fotoPeca.count({ where: { pecaId } });

    const fotosCriadas = [];
    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];
      const ehVideo = arquivo.mimetype.startsWith('video/');

      const foto = await prisma.fotoPeca.create({
        data: {
          pecaId,
          url: `/uploads/${arquivo.filename}`,
          descricao: descricao || '',
          tipo: ehVideo ? 'VIDEO' : 'IMAGEM',
          ordem: totalFotos + i,
        },
      });
      fotosCriadas.push(foto);
    }

    return fotosCriadas;
  }

  /**
   * Remove uma foto de uma peça e limpa o arquivo em disco
   */
  static async deletarFoto(pecaId, fotoId) {
    const foto = await prisma.fotoPeca.findUnique({ where: { id: fotoId } });
    if (!foto) {
      throw AppError.notFound('Foto não encontrada');
    }

    if (foto.pecaId !== pecaId) {
      throw AppError.badRequest('A foto informada não pertence a esta peça');
    }

    await prisma.fotoPeca.delete({ where: { id: fotoId } });

    // Remove arquivo assincronamente
    await FileService.removerArquivo(foto.url);

    // Reordena fotos restantes para manter integridade sequencial
    const fotosRestantes = await prisma.fotoPeca.findMany({
      where: { pecaId },
      orderBy: { ordem: 'asc' },
    });

    if (fotosRestantes.length > 0) {
      await prisma.$transaction(
        fotosRestantes.map((f, index) =>
          prisma.fotoPeca.update({
            where: { id: f.id },
            data: { ordem: index },
          })
        )
      );
    }

    return { mensagem: 'Foto deletada com sucesso' };
  }

  /**
   * Reordena as fotos de uma peça
   */
  static async reordenarFotos(pecaId, fotosIds) {
    const validacao = validarReordenacaoFotos(fotosIds);
    if (!validacao.valido) {
      throw AppError.badRequest(validacao.mensagem);
    }

    const idsNumericos = fotosIds.map(id => parseInt(id, 10));

    await prisma.$transaction(
      idsNumericos.map((fotoId, index) =>
        prisma.fotoPeca.update({
          where: { id: fotoId },
          data: { ordem: index },
        })
      )
    );

    return prisma.fotoPeca.findMany({
      where: { pecaId },
      orderBy: { ordem: 'asc' },
    });
  }

  /**
   * Define uma foto específica como a capa principal (posição 0)
   */
  static async definirFotoCapa(pecaId, fotoId) {
    const fotoAlvo = await prisma.fotoPeca.findUnique({
      where: { id: fotoId },
    });

    if (!fotoAlvo || fotoAlvo.pecaId !== pecaId) {
      throw AppError.notFound('Foto não encontrada para esta peça');
    }

    const fotos = await prisma.fotoPeca.findMany({
      where: { pecaId },
      orderBy: { ordem: 'asc' },
    });

    const ordenadas = [fotoAlvo, ...fotos.filter(f => f.id !== fotoId)];

    await prisma.$transaction(
      ordenadas.map((f, index) =>
        prisma.fotoPeca.update({
          where: { id: f.id },
          data: { ordem: index },
        })
      )
    );

    return prisma.fotoPeca.findMany({
      where: { pecaId },
      orderBy: { ordem: 'asc' },
    });
  }
}

module.exports = FotoService;
