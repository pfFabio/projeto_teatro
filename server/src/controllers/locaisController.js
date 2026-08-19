// =============================================================================
// Controller de Locais de Apresentação
// Single Responsibility: apenas operações de locais/temporadas
// =============================================================================

const prisma = require('../lib/prisma');
const { validarCriacaoLocal } = require('../validators/pecaValidator');

// POST /api/pecas/:id/locais — Adicionar novo local/apresentação à peça (admin only)
async function adicionarLocal(req, res) {
  try {
    const { id } = req.params;
    const { nomeLocal, cidade, endereco, latitude, longitude, dataEstreia, dataFim, horario, status } = req.body;

    const validacao = validarCriacaoLocal({ nomeLocal, cidade, endereco });
    if (!validacao.valido) {
      return res.status(400).json({ erro: true, mensagem: validacao.mensagem });
    }

    const local = await prisma.localPeca.create({
      data: {
        pecaId: parseInt(id),
        nomeLocal,
        cidade,
        endereco,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        dataEstreia: dataEstreia || null,
        dataFim: dataFim || null,
        horario: horario || null,
        status: status || 'PROGRAMADA',
      },
    });

    res.status(201).json(local);
  } catch (erro) {
    console.error('Erro ao adicionar local:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao adicionar local de apresentação' });
  }
}

// PUT /api/pecas/:id/locais/:localId — Atualizar local/apresentação (admin only)
async function atualizarLocal(req, res) {
  try {
    const { localId } = req.params;
    const { nomeLocal, cidade, endereco, latitude, longitude, dataEstreia, dataFim, horario, status } = req.body;

    const local = await prisma.localPeca.update({
      where: { id: parseInt(localId) },
      data: {
        ...(nomeLocal && { nomeLocal }),
        ...(cidade && { cidade }),
        ...(endereco && { endereco }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(dataEstreia !== undefined && { dataEstreia }),
        ...(dataFim !== undefined && { dataFim }),
        ...(horario !== undefined && { horario }),
        ...(status && { status }),
      },
    });

    res.json(local);
  } catch (erro) {
    console.error('Erro ao atualizar local:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao atualizar local de apresentação' });
  }
}

// DELETE /api/pecas/:id/locais/:localId — Deletar local/apresentação (admin only)
async function deletarLocal(req, res) {
  try {
    const { localId } = req.params;

    await prisma.localPeca.delete({
      where: { id: parseInt(localId) },
    });

    res.json({ mensagem: 'Local de apresentação removido com sucesso' });
  } catch (erro) {
    console.error('Erro ao deletar local:', erro);
    res.status(500).json({ erro: true, mensagem: 'Erro ao remover local de apresentação' });
  }
}

module.exports = {
  adicionarLocal,
  atualizarLocal,
  deletarLocal,
};
