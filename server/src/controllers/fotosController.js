// =============================================================================
// Controller de Fotos/Mídias de Peças
// Single Responsibility: apenas operações de fotos e vídeos
// =============================================================================

const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const { validarReordenacaoFotos } = require('../validators/pecaValidator');

// POST /api/pecas/:id/fotos — Upload de fotos/vídeos da peça (admin only)
async function adicionarFotos(req, res) {
  try {
    const { id } = req.params;
    const { descricao = '' } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ erro: true, mensagem: 'Nenhum arquivo enviado' });
    }

    // Verificar se a peça existe
    const peca = await prisma.peca.findUnique({ where: { id: parseInt(id) } });
    if (!peca) {
      return res.status(404).json({ erro: true, mensagem: 'Peça não encontrada' });
    }

    // Contar fotos existentes para definir ordem
    const totalFotos = await prisma.fotoPeca.count({ where: { pecaId: parseInt(id) } });

    const fotos = [];
    for (let i = 0; i < req.files.length; i++) {
      const arquivo = req.files[i];
      const ehVideo = arquivo.mimetype.startsWith('video/');

      const foto = await prisma.fotoPeca.create({
        data: {
          pecaId: parseInt(id),
          url: `/uploads/${arquivo.filename}`,
          descricao,
          tipo: ehVideo ? 'VIDEO' : 'IMAGEM',
          ordem: totalFotos + i,
        },
      });
      fotos.push(foto);
    }

    res.status(201).json(fotos);
  } catch (erro) {
    console.error('Erro ao adicionar fotos:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao adicionar fotos' });
  }
}

// DELETE /api/pecas/:pecaId/fotos/:fotoId — Deletar foto (admin only)
async function deletarFoto(req, res) {
  try {
    const { fotoId } = req.params;

    const foto = await prisma.fotoPeca.findUnique({ where: { id: parseInt(fotoId) } });
    if (!foto) {
      return res.status(404).json({ erro: true, mensagem: 'Foto não encontrada' });
    }

    // Deletar arquivo do disco
    const caminhoArquivo = path.join(__dirname, '..', '..', foto.url);
    if (fs.existsSync(caminhoArquivo)) {
      fs.unlinkSync(caminhoArquivo);
    }

    await prisma.fotoPeca.delete({ where: { id: parseInt(fotoId) } });

    // Reordenar as fotos restantes para não deixar buracos na numeração de ordem
    const fotosRestantes = await prisma.fotoPeca.findMany({
      where: { pecaId: parseInt(req.params.pecaId) },
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

    res.json({ mensagem: 'Foto deletada com sucesso' });
  } catch (erro) {
    console.error('Erro ao deletar foto:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao deletar foto' });
  }
}

// PUT /api/pecas/:id/fotos/reordenar — Alterar ordem das fotos da peça (admin only)
async function reordenarFotos(req, res) {
  try {
    const { id } = req.params;
    const { fotosIds } = req.body;

    const validacao = validarReordenacaoFotos(fotosIds);
    if (!validacao.valido) {
      return res.status(400).json({ erro: true, mensagem: validacao.mensagem });
    }

    await prisma.$transaction(
      fotosIds.map((fotoId, index) =>
        prisma.fotoPeca.update({
          where: { id: parseInt(fotoId) },
          data: { ordem: index },
        })
      )
    );

    const fotosAtualizadas = await prisma.fotoPeca.findMany({
      where: { pecaId: parseInt(id) },
      orderBy: { ordem: 'asc' },
    });

    res.json(fotosAtualizadas);
  } catch (erro) {
    console.error('Erro ao reordenar fotos:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao reordenar fotos' });
  }
}

// PUT /api/pecas/:id/fotos/:fotoId/capa — Definir foto como capa principal (admin only)
async function definirFotoCapa(req, res) {
  try {
    const { id, fotoId } = req.params;

    const fotoAlvo = await prisma.fotoPeca.findUnique({
      where: { id: parseInt(fotoId) },
    });

    if (!fotoAlvo || fotoAlvo.pecaId !== parseInt(id)) {
      return res.status(404).json({ erro: true, mensagem: 'Foto não encontrada para esta peça' });
    }

    const fotos = await prisma.fotoPeca.findMany({
      where: { pecaId: parseInt(id) },
      orderBy: { ordem: 'asc' },
    });

    const ordenadas = [fotoAlvo, ...fotos.filter(f => f.id !== parseInt(fotoId))];

    await prisma.$transaction(
      ordenadas.map((f, index) =>
        prisma.fotoPeca.update({
          where: { id: f.id },
          data: { ordem: index },
        })
      )
    );

    const fotosAtualizadas = await prisma.fotoPeca.findMany({
      where: { pecaId: parseInt(id) },
      orderBy: { ordem: 'asc' },
    });

    res.json(fotosAtualizadas);
  } catch (erro) {
    console.error('Erro ao definir foto como capa:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao definir foto como capa' });
  }
}

module.exports = {
  adicionarFotos,
  deletarFoto,
  reordenarFotos,
  definirFotoCapa,
};
